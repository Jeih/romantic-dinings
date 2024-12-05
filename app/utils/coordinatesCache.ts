export interface Coordinates {
  lat: number;
  lng: number;
}

const coordinatesCache = new Map<string, Coordinates>();

export async function getCoordinates(placeId: string): Promise<Coordinates> {
  if (coordinatesCache.has(placeId)) {
    return coordinatesCache.get(placeId)!;
  }

  try {
    const details = await fetch(`/api/places/${placeId}`);
    const data = await details.json();

    if (!data.geometry?.location) {
      throw new Error('No location data found');
    }

    const coordinates: Coordinates = {
      lat: data.geometry.location.lat,
      lng: data.geometry.location.lng
    };

    coordinatesCache.set(placeId, coordinates);
    return coordinates;
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    // Return a default location (e.g., Pittsburgh downtown) if fetch fails
    return { lat: 40.4406, lng: -79.9959 };
  }
}