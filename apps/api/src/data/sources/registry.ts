import { aryaScansSource } from "./arya-scans"
import { demonicScansSource } from "./demonicscans"
import { kaliscanSource } from "./kaliscan"
import { DEFAULT_SOURCE_ID, sourceDefinitions } from "./source-config"

const sourceAdapters = [kaliscanSource, aryaScansSource, demonicScansSource]

const sourceAdapterMap = new Map(
  sourceAdapters.map((adapter) => [adapter.definition.id, adapter])
)

export function getSourceAdapter(sourceId: string) {
  return sourceAdapterMap.get(sourceId)
}

export function getDefaultSourceAdapter() {
  return sourceAdapterMap.get(DEFAULT_SOURCE_ID) ?? sourceAdapters[0]
}

export function getAllSourceAdapters() {
  return sourceAdapters
}

export function listSourceDefinitions() {
  return sourceDefinitions
}
