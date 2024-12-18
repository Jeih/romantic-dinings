export interface EnvConfig {
  server: {
    googleMapsApiKey: string;
  };
  client: {
    googleMapsApiKey: string;
  };
  nodeEnv: string;
}

function validateEnv (): EnvConfig {
  // Check if we're on the client side
  const isClient = typeof window !== 'undefined';

  // For client-side, we only need the public key
  if (isClient) {
    const clientGoogleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!clientGoogleKey) {
      throw new Error('Missing required NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable');
    }

    return {
      client: {
        googleMapsApiKey: clientGoogleKey,
      },
      server: {
        googleMapsApiKey: '', // Empty on client-side
      },
      nodeEnv: process.env.NODE_ENV || 'development'
    };
  }

  // Server-side validation
  const serverGoogleKey = process.env.GOOGLE_MAPS_API_KEY;
  const clientGoogleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!serverGoogleKey) {
    throw new Error('Missing required GOOGLE_MAPS_API_KEY environment variable');
  }
  if (!clientGoogleKey) {
    throw new Error('Missing required NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable');
  }

  return {
    server: {
      googleMapsApiKey: serverGoogleKey,
    },
    client: {
      googleMapsApiKey: clientGoogleKey,
    },
    nodeEnv: process.env.NODE_ENV || 'development'
  };
}

export const env = validateEnv();