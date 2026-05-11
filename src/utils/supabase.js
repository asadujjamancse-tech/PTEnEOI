/**
 * supabase.js — Supabase client and user identity helper
 *
 * The Supabase client connects directly from the browser using the anon/public key.
 * This is safe because Row Level Security (RLS) is enabled on all tables.
 *
 * VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env before build.
 * They are baked into the frontend bundle at build time by Vite.
 *
 * getUserId(): returns the logged-in username from localStorage.
 * This is stored at login time (LoginScreen.jsx) and used as the user_id
 * column value in all Supabase tables, separating data per user.
 *
 * Tables: notes, video_links, bookmarks
 * See docs/ARCHITECTURE.md §9 for how to add new tables.
 */
import { createClient } from "@supabase/supabase-js";

const URL  = import.meta.env.VITE_SUPABASE_URL;
const KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (URL && KEY) ? createClient(URL, KEY) : null;

// Stable user_id — derived from app login username stored at login time
export function getUserId() {
  return localStorage.getItem("app_username") || "default";
}
