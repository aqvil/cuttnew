'use client'

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { updateBioPage, saveBioBlocks } from "@/app/actions/bio"
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
import { toast } from "sonner"

interface BioPageEditorProps {
  page: any // Simplified type for now
  initialBlocks: any[]
}

const blockTypeIcons: Record<string, React.ElementType> = {
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
  const [blocks, setBlocks] = useState<any[]>(initialBlocks)
  const [title, setTitle] = useState(page.title || "")
  const [description, setDescription] = useState(page.description || "")
  const [isPublished, setIsPublished] = useState(page.isPublished)
  const [theme, setTheme] = useState<any>(page.theme)
  const [isSaving, setIsSaving] = useState(false)
  const [showAddBlock, setShowAddBlock] = useState(false)
  const [activeTab, setActiveTab] = useState("editor")
  const router = useRouter()

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateBioPage(page.id, {
        title,
        description,
        isPublished,
        theme,
        slug: page.slug
      })

      await saveBioBlocks(page.id, blocks)
      
      toast.success("Changes saved successfully")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddBlock = (type: string) => {
    const newBlock = {
      id: crypto.randomUUID(),
      pageId: page.id,
      type,
      content: getDefaultContent(type),
      position: blocks.length,
      isVisible: true,
    }
    setBlocks([...blocks, newBlock])
    setShowAddBlock(false)
  }

  const handleUpdateBlock = useCallback((id: string, content: any) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, content } : block
    ))
  }, [])

  const handleDeleteBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id))
  }, [])

  const handleToggleVisibility = useCallback((id: string) => {
    setBlocks(prev => prev.map(block =>
      block.id === id ? { ...block, isVisible: !block.isVisible } : block
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
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-border px-6 py-4">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="border-2 border-primary hover:bg-primary hover:text-primary-foreground" asChild>
            <Link href="/dashboard/bio">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">{title || "Untitled Page"}</h1>
            <p className="text-[10px] font-mono text-muted-foreground uppercase mt-1 tracking-widest">/p/{page.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border-2 border-border px-3 py-1 bg-muted/30">
            <Switch
              id="publish"
              checked={isPublished}
              onCheckedChange={setIsPublished}
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="publish" className="text-[10px] font-black uppercase tracking-widest">Published</Label>
          </div>
          {isPublished && (
            <Button variant="outline" size="sm" className="btn-mono !px-3 !py-1 !text-[10px]" asChild>
              <Link href={`/p/${page.slug}`} target="_blank">
                <ExternalLink className="mr-2 h-3 w-3" />
                View
              </Link>
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving} className="btn-mono">
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
        <div className="w-1/2 border-r-2 border-border overflow-auto p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8 w-full justify-start gap-2 bg-transparent p-0">
              {["editor", "design", "settings"].map((tab) => (
                <TabsTrigger 
                  key={tab} 
                  value={tab}
                  className="px-6 py-2 border-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none font-black uppercase text-xs tracking-widest"
                >
                  {tab === "editor" && <Type className="mr-2 h-4 w-4" />}
                  {tab === "design" && <Palette className="mr-2 h-4 w-4" />}
                  {tab === "settings" && <Settings className="mr-2 h-4 w-4" />}
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="editor" className="space-y-8 mt-0">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest">Page Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="MY BIO PAGE"
                    className="border-2 border-primary bg-background font-bold h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest">Description</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="TELL THE WORLD ABOUT YOU..."
                    className="border-2 border-primary bg-background font-bold h-12"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-border pb-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest italic">Blocks</Label>
                  <Button size="sm" variant="outline" className="btn-mono !px-3 !py-1 !text-[10px]" onClick={() => setShowAddBlock(true)}>
                    <Plus className="mr-2 h-3 w-3" />
                    Add Block
                  </Button>
                </div>
                
                {blocks.length === 0 ? (
                  <div className="card-mono text-center py-16 opacity-50">
                    <p className="text-xs font-mono uppercase tracking-widest mb-6">No entities detected in this sector.</p>
                    <Button variant="outline" className="btn-mono" onClick={() => setShowAddBlock(true)}>
                      Initialize Block
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
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

            <TabsContent value="design" className="space-y-6 mt-0">
              <div className="card-mono">
                <h3 className="text-xs font-black uppercase italic mb-6">Color Palette</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Background", key: "background" },
                    { label: "Text", key: "text" },
                    { label: "Accent", key: "accent" }
                  ].map((item) => (
                    <div key={item.key} className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest">{item.label}</Label>
                      <div className="flex flex-col gap-2">
                        <div 
                          className="h-12 w-full border-2 border-primary flex items-center justify-center relative overflow-hidden"
                          style={{ backgroundColor: theme[item.key] }}
                        >
                          <input
                            type="color"
                            value={theme[item.key]}
                            onChange={(e) => setTheme({ ...theme, [item.key]: e.target.value })}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <span className="font-mono text-[10px] mix-blend-difference invert uppercase">{theme[item.key]}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-mono">
                <h3 className="text-xs font-black uppercase italic mb-6">Visual Style</h3>
                <div className="grid grid-cols-2 gap-4">
                  {(["minimal", "bold", "elegant", "playful"] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setTheme({ ...theme, style })}
                      className={`border-2 p-4 text-xs font-black uppercase tracking-widest transition-all ${
                        theme.style === style
                          ? "border-primary bg-primary text-primary-foreground italic -translate-x-1 -translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-0">
              <div className="card-mono">
                <h3 className="text-xs font-black uppercase italic mb-6">SEO Configuration</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest">Metadata Title</Label>
                    <Input placeholder="SEO TITLE INDEX" className="border-2 border-primary bg-background font-bold h-12 uppercase" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest">Metadata Description</Label>
                    <Input placeholder="SEO DESCRIPTION BUFFER" className="border-2 border-primary bg-background font-bold h-12 uppercase" />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 bg-muted/10 overflow-auto p-12 relative">
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <div className="size-2 bg-primary animate-pulse" />
            <Label className="text-[10px] font-black uppercase tracking-widest italic opacity-50">Live Preview Monitor</Label>
          </div>
          <div className="mx-auto max-w-[360px] shadow-2xl">
            <BioPreview
              title={title}
              description={description}
              blocks={blocks}
              theme={theme}
            />
          </div>
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

function getDefaultContent(type: string): any {
  switch (type) {
    case "link":
      return { url: "", title: "NEW LINK", icon: "" }
    case "header":
      return { text: "NEW HEADER", size: "medium" }
    case "text":
      return { text: "ENTER YOUR TEXT HERE..." }
    case "image":
      return { url: "", alt: "" }
    case "social":
      return { platform: "twitter", url: "" }
    case "embed":
      return { url: "", type: "youtube" }
    case "divider":
      return { style: "line" }
    case "email-capture":
      return { title: "SUBSCRIBE", placeholder: "EMAIL BUFFER", button_text: "INITIALIZE" }
    default:
      return {}
  }
}
