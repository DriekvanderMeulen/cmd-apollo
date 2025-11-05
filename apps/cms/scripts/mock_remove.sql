-- Mock Remove SQL File
-- Removes all mock data with public_id starting with "mock_"
-- Run this file to clean up test data without affecting real data

-- Delete in reverse order of dependencies to avoid foreign key constraint violations

-- Delete mock iterations (where object_id references mock objects)
DELETE FROM iterations
WHERE object_id IN (
  SELECT id FROM objects WHERE public_id LIKE 'mock_%'
);

-- Delete mock app codes (where user_id references mock users)
DELETE FROM app_codes
WHERE user_id IN (
  SELECT id FROM users WHERE public_id LIKE 'mock_%'
);

-- Delete mock objects (where public_id starts with "mock_")
DELETE FROM objects
WHERE public_id LIKE 'mock_%';

-- Delete mock collections (where public_id starts with "mock_")
DELETE FROM collections
WHERE public_id LIKE 'mock_%';

-- Delete mock categories (where public_id starts with "mock_")
DELETE FROM categories
WHERE public_id LIKE 'mock_%';

-- Delete mock users (where public_id starts with "mock_")
-- Note: This will also cascade delete related sessions, oauth_accounts, and verification_tokens
DELETE FROM users
WHERE public_id LIKE 'mock_%';

-- Delete mock tenants (where public_id starts with "mock_")
DELETE FROM tenants
WHERE public_id LIKE 'mock_%';

