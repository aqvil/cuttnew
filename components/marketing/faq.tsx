import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface FaqItem {
  question: string
  answer: string
}

export function Faq({ items, className }: { items: FaqItem[]; className?: string }) {
  return (
    <Accordion type="single" collapsible className={className}>
      {items.map((item, index) => (
        <AccordionItem key={item.question} value={`item-${index}`}>
          <AccordionTrigger className="font-display text-[16px] font-semibold tracking-[-0.01em] hover:no-underline">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-[14px] leading-7 text-muted-foreground">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

/** Grounded in what the product actually does — lib/plans.ts and the real
 * redirect/billing behaviour, not invented policy. */
export const PRODUCT_FAQ: FaqItem[] = [
  {
    question: "What happens when a link expires or hits its click limit?",
    answer:
      "You choose: the redirect can stop working and show a plain expired-link page, or forward everyone to a fallback URL you set — useful for sending late traffic to a new offer once the original one ends.",
  },
  {
    question: "Can I change where a short link points after I've shared it?",
    answer:
      "Yes — that's the whole point. The short URL never changes, so anything printed, posted, or bookmarked keeps working even after you update the destination.",
  },
  {
    question: "How is the analytics data actually collected?",
    answer:
      "Every redirect is logged server-side at click time: referrer, country, device, browser and OS. Unique visitors are counted by hashed IP, not cookies. Nothing is modelled or estimated — if we can't measure it, it doesn't show up on your dashboard.",
  },
  {
    question: "Can I use my own domain for short links?",
    answer:
      "Yes, on Pro and Business. Connect a domain you own and your short links use it instead of the shared domain — the redirect, analytics, and password/expiry rules all work exactly the same.",
  },
  {
    question: "Do you have an API?",
    answer:
      "Yes. Create, update, and delete links programmatically with a scoped API key from Settings. Every request is rate-limited per key and documented — see the API section below for a real example.",
  },
  {
    question: "Is there a free plan, and what does it include?",
    answer:
      "Yes — 50 links a month, 1 bio page, password protection, expiry rules, and 30 days of analytics history, no credit card required. Upgrade when you need a custom domain, API access, or more links.",
  },
  {
    question: "Can I cancel or change plans later?",
    answer:
      "Any time, from the billing portal in Settings — no support ticket required. Changes take effect on your next billing cycle.",
  },
]
