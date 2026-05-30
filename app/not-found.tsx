import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Home, Search } from "lucide-react"

export default function NotFound() {
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
          {/* 404 Icon */}
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-primary" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-card-foreground mb-2">
            404
          </h1>
          <h2 className="text-xl font-semibold text-card-foreground mb-4">
            Page Not Found
          </h2>

          {/* Description */}
          <p className="text-muted-foreground mb-6">
            {"Oops! It looks like you've wandered off the adventure path. The page you're looking for doesn't exist."}
          </p>

          {/* Action Button */}
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90">
              <Home className="w-4 h-4 mr-2" />
              Return to Adventure
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
