import { aryaScansSource } from "@/lib/data/sources/arya-scans"
import { DEFAULT_SOURCE_ID, sourceDefinitions } from "@/lib/data/sources/source-config"

const sourceAdapters = [aryaScansSource]

const sourceAdapterMap = new Map(
  sourceAdapters.map((adapter) => [adapter.definition.id, adapter])
)

export function getSourceAdapter(sourceId: string) {
  return sourceAdapterMap.get(sourceId)
}

export function getDefaultSourceAdapter() {
  return sourceAdapterMap.get(DEFAULT_SOURCE_ID) ?? sourceAdapters[0]
}

export function listSourceDefinitions() {
  return sourceDefinitions
}
