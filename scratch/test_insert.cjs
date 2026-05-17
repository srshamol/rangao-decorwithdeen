const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wribyhmsmzpxwlxibvvx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zMRhOlsbjp9lnTuydSQnxA_nXWF1pvT';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  console.log('Attempting to insert a TEST ORDER...');
  const testOrder = {
    customer_name: 'TEST ADMIN CHECK',
    phone: '01234567890',
    address: 'Diagnostic Test Address',
    district: 'ঢাকা',
    items: [{ id: 'test', name: 'Test Product', qty: 1, price: 100 }],
    subtotal: 100,
    delivery_charge: 60,
    total: 160,
    status: 'pending',
    payment_method: 'cod',
    order_number: 'TEST-' + Date.now()
  };

  const { data, error } = await supabase
    .from('orders')
    .insert(testOrder)
    .select();

  if (error) {
    console.error('FAILED to insert test order:', error.message);
    if (error.message.includes('permission denied')) {
        console.log('CRITICAL: RLS is blocking inserts!');
    }
  } else {
    console.log('SUCCESS! Test order inserted:', data);
  }
}

test();
