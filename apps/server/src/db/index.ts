import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../models/schema.js";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

// Disable prefetch/prepared statements for database pooler compatibility (e.g. Supabase Transaction Pooler)
const queryClient = postgres(databaseUrl, {
  prepare: false,
  onnotice: () => {}, // Suppress PostgreSQL notices (like column already exists) to keep logs clean
});

// Self-healing schema migrations for new columns
queryClient.unsafe(`
  ALTER TABLE "user" ADD COLUMN IF NOT EXISTS push_token text;
  ALTER TABLE visitors ADD COLUMN IF NOT EXISTS check_in_time timestamp;
  ALTER TABLE visitors ADD COLUMN IF NOT EXISTS check_out_time timestamp;
  ALTER TABLE amenities ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
  ALTER TABLE amenities ADD COLUMN IF NOT EXISTS operating_hours text;
  ALTER TABLE amenities ADD COLUMN IF NOT EXISTS image_url text;

  -- Towers / Floors / Flats (layout structure for society setup wizard)
  CREATE TABLE IF NOT EXISTS towers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id uuid NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS floors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tower_id uuid NOT NULL REFERENCES towers(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS flats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    floor_id uuid NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  );

  -- Ensure admin flat_number is persisted on the user table
  ALTER TABLE "user" ADD COLUMN IF NOT EXISTS flat_number text;
`).catch((err) => {
  console.warn("Auto-migration notice:", err.message);
});

export const db = drizzle(queryClient, { schema });
