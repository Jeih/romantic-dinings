export interface EnvConfig {
  server: {
    googleMapsApiKey: string;
    supabaseUrl: string;
    supabaseKey: string;
  };
  client: {
    googleMapsApiKey: string;
  };
  nodeEnv: string;
}

function validateEnv (): EnvConfig {
  const serverGoogleKey = process.env.GOOGLE_MAPS_API_KEY;
  const clientGoogleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serverGoogleKey) {
    throw new Error('Missing required GOOGLE_MAPS_API_KEY environment variable');
  }
  if (!clientGoogleKey) {
    throw new Error('Missing required NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable');
  }
  if (!supabaseUrl) {
    throw new Error('Missing required SUPABASE_URL environment variable');
  }
  if (!supabaseKey) {
    throw new Error('Missing required SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return {
    server: {
      googleMapsApiKey: serverGoogleKey,
      supabaseUrl,
      supabaseKey,
    },
    client: {
      googleMapsApiKey: clientGoogleKey,
    },
    nodeEnv: process.env.NODE_ENV || 'development'
  };
}

export const env = validateEnv();