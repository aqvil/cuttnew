'use client'

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { updateNotificationPreferences } from "@/app/actions/profile"

export function NotificationsForm({
  productEmails,
  marketingEmails,
}: {
  productEmails: boolean
  marketingEmails: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [product, setProduct] = useState(productEmails)
  const [marketing, setMarketing] = useState(marketingEmails)

  const save = () => {
    startTransition(async () => {
      const result = await updateNotificationPreferences({
        productEmails: product,
        marketingEmails: marketing,
      })

      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success("Preferences saved.")
    })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="h2">Notifications</h2>
        <p className="lede">Choose what we email you about.</p>
      </div>

      <div className="divide-y divide-border rounded-lg border border-border">
        <Row
          id="product-emails"
          title="Account and security emails"
          description="Password resets, plan changes and anything that affects access to your account. These are sent regardless of the setting below."
          checked={product}
          onChange={setProduct}
        />
        <Row
          id="marketing-emails"
          title="Product news"
          description="Occasional updates about new features. Off by default; you can turn this off again at any time."
          checked={marketing}
          onChange={setMarketing}
        />
      </div>

      <div className="border-t border-border pt-6">
        <Button onClick={save} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : (
            "Save preferences"
          )}
        </Button>
      </div>
    </div>
  )
}

function Row({
  id,
  title,
  description,
  checked,
  onChange,
}: {
  id: string
  title: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-6 p-4">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="font-medium">
          {title}
        </Label>
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} className="mt-0.5" />
    </div>
  )
}
