"use client"

import { useGame } from "@/lib/game-context"
import { Button } from "@/components/ui/button"
import { Play, Heart, Sparkles } from "lucide-react"

export function MainMenu() {
  const { setGameState } = useGame()

  return (
    <div 
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        backgroundImage: "url('/main-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

      {/* Animated particles overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating light particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/60 rounded-full blur-sm animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-white/40 rounded-full blur-sm animate-pulse delay-300" />
        <div className="absolute top-1/2 left-1/5 w-2 h-2 bg-primary/40 rounded-full blur-sm animate-pulse delay-500" />
        <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-white/30 rounded-full blur-sm animate-pulse delay-700" />
        <div className="absolute top-1/4 right-1/5 w-3 h-3 bg-primary/50 rounded-full blur-sm animate-pulse delay-100" />
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white/40 rounded-full blur-sm animate-pulse delay-400" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo/Title Area */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Heart className="w-10 h-10 md:w-12 md:h-12 text-red-400 animate-pulse drop-shadow-lg" />
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-primary drop-shadow-lg" />
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white drop-shadow-2xl mb-3 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-400 to-primary">Mind</span> Care
          </h1>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-2xl tracking-tight">
            Adventure
          </h2>
          
          <p className="mt-6 text-white/90 text-base md:text-lg max-w-md mx-auto font-medium drop-shadow-lg">
            {"Embark on a journey of self-discovery through fun gameplay"}
          </p>
        </div>

        {/* Play Button - Modern Style */}
        <div className="relative group">
          {/* Outer glow effect */}
          <div className="absolute inset-0 bg-primary/40 rounded-full blur-2xl group-hover:bg-primary/60 transition-all duration-500 scale-125 animate-pulse" />
          
          {/* Ring effect */}
          <div className="absolute inset-[-8px] rounded-full border-2 border-primary/40 group-hover:border-primary/60 group-hover:scale-110 transition-all duration-300" />
          
          <Button
            onClick={() => setGameState("character-select")}
            size="lg"
            className="relative z-10 w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border-4 border-white/20"
          >
            <Play className="w-16 h-16 md:w-20 md:h-20 ml-2 drop-shadow-lg" fill="currentColor" />
          </Button>
        </div>

        <p className="mt-10 text-white/70 text-base font-medium animate-pulse tracking-wide">
          Tap to Play
        </p>

        {/* Feature badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium border border-white/20">
            Mental Wellness
          </span>
          <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium border border-white/20">
            Fun Adventure
          </span>
          <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium border border-white/20">
            Self Discovery
          </span>
        </div>

        {/* Footer info */}
        <div className="absolute bottom-8 text-center">
          <p className="text-white/50 text-sm font-medium">
            A mental wellness assessment game
          </p>
        </div>
      </div>
    </div>
  )
}
