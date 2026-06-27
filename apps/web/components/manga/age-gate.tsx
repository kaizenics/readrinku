"use client"

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
import { confirmAdult, useAdultConfirmed } from "@/components/manga/adult-consent"

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
  const confirmed = useAdultConfirmed()

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
            <AlertDialogAction onClick={confirmAdult}>
              Yes, I am 18+
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
