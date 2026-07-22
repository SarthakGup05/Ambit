import "./env.js"; // Initialize env first
import { db } from "./db/index.js";
import { societies, user, notices, visitors, complaints, amenities, bookings } from "./models/schema.js";
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

      // 5. Seed Helpdesk Complaints
      console.log("🛠️ Seeding initial helpdesk complaints...");
      await db.delete(complaints).where(eq(complaints.societyId, society.id));
      await db.insert(complaints).values([
        {
          societyId: society.id,
          residentId: adminUser.id,
          title: "Elevator B making loud screeching noise",
          description: "The passenger lift in Tower B vibrates heavily and makes a loud noise when stopping on the 4th floor.",
          category: "elevator",
          priority: "high",
          status: "in_progress",
          comments: [
            {
              id: "cm1",
              author: "Admin Office",
              role: "admin",
              text: "Otis Elevator service engineer notified. Technician visiting today at 4 PM.",
              createdAt: new Date(Date.now() - 43200000).toISOString(),
            },
          ],
        },
        {
          societyId: society.id,
          residentId: adminUser.id,
          title: "Water leakage near main lobby entrance",
          description: "Drip from overhead AC line near lobby entrance gate creating slippery floor.",
          category: "plumbing",
          priority: "urgent",
          status: "open",
          comments: [],
        },
        {
          societyId: society.id,
          residentId: adminUser.id,
          title: "Clubhouse gym treadmill #2 belt loose",
          description: "The second treadmill belt slips when running above 8km/h.",
          category: "maintenance",
          priority: "low",
          status: "resolved",
          comments: [
            {
              id: "cm2",
              author: "Society Maintenance",
              role: "admin",
              text: "Gym technician calibrated and tightened the belt.",
              createdAt: new Date(Date.now() - 259200000).toISOString(),
            },
          ],
        },
      ]);

      // 6. Seed Amenities
      console.log("🌱 Seeding society amenities...");
      await db.delete(bookings).where(eq(bookings.societyId, society.id));
      await db.delete(amenities).where(eq(amenities.societyId, society.id));
      
      const insertedAmenities = await db.insert(amenities).values([
        {
          societyId: society.id,
          name: "Clubhouse Lounge",
          description: "Premium air-conditioned space for community gatherings & parties.",
          capacity: 50,
          status: "active" as const,
          operatingHours: "08:00 AM - 11:00 PM",
          imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        },
        {
          societyId: society.id,
          name: "Swimming Pool",
          description: "Temperature-controlled lap pool with separate kids splash zone.",
          capacity: 25,
          status: "active" as const,
          operatingHours: "06:00 AM - 09:00 PM",
          imageUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800",
        },
        {
          societyId: society.id,
          name: "Tennis Court",
          description: "Synth-court with LED floodlights and automated booking slots.",
          capacity: 4,
          status: "maintenance" as const,
          operatingHours: "06:00 AM - 10:00 PM",
          imageUrl: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800",
        },
        {
          societyId: society.id,
          name: "Fitness Center / Gym",
          description: "Full cardio suite, free weights, and resident personal trainer desk.",
          capacity: 15,
          status: "active" as const,
          operatingHours: "05:00 AM - 11:00 PM",
          imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
        }
      ]).returning();

      // 7. Seed Bookings
      console.log("🗓️ Seeding booking logs...");
      await db.delete(bookings).where(eq(bookings.societyId, society.id));

      const clubhouse = insertedAmenities.find(a => a.name === "Clubhouse Lounge");
      const pool = insertedAmenities.find(a => a.name === "Swimming Pool");
      const tennis = insertedAmenities.find(a => a.name === "Tennis Court");

      const residentUser = await db.query.user.findFirst({
        where: eq(user.email, "resident@ambit.com"),
      });

      if (clubhouse && pool && tennis && residentUser) {
        // Create tomorrow's dates
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const slot1Start = new Date(tomorrow);
        slot1Start.setHours(16, 0, 0, 0); // 4:00 PM
        const slot1End = new Date(tomorrow);
        slot1End.setHours(18, 0, 0, 0); // 6:00 PM

        const slot2Start = new Date(tomorrow);
        slot2Start.setHours(7, 0, 0, 0); // 7:00 AM
        const slot2End = new Date(tomorrow);
        slot2End.setHours(8, 30, 0, 0); // 8:30 AM

        const nextDay = new Date(tomorrow);
        nextDay.setDate(nextDay.getDate() + 1); // 2 days from now
        const slot3Start = new Date(nextDay);
        slot3Start.setHours(18, 0, 0, 0); // 6:00 PM
        const slot3End = new Date(nextDay);
        slot3End.setHours(19, 30, 0, 0); // 7:30 PM

        await db.insert(bookings).values([
          {
            societyId: society.id,
            amenityId: clubhouse.id,
            residentId: residentUser.id,
            startTime: slot1Start,
            endTime: slot1End,
            status: "confirmed" as const,
          },
          {
            societyId: society.id,
            amenityId: pool.id,
            residentId: residentUser.id,
            startTime: slot2Start,
            endTime: slot2End,
            status: "confirmed" as const,
          },
          {
            societyId: society.id,
            amenityId: tennis.id,
            residentId: residentUser.id,
            startTime: slot3Start,
            endTime: slot3End,
            status: "cancelled" as const,
          }
        ]);
      }
    }

    console.log("✅ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
