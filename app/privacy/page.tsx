import Link from "next/link"
import { LegalPage } from "@/components/marketing/legal-page"

export const metadata = {
  title: "Privacy Policy",
  description: "What data Cuttly collects, why, and how long it is kept.",
}

/**
 * Describes what this application actually does with data — the fields it
 * records on a click, how IPs are handled, what a visitor can request. It is
 * written from the implementation, not from a template, but it is not legal
 * advice and should be reviewed before a commercial launch.
 */
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="12 August 2026">
      <p>
        This policy explains what Cuttly records, why it records it, and what you can do about
        it. It covers both people with an account and visitors who simply click a Cuttly short
        link.
      </p>

      <h2>What we collect from account holders</h2>
      <ul>
        <li>
          <strong>Account details.</strong> Your name, email address and a hash of your password.
          We never store your password itself.
        </li>
        <li>
          <strong>Your content.</strong> The destination URLs, titles, tags and settings of the
          links and QR codes you create.
        </li>
        <li>
          <strong>Billing details.</strong> If you subscribe, Stripe processes your payment and
          we store only the customer and subscription identifiers it returns. Card numbers never
          reach our servers.
        </li>
      </ul>

      <h2>What we record when someone clicks a link</h2>
      <p>Each redirect stores a single row containing:</p>
      <ul>
        <li>The time of the click and which link was clicked</li>
        <li>The referring page, if the browser sent one</li>
        <li>Device type, browser and operating system, derived from the user-agent string</li>
        <li>
          A two-letter country code and, where the network provides it, a city — supplied by the
          CDN edge, not by geolocating the visitor&apos;s device
        </li>
        <li>Whether the visit came from scanning a QR code</li>
        <li>
          <strong>A truncated, keyed hash of the IP address.</strong> The raw IP is never
          written to the database. The hash exists so that repeat visits can be counted as one
          visitor; it is not reversible without the server secret.
        </li>
      </ul>
      <p>
        We do not set cookies on the redirect path, do not run third-party trackers of our own,
        and do not build cross-site profiles of visitors.
      </p>

      <h2>Tracking pixels added by link owners</h2>
      <p>
        A link owner can attach their own retargeting pixel (Meta, Google Tag Manager or TikTok)
        to a link. When they do, that provider&apos;s script runs on a brief interstitial page
        before the redirect, and that provider collects data under its own policy. Cuttly does
        not control what they collect.
      </p>

      <h2>How long we keep things</h2>
      <ul>
        <li>Links and QR codes: until you delete them or close your account</li>
        <li>Click records: for the analytics window included in your plan</li>
        <li>Contact form messages: until resolved, then archived</li>
        <li>Account records: deleted immediately when you delete your account</li>
      </ul>

      <h2>Deleting your data</h2>
      <p>
        Settings → Security → Delete account permanently removes your account, every link you
        own, all associated click history and every QR code. Deletion is immediate and cannot be
        undone. Your short links stop resolving straight away.
      </p>

      <h2>Who we share data with</h2>
      <p>
        We do not sell data. We share only what is necessary with the services that run the
        product: our hosting provider, our database provider, and Stripe for payments. Each
        processes data on our instructions.
      </p>

      <h2>Contact</h2>
      <p>
        For any privacy question, or to request a copy of your data, use the{" "}
        <Link href="/contact">contact form</Link>.
      </p>
    </LegalPage>
  )
}
