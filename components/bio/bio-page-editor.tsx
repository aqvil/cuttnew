'use client'

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { BioPage, BioBlock, BlockType, BioPageTheme } from "@/lib/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Settings, 
  Palette,
  Plus,
  Loader2,
  ExternalLink,
  GripVertical,
  Trash2,
  Link as LinkIcon,
  Type,
  Image,
  Share2,
  Code,
  Minus,
  Mail,
  Heading,
} from "lucide-react"
import Link from "next/link"
import { BioBlockItem } from "./bio-block-item"
import { BioPreview } from "./bio-preview"
import { AddBlockDialog } from "./add-block-dialog"

interface BioPageEditorProps {
  page: BioPage
  initialBlocks: BioBlock[]
}

const blockTypeIcons: Record<BlockType, React.ElementType> = {
  link: LinkIcon,
  header: Heading,
  text: Type,
  image: Image,
  social: Share2,
  embed: Code,
  divider: Minus,
  "email-capture": Mail,
}

export function BioPageEditor({ page, initialBlocks }: BioPageEditorProps) {
  const [blocks, setBlocks] = useState<BioBlock[]>(initialBlocks)
  const [title, setTitle] = useState(page.title || "")
  const [description, setDescription] = useState(page.description || "")
  const [isPublished, setIsPublished] = useState(page.is_published)
  const [theme, setTheme] = useState<BioPageTheme>(page.theme as BioPageTheme)
  const [isSaving, setIsSaving] = useState(false)
  const [showAddBlock, setShowAddBlock] = useState(false)
  const [activeTab, setActiveTab] = useState("editor")
  const router = useRouter()

  const handleSave = async () => {
    setIsSaving(true)
    const supabase = createClient()

    // Update page
    await supabase
      .from("bio_pages")
      .update({
        title,
        description,
        is_published: isPublished,
        theme,
        updated_at: new Date().toISOString(),
      })
      .eq("id", page.id)

    // Update blocks - delete all and re-insert to handle reordering
    await supabase.from("bio_blocks").delete().eq("page_id", page.id)
    
    if (blocks.length > 0) {
      await supabase.from("bio_blocks").insert(
        blocks.map((block, index) => ({
          id: block.id,
          page_id: page.id,
          type: block.type,
          content: block.content,
          position: index,
          is_visible: block.is_visible,
        }))
      )
    }

    setIsSaving(false)
    router.refresh()
  }

  const handleAddBlock = (type: BlockType) => {
    const newBlock: BioBlock = {
      id: crypto.randomUUID(),
      page_id: page.id,
      type,
      content: getDefaultContent(type),
      position: blocks.length,
      is_visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setBlocks([...blocks, newBlock])
    setShowAddBlock(false)
  }

  const handleUpdateBlock = useCallback((id: string, content: BioBlock["content"]) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, content } : block
    ))
  }, [])

  const handleDeleteBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id))
  }, [])

  const handleToggleVisibility = useCallback((id: string) => {
    setBlocks(prev => prev.map(block =>
      block.id === id ? { ...block, is_visible: !block.is_visible } : block
    ))
  }, [])

  const moveBlock = useCallback((fromIndex: number, toIndex: number) => {
    setBlocks(prev => {
      const newBlocks = [...prev]
      const [removed] = newBlocks.splice(fromIndex, 1)
      newBlocks.splice(toIndex, 0, removed)
      return newBlocks
    })
  }, [])

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/bio">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-semibold">{title || "Untitled Page"}</h1>
            <p className="text-xs text-muted-foreground">/p/{page.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="publish"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
            <Label htmlFor="publish" className="text-sm">Published</Label>
          </div>
          {isPublished && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/p/${page.slug}`} target="_blank">
                <ExternalLink className="mr-2 h-3 w-3" />
                View
              </Link>
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Editor */}
        <div className="w-1/2 border-r overflow-auto p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="editor">
                <Type className="mr-2 h-4 w-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="design">
                <Palette className="mr-2 h-4 w-4" />
                Design
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Page Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My Bio Page"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A short description..."
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Blocks</Label>
                  <Button size="sm" variant="outline" onClick={() => setShowAddBlock(true)}>
                    <Plus className="mr-2 h-3 w-3" />
                    Add Block
                  </Button>
                </div>
                
                {blocks.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <p className="text-sm text-muted-foreground mb-4">No blocks yet</p>
                      <Button variant="outline" onClick={() => setShowAddBlock(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add your first block
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {blocks.map((block, index) => (
                      <BioBlockItem
                        key={block.id}
                        block={block}
                        index={index}
                        totalBlocks={blocks.length}
                        icon={blockTypeIcons[block.type]}
                        onUpdate={handleUpdateBlock}
                        onDelete={handleDeleteBlock}
                        onToggleVisibility={handleToggleVisibility}
                        onMoveUp={() => index > 0 && moveBlock(index, index - 1)}
                        onMoveDown={() => index < blocks.length - 1 && moveBlock(index, index + 1)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="design" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Background</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={theme.background}
                          onChange={(e) => setTheme({ ...theme, background: e.target.value })}
                          className="h-8 w-8 rounded border cursor-pointer"
                        />
                        <Input
                          value={theme.background}
                          onChange={(e) => setTheme({ ...theme, background: e.target.value })}
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Text</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={theme.text}
                          onChange={(e) => setTheme({ ...theme, text: e.target.value })}
                          className="h-8 w-8 rounded border cursor-pointer"
                        />
                        <Input
                          value={theme.text}
                          onChange={(e) => setTheme({ ...theme, text: e.target.value })}
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Accent</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={theme.accent}
                          onChange={(e) => setTheme({ ...theme, accent: e.target.value })}
                          className="h-8 w-8 rounded border cursor-pointer"
                        />
                        <Input
                          value={theme.accent}
                          onChange={(e) => setTheme({ ...theme, accent: e.target.value })}
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Style</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {(["minimal", "bold", "elegant", "playful"] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => setTheme({ ...theme, style })}
                        className={`rounded-lg border p-3 text-sm capitalize transition-colors ${
                          theme.style === style
                            ? "border-foreground bg-foreground/5"
                            : "hover:bg-muted"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">SEO Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>SEO Title</Label>
                    <Input placeholder="Page title for search engines" />
                  </div>
                  <div className="space-y-2">
                    <Label>SEO Description</Label>
                    <Input placeholder="Page description for search engines" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 bg-muted/30 overflow-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-xs text-muted-foreground">Preview</Label>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </div>
          <BioPreview
            title={title}
            description={description}
            blocks={blocks}
            theme={theme}
          />
        </div>
      </div>

      <AddBlockDialog
        open={showAddBlock}
        onOpenChange={setShowAddBlock}
        onAddBlock={handleAddBlock}
      />
    </div>
  )
}

function getDefaultContent(type: BlockType): BioBlock["content"] {
  switch (type) {
    case "link":
      return { url: "", title: "New Link", icon: "" }
    case "header":
      return { text: "New Header", size: "medium" }
    case "text":
      return { text: "Enter your text here..." }
    case "image":
      return { url: "", alt: "" }
    case "social":
      return { platform: "twitter", url: "" }
    case "embed":
      return { url: "", type: "youtube" }
    case "divider":
      return { style: "line" }
    case "email-capture":
      return { title: "Subscribe", placeholder: "Enter your email", button_text: "Subscribe" }
    default:
      return {}
  }
}
