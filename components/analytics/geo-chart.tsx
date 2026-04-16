'use client'

import { Globe } from "lucide-react"

interface GeoChartProps {
  countries: Array<[string, number]>
}

// Country code to name mapping
const countryNames: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  JP: "Japan",
  IN: "India",
  BR: "Brazil",
  MX: "Mexico",
  NL: "Netherlands",
  IT: "Italy",
  ES: "Spain",
  PL: "Poland",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  SG: "Singapore",
  KR: "South Korea",
}

// Country code to flag emoji
function getFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export function GeoChart({ countries }: GeoChartProps) {
  if (countries.length === 0) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center text-muted-foreground">
        <Globe className="h-12 w-12 mb-2 opacity-50" />
        <p className="text-sm">No geographic data yet</p>
      </div>
    )
  }

  const totalClicks = countries.reduce((acc, [, count]) => acc + count, 0)

  return (
    <div className="space-y-3">
      {countries.map(([country, count]) => {
        const percentage = totalClicks > 0 ? (count / totalClicks) * 100 : 0
        const countryName = countryNames[country] || country
        
        return (
          <div key={country} className="flex items-center gap-3">
            <span className="text-xl">{getFlag(country)}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-sm truncate">{countryName}</p>
                <span className="text-sm font-mono text-muted-foreground shrink-0">
                  {count.toLocaleString()} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-foreground/50 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
