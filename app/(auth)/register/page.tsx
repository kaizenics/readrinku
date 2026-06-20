import Link from "next/link"

import { AuthForm } from "@/components/auth/auth-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegisterPage() {
  return (
    <Card className="border bg-card/95">
      <CardHeader className="gap-2">
        <CardTitle className="font-heading text-2xl tracking-tight">Register</CardTitle>
        <p className="text-sm text-muted-foreground">
          Create a local-only demo profile. No OAuth and no passwords stored.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <AuthForm mode="register" />
        <p className="text-sm text-muted-foreground">
          <Link href="/" className="underline underline-offset-4">
            Return home
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
