'use client'

import { useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface UtmValues {
  source: string
  medium: string
  campaign: string
  term: string
  content: string
}

export const emptyUtmValues: UtmValues = {
  source: "",
  medium: "",
  campaign: "",
  term: "",
  content: "",
}

const PARAM_MAP: Record<keyof UtmValues, string> = {
  source: "utm_source",
  medium: "utm_medium",
  campaign: "utm_campaign",
  term: "utm_term",
  content: "utm_content",
}

export function buildUtmUrl(baseUrl: string, values: UtmValues): string {
  if (!baseUrl) return baseUrl
  const hasAny = Object.values(values).some((v) => v.trim())
  if (!hasAny) return baseUrl

  try {
    const url = new URL(baseUrl)
    for (const key of Object.keys(PARAM_MAP) as (keyof UtmValues)[]) {
      const value = values[key]?.trim()
      if (value) url.searchParams.set(PARAM_MAP[key], value)
    }
    return url.toString()
  } catch {
    return baseUrl
  }
}

interface UtmBuilderProps {
  baseUrl: string
  values: UtmValues
  onChange: (values: UtmValues) => void
}

export function UtmBuilder({ baseUrl, values, onChange }: UtmBuilderProps) {
  const finalUrl = useMemo(() => buildUtmUrl(baseUrl, values), [baseUrl, values])

  const set = (key: keyof UtmValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...values, [key]: e.target.value })

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Campaign source</Label>
          <Input placeholder="newsletter" value={values.source} onChange={set("source")} className="dash-field" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Campaign medium</Label>
          <Input placeholder="email" value={values.medium} onChange={set("medium")} className="dash-field" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Campaign name</Label>
          <Input placeholder="spring-launch" value={values.campaign} onChange={set("campaign")} className="dash-field" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Campaign term</Label>
          <Input placeholder="running-shoes" value={values.term} onChange={set("term")} className="dash-field" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label className="text-sm font-semibold text-foreground">Campaign content</Label>
          <Input placeholder="logo-link" value={values.content} onChange={set("content")} className="dash-field" />
        </div>
      </div>

      {finalUrl && finalUrl !== baseUrl && (
        <div className="rounded-md border border-border bg-background p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tagged destination</p>
          <p className="break-all font-mono text-sm text-foreground">{finalUrl}</p>
        </div>
      )}
    </div>
  )
}
