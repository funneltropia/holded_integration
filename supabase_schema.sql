-- Enable the pgcrypto extension to use gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create the `accounts` table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id TEXT UNIQUE NOT NULL,
  holded_api_key TEXT,
  ghl_api_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create the `contacts_map` table
CREATE TABLE IF NOT EXISTS contacts_map (
  ghl_contact_id TEXT PRIMARY KEY,
  holded_contact_id TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Set up Row Level Security (RLS) - Basic policies for the API to access it
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts_map ENABLE ROW LEVEL SECURITY;

-- Allow read/write access to everyone anonymously for this MVP (can be restricted later if there is auth)
CREATE POLICY "Allow anonymous read access to accounts" ON accounts FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access to accounts" ON accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access to accounts" ON accounts FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous read access to contacts_map" ON contacts_map FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access to contacts_map" ON contacts_map FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access to contacts_map" ON contacts_map FOR UPDATE USING (true);
