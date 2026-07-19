import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../models/schema.js";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

// Disable prefetch/prepared statements for database pooler compatibility (e.g. Supabase Transaction Pooler)
const queryClient = postgres(databaseUrl, { prepare: false });

// Self-healing schema migrations for new columns
queryClient.unsafe(`
  ALTER TABLE visitors ADD COLUMN IF NOT EXISTS check_in_time timestamp;
  ALTER TABLE visitors ADD COLUMN IF NOT EXISTS check_out_time timestamp;
`).catch((err) => {
  console.warn("Auto-migration notice:", err.message);
});

export const db = drizzle(queryClient, { schema });
