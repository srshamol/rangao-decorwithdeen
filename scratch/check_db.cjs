const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wribyhmsmzpxwlxibvvx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zMRhOlsbjp9lnTuydSQnxA_nXWF1pvT'; // From .env

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  console.log('Testing connection to Supabase...');
  const { data, count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Error fetching orders:', error.message);
  } else {
    console.log('Successfully connected!');
    console.log('Total Orders in database:', count);
    console.log('Orders data:', data);
  }

  const { data: abandoned, count: abandonedCount, error: abandonedError } = await supabase
    .from('abandoned_carts')
    .select('*', { count: 'exact' });

  if (abandonedError) {
    console.error('Error fetching abandoned carts:', abandonedError.message);
  } else {
    console.log('Total Abandoned Carts:', abandonedCount);
    const recovered = abandoned?.filter(c => c.is_recovered);
    console.log('Recovered Carts:', recovered?.length);
    console.log('Recovered Carts data:', recovered);
  }
}

test();
