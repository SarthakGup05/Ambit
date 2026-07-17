import "./env.js"; // Initialize env first
import { db } from "./db/index.js";
import { societies, user, notices, visitors } from "./models/schema.js";
import { auth } from "./auth.js";
import { eq, sql } from "drizzle-orm";

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // Ensure Better-Auth admin columns exist (bypasses drizzle-kit Supabase introspection bugs)
    console.log("🔧 Ensuring Better-Auth admin columns exist in 'user' table...");
    await db.execute(sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banned" boolean;`);
    await db.execute(sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "ban_reason" text;`);
    await db.execute(sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "ban_expires" timestamp;`);
    // 1. Create or Find Test Society
    let testSociety = await db.query.societies.findFirst({
      where: eq(societies.inviteCode, "AMBIT1"),
    });

    if (!testSociety) {
      console.log("🏢 Creating test society 'Ambit Heights'...");
      const [inserted] = await db
        .insert(societies)
        .values({
          name: "Ambit Heights",
          address: "123 Security Avenue, Tech City",
          inviteCode: "AMBIT1",
        })
        .returning();
      testSociety = inserted;
    }

    if (!testSociety) {
      throw new Error("Failed to create or find test society");
    }

    const society = testSociety;

    console.log(`🏢 Society: ${society.name} [ID: ${society.id}, Code: ${society.inviteCode}]`);

    // Helper to create user via Better-Auth and assign role + society
    async function createTestUser(email: string, name: string, role: "admin" | "resident" | "guard", flatNumber: string | null) {
      // Check if user exists
      let dbUser = await db.query.user.findFirst({
        where: eq(user.email, email),
      });

      if (!dbUser) {
        console.log(`👤 Registering user ${name} (${email})...`);
        
        // Use Better-Auth programmatic sign up to hash passwords correctly
        const result = await auth.api.signUpEmail({
          body: {
            email,
            password: "password123",
            name,
            societyId: society.id,
            flatNumber: flatNumber || "",
          },
        });

        if (!result || !result.user) {
          throw new Error(`Failed to sign up ${email}`);
        }

        // Fetch the user record from database
        dbUser = await db.query.user.findFirst({
          where: eq(user.email, email),
        });
      }

      if (dbUser) {
        // Update user record with role, societyId, and flatNumber
        console.log(`🔧 Updating role and society for ${email} -> ${role}...`);
        await db
          .update(user)
          .set({
            role,
            societyId: society.id,
            flatNumber,
            emailVerified: true,
          })
          .where(eq(user.id, dbUser.id));
      }
    }

    // 2. Create the Three Test Users
    await createTestUser("admin@ambit.com", "Ambit Admin", "admin", null);
    await createTestUser("resident@ambit.com", "Ambit Resident", "resident", "101-A");
    await createTestUser("guard@ambit.com", "Ambit Guard", "guard", null);

    // Fetch Admin user id to bind notices and approvals
    const adminUser = await db.query.user.findFirst({
      where: eq(user.email, "admin@ambit.com"),
    });

    if (adminUser) {
      // 3. Seed Bulletins / Notices
      console.log("📢 Seeding society notices...");
      await db.delete(notices).where(eq(notices.societyId, society.id));
      await db.insert(notices).values([
        {
          societyId: society.id,
          title: "Power Substation Maintenance",
          description: "Scheduled power interruption this coming Sunday.",
          content: "There will be a power shutdown on Sunday from 10:00 AM to 2:00 PM for transformer inspection. High-load appliances should be kept switched off.",
          category: "Maintenance",
          authorId: adminUser.id,
          isUrgent: true,
        },
        {
          societyId: society.id,
          title: "Annual General Meeting (AGM)",
          description: "Important community guidelines and budget reviews.",
          content: "Residents are requested to attend the Annual General Meeting in the clubhouse on July 25th at 6:00 PM to align on security rules.",
          category: "Society",
          authorId: adminUser.id,
          isUrgent: false,
        }
      ]);

      // 4. Seed Visitor Logs
      console.log("📋 Seeding visitor entry logs...");
      await db.delete(visitors).where(eq(visitors.societyId, society.id));
      await db.insert(visitors).values([
        {
          societyId: society.id,
          flatNumber: "101-A",
          name: "Rahul Sharma",
          phone: "+91 98765 43210",
          purpose: "Friend",
          status: "checked_in",
          approvedBy: adminUser.id,
        },
        {
          societyId: society.id,
          flatNumber: "B-104",
          name: "Zomato Delivery",
          phone: "+91 99999 88888",
          purpose: "Delivery",
          status: "approved",
          approvedBy: adminUser.id,
        },
        {
          societyId: society.id,
          flatNumber: "C-309",
          name: "Urban Company Cleaner",
          phone: "+91 88888 77777",
          purpose: "Service",
          status: "denied",
          approvedBy: adminUser.id,
        }
      ]);
    }

    console.log("✅ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
