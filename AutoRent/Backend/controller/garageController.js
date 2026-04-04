import { createGarage, getGarages, getGaragesInBbox } from "../services/garageService.js";

/**
 * Public: list garages with optional basic filters.
 */
const getGaragesController = async (req, res) => {
  try {
    const { city, q, limit, offset } = req.query;
    const data = await getGarages({ city, q, limit, offset });
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get garages error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Public: get garages for map within a bounding box.
 * Expects query param: bbox=west,south,east,north
 */
const getGaragesForMapController = async (req, res) => {
  try {
    const { bbox, limit } = req.query;

    const parts = String(bbox).split(",").map((p) => p.trim());
    const [west, south, east, north] = parts;

    const data = await getGaragesInBbox({ west, south, east, north, limit });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get garages for map error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * Authenticated (renter): create a garage from the map (crowd locating).
 */
const createGarageController = async (req, res) => {
  try {
    const { userId, role } = req.user || {};

    if (!userId || !role) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (role !== "renter") {
      return res.status(403).json({
        success: false,
        message: "Only renters can add garage locations",
      });
    }

    const { name, latitude, longitude, city, district, province, address, phone, email, website, openingHours, type } =
      req.body || {};

    const latNum = Number(latitude);
    const lngNum = Number(longitude);

    const garage = await createGarage({
      name,
      latitude: latNum,
      longitude: lngNum,
      city,
      district,
      province,
      address,
      phone,
      email,
      website,
      openingHours,
      type,
      source: "user",
      createdByUserId: userId,
    });

    if (!garage) {
      return res.status(500).json({
        success: false,
        message: "Failed to create garage",
      });
    }

    res.status(201).json({
      success: true,
      message: "Garage added successfully",
      data: garage,
    });
  } catch (error) {
    console.error("Create garage error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export { createGarageController, getGaragesController, getGaragesForMapController };
