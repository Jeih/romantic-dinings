import { getPlacesByType } from '@/app/lib/db';
import { PlaceType } from '@prisma/client';
import { NextRequest } from 'next/server';

export async function GET (request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') as PlaceType;

  if (!type) {
    return Response.json(
      { error: 'Missing type parameter' },
      { status: 400 }
    );
  }

  try {
    const places = await getPlacesByType(type);
    return Response.json(places);
  } catch (error) {
    console.error('Failed to fetch places:', error);
    return Response.json(
      { error: 'Failed to fetch places' },
      { status: 500 }
    );
  }
}