import { Coordinates } from "../data/venues";

export async function calculateTravelTime(start: Coordinates, end: Coordinates) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?` +
      `origins=${start.lat},${start.lng}&` +
      `destinations=${end.lat},${end.lng}&` +
      `mode=driving&` +
      `key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();
    return data.rows[0].elements[0].duration.value; // returns seconds
  } catch (error) {
    console.error('Error calculating travel time:', error);
    // Fallback to simple calculation
    return Math.round(
      Math.sqrt(
        Math.pow(end.lat - start.lat, 2) +
        Math.pow(end.lng - start.lng, 2)
      ) * 1000
    );
  }
}