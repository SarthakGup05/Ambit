import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL is not set in environment variables");
  process.exit(1);
}

async function runMigration() {
  console.log("⏳ Connecting to database and applying migrations...");
  const sql = postgres(databaseUrl!, { max: 1, prepare: false });
  const db = drizzle(sql);

  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✅ All SQL migrations successfully applied to database!");
  } catch (error) {
    console.error("❌ Error applying migrations:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
