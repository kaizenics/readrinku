import type { Metadata } from "next"
import Link from "next/link"

import { AuthForm } from "@/components/auth/auth-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buildNoIndexMetadata } from "@/lib/seo"

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Login",
  description:
    "Sign in to the ReadRinku demo reader to restore local progress, preferences, and saved manga lists on this device.",
  path: "/login",
})

export default function LoginPage() {
  return (
    <Card className="border bg-card/95">
      <CardHeader className="gap-2">
        <CardTitle className="font-heading text-2xl tracking-tight">Login</CardTitle>
        <p className="text-sm text-muted-foreground">
          Continue the demo reader flow and restore your local reading progress.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <AuthForm mode="login" />
        <p className="text-sm text-muted-foreground">
          <Link href="/" className="underline underline-offset-4">
            Return home
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
