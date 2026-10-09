// src/utils/audio.js
// Singleton Web Audio API Synthesizer dengan Autoplay Unlock untuk Mobile & Desktop

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

// Auto-unlock AudioContext pada interaksi sentuhan atau klik pertama pengguna
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext()
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
  }
  window.addEventListener('click', unlockAudio, { passive: true })
  window.addEventListener('touchstart', unlockAudio, { passive: true })
  window.addEventListener('pointerdown', unlockAudio, { passive: true })
  window.addEventListener('keydown', unlockAudio, { passive: true })
}

/**
 * Memainkan efek suara sintetis tanpa membutuhkan aset file eksternal
 * @param {string} type - Jenis suara: 'click' | 'correct' | 'match' | 'wrong' | 'tick' | 'combo' | 'cring' | 'applause' | 'heartbeat' | 'stamp' | 'found'
 * @param {object} options - Opsi tambahan (e.g. streak count, isEven tick)
 */
export const playSound = (type, options = {}) => {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    const now = ctx.currentTime

    switch (type) {
      // 1. KLIK TOMBOL BIASA
      case 'click': {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(520, now)
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.05)
        gain.gain.setValueAtTime(0.2, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.05)
        break
      }

      // 2. DETAK JAM TIK-TOK (JELAS DI SPEAKER HP DENGAN TRANSIENT PUNCHY)
      case 'tick': {
        const isHighTick = options.isEven ?? false
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        
        // Frekuensi bergantian 1150Hz (tik) dan 850Hz (tok)
        const freq = isHighTick ? 1150 : 850
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now)
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.06)

        gain.gain.setValueAtTime(0.35, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

        // Tambahkan filtered noise burst singkat untuk suara mekanik roda gigi jam
        const bufferSize = ctx.sampleRate * 0.02
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1
        }
        const whiteNoise = ctx.createBufferSource()
        whiteNoise.buffer = noiseBuffer

        const filter = ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.value = isHighTick ? 2400 : 1600
        filter.Q.value = 3

        const noiseGain = ctx.createGain()
        noiseGain.gain.setValueAtTime(0.25, now)
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025)

        whiteNoise.connect(filter)
        filter.connect(noiseGain)
        noiseGain.connect(ctx.destination)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now)
        osc.stop(now + 0.06)
        whiteNoise.start(now)
        break
      }

      // 3. SUARA COMBO SKOR (ASCENDING ARCADE CHIMES BERDASARKAN STREAK)
      case 'combo': {
        const streak = Math.min(10, Math.max(1, options.streak || 2))
        // Nada dasar naik bertahap seiring bertambahnya streak combo
        const basePitchMultiplier = 1 + (streak - 1) * 0.08
        const freqs = [
          523.25 * basePitchMultiplier, // C
          659.25 * basePitchMultiplier, // E
          783.99 * basePitchMultiplier, // G
          1046.50 * basePitchMultiplier, // C high
          1318.51 * basePitchMultiplier  // E high
        ]

        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          const noteTime = now + idx * 0.045
          osc.frequency.setValueAtTime(freq, noteTime)
          gain.gain.setValueAtTime(0.25, noteTime)
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.16)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(noteTime)
          osc.stop(noteTime + 0.16)
        })
        break
      }

      // 4. BENAR / JAWABAN TEPAT / KARTU COCOK
      case 'correct':
      case 'match': {
        const notes = [587.33, 880, 1174.66]
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          const noteTime = now + idx * 0.07
          osc.frequency.setValueAtTime(freq, noteTime)
          gain.gain.setValueAtTime(0.28, noteTime)
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.22)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(noteTime)
          osc.stop(noteTime + 0.22)
        })
        break
      }

      // 5. SALAH / PENALTI / TIMEOUT / BUZZER
      case 'wrong': {
        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        const gain = ctx.createGain()
        osc1.type = 'sawtooth'
        osc2.type = 'square'
        osc1.frequency.setValueAtTime(196, now)
        osc1.frequency.linearRampToValueAtTime(146.83, now + 0.25)
        osc2.frequency.setValueAtTime(207.65, now) // Dissonant tone
        osc2.frequency.linearRampToValueAtTime(155.56, now + 0.25)
        gain.gain.setValueAtTime(0.28, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
        osc1.connect(gain)
        osc2.connect(gain)
        gain.connect(ctx.destination)
        osc1.start(now)
        osc2.start(now)
        osc1.stop(now + 0.3)
        osc2.stop(now + 0.3)
        break
      }

      // 6. SUARA CRINGGG / TEPUK TANGAN / MERIAH (APRESIASI SKOR & HASIL GAME)
      case 'cring':
      case 'celebration':
      case 'win': {
        // (A) Kemilau Koin Emas / Chime Kristal Meluncur Cepat
        const sparkles = [1046.50, 1318.51, 1567.98, 2093.00, 2637.02, 3135.96, 4186.01]
        sparkles.forEach((freq, idx) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'triangle'
          const noteTime = now + idx * 0.04
          osc.frequency.setValueAtTime(freq, noteTime)
          gain.gain.setValueAtTime(0.3, noteTime)
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.55)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(noteTime)
          osc.stop(noteTime + 0.55)
        })

        // (B) Akor Kemenangan Mega Fanfare (C Mayor: C4, G4, C5, E5, G5)
        const chords = [261.63, 392.00, 523.25, 659.25, 783.99]
        chords.forEach((freq) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          const noteTime = now + 0.18
          osc.frequency.setValueAtTime(freq, noteTime)
          gain.gain.setValueAtTime(0.28, noteTime)
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 1.2)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(noteTime)
          osc.stop(noteTime + 1.2)
        })

        // (C) Efek Tepuk Tangan / Applause Meriah
        const clapTimes = [0.25, 0.35, 0.44, 0.52, 0.60, 0.67, 0.75, 0.82, 0.90, 0.98, 1.08]
        clapTimes.forEach((delay) => {
          const clapBuf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate)
          const data = clapBuf.getChannelData(0)
          for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015))
          }
          const clapSrc = ctx.createBufferSource()
          clapSrc.buffer = clapBuf

          const filter = ctx.createBiquadFilter()
          filter.type = 'bandpass'
          filter.frequency.value = 1400 + Math.random() * 600
          filter.Q.value = 1.8

          const clapGain = ctx.createGain()
          clapGain.gain.setValueAtTime(0.22, now + delay)
          clapGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.05)

          clapSrc.connect(filter)
          filter.connect(clapGain)
          clapGain.connect(ctx.destination)

          clapSrc.start(now + delay)
        })
        break
      }

      // 7. STEMPEL / STAMP PENILAIAN
      case 'stamp': {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'square'
        osc.frequency.setValueAtTime(170, now)
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.09)
        gain.gain.setValueAtTime(0.35, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.09)
        break
      }

      // 8. DETAK JANTUNG / HEARTBEAT
      case 'heartbeat': {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(70, now)
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.12)
        gain.gain.setValueAtTime(0.4, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.12)
        break
      }

      // 9. DITEMUKAN / FOUND GEJALA
      case 'found': {
        const notes = [523.25, 659.25, 783.99, 1046.50]
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'triangle'
          const noteTime = now + idx * 0.06
          osc.frequency.setValueAtTime(freq, noteTime)
          gain.gain.setValueAtTime(0.25, noteTime)
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18)
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
    // Graceful handling jika autoplay diblokir browser
    console.warn('Audio playback prevented:', err?.message)
  }
}
