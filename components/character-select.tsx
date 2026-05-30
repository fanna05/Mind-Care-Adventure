"use client"

import { useState } from "react"
import { useGame, CHARACTERS, type Character } from "@/lib/game-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Check, User } from "lucide-react"
import { cn } from "@/lib/utils"

const characterImages: Record<string, string> = {
  ironman: "/characters/ironman.png",
  captain: "/characters/captain.png",
  hulk: "/characters/hulk.png",
  thor: "/characters/thor.png",
  spiderman: "/characters/spiderman.png",
  blackpanther: "/characters/blackpanther.png",
}

// Character image component with fallback
function CharacterImage({ 
  characterId, 
  characterName, 
  characterColor 
}: { 
  characterId: string
  characterName: string
  characterColor: string 
}) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  if (imageError) {
    // Fallback to a colored circle with first letter
    return (
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: characterColor }}
      >
        <User className="w-12 h-12 text-white/80" />
      </div>
    )
  }

  return (
    <>
      {imageLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center animate-pulse"
          style={{ backgroundColor: characterColor + "40" }}
        >
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      <img
        src={characterImages[characterId]}
        alt={characterName}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          imageLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          console.warn(`[v0] Failed to load character image: ${characterId}`)
          setImageError(true)
          setImageLoading(false)
        }}
      />
    </>
  )
}

export function CharacterSelect() {
  const { setGameState, selectedCharacter, setSelectedCharacter } = useGame()

  const handleSelect = (character: Character) => {
    setSelectedCharacter(character)
  }

  const handleContinue = () => {
    if (selectedCharacter) {
      setGameState("playing")
    }
  }

  return (
    <div 
      className="min-h-screen w-full p-4 md:p-8"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('/main-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setGameState("menu")}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg">
            Choose Your Hero
          </h1>
          <p className="text-white/60 text-sm mt-1">Select a champion for your adventure</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Character Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        {CHARACTERS.map((character) => (
          <Card
            key={character.id}
            onClick={() => handleSelect(character)}
            className={cn(
              "relative cursor-pointer transition-all duration-300 hover:scale-105 bg-black/40 backdrop-blur-md border-2 p-4 md:p-6 overflow-hidden group",
              selectedCharacter?.id === character.id
                ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-transparent"
                : "border-white/20 hover:border-primary/50"
            )}
          >
            {/* Selection indicator */}
            {selectedCharacter?.id === character.id && (
              <div className="absolute -top-1 -right-1 w-10 h-10 bg-primary rounded-bl-xl rounded-tr-lg flex items-center justify-center z-10">
                <Check className="w-6 h-6 text-primary-foreground" />
              </div>
            )}
            
            {/* Glow effect on hover */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
              style={{ 
                background: `radial-gradient(circle at center, ${character.color}40, transparent 70%)` 
              }}
            />
            
            {/* Character Image */}
            <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white/20 group-hover:border-primary/50 transition-colors shadow-xl">
              <CharacterImage 
                characterId={character.id}
                characterName={character.name}
                characterColor={character.color}
              />
            </div>
            
            {/* Character Name */}
            <h3 className="text-center font-bold text-white text-lg md:text-xl drop-shadow-lg">
              {character.name}
            </h3>
            
            {/* Color indicator */}
            <div 
              className="mx-auto mt-2 w-16 h-1 rounded-full opacity-80"
              style={{ backgroundColor: character.color }}
            />
          </Card>
        ))}
      </div>

      {/* Continue Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleContinue}
          disabled={!selectedCharacter}
          size="lg"
          className="px-12 py-6 text-lg font-bold bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground disabled:opacity-30 shadow-xl transition-all hover:scale-105 disabled:hover:scale-100"
        >
          Start Adventure
        </Button>
      </div>

      {/* Selected Character Display */}
      {selectedCharacter && (
        <div className="mt-8 text-center animate-in fade-in duration-300">
          <p className="text-white/80 text-lg">
            {"You've selected"} <span className="font-bold text-primary">{selectedCharacter.name}</span>
          </p>
        </div>
      )}
    </div>
  )
}
