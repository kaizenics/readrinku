import type { Metadata } from "next"

import { SettingsPanel } from "@/components/settings/settings-panel"
import { buildNoIndexMetadata } from "@/lib/seo"

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Settings",
  description:
    "Adjust theme, reader defaults, and local demo persistence settings for the ReadRinku manga reader.",
  path: "/settings",
})

export default function SettingsPage() {
  return (
    <div className="page-frame flex flex-col gap-8 py-8 sm:py-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Theme, reader defaults, and demo persistence all live here.
        </p>
      </div>
      <SettingsPanel />
    </div>
  )
}
