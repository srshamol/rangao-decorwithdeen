const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wribyhmsmzpxwlxibvvx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zMRhOlsbjp9lnTuydSQnxA_nXWF1pvT';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  console.log('Attempting to insert an ABANDONED CART...');
  const testCart = {
    customer_name: 'DIAGNOSTIC TEST',
    phone: '09999999999',
    items: [{ id: 'test', name: 'Test Product', qty: 1, price: 100 }],
    total_amount: 100,
    is_recovered: false
  };

  const { data, error } = await supabase
    .from('abandoned_carts')
    .insert(testCart)
    .select();

  if (error) {
    console.error('FAILED to insert cart:', error.message);
  } else {
    console.log('SUCCESS! Cart inserted:', data);
  }
}

test();
