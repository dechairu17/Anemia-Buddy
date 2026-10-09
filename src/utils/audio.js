// src/utils/audio.js
// Singleton Web Audio API Synthesizer - 100% kompatibel dengan Android WebView & Desktop

let sharedAudioCtx = null

/**
 * Mendapatkan atau menginisialisasi singleton AudioContext
 */
export const getAudioContext = () => {
  if (typeof window === 'undefined') return null

  if (!sharedAudioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      sharedAudioCtx = new AudioContextClass()
    }
  }

  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {})
  }

  return sharedAudioCtx
}

// Buka kunci AudioContext secara proaktif di HP Android & iOS
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext()
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
  }
  window.addEventListener('click', unlockAudio, { passive: true })
  window.addEventListener('touchstart', unlockAudio, { passive: true })
  window.addEventListener('touchend', unlockAudio, { passive: true })
  window.addEventListener('pointerdown', unlockAudio, { passive: true })
  window.addEventListener('keydown', unlockAudio, { passive: true })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') unlockAudio()
  })
}

/**
 * Memainkan efek suara sintetis
 * @param {string} type - 'click' | 'correct' | 'match' | 'wrong' | 'tick' | 'combo' | 'cring' | 'celebration' | 'heartbeat' | 'stamp' | 'found'
 * @param {object} options - Opsi tambahan (e.g. streak count, isEven tick)
 */
export const playSound = (type, options = {}) => {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    // Pastikan context dalam keadaan running
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    const now = ctx.currentTime

    switch (type) {
      // 1. KLIK TOMBOL
      case 'click': {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(520, now)
        osc.frequency.setValueAtTime(320, now + 0.02)
        gain.gain.setValueAtTime(0.25, now)
        gain.gain.linearRampToValueAtTime(0.001, now + 0.06)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.06)
        break
      }

      // 2. DETAK JAM TIK-TOK (15 DETIK COUNTDOWN)
      case 'tick': {
        const isHighTick = options.isEven ?? false
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const freq = isHighTick ? 1150 : 850
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now)
        osc.frequency.setValueAtTime(freq * 0.6, now + 0.03)

        gain.gain.setValueAtTime(0.4, now)
        gain.gain.linearRampToValueAtTime(0.001, now + 0.07)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now)
        osc.stop(now + 0.07)
        break
      }

      // 3. COMBO SKOR BERTINGKAT
      case 'combo': {
        const streak = Math.min(10, Math.max(1, options.streak || 2))
        const baseMult = 1 + (streak - 1) * 0.09
        const freqs = [523.25 * baseMult, 659.25 * baseMult, 783.99 * baseMult, 1046.50 * baseMult, 1318.51 * baseMult]

        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          const noteTime = now + idx * 0.045
          osc.frequency.setValueAtTime(freq, noteTime)
          gain.gain.setValueAtTime(0.001, now)
          gain.gain.setValueAtTime(0.28, noteTime)
          gain.gain.linearRampToValueAtTime(0.001, noteTime + 0.16)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(noteTime)
          osc.stop(noteTime + 0.16)
        })
        break
      }

      // 4. JAWABAN TEPAT / PASANGAN KARTU COCOK
      case 'correct':
      case 'match': {
        const notes = [587.33, 880, 1174.66]
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          const noteTime = now + idx * 0.065
          osc.frequency.setValueAtTime(freq, noteTime)
          gain.gain.setValueAtTime(0.001, now)
          gain.gain.setValueAtTime(0.3, noteTime)
          gain.gain.linearRampToValueAtTime(0.001, noteTime + 0.22)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(noteTime)
          osc.stop(noteTime + 0.22)
        })
        break
      }

      // 5. SALAH / BUZZER
      case 'wrong': {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(220, now)
        osc.frequency.linearRampToValueAtTime(140, now + 0.28)
        gain.gain.setValueAtTime(0.35, now)
        gain.gain.linearRampToValueAtTime(0.001, now + 0.3)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.3)
        break
      }

      // 6. SUARA CRINGGG / SELEBRASI / SELESAI GAME (100% RELIABLE DI ANDROID)
      case 'cring':
      case 'celebration':
      case 'win': {
        // (A) Kemilau Koin Kristal Emas Cepat
        const sparkles = [1046.50, 1318.51, 1567.98, 2093.00, 2637.02, 3135.96, 3951.07]
        sparkles.forEach((freq, idx) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'triangle'
          const noteTime = now + idx * 0.04
          osc.frequency.setValueAtTime(freq, noteTime)
          gain.gain.setValueAtTime(0.001, now)
          gain.gain.setValueAtTime(0.35, noteTime)
          gain.gain.linearRampToValueAtTime(0.001, noteTime + 0.6)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(noteTime)
          osc.stop(noteTime + 0.6)
        })

        // (B) Akor Kemenangan Fanfare Mayor (C Mayor)
        const fanfareChords = [523.25, 659.25, 783.99, 1046.50]
        fanfareChords.forEach((freq) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          const noteTime = now + 0.16
          osc.frequency.setValueAtTime(freq, noteTime)
          gain.gain.setValueAtTime(0.001, now)
          gain.gain.setValueAtTime(0.32, noteTime)
          gain.gain.linearRampToValueAtTime(0.001, noteTime + 1.2)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(noteTime)
          osc.stop(noteTime + 1.2)
        })
        break
      }

      // 7. STEMPEL
      case 'stamp': {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'square'
        osc.frequency.setValueAtTime(170, now)
        osc.frequency.linearRampToValueAtTime(45, now + 0.08)
        gain.gain.setValueAtTime(0.35, now)
        gain.gain.linearRampToValueAtTime(0.001, now + 0.09)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.09)
        break
      }

      // 8. DETAK JANTUNG
      case 'heartbeat': {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(70, now)
        osc.frequency.linearRampToValueAtTime(45, now + 0.12)
        gain.gain.setValueAtTime(0.4, now)
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.12)
        break
      }

      // 9. DITEMUKAN GEJALA
      case 'found': {
        const notes = [523.25, 659.25, 783.99, 1046.50]
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'triangle'
          const noteTime = now + idx * 0.06
          osc.frequency.setValueAtTime(freq, noteTime)
          gain.gain.setValueAtTime(0.001, now)
          gain.gain.setValueAtTime(0.28, noteTime)
          gain.gain.linearRampToValueAtTime(0.001, noteTime + 0.18)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(noteTime)
          osc.stop(noteTime + 0.18)
        })
        break
      }

      default:
        break
    }
  } catch (err) {
    console.warn('Audio playback error:', err?.message)
  }
}
