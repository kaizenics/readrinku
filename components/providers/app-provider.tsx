"use client"

import { ThemeProvider } from "next-themes"

import { ReadRinkuProvider } from "@/components/providers/read-rinku-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <ReadRinkuProvider>
          {children}
          <Toaster position="top-right" richColors />
        </ReadRinkuProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}
