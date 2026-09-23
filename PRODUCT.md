# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are marketers and growth teams running campaigns across social, email, and paid channels. They create and share short links, QR codes, and bio/action pages, then need to see real performance data (clicks, referrers, device/geo, QR scans) to report on and optimize campaigns. Secondary audience: developers who manage links programmatically via the REST API, and solo creators/small businesses using bio pages, action pages, and surveys.

## Product Purpose

Cuttly is a URL-shortening and link-infrastructure SaaS: create short links that keep working after you've shared them (destination is editable without changing the link), track every redirect with real analytics, generate QR codes, protect links with passwords, set expiry rules, target by device, tag/search at scale, and automate everything through a documented REST API. It also offers bio-link pages, "action pages," and surveys as adjacent link-based products.

## Positioning

Honesty and accuracy over vanity marketing. The current landing-page copy explicitly documents that a previous version advertised unmeasured/false claims ("10M+ links shortened", "99.9% uptime SLA", "<50ms redirect speed") and replaced them with only what is actually measured and shown. The product's differentiator is that every analytics number shown is real, measured data recorded on redirect — nothing modeled or estimated.

## Operating Context

- Self-serve SaaS: sign-up, free plan (with a monthly link cap), paid tiers, billing via Stripe.
- Core workflows: create/edit a link, view analytics dashboards, generate/download QR codes (PNG/SVG), build bio pages and action pages, run surveys, manage teams, manage custom domains, manage API keys, admin console for platform operators.
- Public-facing surfaces beyond the dashboard: the redirect itself (`/l/[code]`), password-gated unlock pages, bio pages (`/p/[slug]`), action pages (`/a/[slug]`), surveys (`/s/[id]`), and link-state error pages (expired/inactive/not-found/unavailable).

## Capabilities and Constraints

- Built on Next.js (App Router), Tailwind, shadcn/ui (Radix primitives), Drizzle ORM, NextAuth-style auth, Stripe billing, an AI SDK integration (`app/dashboard/ai`).
- ~46 routes total: marketing (landing, pricing, contact, privacy, terms), auth (login/sign-up/reset/forgot-password/error), dashboard (links, analytics, QR codes, bio, action pages, surveys, domains, teams, billing, settings, admin), and public link-resolution/error pages.
- Redesign must preserve all existing functionality, copy accuracy (no reintroducing unmeasured marketing claims), and routes/behavior — this is a visual system replacement, not a feature or content rewrite.

## Brand Commitments

Product name "Cuttly" stays as-is. Logo/wordmark, color system, and typography are open for full reinterpretation as part of this redesign.

## Evidence on Hand

No testimonials, customer logos, press mentions, or usage-count claims exist or should be fabricated. Any social proof shown must be real or explicitly avoided, consistent with the existing landing page's stance against unmeasured claims.

## Product Principles

- Real data only — never imply precision or scale that isn't measured.
- The dashboard is a daily operating tool for marketers; clarity and speed of scanning beat decoration there.
- Public/marketing surfaces are the persuasion layer and can be bolder and more expressive.
- One cohesive visual system must span both: shared tokens/components, not two disconnected skins.
- Preserve accessibility and existing functional behavior while replacing the look.
