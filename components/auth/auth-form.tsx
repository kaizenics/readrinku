"use client"

import Link from "next/link"
import { EyeIcon, EyeSlashIcon, SpinnerGapIcon } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { useReadRinku } from "@/components/providers/read-rinku-provider"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { defaultDemoCredentials } from "@/lib/readrinku"

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter()
  const { login, register } = useReadRinku()
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState(
    mode === "login" ? defaultDemoCredentials.email : ""
  )
  const [password, setPassword] = useState(
    mode === "login" ? defaultDemoCredentials.password : ""
  )
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const title = mode === "login" ? "Login" : "Register"

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (mode === "login") {
        await login({ email, password })
        toast.success("Welcome back.")
      } else {
        if (!displayName.trim()) {
          throw new Error("Enter a display name.")
        }

        await register({ displayName, email, password })
        toast.success("Profile created in local demo storage.")
      }

      router.push("/")
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "Unable to continue."
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        {mode === "register" ? (
          <Field data-invalid={Boolean(error) || undefined}>
            <FieldLabel htmlFor="display-name">Display name</FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupInput
                  id="display-name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="How should we address you?"
                  aria-invalid={Boolean(error)}
                />
              </InputGroup>
            </FieldContent>
          </Field>
        ) : null}

        <Field data-invalid={Boolean(error) || undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupInput
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="reader@example.com"
                aria-invalid={Boolean(error)}
              />
            </InputGroup>
            {mode === "login" ? (
              <FieldDescription>
                Demo login: {defaultDemoCredentials.email}
              </FieldDescription>
            ) : null}
          </FieldContent>
        </Field>

        <Field data-invalid={Boolean(error) || undefined}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupInput
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                aria-invalid={Boolean(error)}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {mode === "login" ? (
              <FieldDescription>
                Demo password: {defaultDemoCredentials.password}
              </FieldDescription>
            ) : (
              <FieldDescription>
                Passwords are not stored. They only unlock a local demo session.
              </FieldDescription>
            )}
            <FieldError>{error}</FieldError>
          </FieldContent>
        </Field>
      </FieldGroup>

      <div className="flex flex-col gap-3">
        <Button type="submit" disabled={isSubmitting} className="min-h-11">
          {isSubmitting ? <SpinnerGapIcon data-icon="inline-start" className="animate-spin" /> : null}
          {title}
        </Button>
        <p className="text-sm text-muted-foreground">
          {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
          <Link
            href={mode === "login" ? "/register" : "/login"}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {mode === "login" ? "Create one" : "Login"}
          </Link>
        </p>
      </div>
    </form>
  )
}
