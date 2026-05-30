"use client"

import { useEffect, useRef, useCallback } from "react"

type AudioContextType = typeof AudioContext

export function useAdventureMusic() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const oscillatorsRef = useRef<OscillatorNode[]>([])
  const isPlayingRef = useRef(false)

  const createMelody = useCallback((audioContext: AudioContext, gainNode: GainNode) => {
    // Adventure melody notes (frequencies in Hz)
    const melody = [
      { freq: 392, duration: 0.3 }, // G4
      { freq: 440, duration: 0.3 }, // A4
      { freq: 494, duration: 0.3 }, // B4
      { freq: 523, duration: 0.6 }, // C5
      { freq: 494, duration: 0.3 }, // B4
      { freq: 440, duration: 0.3 }, // A4
      { freq: 392, duration: 0.6 }, // G4
      { freq: 330, duration: 0.3 }, // E4
      { freq: 392, duration: 0.3 }, // G4
      { freq: 440, duration: 0.6 }, // A4
      { freq: 392, duration: 0.3 }, // G4
      { freq: 330, duration: 0.3 }, // E4
      { freq: 294, duration: 0.6 }, // D4
    ]

    let time = audioContext.currentTime
    const loopDuration = melody.reduce((sum, note) => sum + note.duration, 0)

    const playLoop = () => {
      if (!isPlayingRef.current) return

      melody.forEach((note, index) => {
        const oscillator = audioContext.createOscillator()
        const noteGain = audioContext.createGain()

        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(note.freq, time)

        noteGain.gain.setValueAtTime(0, time)
        noteGain.gain.linearRampToValueAtTime(0.1, time + 0.05)
        noteGain.gain.linearRampToValueAtTime(0.05, time + note.duration - 0.05)
        noteGain.gain.linearRampToValueAtTime(0, time + note.duration)

        oscillator.connect(noteGain)
        noteGain.connect(gainNode)

        oscillator.start(time)
        oscillator.stop(time + note.duration)

        oscillatorsRef.current.push(oscillator)

        time += note.duration
      })

      // Schedule next loop
      setTimeout(playLoop, loopDuration * 1000)
    }

    playLoop()

    // Add bass line
    const bassNotes = [196, 220, 247, 262, 247, 220, 196, 165]
    let bassTime = audioContext.currentTime
    
    const playBass = () => {
      if (!isPlayingRef.current) return

      bassNotes.forEach((freq) => {
        const bassOsc = audioContext.createOscillator()
        const bassGain = audioContext.createGain()

        bassOsc.type = "triangle"
        bassOsc.frequency.setValueAtTime(freq, bassTime)

        bassGain.gain.setValueAtTime(0.03, bassTime)
        bassGain.gain.linearRampToValueAtTime(0.01, bassTime + 0.5)

        bassOsc.connect(bassGain)
        bassGain.connect(gainNode)

        bassOsc.start(bassTime)
        bassOsc.stop(bassTime + 0.6)

        oscillatorsRef.current.push(bassOsc)

        bassTime += 0.6
      })

      setTimeout(playBass, bassNotes.length * 600)
    }

    playBass()
  }, [])

  const play = useCallback(() => {
    if (isPlayingRef.current) return

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: AudioContextType }).webkitAudioContext
      if (!AudioContextClass) return

      audioContextRef.current = new AudioContextClass()
      gainNodeRef.current = audioContextRef.current.createGain()
      gainNodeRef.current.gain.setValueAtTime(0.3, audioContextRef.current.currentTime)
      gainNodeRef.current.connect(audioContextRef.current.destination)

      isPlayingRef.current = true
      createMelody(audioContextRef.current, gainNodeRef.current)
    } catch (error) {
      console.log("Web Audio API not supported")
    }
  }, [createMelody])

  const stop = useCallback(() => {
    isPlayingRef.current = false
    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop()
      } catch {
        // Already stopped
      }
    })
    oscillatorsRef.current = []

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }, [])

  const setVolume = useCallback((volume: number) => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current.currentTime)
    }
  }, [])

  const mute = useCallback(() => {
    setVolume(0)
  }, [setVolume])

  const unmute = useCallback(() => {
    setVolume(0.3)
  }, [setVolume])

  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  return { play, stop, mute, unmute, setVolume }
}
