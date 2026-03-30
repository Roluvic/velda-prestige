import { eq, ilike, and, or, asc, desc, count } from "drizzle-orm";
import { db } from "./db";
import {
  products, sectors, timelineEvents, quoteRequests, contactMessages,
  jobs, jobApplications, catalogDownloads, users,
  type Product, type InsertProduct,
  type Sector, type InsertSector,
  type TimelineEvent, type InsertTimelineEvent,
  type QuoteRequest, type InsertQuoteRequest,
  type ContactMessage, type InsertContactMessage,
  type Job, type InsertJob,
  type JobApplication, type InsertJobApplication,
  type CatalogDownload, type InsertCatalogDownload,
  type User, type InsertUser,
} from "@shared/schema";

export interface IStorage {
  getProducts(filters?: { type?: string; category?: string; search?: string }): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  getSectors(): Promise<Sector[]>;
  getSectorBySlug(slug: string): Promise<Sector | undefined>;
  createSector(sector: InsertSector): Promise<Sector>;
  updateSector(id: number, data: Partial<InsertSector>): Promise<Sector | undefined>;
  deleteSector(id: number): Promise<boolean>;

  getTimelineEvents(): Promise<TimelineEvent[]>;
  createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent>;
  updateTimelineEvent(id: number, data: Partial<InsertTimelineEvent>): Promise<TimelineEvent | undefined>;
  deleteTimelineEvent(id: number): Promise<boolean>;

  createQuoteRequest(request: InsertQuoteRequest): Promise<QuoteRequest>;
  getQuoteRequests(): Promise<QuoteRequest[]>;
  getQuoteRequestById(id: number): Promise<QuoteRequest | undefined>;
  updateQuoteRequestStatus(id: number, status: string): Promise<QuoteRequest | undefined>;
  deleteQuoteRequest(id: number): Promise<boolean>;

  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  deleteContactMessage(id: number): Promise<boolean>;

  getJobs(includeInactive?: boolean): Promise<Job[]>;
  getJobBySlug(slug: string): Promise<Job | undefined>;
  getJobById(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, data: Partial<InsertJob>): Promise<Job | undefined>;
  deleteJob(id: number): Promise<boolean>;

  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  getJobApplications(jobSlug?: string): Promise<JobApplication[]>;
  deleteJobApplication(id: number): Promise<boolean>;

  createCatalogDownload(download: InsertCatalogDownload): Promise<CatalogDownload>;
  getCatalogDownloads(): Promise<CatalogDownload[]>;

  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(filters?: { type?: string; category?: string; search?: string }): Promise<Product[]> {
    const conditions = [];
    if (filters?.type) {
      conditions.push(eq(products.type, filters.type));
    }
    if (filters?.category) {
      conditions.push(eq(products.category, filters.category));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(products.name, `%${filters.search}%`),
          ilike(products.descriptionShort, `%${filters.search}%`)
        )
      );
    }
    if (conditions.length > 0) {
      return db.select().from(products).where(and(...conditions));
    }
    return db.select().from(products);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  async getSectors(): Promise<Sector[]> {
    return db.select().from(sectors);
  }

  async getSectorBySlug(slug: string): Promise<Sector | undefined> {
    const [sector] = await db.select().from(sectors).where(eq(sectors.slug, slug));
    return sector;
  }

  async createSector(sector: InsertSector): Promise<Sector> {
    const [created] = await db.insert(sectors).values(sector).returning();
    return created;
  }

  async updateSector(id: number, data: Partial<InsertSector>): Promise<Sector | undefined> {
    const [updated] = await db.update(sectors).set(data).where(eq(sectors.id, id)).returning();
    return updated;
  }

  async deleteSector(id: number): Promise<boolean> {
    const result = await db.delete(sectors).where(eq(sectors.id, id)).returning();
    return result.length > 0;
  }

  async getTimelineEvents(): Promise<TimelineEvent[]> {
    return db.select().from(timelineEvents).orderBy(asc(timelineEvents.year));
  }

  async createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent> {
    const [created] = await db.insert(timelineEvents).values(event).returning();
    return created;
  }

  async updateTimelineEvent(id: number, data: Partial<InsertTimelineEvent>): Promise<TimelineEvent | undefined> {
    const [updated] = await db.update(timelineEvents).set(data).where(eq(timelineEvents.id, id)).returning();
    return updated;
  }

  async deleteTimelineEvent(id: number): Promise<boolean> {
    const result = await db.delete(timelineEvents).where(eq(timelineEvents.id, id)).returning();
    return result.length > 0;
  }

  async createQuoteRequest(request: InsertQuoteRequest): Promise<QuoteRequest> {
    const [created] = await db.insert(quoteRequests).values(request).returning();
    return created;
  }

  async getQuoteRequests(): Promise<QuoteRequest[]> {
    return db.select().from(quoteRequests).orderBy(desc(quoteRequests.createdAt));
  }

  async getQuoteRequestById(id: number): Promise<QuoteRequest | undefined> {
    const [qr] = await db.select().from(quoteRequests).where(eq(quoteRequests.id, id));
    return qr;
  }

  async updateQuoteRequestStatus(id: number, status: string): Promise<QuoteRequest | undefined> {
    const [updated] = await db.update(quoteRequests).set({ status }).where(eq(quoteRequests.id, id)).returning();
    return updated;
  }

  async deleteQuoteRequest(id: number): Promise<boolean> {
    const result = await db.delete(quoteRequests).where(eq(quoteRequests.id, id)).returning();
    return result.length > 0;
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [created] = await db.insert(contactMessages).values(message).returning();
    return created;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async deleteContactMessage(id: number): Promise<boolean> {
    const result = await db.delete(contactMessages).where(eq(contactMessages.id, id)).returning();
    return result.length > 0;
  }

  async getJobs(includeInactive = false): Promise<Job[]> {
    if (includeInactive) {
      return db.select().from(jobs).orderBy(desc(jobs.createdAt));
    }
    return db.select().from(jobs).where(eq(jobs.active, true)).orderBy(desc(jobs.createdAt));
  }

  async getJobBySlug(slug: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.slug, slug));
    return job;
  }

  async getJobById(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [created] = await db.insert(jobs).values(job).returning();
    return created;
  }

  async updateJob(id: number, data: Partial<InsertJob>): Promise<Job | undefined> {
    const [updated] = await db.update(jobs).set(data).where(eq(jobs.id, id)).returning();
    return updated;
  }

  async deleteJob(id: number): Promise<boolean> {
    const result = await db.delete(jobs).where(eq(jobs.id, id)).returning();
    return result.length > 0;
  }

  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const [created] = await db.insert(jobApplications).values(application).returning();
    return created;
  }

  async getJobApplications(jobSlug?: string): Promise<JobApplication[]> {
    if (jobSlug) {
      return db.select().from(jobApplications).where(eq(jobApplications.jobSlug, jobSlug)).orderBy(desc(jobApplications.createdAt));
    }
    return db.select().from(jobApplications).orderBy(desc(jobApplications.createdAt));
  }

  async deleteJobApplication(id: number): Promise<boolean> {
    const result = await db.delete(jobApplications).where(eq(jobApplications.id, id)).returning();
    return result.length > 0;
  }

  async createCatalogDownload(download: InsertCatalogDownload): Promise<CatalogDownload> {
    const [created] = await db.insert(catalogDownloads).values(download).returning();
    return created;
  }

  async getCatalogDownloads(): Promise<CatalogDownload[]> {
    return db.select().from(catalogDownloads).orderBy(desc(catalogDownloads.createdAt));
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
