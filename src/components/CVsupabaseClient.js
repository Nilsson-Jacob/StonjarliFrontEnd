import { createClient } from "@supabase/supabase-js";

const supabaseUrlCV = process.env.REACT_APP_SUPABASE_URL_CV;
const supabaseAnonKeyCV =
  process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY_CV;

export const supabase = createClient(supabaseUrlCV, supabaseAnonKeyCV);
