/**
 * Import garages from JSON file (garage_locator.garages.json).
 * Usage: node scripts/import-garages-from-json.js
 */
import "dotenv/config";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { db } from "../db/index.js";
import { garages } from "../schema/index.js";
import { eq } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the JSON file - adjust if your file is in a different location
// This assumes the file is at e:/garage_locator.garages.json
// If it's elsewhere, update this path
const JSON_FILE_PATH = process.env.GARAGES_JSON_PATH || join(__dirname, "../../../garage_locator.garages.json");

function loadGaragesFromJSON() {
  try {
    console.log(`Reading JSON file from: ${JSON_FILE_PATH}`);
    const fileContent = readFileSync(JSON_FILE_PATH, "utf-8");
    const data = JSON.parse(fileContent);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error reading JSON file:", error);
    throw error;
  }
}

function normalizeOsmId(osmId) {
  if (osmId == null || osmId === undefined) return null;
  if (typeof osmId === "number") return osmId;
  if (typeof osmId === "string") {
    const parsed = parseInt(osmId, 10);
    return isNaN(parsed) ? null : parsed;
  }
  // Handle MongoDB ObjectId format (shouldn't happen for OSM IDs, but just in case)
  if (typeof osmId === "object" && osmId.$oid) {
    return null; // OSM IDs shouldn't be MongoDB ObjectIds
  }
  return null;
}

function transformGarageData(item) {
  const tags = item.tags || {};
  
  return {
    name: item.name || tags.name || "Unknown Garage",
    latitude: String(item.lat || 0),
    longitude: String(item.lng || 0),
    city: item.city || tags["addr:city"] || tags.city || null,
    district: item.district || tags["addr:district"] || tags.district || null,
    province: item.province || tags["addr:province"] || tags.province || tags["addr:state"] || null,
    address: tags["addr:street"] || tags.address || null,
    phone: item.phone || tags.phone || tags["contact:phone"] || null,
    email: tags.email || tags["contact:email"] || null,
    website: tags.website || tags["contact:website"] || null,
    openingHours: tags.opening_hours || tags["opening_hours"] || null,
    type: tags.shop || tags.transportation || tags.amenity || "car_repair",
    source: item.source || "osm",
    osmId: normalizeOsmId(item.osmId),
    createdByUserId: null,
  };
}

async function importGarages() {
  try {
    console.log("Starting garage import from JSON file...");
    
    const items = loadGaragesFromJSON();
    console.log(`Found ${items.length} garages in JSON file`);

    if (items.length === 0) {
      console.log("No garages found. Exiting.");
      return;
    }

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    // Process in batches to avoid overwhelming the database
    const batchSize = 100;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      for (const item of batch) {
        try {
          // Skip if missing required fields
          if (!item.lat || !item.lng || !item.name) {
            skipped++;
            continue;
          }

          const garageData = transformGarageData(item);

          // Check if garage already exists (by OSM ID if available, or by location + name)
          let existing = [];
          
          if (garageData.osmId != null && typeof garageData.osmId === "number") {
            // Check by OSM ID first
            const allWithOsmId = await db
              .select()
              .from(garages)
              .where(eq(garages.osmId, garageData.osmId))
              .limit(1);
            existing = allWithOsmId;
          }

          // If not found by OSM ID, check by location + name (within 0.001 degrees ≈ 100m)
          if (existing.length === 0) {
            const allGarages = await db
              .select()
              .from(garages)
              .where(eq(garages.name, garageData.name))
              .limit(50);

            existing = allGarages.filter((g) => {
              const latDiff = Math.abs(Number(g.latitude) - Number(garageData.latitude));
              const lngDiff = Math.abs(Number(g.longitude) - Number(garageData.longitude));
              return latDiff < 0.001 && lngDiff < 0.001;
            });
          }

          if (existing.length > 0) {
            skipped++;
            continue;
          }

          // Insert new garage
          await db.insert(garages).values({
            name: garageData.name,
            latitude: garageData.latitude,
            longitude: garageData.longitude,
            city: garageData.city,
            district: garageData.district,
            province: garageData.province,
            address: garageData.address,
            phone: garageData.phone,
            email: garageData.email,
            website: garageData.website,
            openingHours: garageData.openingHours,
            type: garageData.type,
            source: garageData.source,
            osmId: garageData.osmId,
            createdByUserId: null,
          });

          imported++;
          
          if (imported % 50 === 0) {
            console.log(`Imported ${imported} garages...`);
          }
        } catch (err) {
          console.error(`Error processing garage "${item.name || "Unknown"}":`, err.message);
          if (err.message.includes("Failed query")) {
            console.error(`  OSM ID value:`, garageData.osmId, `(type: ${typeof garageData.osmId})`);
          }
          errors++;
        }
      }
    }

    console.log("\n=== Import Summary ===");
    console.log(`Total items processed: ${items.length}`);
    console.log(`Successfully imported: ${imported}`);
    console.log(`Skipped (duplicates/invalid): ${skipped}`);
    console.log(`Errors: ${errors}`);
    console.log("\nImport completed!");
  } catch (error) {
    console.error("Import failed:", error);
    process.exit(1);
  }
}

importGarages();
