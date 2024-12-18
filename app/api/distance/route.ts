import { NextRequest } from 'next/server';
import { env } from '@/app/config/env';

export async function GET (request: NextRequest) {
  const origin = request.nextUrl.searchParams.get('origin');
  const destination = request.nextUrl.searchParams.get('destination');

  if (!origin || !destination) {
    return Response.json(
      { error: 'Missing origin or destination' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?` +
      `origins=${origin}&` +
      `destinations=${destination}&` +
      `mode=driving&` +
      `units=imperial&` +
      `departure_time=now&` +
      `traffic_model=best_guess&` +
      `key=${env.server.googleMapsApiKey}`
    );

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.rows?.[0]?.elements?.[0]?.duration?.value) {
      console.error('Invalid Distance Matrix API response:', JSON.stringify(data, null, 2));
      return Response.json(
        { duration: 900 },
        {
          status: 200,
          headers: {
            'Warning': 'Using fallback values due to invalid API response'
          }
        }
      );
    }

    const duration = data.rows[0].elements[0].duration.value;

    return Response.json({
      duration: duration
    });
  } catch (error) {
    console.error('Failed to calculate distance:', error);
    return Response.json(
      { duration: 900 },
      { status: 200 }
    );
  }
}