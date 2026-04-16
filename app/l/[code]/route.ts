import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const supabase = await createClient()

  const { data: link, error } = await supabase
    .from("short_links")
    .select("*")
    .eq("short_code", code)
    .single()

  if (error || !link) {
    return NextResponse.redirect(new URL("/404", request.url))
  }

  // Check if link is active
  if (!link.is_active) {
    return NextResponse.redirect(new URL("/link-inactive", request.url))
  }

  // Check if link has expired
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return NextResponse.redirect(new URL("/link-expired", request.url))
  }

  // Check if password protected
  if (link.is_password_protected) {
    // Redirect to password page
    return NextResponse.redirect(new URL(`/l/${code}/unlock`, request.url))
  }

  // Record click analytics
  const geo = request.geo
  const userAgent = request.headers.get("user-agent") || ""
  
  // Simple device detection
  let device = "desktop"
  if (/mobile/i.test(userAgent)) device = "mobile"
  else if (/tablet/i.test(userAgent)) device = "tablet"

  // Simple browser detection
  let browser = "other"
  if (/chrome/i.test(userAgent)) browser = "chrome"
  else if (/firefox/i.test(userAgent)) browser = "firefox"
  else if (/safari/i.test(userAgent)) browser = "safari"
  else if (/edge/i.test(userAgent)) browser = "edge"

  // Record analytics (fire and forget)
  supabase.from("link_analytics").insert({
    short_link_id: link.id,
    country: geo?.country || null,
    city: geo?.city || null,
    device,
    browser,
    referer: request.headers.get("referer") || null,
  })

  // Increment click count
  supabase.from("short_links").update({ 
    click_count: link.click_count + 1 
  }).eq("id", link.id)

  return NextResponse.redirect(link.original_url)
}
