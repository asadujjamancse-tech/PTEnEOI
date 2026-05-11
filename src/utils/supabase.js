import { createClient } from "@supabase/supabase-js";

const URL  = import.meta.env.VITE_SUPABASE_URL;
const KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (URL && KEY) ? createClient(URL, KEY) : null;

// Stable user_id — derived from app login username stored at login time
export function getUserId() {
  return localStorage.getItem("app_username") || "default";
}
