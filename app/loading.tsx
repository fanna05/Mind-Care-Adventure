import { Card } from "@/components/ui/card"

export default function Loading() {
  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.9))",
        backgroundColor: "#1a4d2e",
      }}
    >
      <Card className="max-w-md w-full p-8 bg-card/95 backdrop-blur border-primary/30">
        <div className="flex flex-col items-center text-center">
          {/* Loading Spinner */}
          <div className="w-16 h-16 mb-6 relative">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-card-foreground mb-2">
            Loading Adventure...
          </h2>

          {/* Description */}
          <p className="text-muted-foreground text-sm">
            Preparing your mental wellness journey
          </p>

          {/* Loading dots animation */}
          <div className="flex gap-1 mt-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
          </div>
        </div>
      </Card>
    </div>
  )
}
