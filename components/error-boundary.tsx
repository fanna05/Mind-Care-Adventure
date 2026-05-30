"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onReset?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[v0] Error caught by ErrorBoundary:", error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error | null
  onReset?: () => void
  title?: string
  description?: string
}

export function ErrorFallback({ 
  error, 
  onReset,
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again."
}: ErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = "/"
  }

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.9))",
        backgroundColor: "#1a4d2e",
      }}
    >
      <Card className="max-w-md w-full p-8 bg-card/95 backdrop-blur border-destructive/30">
        <div className="flex flex-col items-center text-center">
          {/* Error Icon */}
          <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>

          {/* Error Title */}
          <h2 className="text-2xl font-bold text-card-foreground mb-2">
            {title}
          </h2>

          {/* Error Description */}
          <p className="text-muted-foreground mb-6">
            {description}
          </p>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === "development" && error && (
            <div className="w-full mb-6 p-4 bg-muted rounded-lg text-left overflow-auto max-h-32">
              <p className="text-sm font-mono text-destructive break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {onReset && (
              <Button
                onClick={onReset}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleReload}
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
            <Button
              variant="ghost"
              onClick={handleGoHome}
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Game-specific error fallback with themed styling
export function GameErrorFallback({ 
  error, 
  onReset 
}: { 
  error: Error | null
  onReset?: () => void 
}) {
  return (
    <ErrorFallback
      error={error}
      onReset={onReset}
      title="Game Error"
      description="The game encountered an issue. Don&apos;t worry, your progress is safe!"
    />
  )
}

// Loading error fallback for async operations
export function LoadingErrorFallback({ 
  message = "Failed to load content",
  onRetry 
}: { 
  message?: string
  onRetry?: () => void 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
      <p className="text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      )}
    </div>
  )
}
