const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wribyhmsmzpxwlxibvvx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zMRhOlsbjp9lnTuydSQnxA_nXWF1pvT';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  console.log('Checking table metadata...');
  const { data, error } = await supabase.rpc('get_table_info', { table_name: 'orders' });
  
  if (error) {
    console.log('RPC get_table_info failed (expected if not defined).');
  } else {
    console.log('Table Info:', data);
  }

  // Check if we can select from information_schema
  const { data: info, error: infoErr } = await supabase
    .from('information_schema.tables')
    .select('table_name, table_schema, table_type')
    .eq('table_name', 'orders');

  if (infoErr) {
    console.log('Cannot access information_schema directly (expected for anon).');
  } else {
    console.log('Information Schema:', info);
  }
}

test();
