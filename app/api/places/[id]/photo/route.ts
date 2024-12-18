import { fetchPlaceDetails, fetchPlacePhoto } from '@/app/lib/google-api';
import { prisma } from '@/app/lib/prisma';
import { isPhotoStale } from '@/app/utils/photoCache';
import { NextRequest } from 'next/server';

export async function GET (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const id = (await params).id;
  const maxwidth = request.nextUrl.searchParams.get('maxwidth') || '400';

  try {
    // Check if we have a valid cached photo
    const place = await prisma.place.findUnique({
      where: { place_id: id },
      select: {
        photo_ref: true,
        name: true,
        photo_updated: true
      }
    });

    if (!place) {
      return fallbackResponse(id);
    }

    let photoReference = place.photo_ref;
    const needsUpdate = isPhotoStale(place.photo_updated);

    // If no cached reference or it's stale, fetch from Google
    if (!photoReference || needsUpdate) {
      const detailsData = await fetchPlaceDetails(id, 'photos,name');

      if (detailsData.status !== 'OK' || !detailsData.result?.photos?.[0]?.photo_reference) {
        return fallbackResponse(place.name || id);
      }

      photoReference = detailsData.result.photos[0].photo_reference;

      // Update the cached reference with new timestamp
      await prisma.place.update({
        where: { place_id: id },
        data: {
          photo_ref: photoReference,
          photo_updated: new Date()
        }
      });
    }

    // Check if we have a valid photo reference before proceeding
    if (!photoReference) {
      return fallbackResponse(place.name || id);
    }

    const photoResponse = await fetchPlacePhoto(photoReference, maxwidth);

    // Return the photo response with caching headers
    return new Response(photoResponse.body, {
      headers: {
        ...photoResponse.headers,
        'Cache-Control': 'public, max-age=604800', // 7 days browser caching
      },
      status: photoResponse.status,
    });
  } catch (error) {
    console.error('Failed to fetch place photo:', error);
    return fallbackResponse(id);
  }
}

function fallbackResponse (name: string): Response {
  return new Response(null, {
    status: 307,
    headers: {
      'Location': `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=400&bold=true&length=2`,
      'Cache-Control': 'public, max-age=31536000' // 1 year for fallback images
    }
  });
}