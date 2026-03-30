import React, { useEffect, useRef, useState } from 'react'
import { Howl } from 'howler'
import ThemeMusic from '../../../../../../../assets/sound-effect/solitare/theme.mp3'

const STORAGE_KEY = 'wordle-theme-volume'

// CSS gộp chung trong JSX (dùng className + <style>)
const VOLUME_CONTROL_CSS = `
.wordle-volume {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.wordle-volume__button {
  border: none;
  background: #fff7ea;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  font-weight: 700;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #222;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  transition: transform 0.15s ease, color 0.15s ease, opacity 0.15s ease;
}

.wordle-volume__button--muted {
  color: #b0bec5;
}

.wordle-volume__button:hover {
  transform: scale(1.05);
}
`

export function VolumeControl() {
  const howlRef = useRef(null)
  const [volume, setVolume] = useState(0.5)
  const [isMuted, setIsMuted] = useState(false)
  const lastVolumeRef = useRef(0.5)

  // Init volume from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      const v = Number(stored)
      if (!Number.isNaN(v)) {
        setVolume(Math.max(0, Math.min(1, v)))
        if (v === 0) {
          setIsMuted(true)
        } else {
          lastVolumeRef.current = v
        }
      }
    }
  }, [])

  // Init Howler bgm
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (howlRef.current) return

    const initialVolume = volume
    const bgm = new Howl({
      src: [ThemeMusic],
      loop: true,
      volume: initialVolume,
      html5: true,
    })

    howlRef.current = bgm

    bgm.play()

    return () => {
      bgm.unload()
      howlRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync volume to Howler + localStorage
  useEffect(() => {
    const v = isMuted ? 0 : volume
    if (howlRef.current) {
      howlRef.current.volume(v)
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, String(v))
    }
  }, [volume, isMuted])

  const handleSliderChange = (e) => {
    const v = Number(e.target.value)
    const clamped = Math.max(0, Math.min(1, v))
    setVolume(clamped)
    if (clamped === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
      lastVolumeRef.current = clamped
    }
  }

  const toggleMute = () => {
    if (isMuted) {
      const restore = lastVolumeRef.current > 0 ? lastVolumeRef.current : 0.5
      setVolume(restore)
      setIsMuted(false)
    } else {
      if (volume > 0) {
        lastVolumeRef.current = volume
      }
      setIsMuted(true)
    }
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
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>
    </>
  )
}

// Example (Howler integration is already inside this component)
// Just render <VolumeControl /> in your header/layout.


