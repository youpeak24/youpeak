const Agency = require("../models/agency.model");

// Haversine formula to calculate distance between 2 points in km
const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Resolve Agency based on Lat/Lng or District/State text
const resolveAgency = async ({ latitude, longitude, district, state, city }) => {
  try {
    const agencies = await Agency.find({ isActive: true });
    if (!agencies || agencies.length === 0) return null;

    // 1. Radius/Geofence match if lat/lng available
    if (latitude && longitude) {
      for (const agency of agencies) {
        if (
          agency.geofenceCenter &&
          agency.geofenceCenter.latitude &&
          agency.geofenceCenter.longitude &&
          agency.radiusKm > 0
        ) {
          const dist = getDistanceInKm(
            latitude,
            longitude,
            agency.geofenceCenter.latitude,
            agency.geofenceCenter.longitude
          );
          if (dist <= agency.radiusKm) {
            return agency._id;
          }
        }
      }
    }

    // 2. District & State string match
    if (district || state) {
      const match = agencies.find((agency) => {
        const districtMatch =
          district &&
          agency.district &&
          agency.district.toLowerCase() === district.toLowerCase();
        const stateMatch =
          state &&
          agency.state &&
          agency.state.toLowerCase() === state.toLowerCase();
        return districtMatch || stateMatch;
      });
      if (match) return match._id;
    }

    return null;
  } catch (error) {
    console.error("Error resolving agency geofence:", error);
    return null;
  }
};

module.exports = {
  resolveAgency,
  getDistanceInKm,
};
