import { getPlaceByGoogleId, getPlaceById } from '@/app/lib/db';
import { fetchPlaceDetails } from '@/app/lib/google-api';
import { prisma } from '@/app/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const id = (await params).id;
  try {
    // First try to find by internal ID
    let place = await getPlaceById(id);

    // If not found, try finding by Google Place ID
    if (!place) {
      place = await getPlaceByGoogleId(id);
    }

    // If found in database, return it
    if (place) {
      return Response.json(place);
    }

    // If not in database, fetch from Google API
    const data = await fetchPlaceDetails(
      id,
      'name,formatted_address,geometry,photos,price_level,rating,opening_hours'
    );

    if (!data.result) {
      return Response.json(
        { error: 'Place not found' },
        { status: 404 }
      );
    }

    // Store the new place in database
    const newPlace = await prisma.place.create({
      data: {
        place_id: id,
        name: data.result.name,
        type: data.result.types.includes('bar') ? 'bar' : 'restaurant',
        vibes: [],
        price_level: data.result.price_level || null,
        address: {
          formatted_address: data.result.formatted_address,
          geometry: {
            location: data.result.geometry.location
          }
        },
        cuisine: data.result.types.filter((t: string) =>
          !['restaurant', 'bar', 'food', 'point_of_interest', 'establishment'].includes(t)
        ),
        photo_ref: data.result.photos?.[0]?.photo_reference || null,
        photo_url: data.result.photos?.[0]?.photo_reference
          ? `/api/places/${id}/photo?maxwidth=400`
          : null,
        photo_updated: new Date()
      }
    });

    return Response.json(newPlace);
  } catch (error) {
    console.error('Failed to fetch place:', error);
    return Response.json(
      { error: 'Failed to fetch place' },
      { status: 500 }
    );
  }
}