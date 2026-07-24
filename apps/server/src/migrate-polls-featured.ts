import "./env.js";
import { db } from "./db/index.js";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("🔧 Adding is_featured column to polls table...");
  await db.execute(
    sql`ALTER TABLE polls ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false`
  );
  console.log("✅ Migration complete!");
  process.exit(0);
}

migrate().catch((e) => {
  console.error("❌ Migration failed:", e.message);
  process.exit(1);
});
