"use client";

import { useState } from "react";
import { updateAdminSettingAction } from "@/app/actions/admin";
import { Settings, Save, CheckCircle2, Shield, Lock, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export function AdminSettingsClient({ initialSettings }: { initialSettings: Record<string, any> }) {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const handleUpdate = async (key: string, value: any) => {
    setLoading(true);
    try {
      await updateAdminSettingAction(key, value);
      setSettings((prev) => ({ ...prev, [key]: value }));
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Platform Information Card */}
      <div className="p-6 rounded-xl border border-border bg-card/40 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg border border-border bg-background flex items-center justify-center">
            <Sliders className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">General Application Configuration</h3>
            <p className="text-xs text-muted-foreground font-mono">
              Global system defaults, domain endpoints, and maximum free link caps.
            </p>
          </div>
        </div>

        <div className="space-y-6 pt-2">
          {/* App Name */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border/60 bg-background/50">
            <div>
              <label className="text-sm font-bold">Platform Brand Name</label>
              <p className="text-xs text-muted-foreground">The display title shown across footers, emails, and meta tags.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Input
                value={settings.appName || "Cuttly"}
                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                className="w-48 font-mono text-xs"
              />
              <Button
                size="sm"
                onClick={() => handleUpdate("appName", settings.appName)}
                disabled={loading}
                className="font-mono text-xs gap-1"
              >
                {savedKey === "appName" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />} Save
              </Button>
            </div>
          </div>

          {/* Default Domain */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border/60 bg-background/50">
            <div>
              <label className="text-sm font-bold">Default System Short Domain</label>
              <p className="text-xs text-muted-foreground">Primary domain used for shortened URLs when no custom domain is selected.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Input
                value={settings.defaultDomain || "2s.ms"}
                onChange={(e) => setSettings({ ...settings, defaultDomain: e.target.value })}
                className="w-48 font-mono text-xs"
              />
              <Button
                size="sm"
                onClick={() => handleUpdate("defaultDomain", settings.defaultDomain)}
                disabled={loading}
                className="font-mono text-xs gap-1"
              >
                {savedKey === "defaultDomain" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />} Save
              </Button>
            </div>
          </div>

          {/* Max Free Links */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border/60 bg-background/50">
            <div>
              <label className="text-sm font-bold">Free Plan Short Links Cap</label>
              <p className="text-xs text-muted-foreground">Maximum allowed links created by free plan user accounts.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Input
                type="number"
                value={settings.maxFreeLinks || 50}
                onChange={(e) => setSettings({ ...settings, maxFreeLinks: parseInt(e.target.value, 10) || 50 })}
                className="w-48 font-mono text-xs"
              />
              <Button
                size="sm"
                onClick={() => handleUpdate("maxFreeLinks", settings.maxFreeLinks)}
                disabled={loading}
                className="font-mono text-xs gap-1"
              >
                {savedKey === "maxFreeLinks" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />} Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Toggles Card */}
      <div className="p-6 rounded-xl border border-border bg-card/40 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg border border-border bg-background flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Platform Access & Maintenance Control</h3>
            <p className="text-xs text-muted-foreground font-mono">
              Toggle user registration or activate emergency maintenance mode.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {/* Allow Signups */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/60 bg-background/50">
            <div>
              <label className="text-sm font-bold">Public User Signups</label>
              <p className="text-xs text-muted-foreground">Allow new users to register via sign-up page or OAuth.</p>
            </div>
            <Switch
              checked={settings.allowSignups ?? true}
              onCheckedChange={(val) => handleUpdate("allowSignups", val)}
            />
          </div>

          {/* Maintenance Mode */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/60 bg-background/50">
            <div>
              <label className="text-sm font-bold text-amber-500">System Maintenance Mode</label>
              <p className="text-xs text-muted-foreground">Blocks public access and displays maintenance banner.</p>
            </div>
            <Switch
              checked={settings.maintenanceMode ?? false}
              onCheckedChange={(val) => handleUpdate("maintenanceMode", val)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
