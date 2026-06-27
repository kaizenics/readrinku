"use client"

import { useEffect } from "react"

// A favicon can't read the in-app theme class via CSS (it's rendered by the
// browser chrome, not the page), and this app's theme is a manual light/dark/
// system toggle on <html> — not just the OS prefers-color-scheme. So we swap the
// favicon in JS: the black logo in light mode, a white version in dark mode,
// kept in sync with the `.dark` class as the user toggles.
const LIGHT_ICON = "/readrinku-icon.png?v=1"
const DARK_ICON = "/readrinku-icon-white.png?v=1"

export function ThemedFavicon() {
  useEffect(() => {
    const root = document.documentElement

    const apply = () => {
      const href = root.classList.contains("dark") ? DARK_ICON : LIGHT_ICON
      const links = document.querySelectorAll<HTMLLinkElement>(
        'link[rel="icon"], link[rel="shortcut icon"]'
      )

      if (links.length === 0) {
        const link = document.createElement("link")
        link.rel = "icon"
        link.type = "image/png"
        link.href = href
        document.head.appendChild(link)
        return
      }

      links.forEach((link) => {
        link.type = "image/png"
        // Only reassign when it actually changed, so the browser doesn't refetch
        // the icon on every unrelated class mutation.
        if (link.getAttribute("href") !== href) {
          link.href = href
        }
      })
    }

    apply()

    // Re-apply whenever the theme class flips (manual toggle or system change).
    const observer = new MutationObserver(apply)
    observer.observe(root, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  return null
}
