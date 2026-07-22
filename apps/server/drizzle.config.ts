import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables for Drizzle Kit
dotenv.config();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/models/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schemaFilter: ["public"],
});
