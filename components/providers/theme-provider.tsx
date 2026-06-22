"use client"

import { createContext, useContext, useEffect, useMemo } from "react"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyThemeToDocument(nextResolvedTheme: ResolvedTheme) {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(nextResolvedTheme)
  root.style.colorScheme = nextResolvedTheme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyThemeToDocument("dark")
  }, [])

  const value = useMemo(
    () => ({
      theme: "dark" as Theme,
      resolvedTheme: "dark" as ResolvedTheme,
      setTheme: () => {},
    }),
    []
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider.")
  }

  return context
}
