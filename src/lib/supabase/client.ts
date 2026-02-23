import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
    console.warn("Supabase URL or anon key missing. Gallery and share features will be disabled.");
}

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
export const isGalleryEnabled = Boolean(url && anonKey);

export type SharedCard = {
    id: string;
    image_url: string;
    caption: string | null;
    locale: string;
    status: string;
    created_at: string;
};
