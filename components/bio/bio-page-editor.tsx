'use client'

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { updateBioPage, saveBioBlocks } from "@/app/actions/bio"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { 
  ArrowLeft, 
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
  Smartphone,
  Eye
} from "lucide-react"
import Link from "next/link"
import { QrCodeCard } from "@/components/ui/qr-code-card"
import { BioBlockItem } from "./bio-block-item"
import { BioPreview } from "./bio-preview"
import { AddBlockDialog } from "./add-block-dialog"
import { toast } from "sonner"

interface BioPageEditorProps {
  page: any
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

function createBlockId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  if (globalThis.crypto?.getRandomValues) {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (char) => {
      const value = Number(char)
      return (value ^ (globalThis.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (value / 4)))).toString(16)
    })
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const value = Math.floor(Math.random() * 16)
    return (char === "x" ? value : (value & 0x3) | 0x8).toString(16)
  })
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
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)
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
      toast.success("Design published successfully")
      router.refresh()
    } catch (error) {
      toast.error("Failed to publish design")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddBlock = (type: string) => {
    const newBlock = {
      id: createBlockId(),
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
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background overflow-hidden font-sans">
      {/* Editor Header */}
      <div className="shrink-0 flex items-center justify-between border-b border-border px-4 sm:px-6 py-4 bg-card/90 backdrop-blur-xl z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-muted" asChild>
            <Link href="/dashboard/bio">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground leading-none">{title || "Untitled bio page"}</h1>
            <a href={`${process.env.NEXT_PUBLIC_APP_URL}/p/${page.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-1 inline-flex items-center gap-1">
               cuttly.io/p/{page.slug}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Mobile Preview Toggle (visible only on small screens) */}
           <Button variant="secondary" className="md:hidden" onClick={() => setMobilePreviewOpen(!mobilePreviewOpen)}>
              {mobilePreviewOpen ? <ArrowLeft className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {mobilePreviewOpen ? "Editor" : "Preview"}
           </Button>

          <div className="hidden sm:flex items-center gap-3 border border-border px-4 h-10 rounded-md bg-background">
             <Label htmlFor="publish" className="text-sm font-semibold text-foreground cursor-pointer">Live</Label>
             <Switch
               id="publish"
               checked={isPublished}
               onCheckedChange={setIsPublished}
             />
          </div>
          
          <Button onClick={handleSave} disabled={isSaving} className="">
            {isSaving ? (
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Publish changes
          </Button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel - Editor Form */}
        <div className={`w-full md:w-[60%] lg:w-[55%] border-r border-border overflow-y-auto p-6 md:p-10 bg-card ${mobilePreviewOpen ? 'hidden md:block' : 'block'}`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl mx-auto">
            <TabsList className="mb-8 w-full justify-start gap-2 bg-transparent p-0 border-b border-border h-auto rounded-none">
              {[
                { id: "editor", icon: LinkIcon, label: "Links & Blocks" },
                { id: "design", icon: Palette, label: "Design" },
                { id: "settings", icon: Settings, label: "Settings" }
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="h-10 px-4 bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none font-semibold text-sm transition-all text-muted-foreground"
                >
                  <tab.icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="editor" className="space-y-8 mt-4 focus-visible:outline-none">
               <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Profile Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Your name or brand"
                      className="h-10 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Bio description</Label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="A short description about you..."
                      className="h-10 text-base"
                    />
                  </div>
              </div>

              <div className="pt-6 border-t border-border">
                <Button className="w-full h-12 rounded-md text-base" onClick={() => setShowAddBlock(true)}>
                  <Plus className="mr-2 h-5 w-5" />
                  Add Link or Block
                </Button>
                
                <div className="mt-8 space-y-4">
                  {blocks.length === 0 ? (
                    <div className="flex flex-col items-center rounded-lg border border-dashed border-border px-6 py-16 text-center">
                      <p className="text-sm font-medium text-muted-foreground">You don't have any links yet.</p>
                      <p className="text-sm text-muted-foreground mt-1">Add your first link to get started.</p>
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
              </div>
            </TabsContent>

            <TabsContent value="design" className="space-y-8 mt-4 focus-visible:outline-none">
               <div className="surface p-6">
                <h3 className="h3 mb-6 border-b border-border pb-4">Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Background", key: "background" },
                    { label: "Card Text", key: "text" },
                    { label: "Card Color", key: "accent" }
                  ].map((item) => (
                    <div key={item.key} className="space-y-3">
                      <Label className="text-sm font-semibold text-foreground">{item.label}</Label>
                      <div className="relative h-12 w-full border border-border rounded-md flex items-center justify-center overflow-hidden hover:bg-muted transition-colors shadow-sm bg-background">
                        <input
                          type="color"
                          value={theme[item.key]}
                          onChange={(e) => setTheme({ ...theme, [item.key]: e.target.value })}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-foreground font-mono">{theme[item.key]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface p-6">
                <h3 className="h3 mb-6 border-b border-border pb-4">Card Style</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "minimal", label: "Minimal" },
                    { id: "bold", label: "Bold Shadow" },
                    { id: "elegant", label: "Elegant Rounded" },
                    { id: "playful", label: "Pill Shape" }
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setTheme({ ...theme, style: style.id })}
                      className={`h-14 px-4 text-sm font-bold transition-all rounded-sm border ${
                        theme.style === style.id
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-8 mt-4 focus-visible:outline-none">
              <div className="surface p-6">
                <h3 className="h3 mb-6 border-b border-border pb-4">Search Engine Optimization</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">SEO Title</Label>
                    <Input placeholder="Enter title for search engines" className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Meta Description</Label>
                    <Input placeholder="Enter description for search engines" className="h-10" />
                  </div>
                </div>
              </div>

              <div className="surface p-6">
                <h3 className="h3 mb-6 border-b border-border pb-4">QR Code</h3>
                <QrCodeCard
                  url={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/p/${page.slug}`}
                  fileName={`cuttly-${page.slug}`}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Phone Preview */}
        <div className={`w-full md:w-[40%] lg:w-[45%] bg-background overflow-y-auto p-10 flex flex-col items-center border-l border-border ${mobilePreviewOpen ? 'block' : 'hidden md:flex'}`}>
           <div className="mb-6 flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
             <Smartphone className="h-4 w-4" />
             Live Preview
           </div>
           
           {/* Phone Frame */}
           <div className="relative w-[340px] h-[720px] rounded-[1.5rem] border-8 border-foreground shadow-2xl shadow-foreground/20 overflow-hidden bg-card shrink-0">
             <div className="absolute top-0 inset-x-0 h-6 bg-foreground rounded-b-3xl w-40 mx-auto z-50 flex items-center justify-center">
                 <div className="h-2 w-12 bg-background/30 rounded-sm"></div>
             </div>
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
      return { url: "", title: "My New Link", icon: "" }
    case "header":
      return { text: "Section Header", size: "medium" }
    case "text":
      return { text: "Add some text here..." }
    case "image":
      return { url: "", alt: "" }
    case "social":
      return { platform: "instagram", url: "" }
    case "embed":
      return { url: "", type: "youtube" }
    case "divider":
      return { style: "line" }
    case "email-capture":
      return { title: "Subscribe to my newsletter", placeholder: "Email address", button_text: "Subscribe" }
    default:
      return {}
  }
}
