const { createClient } = require('@supabase/supabase-js');

const defaultSupabaseUrl = 'https://iqslzqzldhlxmeudppit.supabase.co';
const defaultSupabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxc2x6cXpsZGhseG1ldWRwcGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NjY2NzgsImV4cCI6MjA3MTI0MjY3OH0.PHfxuMHM42l4Axgbrt40VdbCkoMmmlQabuArpUOXszY';

const supabaseUrl = process.env.SUPABASE_URL?.trim() || defaultSupabaseUrl;
const supabaseKey = process.env.SUPABASE_ANON_KEY?.trim() || defaultSupabaseKey;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase credentials are missing. Falling back to the bundled development keys. Update SUPABASE_URL and SUPABASE_ANON_KEY for production use.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
