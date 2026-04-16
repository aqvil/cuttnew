import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { LinkEditor } from "@/components/links/link-editor"

export const metadata = {
  title: "Edit Link",
}

export default async function EditLinkPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: link, error } = await supabase
    .from("short_links")
    .select("*")
    .eq("id", id)
    .eq("user_id", user?.id)
    .single()

  if (error || !link) {
    notFound()
  }

  return <LinkEditor link={link} />
}
