import Link from "next/link"
import { LegalPage } from "@/components/marketing/legal-page"

export const metadata = {
  title: "Terms of Service",
  description: "The rules for using Cuttly, including what links are not allowed.",
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="12 August 2026">
      <p>
        By creating an account or using a Cuttly short link you agree to these terms. They are
        deliberately short. If something here is unclear, ask us before relying on your own
        interpretation.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>You are responsible for activity that happens under your account and API keys.</li>
        <li>Keep your password and API keys secret. Revoke a key immediately if it leaks.</li>
        <li>One person or organisation per account. Don&apos;t share credentials.</li>
      </ul>

      <h2>Acceptable use</h2>
      <p>
        A URL shortener is attractive to abuse because it hides the destination. The following
        are not permitted, and links doing any of them will be disabled without notice:
      </p>
      <ul>
        <li>Phishing, credential harvesting, or impersonating a person or organisation</li>
        <li>Distributing malware, ransomware or unwanted software</li>
        <li>Unsolicited bulk messaging (spam) of any kind</li>
        <li>Content that is illegal where it is hosted or where it is served</li>
        <li>Cloaking — showing a different destination to scanners than to real visitors</li>
        <li>Deliberately overloading the service or circumventing rate limits</li>
      </ul>
      <p>
        We may disable a link, suspend an account, or both, when we believe these rules have been
        broken. Where we can, we&apos;ll tell you why.
      </p>

      <h2>Reporting abuse</h2>
      <p>
        If you receive a Cuttly link being used for any of the above, report it through the{" "}
        <Link href="/contact">contact form</Link> with the full short URL. We act on abuse
        reports quickly.
      </p>

      <h2>Availability</h2>
      <p>
        We work to keep redirects fast and available, but the service is provided as-is and we
        don&apos;t offer a contractual uptime guarantee on the plans listed publicly. Don&apos;t
        use Cuttly as the only path to something safety-critical.
      </p>

      <h2>Plans and billing</h2>
      <ul>
        <li>Paid plans renew automatically until cancelled.</li>
        <li>Cancel any time; your plan stays active until the end of the paid period.</li>
        <li>Plan limits are enforced by the server, and match what the pricing page states.</li>
      </ul>

      <h2>Ending your use</h2>
      <p>
        You can delete your account at any time from Settings → Security. Doing so removes your
        links, so anything you&apos;ve shared will stop working. We may terminate an account that
        breaks these terms.
      </p>

      <h2>Changes</h2>
      <p>
        We&apos;ll update this page if these terms change, and note the date at the top. Material
        changes will be announced to account holders by email.
      </p>
    </LegalPage>
  )
}
