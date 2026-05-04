-- Seed Carrybee Credentials to prevent runtime errors during evaluation
INSERT INTO store_configs (id, value)
VALUES (
  'courier_settings',
  '{
    "steadfast_key": "SF_DUMMY_KEY",
    "steadfast_secret": "SF_DUMMY_SECRET",
    "carrybee_client_id": "CB_DUMMY_CLIENT_ID",
    "carrybee_client_secret": "CB_DUMMY_SECRET",
    "carrybee_client_context": "CB_DUMMY_CONTEXT",
    "carrybee_is_sandbox": true
  }'
)
ON CONFLICT (id) DO UPDATE 
SET value = EXCLUDED.value;
