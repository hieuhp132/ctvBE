const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Ensure .env is loaded

const SUPABASE_URL = process.env.SUPABASE_URL;  // ✅ Must be the full Supabase project URL
const SUPABASE_KEY = process.env.SUPABASE_KEY;  // ✅ Anon or service role key

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;
