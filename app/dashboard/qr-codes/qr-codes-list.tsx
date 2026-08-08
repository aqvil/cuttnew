'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Calendar, Filter, Download, Edit2, BarChart2, MoreHorizontal, Globe, Tag, ExternalLink } from "lucide-react"

interface QrCodesListProps {
  links: any[]
  appUrl: string
}

function QrThumbnail({ url }: { url: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    QRCode.toDataURL(url, { width: 120, margin: 1 })
      .then(setDataUrl)
      .catch(() => setDataUrl(null))
  }, [url])

  if (!dataUrl) {
    return <div className="w-16 h-16 bg-muted rounded-md animate-pulse" />
  }

  return <img src={dataUrl} alt="QR Thumbnail" className="w-16 h-16 rounded-md object-contain" />
}

export function QrCodesList({ links, appUrl }: QrCodesListProps) {
  const [search, setSearch] = useState("")

  const filtered = links.filter((link) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (link.title || "").toLowerCase().includes(q) ||
      link.shortCode.toLowerCase().includes(q) ||
      link.originalUrl.toLowerCase().includes(q)
    )
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6 font-mono">
      {/* Bitly Header Row (Attachment 4) */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          QR Codes
        </h1>
        <Button asChild className="bg-primary text-primary-foreground font-mono font-bold text-xs px-5 h-10 hover:opacity-90">
          <Link href="/dashboard/qr-codes/new">Create code</Link>
        </Button>
      </div>

      {/* Bitly Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search codes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 font-mono text-xs bg-card border-border"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="h-10 text-xs font-mono font-semibold gap-1.5 bg-card">
            <Calendar className="w-3.5 h-3.5" /> Filter by created date
          </Button>
          <Button variant="outline" size="sm" className="h-10 text-xs font-mono font-semibold gap-1.5 bg-card">
            <Filter className="w-3.5 h-3.5" /> Add filters
          </Button>
        </div>
      </div>

      {/* Toolbar Controls */}
      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground bg-card border border-border px-4 py-2.5 rounded-lg shadow-sm">
        <Button variant="ghost" size="sm" className="h-7 text-xs font-mono font-semibold text-muted-foreground hover:text-foreground">
          Export
        </Button>

        <select className="bg-transparent font-mono text-xs font-semibold text-foreground focus:outline-none cursor-pointer">
          <option value="active">Show: Active</option>
          <option value="archived">Show: Archived</option>
        </select>
      </div>

      {/* QR Code Cards List (Bitly Screenshot 4) */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((link) => {
            const shortUrl = `${appUrl}/l/${link.shortCode}`
            const dateFormatted = link.createdAt
              ? new Date(link.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "Mar 11, 2025"

            return (
              <div
                key={link.id}
                className="p-5 rounded-2xl border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {/* QR Matrix Thumbnail */}
                  <div className="p-1 bg-white border border-border rounded-lg shrink-0 shadow-sm">
                    <QrThumbnail url={shortUrl} />
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    {/* Category Pill */}
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted border border-border text-[10px] font-bold text-foreground">
                      <Globe className="w-3 h-3 text-muted-foreground" /> Website
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-sm text-foreground truncate">
                      {link.title || "Reminderly - Your Ultimate Reminder Service"}
                    </h3>

                    {/* Destination URL */}
                    <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <span className="text-muted-foreground font-bold">↳</span>
                      <a href={link.originalUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                        {link.originalUrl}
                      </a>
                    </div>

                    {/* Footer Metadata */}
                    <div className="pt-1 flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                      <span className="font-semibold text-foreground">0 scans</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {dateFormatted}
                      </span>
                      <span>·</span>
                      <span className="text-primary font-bold">{shortUrl.replace(/^https?:\/\//, "")}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" /> No tags
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Icons */}
                <div className="flex items-center gap-2 text-muted-foreground shrink-0 self-end sm:self-center">
                  <Link href={`/dashboard/links/${link.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-foreground">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-foreground">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Link href={`/dashboard/links/${link.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-foreground">
                      <BarChart2 className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card">
            <ExternalLink className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-foreground font-mono">No QR codes created yet</h3>
            <p className="text-xs text-muted-foreground mt-1 font-mono">Create your first QR code to track physical scans.</p>
            <Button asChild className="mt-4 h-9 px-4 font-mono text-xs font-bold">
              <Link href="/dashboard/qr-codes/new">Create code</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Bitly End Divider */}
      <div className="pt-4 text-center font-mono text-xs text-muted-foreground flex items-center justify-center gap-4">
        <span className="h-px bg-border flex-1 max-w-[120px]" />
        <span>You've reached the end of your QR codes</span>
        <span className="h-px bg-border flex-1 max-w-[120px]" />
      </div>
    </div>
  )
}
