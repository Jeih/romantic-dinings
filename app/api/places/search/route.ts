import { env } from '@/app/config/env';
import { fetchPlaceDetails } from '@/app/lib/google-api';
import { prisma } from '@/app/lib/prisma';
import { isPhotoStale } from '@/app/utils/photoCache';
import { Place, PlaceType } from '@prisma/client';
import { NextRequest } from 'next/server';

interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  types: string[];
  price_level?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    }
  }
}

export async function GET (request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query');

  if (!query) {
    return Response.json(
      { error: 'Missing query parameter' },
      { status: 400 }
    );
  }

  try {
    // First search in our database with stricter matching
    const dbResults = await prisma.place.findMany({
      where: {
        OR: [
          // Exact match on name
          { name: { equals: query, mode: 'insensitive' } },
          // Starts with query
          { name: { startsWith: query, mode: 'insensitive' } },
          // Contains query as a word
          { name: { contains: ` ${query} `, mode: 'insensitive' } },
          // Exact match on cuisine
          { cuisine: { hasSome: [query.toLowerCase()] } }
        ]
      },
      take: 5
    });

    // If we have RELEVANT results from DB (exact or close matches), return them
    if (dbResults.length > 0 && dbResults.some(place =>
      place.name.toLowerCase().includes(query.toLowerCase()) ||
      place.cuisine.includes(query.toLowerCase())
    )) {
      return Response.json(dbResults);
    }

    // If no relevant results, search Google Places API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?` +
      `query=${encodeURIComponent(query)}&` +
      `type=restaurant|bar&` +
      `key=${env.server.googleMapsApiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Places API');
    }

    const data = await response.json();

    // Process results and merge with DB results
    const places = await Promise.all(
      data.results.slice(0, 5).map(async (result: GooglePlaceResult) => {
        // Check if place already exists in DB
        const existingPlace = await prisma.place.findUnique({
          where: { place_id: result.place_id }
        });

        if (existingPlace) {
          // Update photo if stale
          if (!existingPlace.photo_ref || !existingPlace.photo_url || isPhotoStale(existingPlace.photo_updated)) {
            const details = await fetchPlaceDetails(result.place_id, 'photos');
            const photoRef = details.result?.photos?.[0]?.photo_reference;
            const photoUrl = photoRef
              ? `/api/places/${result.place_id}/photo?maxwidth=400`
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(result.name)}&background=random&size=400&bold=true&length=2`;

            return prisma.place.update({
              where: { place_id: result.place_id },
              data: {
                photo_ref: photoRef,
                photo_url: photoUrl,
                photo_updated: new Date()
              }
            });
          }
          return existingPlace;
        }

        // Get additional details for new places
        const details = await fetchPlaceDetails(
          result.place_id,
          'photos,price_level,types'
        );

        // Get photo reference if available
        const photoRef = details.result?.photos?.[0]?.photo_reference;

        // Generate photo URL
        const photoUrl = photoRef
          ? `/api/places/${result.place_id}/photo?maxwidth=400`
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(result.name)}&background=random&size=400&bold=true&length=2`;

        // Determine place type
        const type = result.types.includes('bar') ? PlaceType.bar : PlaceType.restaurant;

        // Create new place in DB
        const newPlace: Place = await prisma.place.create({
          data: {
            place_id: result.place_id,
            name: result.name,
            type: type,
            vibes: [],
            price_level: result.price_level || null,
            address: {
              formatted_address: result.formatted_address,
              geometry: {
                location: result.geometry.location
              }
            },
            cuisine: result.types.filter((t: string) =>
              !['restaurant', 'bar', 'food', 'point_of_interest', 'establishment'].includes(t)
            ),
            photo_url: photoUrl,
            photo_ref: photoRef || null,
            photo_updated: new Date()
          }
        });

        return newPlace;
      })
    );

    return Response.json(places);

  } catch (error) {
    console.error('Failed to search places:', error);
    return Response.json(
      { error: 'Failed to search places' },
      { status: 500 }
    );
  }
}