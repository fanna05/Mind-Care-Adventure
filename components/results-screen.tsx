"use client"

import { useGame } from "@/lib/game-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Heart, RefreshCw, Home, Sparkles, AlertTriangle, Smile, Meh, Frown } from "lucide-react"

const ADVICE = {
  low: {
    title: "Great Mental Wellness!",
    icon: Smile,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/50",
    description: "Your stress and anxiety levels appear to be well-managed. Keep up the great work!",
    tips: [
      "Continue your healthy habits and self-care routines",
      "Maintain your social connections and support network",
      "Keep engaging in activities that bring you joy",
      "Consider helping others who may be struggling",
      "Practice gratitude daily to maintain your positive outlook",
    ],
  },
  medium: {
    title: "Moderate Stress Detected",
    icon: Meh,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/50",
    description: "You may be experiencing some stress or anxiety. Taking proactive steps can help.",
    tips: [
      "Practice deep breathing exercises for 5-10 minutes daily",
      "Try to get 7-9 hours of quality sleep each night",
      "Take regular breaks during work or study sessions",
      "Consider talking to a trusted friend or family member",
      "Engage in physical activity to release tension",
      "Limit caffeine and screen time before bed",
    ],
  },
  high: {
    title: "High Stress Levels",
    icon: Frown,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/50",
    description: "Your responses indicate elevated stress or anxiety levels. Please consider seeking support.",
    tips: [
      "Reach out to a mental health professional or counselor",
      "Talk to someone you trust about how you're feeling",
      "Practice self-compassion - it's okay to not be okay",
      "Try grounding techniques when feeling overwhelmed",
      "Maintain basic self-care: eat well, sleep, and hydrate",
      "Consider calling a mental health helpline if needed",
    ],
    resources: [
      { name: "National Suicide Prevention Lifeline", contact: "988" },
      { name: "Crisis Text Line", contact: "Text HOME to 741741" },
      { name: "SAMHSA Helpline", contact: "1-800-662-4357" },
    ],
  },
}

export function ResultsScreen() {
  const { totalScore, stressLevel, resetGame, setGameState, selectedCharacter, answers } = useGame()
  
  const advice = ADVICE[stressLevel]
  const Icon = advice.icon
  const maxScore = 30
  const percentage = Math.round((totalScore / maxScore) * 100)

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#1a4d2e] via-[#2d6a4f] to-[#40916c] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-red-400 animate-pulse" />
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Adventure Complete!
          </h1>
          <p className="text-white/70">
            {selectedCharacter?.name} has completed the journey
          </p>
        </div>

        {/* Score Card */}
        <Card className={`p-6 mb-6 bg-card/90 backdrop-blur border-2 ${advice.borderColor}`}>
          <div className="flex items-center justify-center mb-4">
            <div className={`w-20 h-20 rounded-full ${advice.bgColor} flex items-center justify-center`}>
              <Icon className={`w-10 h-10 ${advice.color}`} />
            </div>
          </div>
          
          <h2 className={`text-2xl font-bold text-center ${advice.color} mb-2`}>
            {advice.title}
          </h2>
          
          <p className="text-center text-muted-foreground mb-6">
            {advice.description}
          </p>

          {/* Score Display */}
          <div className="bg-muted rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-card-foreground font-medium">Your Score</span>
              <span className="text-2xl font-bold text-card-foreground">{totalScore}/{maxScore}</span>
            </div>
            <Progress value={percentage} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {percentage}% stress indicator
            </p>
          </div>

          {/* Question Breakdown */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-semibold text-card-foreground mb-3">Response Summary</h3>
            <div className="grid grid-cols-5 gap-2">
              {answers.map((answer, index) => (
                <div
                  key={index}
                  className={`w-full aspect-square rounded-lg flex items-center justify-center text-sm font-medium ${
                    answer === 0
                      ? "bg-green-500/30 text-green-300"
                      : answer === 1
                      ? "bg-yellow-500/30 text-yellow-300"
                      : answer === 2
                      ? "bg-orange-500/30 text-orange-300"
                      : "bg-red-500/30 text-red-300"
                  }`}
                >
                  {answer}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Advice Card */}
        <Card className="p-6 mb-6 bg-card/90 backdrop-blur border-border">
          <h3 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Helpful Suggestions
          </h3>
          <ul className="space-y-3">
            {advice.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-card-foreground text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Resources for High Stress */}
        {stressLevel === "high" && (
          <Card className="p-6 mb-6 bg-red-500/10 border-red-500/30">
            <h3 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Support Resources
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {"If you're struggling, please reach out for help. You're not alone."}
            </p>
            <div className="space-y-3">
              {ADVICE.high.resources.map((resource, index) => (
                <div key={index} className="flex justify-between items-center bg-muted rounded-lg p-3">
                  <span className="text-card-foreground font-medium text-sm">{resource.name}</span>
                  <span className="text-primary font-bold">{resource.contact}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={resetGame}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
          <Button
            onClick={() => setGameState("menu")}
            variant="outline"
            size="lg"
            className="border-border hover:bg-muted"
          >
            <Home className="w-5 h-5 mr-2" />
            Return Home
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="mt-8 text-center text-white/40 text-xs">
          This assessment is for informational purposes only and is not a diagnostic tool.
          Please consult a healthcare professional for proper evaluation.
        </p>
      </div>
    </div>
  )
}
