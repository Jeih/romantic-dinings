import { fetchPlaceDetails } from '@/app/lib/google-api';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const id = (await params).id;
  try {
    const data = await fetchPlaceDetails(id, 'name,formatted_address,geometry,photos,price_level,rating,opening_hours');
    return Response.json(data.result);
  } catch (error) {
    console.error('Failed to fetch place details:', error);
    return Response.json(
      { error: 'Failed to fetch place details' },
      { status: 500 }
    );
  }
}