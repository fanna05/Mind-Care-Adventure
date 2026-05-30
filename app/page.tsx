"use client"

import { GameProvider, useGame } from "@/lib/game-context"
import { MainMenu } from "@/components/main-menu"
import { CharacterSelect } from "@/components/character-select"
import { GameCanvas } from "@/components/game-canvas"
import { ResultsScreen } from "@/components/results-screen"
import { ErrorBoundary, GameErrorFallback } from "@/components/error-boundary"
import { useCallback } from "react"

function GameRouter() {
  const { gameState, resetGame } = useGame()

  const handleGameError = useCallback(() => {
    resetGame()
  }, [resetGame])

  const renderScreen = () => {
    switch (gameState) {
      case "menu":
        return <MainMenu />
      case "character-select":
        return <CharacterSelect />
      case "playing":
      case "question":
        return <GameCanvas />
      case "results":
        return <ResultsScreen />
      default:
        return <MainMenu />
    }
  }

  return (
    <ErrorBoundary
      fallback={<GameErrorFallback error={null} onReset={handleGameError} />}
      onReset={handleGameError}
    >
      {renderScreen()}
    </ErrorBoundary>
  )
}

export default function MindCareAdventure() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <GameRouter />
      </GameProvider>
    </ErrorBoundary>
  )
}
