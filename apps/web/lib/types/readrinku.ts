// The shared, platform-agnostic types now live in @rinku/core so the web app and
// the (future) React Native app share one source of truth. This re-export keeps
// existing "@/lib/types/readrinku" imports working; new code can import from
// "@rinku/core" directly.
export * from "@rinku/core/types"
