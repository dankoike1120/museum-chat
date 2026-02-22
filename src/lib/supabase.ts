import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role key
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export type ObjectRecord = {
  id: string;
  name: string;
  tone: string;
  knowledge: string;
  suggested_questions: string[];
  image_urls: string[];
  created_at: string;
  updated_at: string;
};
