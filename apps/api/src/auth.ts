import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { db } from "./db/index.js";
import * as schema from "./models/schema.js";

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
  trustedOrigins: (request) => {
    const origins = ["ambit://"];
    const origin = request?.headers?.get("origin");
    if (origin) origins.push(origin);
    return origins;
  },
  // Custom fields we added to the schema
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "resident",
      },
      societyId: {
        type: "string",
        required: false,
      },
      flatNumber: {
        type: "string",
        required: false,
      },
    },
  },
  plugins: [
    admin(),
    expo(),
  ],
});
