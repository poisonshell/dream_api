-- Run this on production if tables already exist but migrations table is missing/empty
-- This marks all migrations as executed without actually running them

-- First, ensure migrations table exists (it should be created by TypeORM)
-- Then insert the migration records

INSERT INTO migrations (timestamp, name) 
VALUES 
  (1762329867595, 'InitialSchema1762329867595'),
  (1762330000000, 'AddProductIndexes1762330000000'),
  (1762344195290, 'AddCategoryEntity1762344195290')
ON CONFLICT (timestamp) DO NOTHING;

-- Verify
SELECT * FROM migrations ORDER BY timestamp;
