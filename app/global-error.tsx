"use client"

import { useEffect } from "react"
import { ErrorFallback } from "@/components/error-boundary"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("[v0] Global error:", error)
  }, [error])

  return (
    <html>
      <body>
        <ErrorFallback
          error={error}
          onReset={reset}
          title="Application Error"
          description="Something went wrong with the application. Please try again or refresh the page."
        />
      </body>
    </html>
  )
}
