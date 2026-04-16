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
  Save, 
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
  Terminal,
  Activity,
  Cpu
} from "lucide-react"
import Link from "next/link"
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
      toast.success("SEGMENT_COMMITTED")
      router.refresh()
    } catch (error) {
      toast.error("COMMIT_FAILED")
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
    <div className="h-[calc(100vh-5rem)] flex flex-col bg-black overflow-hidden relative">
       {/* Structural Grid Background for Editor Area */}
      <div className="absolute inset-0 grid-bg opacity-5 pointer-events-none" />

      {/* Editor Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-8 py-6 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <Button variant="outline" size="icon" className="h-12 w-12 border-white/10 bg-transparent hover:border-white transition-all rounded-none" asChild>
            <Link href="/dashboard/bio">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{title || "UNTITLED_SEGMENT"}</h1>
            <p className="text-[10px] font-mono text-white/40 uppercase mt-2 tracking-[0.4em]">ADDR: /p/{page.slug} // STATUS_LINKED</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 border border-white/10 px-6 h-12 bg-black/60">
            <Switch
              id="publish"
              checked={isPublished}
              onCheckedChange={setIsPublished}
              className="data-[state=checked]:bg-white"
            />
            <Label htmlFor="publish" className="text-[10px] font-black uppercase tracking-widest text-white/60">SEGMENT_LIVE</Label>
          </div>
          
          <Button onClick={handleSave} disabled={isSaving} className="btn-mono h-12 px-8">
            {isSaving ? (
              <Loader2 className="mr-3 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-3 h-4 w-4" />
            )}
            COMMIT_LOGIC
          </Button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* Left Panel - Control Matrix */}
        <div className="w-[55%] border-r border-white/10 overflow-auto p-12 bg-black/20">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-12 w-full justify-start gap-4 bg-transparent p-0">
              {[
                { id: "editor", icon: Terminal, label: "BUFFER_BLOCKS" },
                { id: "design", icon: Palette, label: "VISUAL_VECTOR" },
                { id: "settings", icon: Settings, label: "SYS_CONFIG" }
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="h-12 px-8 border border-white/10 data-[state=active]:border-white data-[state=active]:bg-white data-[state=active]:text-black rounded-none font-black uppercase italic text-[10px] tracking-widest transition-all"
                >
                  <tab.icon className="mr-3 size-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="editor" className="space-y-12 mt-0">
               <div className="card-mono border-white/10 p-10">
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <Cpu className="h-4 w-4 text-white/40" />
                    <h2 className="text-sm font-black uppercase italic tracking-widest">SEGMENT_META</h2>
                  </div>
                  <span className="text-[8px] font-mono font-bold opacity-20">[01]</span>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest leading-none">PRIMARY_IDENTIFIER</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="ENTER_TITLE"
                      className="border border-white/10 bg-white/5 h-14 px-6 text-[10px] font-mono uppercase tracking-widest rounded-none focus:border-white transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest leading-none">DESCRIPTOR_STREAM</Label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="ENTER_DESCRIPTION"
                      className="border border-white/10 bg-white/5 h-14 px-6 text-[10px] font-mono uppercase tracking-widest rounded-none focus:border-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <section className="space-y-8">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <Activity className="size-4 text-white/40" />
                    <h2 className="text-sm font-black uppercase italic tracking-widest">LOGIC_BLOCKS</h2>
                  </div>
                  <Button variant="outline" size="sm" className="btn-ghost-mono h-10 px-4 text-[8px]" onClick={() => setShowAddBlock(true)}>
                    <Plus className="mr-2 h-3 w-3" />
                    ADD_BLOCK
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {blocks.length === 0 ? (
                    <div className="card-mono border-dashed border-white/10 text-center py-24 opacity-40">
                      <p className="text-[10px] font-mono uppercase tracking-[0.3em]">NO_ENTITIES_DETECTED_IN_SECTOR.</p>
                      <Button variant="outline" className="btn-mono mt-8 h-12" onClick={() => setShowAddBlock(true)}>
                        INITIALIZE_BLOCK
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {blocks.map((block, index) => (
                        <div key={block.id} className="relative group">
                           {/* Coordinate Marker */}
                           <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-[10px] font-black italic opacity-10 group-hover:opacity-100 transition-opacity">
                              [B{index.toString().padStart(2, '0')}]
                           </div>
                           <BioBlockItem
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
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="design" className="space-y-8 mt-0">
               <div className="card-mono p-10 border-white/20">
                <h3 className="text-sm font-black uppercase italic tracking-widest mb-10 border-b border-white/10 pb-4">COLOR_PALETTE</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { label: "BG_STREAM", key: "background" },
                    { label: "TEXT_FLUX", key: "text" },
                    { label: "ACCENT_PULSE", key: "accent" }
                  ].map((item) => (
                    <div key={item.key} className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">{item.label}</Label>
                      <div className="relative h-14 w-full border border-white/20 flex items-center justify-center overflow-hidden hover:border-white transition-colors">
                        <input
                          type="color"
                          value={theme[item.key]}
                          onChange={(e) => setTheme({ ...theme, [item.key]: e.target.value })}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <span className="font-mono text-[10px] uppercase font-black tracking-widest">{theme[item.key]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-mono p-10 border-white/10">
                <h3 className="text-sm font-black uppercase italic tracking-widest mb-10 border-b border-white/10 pb-4">FRAME_STYLE</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "minimal", label: "01_MINIMAL" },
                    { id: "bold", label: "02_HARDWARE" },
                    { id: "elegant", label: "03_SYNTH" },
                    { id: "playful", label: "04_ABSTRACT" }
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setTheme({ ...theme, style: style.id })}
                      className={`h-16 px-6 text-[10px] font-black uppercase italic tracking-[0.2em] transition-all border ${
                        theme.style === style.id
                          ? "bg-white text-black border-white"
                          : "bg-transparent text-white/40 border-white/10 hover:border-white/40 hover:text-white"
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-8 mt-0">
              <div className="card-mono p-10 border-white/20">
                <h3 className="text-sm font-black uppercase italic tracking-widest mb-10 border-b border-white/10 pb-4">
                  SEO_TELEMETRY
                </h3>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">META_TITLE_INDEX</Label>
                    <Input placeholder="SEO_HEADER_VALUE" className="border border-white/10 bg-white/5 h-14 px-6 text-[10px] font-mono uppercase tracking-widest rounded-none focus:border-white transition-all" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">META_DESC_BUFFER</Label>
                    <Input placeholder="SEO_DESCRIPTION_DATA" className="border border-white/10 bg-white/5 h-14 px-6 text-[10px] font-mono uppercase tracking-widest rounded-none focus:border-white transition-all" />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Reality Monitor (Preview) */}
        <div className="flex-1 bg-black border-l border-white/10 overflow-auto p-16 relative">
          <div className="absolute top-8 left-10 flex items-center gap-4">
            <div className="relative">
              <div className="size-2 bg-accent animate-ping absolute inset-0" />
              <div className="size-2 bg-accent relative" />
            </div>
            <span className="text-[10px] font-black uppercase italic tracking-[0.3em] text-white/40">REALITY_MONITOR_V2.0</span>
          </div>

          <div className="mx-auto max-w-[420px] shadow-[0_0_100px_-20px_rgba(255,255,255,0.05)] border border-white/10">
            <BioPreview
              title={title}
              description={description}
              blocks={blocks}
              theme={theme}
            />
          </div>

          {/* Aesthetic Detail */}
          <div className="absolute bottom-8 right-10 pointer-events-none text-right">
             <div className="text-[8px] font-mono font-bold opacity-10 uppercase tracking-[0.5em] mb-1">DATA_STREAM_ENCRYPTED</div>
             <div className="text-[8px] font-mono font-bold opacity-10 uppercase tracking-[0.5em]">LATENCY_12MS_STABLE</div>
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
      return { url: "", title: "RELAY_POINT", icon: "" }
    case "header":
      return { text: "HEADER_SEQUENCE", size: "medium" }
    case "text":
      return { text: "ENTITY_DESCRIPTION_DATA_STREAM..." }
    case "image":
      return { url: "", alt: "" }
    case "social":
      return { platform: "discord", url: "" }
    case "embed":
      return { url: "", type: "youtube" }
    case "divider":
      return { style: "line" }
    case "email-capture":
      return { title: "SUBSCRIBE_PROTOCOL", placeholder: "EMAIL_BUFFER", button_text: "INITIALIZE" }
    default:
      return {}
  }
}
