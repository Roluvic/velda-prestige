import { sql } from "drizzle-orm";
import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
  descriptionShort: text("description_short").notNull().default(""),
  descriptionLong: text("description_long").notNull().default(""),
  specs: jsonb("specs").notNull().default({}),
  images: text("images").array().notNull().default(sql`'{}'::text[]`),
  documents: text("documents").array().notNull().default(sql`'{}'::text[]`),
});

export const sectors = pgTable("sectors", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  intro: text("intro").notNull().default(""),
  useCases: text("use_cases").array().notNull().default(sql`'{}'::text[]`),
  galleryImages: text("gallery_images").array().notNull().default(sql`'{}'::text[]`),
  recommendedProductSlugs: text("recommended_product_slugs").array().notNull().default(sql`'{}'::text[]`),
  keywords: text("keywords").array().notNull().default(sql`'{}'::text[]`),
  flyer: text("flyer"),
});

export const timelineEvents = pgTable("timeline_events", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
});

export const quoteRequests = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  company: text("company").notNull().default(""),
  applicationType: text("application_type").notNull().default(""),
  environment: text("environment").notNull().default(""),
  corrosionRequirement: text("corrosion_requirement").notNull().default(""),
  load: text("load").notNull().default(""),
  suspensionPoints: text("suspension_points").notNull().default(""),
  cableLength: text("cable_length").notNull().default(""),
  angle: text("angle").notNull().default(""),
  adjustability: text("adjustability").notNull().default(""),
  endFittings: text("end_fittings").notNull().default(""),
  certifications: text("certifications").notNull().default(""),
  quantity: text("quantity").notNull().default(""),
  notes: text("notes").notNull().default(""),
  aiTranscript: text("ai_transcript").notNull().default(""),
  recommendedConfig: jsonb("recommended_config"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  category: text("category").notNull().default("algemeen"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertSectorSchema = createInsertSchema(sectors).omit({ id: true });
export const insertTimelineEventSchema = createInsertSchema(timelineEvents).omit({ id: true });
export const insertQuoteRequestSchema = createInsertSchema(quoteRequests).omit({ id: true, createdAt: true, status: true, recommendedConfig: true, aiTranscript: true });
export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true });

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Sector = typeof sectors.$inferSelect;
export type InsertSector = z.infer<typeof insertSectorSchema>;
export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;
export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  requirements: text("requirements").array().notNull().default(sql`'{}'::text[]`),
  offerings: text("offerings").array().notNull().default(sql`'{}'::text[]`),
  location: text("location").notNull().default("Ronse"),
  type: text("type").notNull().default("voltijds"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  motivation: text("motivation").notNull().default(""),
  jobSlug: text("job_slug"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const catalogDownloads = pgTable("catalog_downloads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull().default(""),
  phone: text("phone").notNull().default(""),
  catalogSlug: text("catalog_slug").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true });
export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({ id: true, createdAt: true });
export const insertCatalogDownloadSchema = createInsertSchema(catalogDownloads).omit({ id: true, createdAt: true });

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type CatalogDownload = typeof catalogDownloads.$inferSelect;
export type InsertCatalogDownload = z.infer<typeof insertCatalogDownloadSchema>;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});
