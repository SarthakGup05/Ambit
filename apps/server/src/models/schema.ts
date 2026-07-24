import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

// 1. Societies (Multi-tenant Boundaries)
export const societies = pgTable("societies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. User (Better-Auth Standard Schema + Custom Extensions)
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  
  // Custom multi-tenant & role extensions
  role: text("role").$type<"admin" | "resident" | "guard">().default("resident").notNull(),
  societyId: uuid("society_id").references(() => societies.id),
  flatNumber: text("flat_number"),

  // Better-Auth Admin Plugin extensions
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  pushToken: text("push_token"),
});

// 3. Better-Auth Sessions
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

// 4. Better-Auth Accounts
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// 5. Better-Auth Verification
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// 6. Visitors (Logs of Check-ins)
export const visitors = pgTable("visitors", {
  id: uuid("id").primaryKey().defaultRandom(),
  societyId: uuid("society_id")
    .notNull()
    .references(() => societies.id),
  flatNumber: text("flat_number").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  purpose: text("purpose").notNull(), // 'delivery' | 'cab' | 'friend' | 'service' | etc.
  status: text("status")
    .$type<"pending" | "approved" | "denied" | "checked_in" | "checked_out">()
    .default("pending")
    .notNull(),
  approvedBy: text("approved_by").references(() => user.id),
  checkInTime: timestamp("check_in_time"),
  checkOutTime: timestamp("check_out_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 7. QR Guest Passes (Pre-approved Entries)
export const guestPasses = pgTable("guest_passes", {
  id: uuid("id").primaryKey().defaultRandom(),
  societyId: uuid("society_id")
    .notNull()
    .references(() => societies.id),
  residentId: text("resident_id")
    .notNull()
    .references(() => user.id),
  guestName: text("guest_name").notNull(),
  validFrom: timestamp("valid_from").notNull(),
  validTo: timestamp("valid_to").notNull(),
  token: text("token").notNull().unique(), // signed token
  isUsed: boolean("is_used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 8. Notices (Broadcast Bulletins)
export const notices = pgTable("notices", {
  id: uuid("id").primaryKey().defaultRandom(),
  societyId: uuid("society_id")
    .notNull()
    .references(() => societies.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // 'Maintenance' | 'Society' | 'Events' | 'Security'
  authorId: text("author_id")
    .notNull()
    .references(() => user.id),
  isUrgent: boolean("is_urgent").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 9. Polls (Community Questions)
export const polls = pgTable("polls", {
  id: uuid("id").primaryKey().defaultRandom(),
  societyId: uuid("society_id")
    .notNull()
    .references(() => societies.id),
  question: text("question").notNull(),
  options: jsonb("options").$type<string[]>().notNull(), // array of options
  expiresAt: timestamp("expires_at").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 10. Poll Votes (Response Ledger)
export const pollVotes = pgTable("poll_votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  pollId: uuid("poll_id")
    .notNull()
    .references(() => polls.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  option: text("option").notNull(), // chosen choice
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 11. Complaints (Helpdesk)
export const complaints = pgTable("complaints", {
  id: uuid("id").primaryKey().defaultRandom(),
  societyId: uuid("society_id")
    .notNull()
    .references(() => societies.id),
  residentId: text("resident_id")
    .notNull()
    .references(() => user.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status")
    .$type<"open" | "in_progress" | "resolved" | "closed">()
    .default("open")
    .notNull(),
  category: text("category").notNull(),
  priority: text("priority")
    .$type<"low" | "medium" | "high" | "urgent">()
    .default("medium")
    .notNull(),
  comments: jsonb("comments")
    .$type<{ id: string; author: string; role: string; text: string; createdAt: string }[]>()
    .default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 12. Amenities (Reserveable Resources)
export const amenities = pgTable("amenities", {
  id: uuid("id").primaryKey().defaultRandom(),
  societyId: uuid("society_id")
    .notNull()
    .references(() => societies.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  capacity: integer("capacity").notNull(),
  status: text("status").$type<"active" | "maintenance" | "closed">().default("active").notNull(),
  operatingHours: text("operating_hours"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 13. Bookings (Amenity Reservations)
export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  societyId: uuid("society_id")
    .notNull()
    .references(() => societies.id),
  amenityId: uuid("amenity_id")
    .notNull()
    .references(() => amenities.id),
  residentId: text("resident_id")
    .notNull()
    .references(() => user.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status")
    .$type<"pending" | "confirmed" | "cancelled">()
    .default("pending")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 14. Notifications (Resident Alerts)
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  societyId: uuid("society_id")
    .notNull()
    .references(() => societies.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  title: text("title").notNull(),
  body: text("body").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 15. Towers (Layout Structure)
export const towers = pgTable("towers", {
  id: uuid("id").primaryKey().defaultRandom(),
  societyId: uuid("society_id")
    .notNull()
    .references(() => societies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 16. Floors (Layout Structure)
export const floors = pgTable("floors", {
  id: uuid("id").primaryKey().defaultRandom(),
  towerId: uuid("tower_id")
    .notNull()
    .references(() => towers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 17. Flats (Layout Structure)
export const flats = pgTable("flats", {
  id: uuid("id").primaryKey().defaultRandom(),
  floorId: uuid("floor_id")
    .notNull()
    .references(() => floors.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
