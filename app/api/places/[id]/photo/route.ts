import { fetchPlaceDetails, fetchPlacePhoto } from '@/app/lib/google-api';
import { NextRequest } from 'next/server';

export const runtime = 'edge'; // Optional: Use edge runtime for better performance

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const id = (await params).id;
  const maxwidth = request.nextUrl.searchParams.get('maxwidth') || '400';
  
  try {
    const detailsData = await fetchPlaceDetails(id, 'photos,name');
    
    if (detailsData.status !== 'OK' || !detailsData.result?.photos?.[0]?.photo_reference) {
      return fallbackResponse(detailsData.result?.name || id);
    }

    const photoReference = detailsData.result.photos[0].photo_reference;
    const photoResponse = await fetchPlacePhoto(photoReference, maxwidth);

    // Stream the photo response directly
    return new Response(photoResponse.body, {
      headers: photoResponse.headers,
      status: photoResponse.status,
    });
  } catch (error) {
    console.error('Failed to fetch place photo:', error);
    return fallbackResponse(id);
  }
}

function fallbackResponse(name: string): Response {
  return new Response(null, {
    status: 307,
    headers: {
      'Location': `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=400&bold=true&length=2`
    }
  });
}