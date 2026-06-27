"use client"

import { useSyncExternalStore } from "react"

// Shared 18+ confirmation, persisted so the user is only asked once across the
// browse blur and the genre age-gate. In-memory listeners keep every gated
// surface in sync within a session.
const STORAGE_KEY = "readrinku:adult-confirmed"
const listeners = new Set<() => void>()

function readConfirmed() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

export function confirmAdult() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1")
  } catch {
    // ignore storage failures; the gate still opens for this view
  }

  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAdultConfirmed() {
  return useSyncExternalStore(subscribe, readConfirmed, () => false)
}
