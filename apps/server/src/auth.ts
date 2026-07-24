import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { APIError } from "better-auth/api";
import { eq } from "drizzle-orm";
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
  databaseHooks: {
    user: {
      create: {
        before: async (user, context) => {
          const body = context?.body as any;
          const inviteCode = body?.inviteCode || body?.invite_code;

          if (inviteCode && typeof inviteCode === "string" && inviteCode.trim().length > 0) {
            const cleanCode = inviteCode.trim().toUpperCase();
            const [matchedSociety] = await db
              .select()
              .from(schema.societies)
              .where(eq(schema.societies.inviteCode, cleanCode))
              .limit(1);

            if (!matchedSociety) {
              throw new APIError("BAD_REQUEST", {
                message: "Invalid or expired Invite Code. Please verify with your society admin.",
              });
            }

            const assignedRole = body?.role === "guard" ? "guard" : "resident";

            return {
              data: {
                ...user,
                societyId: matchedSociety.id,
                role: assignedRole,
              },
            };
          }

          // If no invite code, registration creates a Society Admin
          return {
            data: {
              ...user,
              role: "admin",
            },
          };
        },
      },
    },
  },
  advanced: {},
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
