import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  primaryKey,
  bigint,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

// --- Auth.js Tables ---

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  username: text("username").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatarUrl: text("avatar_url"),
  gender: text("gender"),
  legacyPermissions: text("legacy_permissions"),
  name: text("name"),
  email: text("email").unique(),
  password: text("password"),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorRecoveryCodes: text("two_factor_recovery_codes"),
  twoFactorConfirmedAt: timestamp("two_factor_confirmed_at", { mode: "date" }),
  cardBrand: text("card_brand"),
  cardLastFour: text("card_last_four"),
  rememberToken: text("remember_token"),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  language: text("language"),
  country: text("country"),
  timezone: text("timezone"),
  avatar: text("avatar"),
  stripeId: text("stripe_id"),
  availableSpace: bigint("available_space", { mode: "number" }),
  cardExpires: text("card_expires"),
  bannedAt: timestamp("banned_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
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

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id").references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["owner", "admin", "member"] }).default("member"),
  invitedEmail: text("invited_email"),
  status: text("status", { enum: ["active", "pending"] }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customDomains = pgTable("custom_domains", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
  domain: text("domain").unique().notNull(),
  trackingHeaders: jsonb("tracking_headers").default([]),
  status: text("status").default("active"),
  verifiedAt: timestamp("verified_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const globalTrackingHeaders = pgTable("global_tracking_headers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  script: text("script").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const retargetingPixels = pgTable("retargeting_pixels", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  provider: text("provider", {
    enum: ["facebook", "gtm", "tiktok", "twitter", "linkedin"],
  }).notNull(),
  pixelId: text("pixel_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
  domainId: uuid("domain_id").references(() => customDomains.id, { onDelete: "set null" }),
  originalUrl: text("original_url").notNull(),
  shortCode: text("short_code").unique().notNull(),
  title: text("title"),
  customSlug: text("custom_slug"),
  password: text("password"),
  tags: text("tags").array().default([]),
  archivedAt: timestamp("archived_at"),
  expiresAt: timestamp("expires_at"),
  expirationUrl: text("expiration_url"),
  maxClicks: integer("max_clicks"),
  iosUrl: text("ios_url"),
  androidUrl: text("android_url"),
  deepLinkScheme: text("deep_link_scheme"),
  rotationUrls: jsonb("rotation_urls").default([]),
  retargetingPixelIds: text("retargeting_pixel_ids").array().default([]),
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

export const surveys = pgTable("surveys", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  questions: jsonb("questions").default([]),
  maxAnswers: integer("max_answers").default(5000),
  answerCount: integer("answer_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const surveyResponses = pgTable("survey_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  surveyId: uuid("survey_id").references(() => surveys.id, { onDelete: "cascade" }),
  answers: jsonb("answers").notNull(),
  ipHash: text("ip_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const actionPages = pgTable("action_pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "set null" }),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: jsonb("content").default({}),
  customDomain: text("custom_domain"),
  isActive: boolean("is_active").default(true),
  viewsCount: integer("views_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const actionPageViews = pgTable("action_page_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  actionPageId: uuid("action_page_id").references(() => actionPages.id, {
    onDelete: "cascade",
  }),
  viewedAt: timestamp("viewed_at").defaultNow(),
  referrer: text("referrer"),
  device: text("device"),
  browser: text("browser"),
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

// --- Relations Definitions ---

export const teamsRelations = relations(teams, ({ many }) => ({
  members: many(teamMembers),
  domains: many(customDomains),
  shortLinks: many(shortLinks),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(profiles, {
    fields: [teamMembers.userId],
    references: [profiles.id],
  }),
}));

export const customDomainsRelations = relations(customDomains, ({ one, many }) => ({
  team: one(teams, {
    fields: [customDomains.teamId],
    references: [teams.id],
  }),
  links: many(shortLinks),
}));

export const shortLinksRelations = relations(shortLinks, ({ one, many }) => ({
  team: one(teams, {
    fields: [shortLinks.teamId],
    references: [teams.id],
  }),
  domain: one(customDomains, {
    fields: [shortLinks.domainId],
    references: [customDomains.id],
  }),
  analytics: many(linkAnalytics),
}));

export const linkAnalyticsRelations = relations(linkAnalytics, ({ one }) => ({
  link: one(shortLinks, {
    fields: [linkAnalytics.linkId],
    references: [shortLinks.id],
  }),
}));

export const surveysRelations = relations(surveys, ({ many }) => ({
  responses: many(surveyResponses),
}));

export const surveyResponsesRelations = relations(surveyResponses, ({ one }) => ({
  survey: one(surveys, {
    fields: [surveyResponses.surveyId],
    references: [surveys.id],
  }),
}));

export const actionPagesRelations = relations(actionPages, ({ many }) => ({
  views: many(actionPageViews),
}));

export const actionPageViewsRelations = relations(actionPageViews, ({ one }) => ({
  actionPage: one(actionPages, {
    fields: [actionPageViews.actionPageId],
    references: [actionPages.id],
  }),
}));

