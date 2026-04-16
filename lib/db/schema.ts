import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// --- Auth.js Tables ---

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// --- Application Tables ---

export const profiles = pgTable("profiles", {
  id: text("id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  username: text("username").unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  plan: text("plan", { enum: ["free", "pro", "business"] }).default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bioPages = pgTable("bio_pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  slug: text("slug").unique().notNull(),
  title: text("title"),
  description: text("description"),
  theme: jsonb("theme").default({
    background: "#ffffff",
    text: "#000000",
    accent: "#000000",
    style: "minimal",
  }),
  isPublished: boolean("is_published").default(false),
  customDomain: text("custom_domain"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bioBlocks = pgTable("bio_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  pageId: uuid("page_id").references(() => bioPages.id, { onDelete: "cascade" }),
  type: text("type", {
    enum: [
      "link",
      "header",
      "text",
      "image",
      "social",
      "embed",
      "divider",
      "email-capture",
    ],
  }).notNull(),
  content: jsonb("content").notNull().default({}),
  position: integer("position").notNull(),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shortLinks = pgTable("short_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  originalUrl: text("original_url").notNull(),
  shortCode: text("short_code").unique().notNull(),
  title: text("title"),
  customSlug: text("custom_slug"),
  password: text("password"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  clickCount: integer("click_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const linkAnalytics = pgTable("link_analytics", {
  id: uuid("id").primaryKey().defaultRandom(),
  linkId: uuid("link_id").references(() => shortLinks.id, { onDelete: "cascade" }),
  bioBlockId: uuid("bio_block_id").references(() => bioBlocks.id, {
    onDelete: "cascade",
  }),
  clickedAt: timestamp("clicked_at").defaultNow(),
  referrer: text("referrer"),
  country: text("country"),
  city: text("city"),
  device: text("device"),
  browser: text("browser"),
  os: text("os"),
  ipHash: text("ip_hash"),
});

export const pageViews = pgTable("page_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  pageId: uuid("page_id").references(() => bioPages.id, { onDelete: "cascade" }),
  viewedAt: timestamp("viewed_at").defaultNow(),
  referrer: text("referrer"),
  country: text("country"),
  city: text("city"),
  device: text("device"),
  browser: text("browser"),
  os: text("os"),
  ipHash: text("ip_hash"),
});

export const emailSubscribers = pgTable("email_subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  pageId: uuid("page_id").references(() => bioPages.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
});

export const aiGenerations = pgTable("ai_generations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["bio", "link_title", "seo", "content"] }).notNull(),
  input: text("input"),
  output: text("output"),
  createdAt: timestamp("created_at").defaultNow(),
});
