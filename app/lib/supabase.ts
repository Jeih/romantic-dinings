import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

export type Venue = {
  id: string;
  place_id: string;
  name: string;
  type: 'restaurant' | 'bar';
  vibes: string[];
  duration: number;
  price: string;
  address: string;
  cuisine: string | null;
  created_at: string;
  updated_at: string;
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  env.server.supabaseUrl,
  env.server.supabaseKey
);