import React, { useEffect, useRef, useState } from 'react'
import { Howl } from 'howler'
import ThemeMusic from '../../../../../../../assets/sound-effect/solitare/theme.mp3'

const STORAGE_KEY = 'wordle-theme-volume'

const VOLUME_CONTROL_CSS = `
.wordle-volume {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.wordle-volume__button {
  appearance: none;
  -webkit-appearance: none;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  background: #8B4513;
  cursor: pointer;
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  transition: transform 0.15s ease, color 0.15s ease, opacity 0.15s ease;
  flex-shrink: 0;
  overflow: hidden;
  line-height: 1;
  vertical-align: middle;
}

.wordle-volume__button--muted {
  color: #b0bec5;
}

.wordle-volume__button:hover {
  transform: scale(1.05);
}

.wordle-volume__button:focus {
  outline: none;
}

.wordle-volume__button svg {
  display: block;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  pointer-events: none;
}
`

const VolumeUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
)

const VolumeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
  </svg>
)

export function VolumeControl() {
  const howlRef = useRef(null)
  const [volume, setVolume] = useState(0.5)
  const [isMuted, setIsMuted] = useState(false)
  const lastVolumeRef = useRef(0.5)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      const v = Number(stored)
      if (!Number.isNaN(v)) {
        const normalized = Math.max(0, Math.min(1, v))
        setVolume(normalized)
        if (normalized === 0) {
          setIsMuted(true)
        } else {
          lastVolumeRef.current = normalized
        }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (howlRef.current) return

    const bgm = new Howl({
      src: [ThemeMusic],
      loop: true,
      volume,
      html5: true,
    })

    howlRef.current = bgm
    bgm.play()

    return () => {
      bgm.unload()
      howlRef.current = null
    }
  }, [])

  useEffect(() => {
    const currentVolume = isMuted ? 0 : volume
    if (howlRef.current) {
      howlRef.current.volume(currentVolume)
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, String(currentVolume))
    }
  }, [volume, isMuted])

  const toggleMute = () => {
    if (isMuted) {
      const restore = lastVolumeRef.current > 0 ? lastVolumeRef.current : 0.5
      setVolume(restore)
      setIsMuted(false)
      return
    }

    if (volume > 0) {
      lastVolumeRef.current = volume
    }
    setIsMuted(true)
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: VOLUME_CONTROL_CSS }} />
      <div className="wordle-volume">
        <button
          type="button"
          className={`wordle-volume__button ${isMuted ? 'wordle-volume__button--muted' : ''}`}
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
        </button>
      </div>
    </>
  )
}