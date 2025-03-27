import { pgTable, text, serial, integer, boolean, json, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum for user roles
export const userRoleEnum = pgEnum('user_role', ['customer', 'dealer', 'organization', 'admin']);

// Enum for waste report status
export const reportStatusEnum = pgEnum('report_status', ['pending', 'scheduled', 'in_progress', 'completed', 'rejected']);

// Enum for event status
export const eventStatusEnum = pgEnum('event_status', ['upcoming', 'ongoing', 'completed', 'cancelled']);

// Enum for donation status
export const donationStatusEnum = pgEnum('donation_status', ['available', 'requested', 'matched', 'completed']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  address: json("address").notNull(),
  role: userRoleEnum("role").notNull().default('customer'),
  createdAt: timestamp("created_at").defaultNow(),
  socialPoints: integer("social_points").default(0),
});

// Waste Reports table
export const wasteReports = pgTable("waste_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: json("location").notNull(),
  images: text("images").array(),
  status: reportStatusEnum("status").notNull().default('pending'),
  isSegregated: boolean("is_segregated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  assignedDealerId: integer("assigned_dealer_id").references(() => users.id),
  scheduledDate: timestamp("scheduled_date"),
});

// Donations table
export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  itemName: text("item_name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  images: text("images").array(),
  status: donationStatusEnum("status").notNull().default('available'),
  createdAt: timestamp("created_at").defaultNow(),
  requestedByOrganizationId: integer("requested_by_organization_id").references(() => users.id),
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  organizerId: integer("organizer_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: json("location").notNull(),
  date: timestamp("date").notNull(),
  status: eventStatusEnum("status").notNull().default('upcoming'),
  createdAt: timestamp("created_at").defaultNow(),
  maxParticipants: integer("max_participants"),
  image: text("image"),
});

// Event Participants
export const eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  userId: integer("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Media Content
export const mediaContent = pgTable("media_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  contentType: text("content_type").notNull(), // video, article, blog, image
  authorId: integer("author_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  tags: text("tags").array(),
  published: boolean("published").default(true),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  socialPoints: true,
});

export const insertWasteReportSchema = createInsertSchema(wasteReports).omit({
  id: true,
  createdAt: true,
  assignedDealerId: true,
  scheduledDate: true,
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
  requestedByOrganizationId: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertEventParticipantSchema = createInsertSchema(eventParticipants).omit({
  id: true,
  joinedAt: true,
});

export const insertMediaContentSchema = createInsertSchema(mediaContent).omit({
  id: true,
  createdAt: true,
});

// Address validation schema
export const addressSchema = z.object({
  basicAddress: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  pinCode: z.string().min(1, "PIN code is required"),
  village: z.string().optional(),
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWasteReport = z.infer<typeof insertWasteReportSchema>;
export type WasteReport = typeof wasteReports.$inferSelect;

export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertEventParticipant = z.infer<typeof insertEventParticipantSchema>;
export type EventParticipant = typeof eventParticipants.$inferSelect;

export type InsertMediaContent = z.infer<typeof insertMediaContentSchema>;
export type MediaContent = typeof mediaContent.$inferSelect;

export type Address = z.infer<typeof addressSchema>;
