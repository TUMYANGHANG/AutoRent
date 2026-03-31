import { and, eq, gte, lte, ilike, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { garages } from "../schema/index.js";

/**
 * Create a new garage entry, typically from a renter (crowd-locating).
 */
const createGarage = async ({
  name,
  latitude,
  longitude,
  city = null,
  district = null,
  province = null,
  address = null,
  phone = null,
  email = null,
  website = null,
  openingHours = null,
  type = null,
  source = "user",
  createdByUserId = null,
}) => {
  const [garage] = await db
    .insert(garages)
    .values({
      name: String(name).trim(),
      latitude: String(latitude),
      longitude: String(longitude),
      city: city ? String(city).trim() : null,
      district: district ? String(district).trim() : null,
      province: province ? String(province).trim() : null,
      address: address ? String(address).trim() : null,
      phone: phone ? String(phone).trim() : null,
      email: email ? String(email).trim() : null,
      website: website ? String(website).trim() : null,
      openingHours: openingHours ? String(openingHours).trim() : null,
      type: type ? String(type).trim() : null,
      source,
      createdByUserId,
      updatedAt: new Date(),
    })
    .returning();

  return garage ?? null;
};

/**
 * Get garages within a bounding box for map display.
 * bbox: { west, south, east, north }
 */
const getGaragesInBbox = async ({ west, south, east, north, limit = 500 }) => {
  try {
    const numericWest = Number(west);
    const numericSouth = Number(south);
    const numericEast = Number(east);
    const numericNorth = Number(north);

    if (
      Number.isNaN(numericWest) ||
      Number.isNaN(numericSouth) ||
      Number.isNaN(numericEast) ||
      Number.isNaN(numericNorth)
    ) {
      return [];
    }

    const list = await db
      .select()
      .from(garages)
      .where(
        and(
          gte(garages.latitude, String(numericSouth)),
          lte(garages.latitude, String(numericNorth)),
          gte(garages.longitude, String(numericWest)),
          lte(garages.longitude, String(numericEast))
        )
      )
      .limit(Math.min(Number(limit) || 500, 1000));

    return list;
  } catch (error) {
    console.error("Error in getGaragesInBbox:", error);
    throw error;
  }
};

/**
 * Simple list/search endpoint for garages (optional filters).
 */
const getGarages = async ({ city, q, limit = 100, offset = 0 } = {}) => {
  const conditions = [];

  if (city) {
    conditions.push(ilike(garages.city, `%${city}%`));
  }

  if (q) {
    const likeQ = `%${q}%`;
    conditions.push(
      or(
        ilike(garages.name, likeQ),
        ilike(garages.address, likeQ),
        ilike(garages.city, likeQ),
        ilike(garages.district, likeQ),
        ilike(garages.province, likeQ)
      )
    );
  }

  const query = db.select().from(garages);

  const finalQuery =
    conditions.length > 0 ? query.where(and(...conditions)) : query;

  const list = await finalQuery
    .limit(Math.min(Number(limit) || 100, 500))
    .offset(Number(offset) || 0);

  return list;
};

const getGarageById = async (id) => {
  const [garage] = await db
    .select()
    .from(garages)
    .where(eq(garages.id, id))
    .limit(1);
  return garage ?? null;
};

export { createGarage, getGarageById, getGarages, getGaragesInBbox };
