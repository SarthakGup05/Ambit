import postgres from "postgres";
import * as dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL is not set");
  process.exit(1);
}

async function applyLatestMigration() {
  const sql = postgres(databaseUrl!, { max: 1, prepare: false });
  try {
    console.log("⏳ Applying 0003_stale_ikaris.sql migration to PostgreSQL database...");
    const migrationFile = path.resolve("./drizzle/0003_stale_ikaris.sql");
    const sqlContent = fs.readFileSync(migrationFile, "utf-8");

    // Execute statements split by semicolon or statement-breakpoint
    const statements = sqlContent
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const statement of statements) {
      console.log(`Executing SQL: ${statement.substring(0, 80)}...`);
      await sql.unsafe(statement);
    }

    console.log("✅ Database schema migration successfully pushed and applied!");
  } catch (error: any) {
    if (error.code === '42701') {
      console.log("ℹ️ Columns already exist in database schema. Database is up to date!");
    } else {
      console.error("❌ Error executing migration:", error.message || error);
    }
  } finally {
    await sql.end();
  }
}

applyLatestMigration();
