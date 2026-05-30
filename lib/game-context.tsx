"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type Character = {
  id: string
  name: string
  color: string
  icon: string
}

export const CHARACTERS: Character[] = [
  { id: "ironman", name: "Blaze", color: "#E62429", icon: "fire" },
  { id: "captain", name: "Shield", color: "#0066B3", icon: "shield" },
  { id: "hulk", name: "Titan", color: "#5C8C44", icon: "muscle" },
  { id: "thor", name: "Thunder", color: "#FFC300", icon: "bolt" },
  { id: "spiderman", name: "Webby", color: "#E52D27", icon: "web" },
  { id: "blackpanther", name: "Shadow", color: "#1A1A2E", icon: "cloak" },
]

export type DASSQuestion = {
  id: number
  question: string
  category: "depression" | "anxiety" | "stress"
}

export const DASS_QUESTIONS: DASSQuestion[] = [
  { id: 1, question: "I found it hard to wind down", category: "stress" },
  { id: 2, question: "I was aware of dryness of my mouth", category: "anxiety" },
  { id: 3, question: "I couldn't seem to experience any positive feeling at all", category: "depression" },
  { id: 4, question: "I experienced breathing difficulty", category: "anxiety" },
  { id: 5, question: "I found it difficult to work up the initiative to do things", category: "depression" },
  { id: 6, question: "I tended to over-react to situations", category: "stress" },
  { id: 7, question: "I experienced trembling (e.g., in the hands)", category: "anxiety" },
  { id: 8, question: "I felt that I was using a lot of nervous energy", category: "stress" },
  { id: 9, question: "I felt that I had nothing to look forward to", category: "depression" },
  { id: 10, question: "I found myself getting agitated", category: "stress" },
]

export type GameState = "menu" | "character-select" | "playing" | "question" | "results"

type GameContextType = {
  gameState: GameState
  setGameState: (state: GameState) => void
  selectedCharacter: Character | null
  setSelectedCharacter: (character: Character) => void
  currentQuestionIndex: number
  setCurrentQuestionIndex: (index: number) => void
  answers: number[]
  addAnswer: (score: number) => void
  resetGame: () => void
  totalScore: number
  stressLevel: "low" | "medium" | "high"
}

const GameContext = createContext<GameContextType | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>("menu")
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])

  const addAnswer = (score: number) => {
    setAnswers((prev) => [...prev, score])
  }

  const resetGame = () => {
    setGameState("menu")
    setSelectedCharacter(null)
    setCurrentQuestionIndex(0)
    setAnswers([])
  }

  const totalScore = answers.reduce((sum, a) => sum + a, 0)
  
  const getStressLevel = (): "low" | "medium" | "high" => {
    const maxScore = 30 // 10 questions * 3 max score
    const percentage = (totalScore / maxScore) * 100
    if (percentage <= 33) return "low"
    if (percentage <= 66) return "medium"
    return "high"
  }

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState,
        selectedCharacter,
        setSelectedCharacter,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        answers,
        addAnswer,
        resetGame,
        totalScore,
        stressLevel: getStressLevel(),
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error(
      "useGame must be used within a GameProvider. " +
      "Make sure your component is wrapped in <GameProvider>. " +
      "This error typically occurs when trying to access game state outside of the main game component tree."
    )
  }
  return context
}
