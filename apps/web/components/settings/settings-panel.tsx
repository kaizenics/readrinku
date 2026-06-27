"use client"

import { TrashIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

import { useReadRinku } from "@/components/providers/read-rinku-provider"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  directionBehaviorLabels,
  readerModeLabels,
  readerWidthLabels,
} from "@/lib/readrinku"

export function SettingsPanel() {
  const { preferences, updatePreferences, clearDemoData } = useReadRinku()

  return (
    <div className="quiet-panel rounded-xl p-4 sm:p-6">
      <FieldGroup>
        <Field orientation="responsive">
          <FieldLabel htmlFor="reader-mode">Default reader mode</FieldLabel>
          <FieldContent>
            <Select
              value={preferences.mode}
              onValueChange={(value) =>
                updatePreferences({ mode: value as typeof preferences.mode })
              }
            >
              <SelectTrigger id="reader-mode" className="w-full sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.entries(readerModeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>

        <Field orientation="responsive">
          <FieldLabel htmlFor="reading-direction">Direction behavior</FieldLabel>
          <FieldContent>
            <Select
              value={preferences.directionBehavior}
              onValueChange={(value) =>
                updatePreferences({
                  directionBehavior: value as typeof preferences.directionBehavior,
                })
              }
            >
              <SelectTrigger id="reading-direction" className="w-full sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.entries(directionBehaviorLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>

        <Field orientation="responsive">
          <FieldLabel htmlFor="image-width">Image width</FieldLabel>
          <FieldContent>
            <Select
              value={preferences.width}
              onValueChange={(value) =>
                updatePreferences({ width: value as typeof preferences.width })
              }
            >
              <SelectTrigger id="image-width" className="w-full sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.entries(readerWidthLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>

        <Field orientation="responsive">
          <FieldLabel htmlFor="controls-visibility">Reader controls</FieldLabel>
          <FieldContent>
            <Select
              value={preferences.controlsVisibility}
              onValueChange={(value) =>
                updatePreferences({
                  controlsVisibility: value as typeof preferences.controlsVisibility,
                })
              }
            >
              <SelectTrigger id="controls-visibility" className="w-full sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="auto">Auto hide</SelectItem>
                  <SelectItem value="always">Always visible</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>

        <Field orientation="responsive">
          <FieldLabel>Clear demo data</FieldLabel>
          <FieldContent>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full justify-start sm:w-fit"
              onClick={() => {
                clearDemoData()
                toast.success("Local ReadRinku demo data cleared.")
              }}
            >
              <TrashIcon data-icon="inline-start" />
              Clear storage
            </Button>
            <p className="text-sm text-muted-foreground">
              Removes the demo session, saved library, history, and reader preferences.
            </p>
          </FieldContent>
        </Field>
      </FieldGroup>
    </div>
  )
}
