-- Database Migration: Rename columns to reflect company context
-- Execution Date: 2025-12-09

-- Rename 'name' column to 'company_name'
ALTER TABLE users RENAME COLUMN name TO company_name;

-- Rename 'email' column to 'company_email'
ALTER TABLE users RENAME COLUMN email TO company_email;

-- Update the unique constraint on company_email (if exists)
-- Drop old constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS uk_email;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- Add new constraint for company_email uniqueness
ALTER TABLE users ADD CONSTRAINT uk_company_email UNIQUE (company_email);
