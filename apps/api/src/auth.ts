import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { db } from "./db/index.js";
import * as schema from "./db/schema.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    "ambit://",
    ...(process.env.NODE_ENV === "development" ? [
      "exp://",
      "exp://**",
      "exp://192.168.*.*:*/**",
    ] : [])
  ],
  // Custom fields we added to the schema
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "resident",
      },
      societyId: {
        type: "string",
      },
      flatNumber: {
        type: "string",
      },
    },
  },
  plugins: [
    admin(),
    expo(),
  ],
});
