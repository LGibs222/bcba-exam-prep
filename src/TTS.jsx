import { useEffect, useRef, useState } from 'react'

/**
 * One Love TTS — calls the Cloudflare Worker proxy that fronts ElevenLabs.
 *
 * To wire up: paste your Cloudflare Worker URL into TTS_ENDPOINT below.
 * Until that's set, all 🔊 buttons render disabled with a tooltip explaining
 * setup is incomplete (no errors, no broken UI).
 */
const TTS_ENDPOINT = 'https://onelove-tts.lenwoodjr.workers.dev/'

const isConfigured = () => !!TTS_ENDPOINT && !TTS_ENDPOINT.startsWith('PASTE_')

// Single shared audio element so a new play() always interrupts the prior one.
let sharedAudio = null
function getAudio() {
  if (sharedAudio) return sharedAudio
  sharedAudio = new Audio()
  return sharedAudio
}

// Module-level subscription so multiple buttons can show "loading" / "playing"
// state for whichever one started the current playback.
const listeners = new Set()
let currentToken = null   // identifies which button owns the current audio
let currentState = 'idle' // 'idle' | 'loading' | 'playing'
function setCurrent(token, state) {
  currentToken = token
  currentState = state
  listeners.forEach(fn => fn())
}

export function useTTSState(token) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const fn = () => setTick(t => t + 1)
    listeners.add(fn)
    return () => listeners.delete(fn)
  }, [])
  if (currentToken !== token) return 'idle'
  return currentState
}

export function stopTTS() {
  const a = getAudio()
  try { a.pause(); a.currentTime = 0 } catch {}
  setCurrent(null, 'idle')
}

export async function playTTS(text, token) {
  if (!isConfigured() || !text) return
  const audio = getAudio()
  // If this same token is currently playing, treat as toggle-stop.
  if (currentToken === token && currentState === 'playing') {
    stopTTS()
    return
  }
  try { audio.pause(); audio.currentTime = 0 } catch {}
  setCurrent(token, 'loading')
  try {
    const res = await fetch(TTS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.slice(0, 1500) }),
    })
    if (!res.ok) throw new Error(`tts_${res.status}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    audio.src = url
    audio.onended = () => { URL.revokeObjectURL(url); setCurrent(null, 'idle') }
    audio.onerror = () => { URL.revokeObjectURL(url); setCurrent(null, 'idle') }
    await audio.play()
    setCurrent(token, 'playing')
  } catch (err) {
    console.warn('[TTS] playback failed', err)
    setCurrent(null, 'idle')
  }
}

/**
 * 🔊 button — pass `text` to read aloud and `token` (any unique string for
 * this button instance, e.g. `module:${id}` or `rationale:${qIdx}`).
 *
 * Renders disabled with a tooltip if TTS_ENDPOINT is unset.
 */
export function TTSButton({ text, token, label = '🔊 Read aloud', size = 'sm', style = {} }) {
  const state = useTTSState(token)
  const configured = isConfigured()
  const disabled = !configured || !text
  const isPlaying = state === 'playing'
  const isLoading = state === 'loading'

  const sizes = {
    xs: { padding: '4px 8px', fontSize: 11 },
    sm: { padding: '6px 12px', fontSize: 12 },
    md: { padding: '8px 14px', fontSize: 13 },
  }

  return (
    <button
      type="button"
      onClick={() => !disabled && playTTS(text, token)}
      disabled={disabled}
      title={!configured ? 'Voice playback not yet set up' : isPlaying ? 'Tap to stop' : 'Read aloud'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: isPlaying ? '#5b21b6' : 'transparent',
        color: isPlaying ? '#fff' : (disabled ? 'rgba(0,0,0,0.3)' : '#5b21b6'),
        border: `1px solid ${disabled ? 'rgba(0,0,0,0.12)' : '#5b21b6'}`,
        borderRadius: 99, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', whiteSpace: 'nowrap',
        ...sizes[size],
        ...style,
      }}
    >
      <span aria-hidden>{isLoading ? '⏳' : isPlaying ? '⏹' : '🔊'}</span>
      {label && <span>{isLoading ? 'Loading…' : isPlaying ? 'Stop' : label.replace('🔊 ', '')}</span>}
    </button>
  )
}
