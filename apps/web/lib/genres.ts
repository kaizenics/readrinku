// The shared genre catalog now lives in @rinku/core (see the lib/types/readrinku
// shim for the rationale). This re-export keeps existing "@/lib/genres" imports
// working; new code can import from "@rinku/core" directly.
export * from "@rinku/core/genres"
