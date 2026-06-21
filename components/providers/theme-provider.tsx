"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const THEME_STORAGE_KEY = "theme"
const ThemeContext = createContext<ThemeContextValue | null>(null)

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "system"
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function getStoredTheme(): Theme {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(value) ? value : "system"
  } catch {
    return "system"
  }
}

function getResolvedTheme(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme
}

function applyThemeToDocument(nextResolvedTheme: ResolvedTheme) {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(nextResolvedTheme)
  root.style.colorScheme = nextResolvedTheme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() =>
    typeof window === "undefined" ? "system" : getStoredTheme()
  )
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    typeof window === "undefined" ? "light" : getResolvedTheme(getStoredTheme())
  )

  useEffect(() => {
    applyThemeToDocument(resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    const storedTheme = getStoredTheme()

    setThemeState(storedTheme)
    setResolvedTheme(getResolvedTheme(storedTheme))
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const syncSystemTheme = () => {
      if (theme !== "system") {
        return
      }

      setResolvedTheme(getSystemTheme())
    }

    syncSystemTheme()

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", syncSystemTheme)
    } else {
      mediaQuery.addListener(syncSystemTheme)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", syncSystemTheme)
      } else {
        mediaQuery.removeListener(syncSystemTheme)
      }
    }
  }, [theme])

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {}
  }, [theme])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) {
        return
      }

      const nextTheme = isTheme(event.newValue) ? event.newValue : "system"
      const nextResolvedTheme = getResolvedTheme(nextTheme)

      setThemeState(nextTheme)
      setResolvedTheme(nextResolvedTheme)
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const setTheme = useCallback((nextTheme: Theme) => {
    const nextResolvedTheme = getResolvedTheme(nextTheme)

    setThemeState(nextTheme)
    setResolvedTheme(nextResolvedTheme)
  }, [])

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [resolvedTheme, setTheme, theme]
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
