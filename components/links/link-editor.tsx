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
import { ArrowLeft, Loader2, ExternalLink, Copy, Check, Trash2, BarChart2 } from "lucide-react"
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
    toast.success("URL_COPIED_TO_CLIPBOARD")
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
      toast.success("Parameters updated")
      router.refresh()
    } catch (err: any) {
      setError(`ERROR: ${err.message?.toUpperCase() || "UPDATE_FAILED"}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteShortLink(link.id)
      toast.success("Entity purged")
      router.push("/dashboard/links")
    } catch (err) {
      toast.error("PURGE_FAILED")
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div className="flex items-center justify-between border-b-2 border-primary pb-8">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="border-2 border-primary hover:bg-primary hover:text-primary-foreground" asChild>
            <Link href="/dashboard/links">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Modify Link</h1>
            <p className="mt-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">ID: {link.shortCode} // Status: Active</p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground uppercase font-black tracking-widest text-xs px-4">
              <Trash2 className="mr-2 h-4 w-4" />
              Purge
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-none border-4 border-primary">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-black uppercase italic">Confirm Entity Purge?</AlertDialogTitle>
              <AlertDialogDescription className="font-mono text-[10px] uppercase tracking-widest">
                This process is irreversible. All linked metadata and analytics buffers will be terminated.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-none border-2 border-primary uppercase font-black text-xs">Abort</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="rounded-none bg-destructive text-destructive-foreground uppercase font-black text-xs hover:bg-destructive/90">
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Initialize Purge
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Short URL Card */}
      <div className="card-mono">
        <div className="mb-6">
          <h2 className="text-xl font-black uppercase italic tracking-tight">Access Point</h2>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">Direct redirection bridge</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={shortUrl}
            readOnly
            className="border-2 border-primary bg-muted/20 font-mono text-xs font-bold uppercase"
          />
          <Button variant="outline" className="border-2 border-primary rounded-none hover:bg-primary hover:text-primary-foreground" onClick={handleCopy}>
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button variant="outline" className="border-2 border-primary rounded-none hover:bg-primary hover:text-primary-foreground" asChild>
            <a href={shortUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
        <div className="mt-8 flex items-center justify-between border-4 border-primary p-6 bg-muted/10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest">Aggregate_Clicks</p>
            <p className="text-4xl font-black italic tracking-tighter mt-1">{link.clickCount}</p>
          </div>
          <Button variant="outline" className="btn-mono" asChild>
            <Link href={`/dashboard/analytics?link=${link.id}`}>
              <BarChart2 className="mr-2 h-4 w-4" />
              Metrics_Buffer
            </Link>
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      <div className="card-mono">
        <div className="mb-8">
          <h2 className="text-xl font-black uppercase italic tracking-tight">Link Parameters</h2>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">Adjust operational logic</p>
        </div>
        
        <div className="space-y-8">
          <div className="flex items-center justify-between border-2 border-primary p-6 bg-muted/10">
            <div>
              <Label className="text-[10px] font-black uppercase tracking-widest leading-none">Operational Status</Label>
              <p className="text-[10px] font-mono uppercase tracking-widest opacity-50 mt-1">Toggle redirection logic</p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url" className="text-[10px] font-black uppercase tracking-widest leading-none">Destination Buffer (URL)</Label>
            <Input
              id="url"
              type="url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              className="border-2 border-primary bg-background font-bold h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest leading-none">Entity Alias</Label>
            <Input
              id="title"
              placeholder="MY TRACKABLE ENTITY"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-2 border-primary bg-background font-bold h-12 uppercase"
            />
          </div>

          {/* Password Protection */}
          <div className="space-y-4 border-2 border-primary p-6 bg-muted/10">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest leading-none">Gateway Lock</Label>
                <p className="text-[10px] font-mono uppercase tracking-widest opacity-50 mt-1">
                  {link.password ? "STATUS: ENCRYPTED" : "STATUS: UNLOCKED"}
                </p>
              </div>
              <Switch
                checked={usePassword}
                onCheckedChange={setUsePassword}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            {usePassword && (
              <div className="space-y-2 pt-2">
                <Input
                  type="password"
                  placeholder={link.password ? "NEW ENCRYPTION KEY (NULL TO RETAIN)" : "SET ENCRYPTION KEY"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-2 border-primary bg-background font-bold h-10"
                />
              </div>
            )}
          </div>

          {/* Expiration */}
          <div className="space-y-4 border-2 border-primary p-6 bg-muted/10">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest leading-none">Decay Timer</Label>
                <p className="text-[10px] font-mono uppercase tracking-widest opacity-50 mt-1">
                  {link.expiresAt 
                    ? `END_SEQUENCE: ${new Date(link.expiresAt).toLocaleDateString().toUpperCase()}`
                    : "STABLE: NO_DECAY_DETECTOR"
                  }
                </p>
              </div>
              <Switch
                checked={useExpiration}
                onCheckedChange={setUseExpiration}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            {useExpiration && (
              <div className="space-y-2 pt-2">
                <Input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="border-2 border-primary bg-background font-bold h-10"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="border-2 border-destructive p-4 bg-destructive/10">
              <p className="text-[10px] font-mono uppercase text-destructive font-black tracking-widest">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-4 pt-4">
            <Button onClick={handleSave} disabled={isSaving} className="btn-mono">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Parameters
            </Button>
            <Button variant="outline" className="border-2 border-border hover:border-primary px-6 py-2 uppercase font-black tracking-widest text-xs" asChild>
              <Link href="/dashboard/links">Abort</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
