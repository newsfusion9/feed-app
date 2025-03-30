import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const newsletters = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  rssUrl: text("rss_url"),
  active: boolean("active").notNull().default(true),
});

export const articles = pgTable("articles", {
  _id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  thumbnailUrl: text("thumbnail_url"), // Added thumbnail URL field
  newsletterId: serial("newsletter_id").references(() => newsletters.id),
  published: boolean("published").notNull().default(false),
  publishedAt: timestamp("published_at"),
  publishUntil: timestamp("publish_until"), // Added publish until date
  archived: boolean("archived").notNull().default(false),
  externalId: text("external_id"), // For tracking RSS entry IDs
  link: text("link"), // For storing original article URLs
});

export const insertNewsletterSchema = createInsertSchema(newsletters).pick({
  name: true,
  email: true,
  rssUrl: true,
});

export type Newsletter = typeof newsletters.$inferSelect;
export type Article = typeof articles.$inferSelect;
