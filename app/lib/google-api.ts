import { env } from '../config/env';

export async function fetchPlaceDetails (placeId: string, fields: string) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?` +
    `place_id=${placeId}&` +
    `fields=${fields}&` +
    `key=${env.server.googleMapsApiKey}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch place details');
  }

  const data = await response.json();
  return data;
}

export async function fetchPlacePhoto (photoReference: string, maxwidth: string) {
  return fetch(
    `https://maps.googleapis.com/maps/api/place/photo?` +
    `maxwidth=${maxwidth}&` +
    `photo_reference=${photoReference}&` +
    `key=${env.server.googleMapsApiKey}`
  );
}