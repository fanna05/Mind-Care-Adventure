"use client"

import { useEffect } from "react"
import { ErrorFallback } from "@/components/error-boundary"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("[v0] Page error:", error)
  }, [error])

  return (
    <ErrorFallback
      error={error}
      onReset={reset}
      title="Game Error"
      description="Something went wrong while loading the game. Please try again."
    />
  )
}
