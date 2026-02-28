import React, { useEffect, useRef, useState } from 'react'
import { Howl } from 'howler'
import ThemeMusic from '../../../../../../../assets/sound-effect/solitare/theme.mp3'

const STORAGE_KEY = 'wordle-theme-volume'

// CSS gộp chung trong JSX (dùng className + <style>)
const VOLUME_CONTROL_CSS = `
.wordle-volume {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #fff7ea;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.wordle-volume__icon {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #222;
  transition: transform 0.15s ease, color 0.15s ease, opacity 0.15s ease;
}

.wordle-volume__icon--muted {
  color: #b0bec5;
  opacity: 0.7;
}

.wordle-volume__icon:hover {
  transform: scale(1.05);
}

.wordle-volume__slider {
  display: flex;
  align-items: center;
  width: 140px;
}

.wordle-volume__range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  background: #111;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.wordle-volume__range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #111;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.wordle-volume__range::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #111;
  border: none;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.wordle-volume__range:hover::-webkit-slider-thumb,
.wordle-volume__range:active::-webkit-slider-thumb,
.wordle-volume__range:hover::-moz-range-thumb,
.wordle-volume__range:active::-moz-range-thumb {
  transform: scale(1.1);
  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.08);
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
          className={`wordle-volume__icon ${isMuted ? 'wordle-volume__icon--muted' : ''}`}
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          🔊
        </button>
        <div className="wordle-volume__slider">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleSliderChange}
            className="wordle-volume__range"
          />
        </div>
      </div>
    </>
  )
}

// Example (Howler integration is already inside this component)
// Just render <VolumeControl /> in your header/layout.


