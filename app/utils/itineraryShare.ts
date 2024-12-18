import { Place } from "@prisma/client";

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export async function createShareableCode (places: Place[]): Promise<string> {
  const response = await fetch('/api/share', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(places),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create share code');
  }

  return data.code;
}

export async function deserializeFromShareCode (code: string): Promise<string[]> {
  const response = await fetch(`${getBaseUrl()}/api/share/${code}`);
  const data = await response.json();

  if (!response.ok) {
    console.error('Failed to deserialize itinerary:', data.error);
    return [];
  }

  return data.placeIds;
}