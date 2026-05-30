"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useGame, DASS_QUESTIONS } from "@/lib/game-context"
import { useAdventureMusic } from "@/hooks/use-adventure-music"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Volume2, VolumeX, Pause, Play, AlertCircle, Home } from "lucide-react"

type Obstacle = {
  x: number
  y: number
  width: number
  height: number
  type: "mushroom" | "poison"
  triggered: boolean
}

type Player = {
  x: number
  y: number
  velocityY: number
  isJumping: boolean
  width: number
  height: number
}

type ImageLoadState = {
  background: "loading" | "loaded" | "error"
  character: "loading" | "loaded" | "error"
}

const GRAVITY = 0.6
const JUMP_FORCE = -14
const GROUND_Y = 280
const GAME_WIDTH = 800
const GAME_HEIGHT = 400

const characterImages: Record<string, string> = {
  ironman: "/characters/ironman.png",
  captain: "/characters/captain.png",
  hulk: "/characters/hulk.png",
  thor: "/characters/thor.png",
  spiderman: "/characters/spiderman.png",
  blackpanther: "/characters/blackpanther.png",
}

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const backgroundRef = useRef<HTMLImageElement | null>(null)
  const characterImgRef = useRef<HTMLImageElement | null>(null)
  const mushroomImgRef = useRef<HTMLImageElement | null>(null)
  const plantImgRef = useRef<HTMLImageElement | null>(null)
  const musicStartedRef = useRef(false)
  const { play: playMusic, stop: stopMusic, mute, unmute } = useAdventureMusic()
  const { 
    selectedCharacter, 
    setGameState, 
    currentQuestionIndex, 
    setCurrentQuestionIndex, 
    addAnswer,
    answers 
  } = useGame()
  
  const [player, setPlayer] = useState<Player>({
    x: 100,
    y: GROUND_Y,
    velocityY: 0,
    isJumping: false,
    width: 50,
    height: 60,
  })
  
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [showQuestion, setShowQuestion] = useState(false)
  const [currentObstacleType, setCurrentObstacleType] = useState<"mushroom" | "poison">("mushroom")
  const [gameSpeed, setGameSpeed] = useState(5)
  const [score, setScore] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [backgroundX, setBackgroundX] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [imageLoadState, setImageLoadState] = useState<ImageLoadState>({
    background: "loading",
    character: "loading",
  })
  const [loadError, setLoadError] = useState<string | null>(null)

  // Load images with proper error handling
  useEffect(() => {
    let isMounted = true
    
    const loadImages = async () => {
      try {
        // Background
        const bgImg = document.createElement("img")
        bgImg.crossOrigin = "anonymous"
        
        bgImg.onload = () => {
          if (isMounted) {
            backgroundRef.current = bgImg
            setImageLoadState(prev => ({ ...prev, background: "loaded" }))
          }
        }
        
        bgImg.onerror = () => {
          if (isMounted) {
            console.warn("[v0] Background image failed to load, using fallback gradient")
            setImageLoadState(prev => ({ ...prev, background: "error" }))
          }
        }
        
        bgImg.src = "/game-bg.png"

        // Character
        if (selectedCharacter) {
          const charImg = document.createElement("img")
          charImg.crossOrigin = "anonymous"
          
          charImg.onload = () => {
            if (isMounted) {
              characterImgRef.current = charImg
              setImageLoadState(prev => ({ ...prev, character: "loaded" }))
            }
          }
          
          charImg.onerror = () => {
            if (isMounted) {
              console.warn("[v0] Character image failed to load, using fallback character")
              setImageLoadState(prev => ({ ...prev, character: "error" }))
            }
          }
          
          charImg.src = characterImages[selectedCharacter.id]
        } else {
          setImageLoadState(prev => ({ ...prev, character: "error" }))
        }

        if (isMounted) {
          setImagesLoaded(true)
        }
      } catch (error) {
        console.error("[v0] Error loading game images:", error)
        if (isMounted) {
          setLoadError("Failed to load game assets. The game will use fallback graphics.")
          setImagesLoaded(true)
        }
      }
    }

    loadImages()
    
    return () => {
      isMounted = false
    }
  }, [selectedCharacter])

  // Initialize music on first interaction
  const startMusicOnInteraction = useCallback(() => {
    if (!musicStartedRef.current) {
      playMusic()
      musicStartedRef.current = true
    }
  }, [playMusic])

  // Cleanup music on unmount
  useEffect(() => {
    return () => {
      stopMusic()
    }
  }, [stopMusic])

  // Handle mute toggle
  useEffect(() => {
    if (isMuted) {
      mute()
    } else {
      unmute()
    }
  }, [isMuted, mute, unmute])

  // Generate obstacles
  const generateObstacle = useCallback(() => {
    const type = Math.random() > 0.5 ? "mushroom" : "poison"
    const newObstacle: Obstacle = {
      x: GAME_WIDTH + 50,
      y: GROUND_Y + (type === "mushroom" ? 5 : 0),
      width: type === "mushroom" ? 40 : 35,
      height: type === "mushroom" ? 45 : 50,
      type,
      triggered: false,
    }
    setObstacles(prev => [...prev, newObstacle])
  }, [])

  // Spawn obstacles periodically - spawn multiple at once for more challenge
  useEffect(() => {
    if (isPaused || showQuestion) return
    
    const interval = setInterval(() => {
      if (currentQuestionIndex < 10) {
        // Spawn 1-3 obstacles at a time
        const spawnCount = Math.floor(Math.random() * 3) + 1
        for (let i = 0; i < spawnCount; i++) {
          if (Math.random() > 0.2) {
            setTimeout(() => generateObstacle(), i * 300) // Stagger spawns slightly
          }
        }
      }
    }, 1200) // Faster spawn rate (was 2000)
    
    return () => clearInterval(interval)
  }, [generateObstacle, isPaused, showQuestion, currentQuestionIndex])

  // Game loop
  useEffect(() => {
    if (isPaused || showQuestion) return
    
    const gameLoop = setInterval(() => {
      // Update player
      setPlayer(prev => {
        let newY = prev.y + prev.velocityY
        let newVelocityY = prev.velocityY + GRAVITY
        let isJumping = prev.isJumping
        
        if (newY >= GROUND_Y) {
          newY = GROUND_Y
          newVelocityY = 0
          isJumping = false
        }
        
        return {
          ...prev,
          y: newY,
          velocityY: newVelocityY,
          isJumping,
        }
      })
      
      // Update background
      setBackgroundX(prev => (prev - gameSpeed * 0.5) % GAME_WIDTH)
      
      // Update obstacles
      setObstacles(prev => {
        return prev
          .map(obs => ({ ...obs, x: obs.x - gameSpeed }))
          .filter(obs => obs.x > -50)
      })
      
      // Update score
      setScore(prev => prev + 1)
    }, 1000 / 60)
    
    return () => clearInterval(gameLoop)
  }, [isPaused, showQuestion, gameSpeed])

  // Gradually increase speed over time
  useEffect(() => {
    if (isPaused || showQuestion) return
    
    const speedInterval = setInterval(() => {
      setGameSpeed(prev => {
        const newSpeed = prev + 0.1
        return Math.min(newSpeed, 15) // Max speed of 15
      })
    }, 2000) // Increase every 2 seconds (was 3)
    
    return () => clearInterval(speedInterval)
  }, [isPaused, showQuestion])

  // Collision detection
  useEffect(() => {
    if (isPaused || showQuestion) return
    
    obstacles.forEach(obstacle => {
      if (obstacle.triggered) return
      
      const playerRight = player.x + player.width
      const playerBottom = player.y + player.height
      const obstacleRight = obstacle.x + obstacle.width
      const obstacleBottom = obstacle.y + obstacle.height
      
      // Check collision
      if (
        player.x < obstacleRight &&
        playerRight > obstacle.x &&
        player.y < obstacleBottom &&
        playerBottom > obstacle.y
      ) {
        // Trigger question
        setObstacles(prev =>
          prev.map(o =>
            o === obstacle ? { ...o, triggered: true } : o
          )
        )
        setCurrentObstacleType(obstacle.type)
        setShowQuestion(true)
      }
    })
  }, [player, obstacles, isPaused, showQuestion])

  // Jump handler
  const handleJump = useCallback(() => {
    if (!player.isJumping && !showQuestion && !isPaused) {
      // Start music on first user interaction
      startMusicOnInteraction()
      
      setPlayer(prev => ({
        ...prev,
        velocityY: JUMP_FORCE,
        isJumping: true,
      }))
    }
  }, [player.isJumping, showQuestion, isPaused, startMusicOnInteraction])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault()
        handleJump()
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleJump])

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    
    // Draw background image or gradient fallback
    if (backgroundRef.current) {
      // Draw scrolling background
      const imgWidth = backgroundRef.current.width || GAME_WIDTH
      const scale = GAME_HEIGHT / (backgroundRef.current.height || GAME_HEIGHT)
      const scaledWidth = imgWidth * scale
      
      const x1 = backgroundX % scaledWidth
      const x2 = x1 + scaledWidth
      
      ctx.drawImage(backgroundRef.current, x1, 0, scaledWidth, GAME_HEIGHT)
      ctx.drawImage(backgroundRef.current, x2, 0, scaledWidth, GAME_HEIGHT)
      if (x1 > 0) {
        ctx.drawImage(backgroundRef.current, x1 - scaledWidth, 0, scaledWidth, GAME_HEIGHT)
      }
    } else {
      // Fallback gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT)
      skyGradient.addColorStop(0, "#1a365d")
      skyGradient.addColorStop(0.4, "#2d6a4f")
      skyGradient.addColorStop(0.7, "#40916c")
      skyGradient.addColorStop(1, "#52b788")
      ctx.fillStyle = skyGradient
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    }
    
    // Draw ground with grass texture
    const groundGradient = ctx.createLinearGradient(0, GROUND_Y + 50, 0, GAME_HEIGHT)
    groundGradient.addColorStop(0, "#3d2914")
    groundGradient.addColorStop(1, "#2a1d0d")
    ctx.fillStyle = groundGradient
    ctx.fillRect(0, GROUND_Y + 50, GAME_WIDTH, 70)
    
    // Draw grass layer
    const grassGradient = ctx.createLinearGradient(0, GROUND_Y + 40, 0, GROUND_Y + 55)
    grassGradient.addColorStop(0, "#4ade80")
    grassGradient.addColorStop(1, "#22c55e")
    ctx.fillStyle = grassGradient
    ctx.fillRect(0, GROUND_Y + 40, GAME_WIDTH, 15)
    
    // Draw grass blades with variation
    for (let i = 0; i < GAME_WIDTH; i += 8) {
      const height = 8 + Math.sin(i * 0.1 + backgroundX * 0.01) * 4
      const green = Math.random() > 0.5 ? "#4ade80" : "#22c55e"
      ctx.fillStyle = green
      ctx.beginPath()
      ctx.moveTo(i, GROUND_Y + 45)
      ctx.lineTo(i + 3, GROUND_Y + 45 - height)
      ctx.lineTo(i + 6, GROUND_Y + 45)
      ctx.fill()
    }
    
    // Draw player
    if (characterImgRef.current) {
      // Draw character with circular mask
      ctx.save()
      
      // Draw shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
      ctx.beginPath()
      ctx.ellipse(player.x + player.width / 2, GROUND_Y + 55, 25, 8, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // Draw character image
      const charSize = 60
      ctx.drawImage(
        characterImgRef.current,
        player.x - 5,
        player.y - 5,
        charSize,
        charSize
      )
      
      ctx.restore()
    } else {
      // Fallback character
      const characterColor = selectedCharacter?.color || "#E62429"
      
      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
      ctx.beginPath()
      ctx.ellipse(player.x + player.width / 2, GROUND_Y + 55, 25, 8, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // Body
      ctx.fillStyle = characterColor
      ctx.beginPath()
      ctx.roundRect(player.x + 5, player.y + 15, player.width - 10, player.height - 20, 8)
      ctx.fill()
      
      // Head
      ctx.beginPath()
      ctx.arc(player.x + player.width / 2, player.y + 5, 20, 0, Math.PI * 2)
      ctx.fill()
      
      // Eyes
      ctx.fillStyle = "white"
      ctx.beginPath()
      ctx.arc(player.x + 18, player.y, 6, 0, Math.PI * 2)
      ctx.arc(player.x + 32, player.y, 6, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = "#1a1a1a"
      ctx.beginPath()
      ctx.arc(player.x + 20, player.y, 3, 0, Math.PI * 2)
      ctx.arc(player.x + 34, player.y, 3, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // Draw obstacles
    obstacles.forEach(obstacle => {
      if (obstacle.type === "mushroom") {
        // Realistic mushroom
        // Stem
        const stemGradient = ctx.createLinearGradient(obstacle.x + 12, obstacle.y, obstacle.x + 28, obstacle.y)
        stemGradient.addColorStop(0, "#f5f5dc")
        stemGradient.addColorStop(0.5, "#fff8dc")
        stemGradient.addColorStop(1, "#ddd8c4")
        ctx.fillStyle = stemGradient
        ctx.beginPath()
        ctx.roundRect(obstacle.x + 12, obstacle.y + 5, 16, 35, [0, 0, 4, 4])
        ctx.fill()
        
        // Cap gradient
        const capGradient = ctx.createRadialGradient(
          obstacle.x + 20, obstacle.y - 5, 0,
          obstacle.x + 20, obstacle.y, 25
        )
        capGradient.addColorStop(0, "#ff6b6b")
        capGradient.addColorStop(0.7, "#e53935")
        capGradient.addColorStop(1, "#c62828")
        ctx.fillStyle = capGradient
        ctx.beginPath()
        ctx.ellipse(obstacle.x + 20, obstacle.y, 22, 16, 0, Math.PI, 0)
        ctx.fill()
        
        // White spots
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
        ctx.beginPath()
        ctx.ellipse(obstacle.x + 12, obstacle.y - 8, 4, 3, -0.3, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(obstacle.x + 26, obstacle.y - 6, 3, 2.5, 0.2, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(obstacle.x + 18, obstacle.y - 2, 2.5, 2, 0, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Realistic poison plant
        // Pot
        const potGradient = ctx.createLinearGradient(obstacle.x + 5, obstacle.y + 20, obstacle.x + 30, obstacle.y + 20)
        potGradient.addColorStop(0, "#5d4037")
        potGradient.addColorStop(0.5, "#8d6e63")
        potGradient.addColorStop(1, "#4e342e")
        ctx.fillStyle = potGradient
        ctx.beginPath()
        ctx.moveTo(obstacle.x + 5, obstacle.y + 22)
        ctx.lineTo(obstacle.x + 8, obstacle.y + 50)
        ctx.lineTo(obstacle.x + 27, obstacle.y + 50)
        ctx.lineTo(obstacle.x + 30, obstacle.y + 22)
        ctx.closePath()
        ctx.fill()
        
        // Pot rim
        ctx.fillStyle = "#6d4c41"
        ctx.beginPath()
        ctx.roundRect(obstacle.x + 3, obstacle.y + 18, 29, 6, 2)
        ctx.fill()
        
        // Plant leaves
        ctx.fillStyle = "#7cb342"
        // Center leaf
        ctx.beginPath()
        ctx.moveTo(obstacle.x + 17, obstacle.y + 20)
        ctx.quadraticCurveTo(obstacle.x + 10, obstacle.y - 5, obstacle.x + 17, obstacle.y - 15)
        ctx.quadraticCurveTo(obstacle.x + 24, obstacle.y - 5, obstacle.x + 17, obstacle.y + 20)
        ctx.fill()
        
        // Left leaf
        ctx.fillStyle = "#8bc34a"
        ctx.beginPath()
        ctx.moveTo(obstacle.x + 15, obstacle.y + 18)
        ctx.quadraticCurveTo(obstacle.x - 5, obstacle.y, obstacle.x + 5, obstacle.y - 8)
        ctx.quadraticCurveTo(obstacle.x + 10, obstacle.y + 5, obstacle.x + 15, obstacle.y + 18)
        ctx.fill()
        
        // Right leaf
        ctx.beginPath()
        ctx.moveTo(obstacle.x + 20, obstacle.y + 18)
        ctx.quadraticCurveTo(obstacle.x + 40, obstacle.y, obstacle.x + 30, obstacle.y - 8)
        ctx.quadraticCurveTo(obstacle.x + 25, obstacle.y + 5, obstacle.x + 20, obstacle.y + 18)
        ctx.fill()
        
        // Poison drops/glow
        ctx.fillStyle = "rgba(138, 43, 226, 0.7)"
        ctx.beginPath()
        ctx.arc(obstacle.x + 10, obstacle.y + 2, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(obstacle.x + 25, obstacle.y - 2, 2.5, 0, Math.PI * 2)
        ctx.fill()
      }
    })
    
  }, [player, obstacles, selectedCharacter, backgroundX, currentQuestionIndex, imagesLoaded])

  // Handle question answer
  const handleAnswer = (answerValue: number) => {
    addAnswer(answerValue)
    setCurrentQuestionIndex(currentQuestionIndex + 1)
    setShowQuestion(false)
    setGameSpeed(prev => Math.min(prev + 0.2, 8))
    
    // Check if we've answered all questions
    if (currentQuestionIndex + 1 >= 10) {
      setGameState("results")
    }
  }

  const currentQuestion = DASS_QUESTIONS[currentQuestionIndex]

  const handleGoToMenu = () => {
    stopMusic()
    setGameState("menu")
  }

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center p-4 overflow-hidden"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.5)), url('/game-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Load Error Banner */}
      {loadError && (
        <div className="w-full max-w-[800px] mb-4 px-2">
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-4 py-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <p className="text-yellow-200 text-sm">{loadError}</p>
            <button 
              onClick={() => setLoadError(null)}
              className="ml-auto text-yellow-400 hover:text-yellow-200 text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Game Controls */}
      <div className="w-full max-w-[800px] flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-4">
          <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
            <span className="text-white font-bold">
              Score: {score}
            </span>
          </div>
          <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
            {selectedCharacter && (
              <div 
                className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: imageLoadState.character === "error" ? selectedCharacter.color : undefined }}
              >
                {imageLoadState.character === "error" ? (
                  <span className="text-white text-xs font-bold">
                    {selectedCharacter.name.charAt(0)}
                  </span>
                ) : (
                  <img
                    src={characterImages[selectedCharacter.id]}
                    alt={selectedCharacter.name}
                    className="w-full h-full object-cover"
                    onError={() => setImageLoadState(prev => ({ ...prev, character: "error" }))}
                  />
                )}
              </div>
            )}
            <span className="text-white font-semibold">
              {selectedCharacter?.name ?? "Unknown Hero"}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="bg-black/50 backdrop-blur-md border-white/10 text-white hover:bg-white/20"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsPaused(!isPaused)}
            className="bg-black/50 backdrop-blur-md border-white/10 text-white hover:bg-white/20"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-[800px] mb-4 px-2">
        <Progress value={(answers.length / 10) * 100} className="h-3 bg-black/30" />
        <p className="text-white/80 text-sm mt-1 text-center font-medium">
          {answers.length}/10 questions answered
        </p>
      </div>
      
      {/* Game Canvas */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          onClick={() => { startMusicOnInteraction(); handleJump(); }}
          onTouchStart={() => { startMusicOnInteraction(); handleJump(); }}
          className="cursor-pointer max-w-full h-auto"
          style={{ touchAction: "none" }}
        />
        
        {/* Pause Overlay */}
        {isPaused && !showQuestion && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">Paused</h2>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => setIsPaused(false)} 
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 px-8 py-3 min-w-[180px]"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Resume
                </Button>
                <Button 
                  onClick={handleGoToMenu}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-3 min-w-[180px]"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Main Menu
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <p className="mt-4 text-white/60 text-sm font-medium">
        Tap screen or press SPACE to jump
      </p>

      {/* Question Modal */}
      {showQuestion && currentQuestion && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-white/10">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">
                {currentObstacleType === "mushroom" ? "🍄" : "🌿"}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {currentObstacleType === "mushroom" ? "Magic Mushroom!" : "Mysterious Plant!"}
              </h2>
              <p className="text-white/60 text-sm">
                Answer this question to continue your adventure
              </p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-5 mb-6 border border-white/10">
              <p className="text-white font-medium text-center text-lg">
                {currentQuestion.question}
              </p>
              <p className="text-white/50 text-xs text-center mt-2">
                Over the past week...
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                onClick={() => handleAnswer(0)}
                className="justify-start text-left h-auto py-4 bg-white/5 border-white/10 hover:bg-primary/20 hover:border-primary/50 text-white"
              >
                <span className="font-bold text-primary">0</span>
                <span className="ml-3 text-sm">Did not apply to me at all</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAnswer(1)}
                className="justify-start text-left h-auto py-4 bg-white/5 border-white/10 hover:bg-primary/20 hover:border-primary/50 text-white"
              >
                <span className="font-bold text-primary">1</span>
                <span className="ml-3 text-sm">Applied to me some degree</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAnswer(2)}
                className="justify-start text-left h-auto py-4 bg-white/5 border-white/10 hover:bg-primary/20 hover:border-primary/50 text-white"
              >
                <span className="font-bold text-primary">2</span>
                <span className="ml-3 text-sm">Applied to me a considerable degree</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAnswer(3)}
                className="justify-start text-left h-auto py-4 bg-white/5 border-white/10 hover:bg-primary/20 hover:border-primary/50 text-white"
              >
                <span className="font-bold text-primary">3</span>
                <span className="ml-3 text-sm">Applied to me very much</span>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
