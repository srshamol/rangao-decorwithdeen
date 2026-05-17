const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wribyhmsmzpxwlxibvvx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zMRhOlsbjp9lnTuydSQnxA_nXWF1pvT';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  console.log('Listing ALL tables accessible via this key...');
  
  // Postgrest doesn't allow listing tables directly via anon key easily, 
  // but we can try common names.
  const tables = ['orders', 'confirmed_orders', 'shop_orders', 'store_orders', 'products', 'categories', 'abandoned_carts'];
  
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (!error) {
      console.log(`Table '${table}' exists. Count: ${count}`);
    } else {
      console.log(`Table '${table}' error: ${error.message}`);
    }
  }

  // Check the 'orders' table specifically for ANY row, even if RLS is on.
  // Sometimes a select without filters on a specific ID can bypass or show different errors.
  const { data: raw, error: rawError } = await supabase.rpc('get_orders'); // Try if there's an RPC
  if (rawError) console.log('RPC get_orders failed:', rawError.message);
  else console.log('RPC get_orders data:', raw);
}

test();
