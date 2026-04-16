'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateShortLink, deleteShortLink } from "@/app/actions/links"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Loader2, ExternalLink, Copy, Check, Trash2, BarChart2, Shield, Activity, Lock } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface LinkEditorProps {
  link: any
}

export function LinkEditor({ link }: LinkEditorProps) {
  const [originalUrl, setOriginalUrl] = useState(link.originalUrl)
  const [title, setTitle] = useState(link.title || "")
  const [password, setPassword] = useState("")
  const [usePassword, setUsePassword] = useState(!!link.password)
  const [expiresAt, setExpiresAt] = useState(
    link.expiresAt ? new Date(link.expiresAt).toISOString().slice(0, 16) : ""
  )
  const [useExpiration, setUseExpiration] = useState(!!link.expiresAt)
  const [isActive, setIsActive] = useState(link.isActive)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://linkforge.app"
  const shortUrl = `${baseUrl}/l/${link.shortCode}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    toast.success("METADATA_EXTRACTED")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    try {
      await updateShortLink(link.id, {
        originalUrl,
        title: title || null,
        password: usePassword ? (password || link.password) : null,
        expiresAt: useExpiration && expiresAt ? expiresAt : null,
        isActive,
      })
      toast.success("CORE_LOGIC_SYNCED")
      router.refresh()
    } catch (err: any) {
      setError(`CRITICAL_FAILURE: ${err.message?.toUpperCase() || "UNKNOWN_OP_ERROR"}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteShortLink(link.id)
      toast.success("ENTITY_NULLIFIED")
      router.push("/dashboard/links")
    } catch (err) {
      toast.error("PURGE_REJECTED")
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-10">
        <div className="flex items-start gap-8">
          <Button variant="outline" size="icon" className="h-12 w-12 border-white/10 bg-transparent hover:border-white transition-all rounded-none mt-2" asChild>
            <Link href="/dashboard/links">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="tech-label mb-3">
               <Shield className="h-3 w-3" />
               NODE_ENCRYPTION_ACTIVE
            </div>
            <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none">MOD_RELAY</h1>
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/40 mt-3">
              NODE_ID: {link.shortCode} // STATUS: {isActive ? 'OPERATIONAL' : 'OFFLINE'}
            </p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="h-14 px-8 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-none text-[10px] font-black uppercase italic tracking-widest">
              TERMINATE_NODE
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-none border border-white/20 bg-black max-w-lg p-10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-black uppercase italic tracking-tight">NULLIFY_ENTITY?</AlertDialogTitle>
              <AlertDialogDescription className="text-[10px] font-mono uppercase tracking-widest leading-relaxed mt-4">
                THIS_ACTION_TERMINATES_ALL_ASSOCIATED_DATA_STREAMS_AND_REDIRECTION_BUFFERS. THE_NODE_WILL_BE_PERMANENTLY_ELIMINATED_FROM_THE_GRID.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-10 gap-4">
              <AlertDialogCancel className="rounded-none border border-white/10 bg-transparent uppercase font-black italic text-[10px] opacity-40 hover:opacity-100 h-12 px-8">ABORT</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="rounded-none bg-red-500 text-white uppercase font-black italic text-[10px] hover:bg-red-600 h-12 px-8 transition-all">
                {isDeleting ? "NULLIFYING..." : "CONFIRM_TERMINATION"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid lg:grid-cols-5 gap-12">
        {/* Main Parameters */}
        <div className="lg:col-span-3 space-y-8">
          <div className="card-mono p-10 border-white/20">
            <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-white/40" />
                <h2 className="text-sm font-black uppercase italic tracking-widest">CORE_PARAMETERS</h2>
              </div>
              <span className="text-[8px] font-mono font-bold opacity-20">[01]</span>
            </div>

            <div className="space-y-10">
               <div className="flex items-center justify-between group">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest">RELAY_ENABLED</Label>
                  <p className="text-[8px] font-mono uppercase tracking-[0.2em] opacity-40">TOGGLE_REDIRECTION_FLUX</p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  className="data-[state=checked]:bg-white"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="url" className="text-[10px] font-black uppercase tracking-widest">DESTINATION_ADDR</Label>
                <div className="relative group">
                  <ExternalLink className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20 group-hover:text-white transition-colors" />
                  <Input
                    id="url"
                    type="url"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    className="border border-white/10 bg-white/5 h-14 pl-12 text-sm font-bold rounded-none focus:border-white transition-all"
                  />
                </div>
              </div>

               <div className="space-y-3">
                <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest">NODE_ALIAS</Label>
                <Input
                  id="title"
                  placeholder="IDENTIFY_NODE"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border border-white/10 bg-white/5 h-14 px-6 text-[10px] font-mono uppercase tracking-widest rounded-none focus:border-white transition-all"
                />
              </div>
            </div>
          </div>

          <div className="card-mono p-10 border-white/10">
            <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-white/40" />
                <h2 className="text-sm font-black uppercase italic tracking-widest">GATEWAY_SECURITY</h2>
              </div>
              <span className="text-[8px] font-mono font-bold opacity-20">[02]</span>
            </div>

            <div className="space-y-10">
               <div className="flex items-center justify-between group">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest">FORCE_ENCRYPTION</Label>
                  <p className="text-[8px] font-mono uppercase tracking-[0.2em] opacity-40">ENABLE_GATEWAY_LOCK</p>
                </div>
                <Switch
                  checked={usePassword}
                  onCheckedChange={setUsePassword}
                  className="data-[state=checked]:bg-white"
                />
              </div>

              {usePassword && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest">DECRYPTION_KEY</Label>
                  <Input
                    type="password"
                    placeholder={link.password ? "STAY_ENCRYPTED_OR_ENTER_NEW" : "INITIAL_ENCRYPTION_KEY"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border border-white/10 bg-white/5 h-14 px-6 text-[10px] font-mono uppercase tracking-widest rounded-none focus:border-white transition-all"
                  />
                </div>
              )}

              <div className="flex items-center justify-between group">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest">TEMPORAL_DECAY</Label>
                  <p className="text-[8px] font-mono uppercase tracking-[0.2em] opacity-40">AUTO_TERMINATE_SEQUENCE</p>
                </div>
                <Switch
                   checked={useExpiration}
                   onCheckedChange={setUseExpiration}
                   className="data-[state=checked]:bg-white"
                />
              </div>

              {useExpiration && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest">EXPIRATION_PULSE</Label>
                   <Input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="border border-white/10 bg-white/5 h-14 px-6 text-[10px] font-mono uppercase tracking-widest rounded-none focus:border-white transition-all invert"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-2 space-y-8">
           <div className="card-mono p-10 border-white/10">
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-8 border-b border-white/10 pb-4 opacity-40">
                ACCESS_LINK
              </h3>
              <div className="space-y-6">
                <div className="border border-white/10 bg-black p-4 flex items-center justify-between group">
                  <span className="text-[10px] font-mono truncate mr-4 opacity-40 uppercase tracking-widest">{shortUrl}</span>
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className="p-2 hover:bg-white/10 transition-colors">
                      {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 transition-colors">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div className="pt-4 flex items-end justify-between border-t border-white/10">
                   <div>
                    <span className="text-[8px] font-mono font-bold uppercase opacity-30">TOTAL_REDIRECTIONS</span>
                    <div className="text-5xl font-black italic tracking-tighter tabular-nums mt-1">{link.clickCount.toLocaleString()}</div>
                   </div>
                   <Button variant="outline" className="btn-ghost-mono px-4 h-10 text-[8px]" asChild>
                    <Link href={`/dashboard/analytics?link=${link.id}`}>
                      TELEMETRY_STREAM
                    </Link>
                   </Button>
                </div>
              </div>
           </div>

           <div className="space-y-4">
              <Button onClick={handleSave} disabled={isSaving} className="btn-mono w-full h-16 text-sm">
                {isSaving ? (
                   <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    SYNCING_LOGIC...
                  </>
                ) : (
                  "COMMIT_PARAMETERS"
                )}
              </Button>
              <Button variant="outline" className="btn-ghost-mono w-full h-14" asChild>
                <Link href="/dashboard/links">ABORT_OPERATIONS</Link>
              </Button>
           </div>
           
           {error && (
            <div className="card-mono border-red-500/50 bg-red-500/5 p-6 animate-shake">
                <p className="text-[10px] font-mono uppercase text-red-500 font-black tracking-widest">{error}</p>
            </div>
           )}
        </div>
      </div>
    </div>
  )
}
