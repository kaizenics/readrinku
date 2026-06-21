"use client"

import { ReadRinkuProvider } from "@/components/providers/read-rinku-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <ReadRinkuProvider>
          {children}
          <Toaster position="top-right" richColors />
        </ReadRinkuProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}
