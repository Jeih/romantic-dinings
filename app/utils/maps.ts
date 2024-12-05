import { Coordinates } from "./coordinatesCache";

export async function getPlaceDetails(placeId: string) {
  try {
    const response = await fetch(
      `/api/places/${placeId}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
}

export async function calculateTravelTime(start: Coordinates, end: Coordinates) {
  try {
    const response = await fetch(
      `/api/distance?` +
      `origin=${start.lat},${start.lng}&` +
      `destination=${end.lat},${end.lng}`
    );
    const data = await response.json();
    return data.duration;
  } catch (error) {
    console.error('Error calculating travel time:', error);
    return fallbackCalculation(start, end);
  }
}

function fallbackCalculation(start: Coordinates, end: Coordinates): number {
  return Math.round(
    Math.sqrt(
      Math.pow(end.lat - start.lat, 2) +
      Math.pow(end.lng - start.lng, 2)
    ) * 1000
  );
}