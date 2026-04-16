import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { BioPageEditor } from "@/components/bio/bio-page-editor"

export const metadata = {
  title: "Edit Bio Page",
}

export default async function EditBioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: page, error } = await supabase
    .from("bio_pages")
    .select("*")
    .eq("id", id)
    .eq("user_id", user?.id)
    .single()

  if (error || !page) {
    notFound()
  }

  const { data: blocks } = await supabase
    .from("bio_blocks")
    .select("*")
    .eq("page_id", id)
    .order("position", { ascending: true })

  return <BioPageEditor page={page} initialBlocks={blocks || []} />
}
