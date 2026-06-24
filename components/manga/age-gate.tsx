"use client"

import { useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const STORAGE_KEY = "readrinku:adult-confirmed"
const listeners = new Set<() => void>()

function readConfirmed() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

function persistConfirmed() {
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

// Blurs an adult genre's listing behind an 18+ confirmation. The choice is
// remembered, so it only asks once across adult categories.
export function AgeGate({
  genreLabel,
  children,
}: {
  genreLabel: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const confirmed = useSyncExternalStore(subscribe, readConfirmed, () => false)

  return (
    <>
      <div
        className={confirmed ? undefined : "pointer-events-none select-none blur-lg"}
        aria-hidden={!confirmed}
      >
        {children}
      </div>

      <AlertDialog open={!confirmed}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Adult content ahead</AlertDialogTitle>
            <AlertDialogDescription>
              The {genreLabel} category can contain mature, 18+ material. Please
              confirm you are 18 years or older to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => router.push("/")}>
              No, take me back
            </AlertDialogCancel>
            <AlertDialogAction onClick={persistConfirmed}>
              Yes, I am 18+
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
