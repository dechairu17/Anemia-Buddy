import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

// IMPORT ASET RESMI PROYEK (CROPPED PROFILE & NO RED TEXTURE)
import mascotSiswi from '../../assets/9. day 1 level B/karakter.png'
import bgProfilPria from '../../assets/6/game home - profil pria_crop.png'
import bgProfilWanita from '../../assets/6/game home - profil wanita_crop.png'
import imgDarahO2 from '../../assets/5/5. kuis - darah & o2.png'
import imgSumberMakanan from '../../assets/3/3. materi - sumber makanan.png'
import imgPenyebab from '../../assets/3/3. materi - penyebab.png'

// AUDIO SYNTHESIZER UNTUK SOUND EFFECT REAL-TIME
import { playSound } from '../../utils/audio'

// DATA KARTU LEVEL 1: EVALUASI FAKTA VS MITOS TANDA GEJALA
const CARDS_LEVEL_1 = [
  {
    id: 1,
    text: 'Cepat Lelah dan Lemah saat Beraktivitas',
    type: 'fakta',
    category: 'Tanda Gejala',
    explanation: 'FAKTA! Sel tubuh kekurangan oksigen karena hemoglobin darah yang rendah sehingga energi cepat habis.'
  },
  {
    id: 2,
    text: 'Minum jamu pahit pasti langsung sembuh dari anemia',
    type: 'mitos',
    category: 'Pengobatan',
    explanation: 'MITOS! Jamu pahit bukan penambah darah. Tubuh butuh zat besi dari makanan bergizi dan Tablet Tambah Darah (TTD).'
  },
  {
    id: 3,
    text: 'Wajah, Bibir, dan Kelopak Mata Tampak Pucat',
    type: 'fakta',
    category: 'Tanda Gejala',
    explanation: 'FAKTA! Hemoglobin yang memberi warna merah pada darah berkurang sehingga warna kulit tampak pucat.'
  },
  {
    id: 4,
    text: 'Makan es batu bisa menyembuhkan anemia',
    type: 'mitos',
    category: 'Kebiasaan',
    explanation: 'MITOS! Keinginan mengunyah es batu (pica) justru tanda kamu kekurangan zat besi, bukan obatnya!'
  },
  {
    id: 5,
    text: 'Sering Pusing dan Pandangan Berkunang-kunang',
    type: 'fakta',
    category: 'Tanda Gejala',
    explanation: 'FAKTA! Suplai oksigen ke otak berkurang ketika kadar hemoglobin dalam darah rendah.'
  },
  {
    id: 6,
    text: 'Anemia hanya menyerang orang lanjut usia',
    type: 'mitos',
    category: 'Penderita',
    explanation: 'MITOS! Remaja putri dan usia sekolah sangat rentan anemia karena percepatan pertumbuhan dan menstruasi.'
  },
  {
    id: 7,
    text: 'Sulit Konsentrasi dan Mudah Mengantuk di Kelas',
    type: 'fakta',
    category: 'Tanda Gejala',
    explanation: 'FAKTA! Kekurangan pasokan oksigen di sel saraf otak membuat konsentrasi dan daya tangkap menurun.'
  },
  {
    id: 8,
    text: 'Sesak Napas saat Melakukan Olahraga Ringan',
    type: 'fakta',
    category: 'Tanda Gejala',
    explanation: 'FAKTA! Jantung dan paru-paru bekerja lebih keras untuk memompa oksigen yang terbatas ke seluruh tubuh.'
  }
]

// DATA PUZZLE LEVEL 2: MEMBANGUN ALUR ANEMIA (PENYEBAB -> TERJADINYA ANEMIA)
const PUZZLE_PIECES = [
  {
    id: 'step1',
    order: 1,
    title: 'Kurang Asupan Zat Besi',
    desc: 'Jarang makan protein hewani & sayuran hijau penyuplai zat besi',
    iconType: 'food',
    badge: '1. Penyebab Awal'
  },
  {
    id: 'step2',
    order: 2,
    title: 'Cadangan Besi Tubuh Habis',
    desc: 'Ferritin & cadangan zat besi di hati dan organ tubuh terkuras',
    iconType: 'body',
    badge: '2. Proses Tubuh'
  },
  {
    id: 'step3',
    order: 3,
    title: 'Hemoglobin Menurun',
    desc: 'Tubuh gagal membuat cukup hemoglobin pembawa oksigen',
    iconType: 'hb',
    badge: '3. Produksi Darah'
  },
  {
    id: 'step4',
    order: 4,
    title: 'Sel Darah Merah Sedikit',
    desc: 'Jumlah eritrosit drop dan pasokan oksigen ke seluruh tubuh anjlok',
    iconType: 'rbc',
    badge: '4. Dampak Akhir'
  }
]

export default function Day1LevelC({ onBack, onComplete, misiId = 'misi_h1_c' }) {
  // PHASE: 'intro' | 'level1' | 'level1_complete' | 'level2' | 'completed'
  const [phase, setPhase] = useState('intro')
  const [gender, setGender] = useState('male')
  const [totalScore, setTotalScore] = useState(0)
  const [earnedScore, setEarnedScore] = useState(100)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)
  const [existingScore, setExistingScore] = useState(0)

  // STATE LEVEL 1 (FAKTA VS MITOS)
  const [deck, setDeck] = useState([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [faktaCount, setFaktaCount] = useState(0)
  const [mitosCount, setMitosCount] = useState(0)
  const [feedbackModal, setFeedbackModal] = useState(null)
  const [dragOverZone, setDragOverZone] = useState(null) // 'fakta' | 'mitos' | null
  const [level1Mistakes, setLevel1Mistakes] = useState(0)

  // ADRENALIN & GAME-FEEL (COMBO, SHAKE, TIMER, STAMP)
  const [streakCount, setStreakCount] = useState(0)
  const [isShaking, setIsShaking] = useState(false)
  const [activeStamp, setActiveStamp] = useState(null) // { text: string, type: 'fakta' | 'mitos' }
  const [timeLeft, setTimeLeft] = useState(15)

  // STATE LEVEL 2 (MEMBANGUN ALUR ANEMIA)
  const [availablePieces, setAvailablePieces] = useState([])
  const [slots, setSlots] = useState([null, null, null, null])
  const [selectedPieceId, setSelectedPieceId] = useState(null)
  const [level2Validation, setLevel2Validation] = useState(null) // null | 'correct' | 'wrong'
  const [level2Mistakes, setLevel2Mistakes] = useState(0)
  const [showLevel2WrongModal, setShowLevel2WrongModal] = useState(false)

  const username = localStorage.getItem('anemia_username') || 'Siswa'
  const startTimeRef = useRef(Date.now())

  // LOAD USER & RIWAYAT SKOR
  useEffect(() => {
    loadUserData()
    initLevel1Deck()
    initLevel2Pieces()
  }, [])

  // HITUNG MUNDUR URGENSI WAKTU LEVEL 1 (15 DETIK DENGAN EFEK DETAK JAM TUT-TUT & TIMEOUT NYATA)
  useEffect(() => {
    if (phase !== 'level1' || feedbackModal || currentCardIndex >= deck.length) return

    // Suara detak jam langsung berbunyi dari awal saat kartu terbuka
    playSound('tick', { isEven: true })

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // WAKTU HABIS (0 DETIK)!
          const card = deck[currentCardIndex]
          playSound('wrong')
          setIsShaking(true)
          setTimeout(() => setIsShaking(false), 400)
          setStreakCount(0)
          setLevel1Mistakes(m => m + 1)
          setEarnedScore(s => Math.max(50, s - 5))
          setFeedbackModal({
            isCorrect: false,
            card,
            chosenType: 'timeout',
            explanation: `⚠️ WAKTU 15 DETIK HABIS! Pernyataan ini sebenarnya adalah ${card?.type?.toUpperCase()}. ${card?.explanation}`
          })
          return 15
        }

        const isEven = prev % 2 === 0
        // Efek suara detak jam "tik tik tik" jelas setiap detik
        if (prev <= 5) {
          playSound('tick', { isEven })
          playSound('heartbeat')
        } else {
          playSound('tick', { isEven })
        }

        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [phase, feedbackModal, currentCardIndex, deck])

  const loadUserData = async () => {
    try {
      const { data: userData } = await supabase
        .from('game_users')
        .select('gender')
        .eq('username', username)
        .maybeSingle()

      if (userData && userData.gender) {
        setGender(userData.gender.toLowerCase())
      }

      const { data: scoreData } = await supabase
        .from('game_scores')
        .select('kategori_game, skor')
        .eq('username', username)

      if (scoreData && scoreData.length > 0) {
        const sum = scoreData.reduce((acc, curr) => acc + (curr.skor || 0), 0)
        setTotalScore(sum)

        const existing = scoreData.find(item => item.kategori_game === misiId)
        if (existing) {
          setAlreadyCompleted(true)
          setExistingScore(existing.skor || 0)
        }
      }
    } catch (err) {
      console.error('Gagal memuat profil:', err.message)
    }
  }

  // INISIALISASI KARTU LEVEL 1 (ACAK DENGAN TIMER 15 DETIK)
  const initLevel1Deck = () => {
    const shuffled = [...CARDS_LEVEL_1].sort(() => Math.random() - 0.5)
    setDeck(shuffled)
    setCurrentCardIndex(0)
    setFaktaCount(0)
    setMitosCount(0)
    setStreakCount(0)
    setTimeLeft(15)
  }

  // INISIALISASI PUZZLE LEVEL 2 (ACAK)
  const initLevel2Pieces = () => {
    const shuffled = [...PUZZLE_PIECES].sort(() => Math.random() - 0.5)
    setAvailablePieces(shuffled)
    setSlots([null, null, null, null])
    setSelectedPieceId(null)
    setLevel2Validation(null)
    setShowLevel2WrongModal(false)
  }

  // SIMPAN SKOR KE DATABASE SUPABASE
  const saveScoreToDatabase = async (finalScore) => {
    try {
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
      await supabase.from('game_scores').insert([
        {
          username: username,
          kategori_game: misiId,
          skor: finalScore,
          durasi_detik: durationSeconds
        }
      ])
      setTotalScore(prev => prev + finalScore)
      setAlreadyCompleted(true)
      setExistingScore(finalScore)
    } catch (err) {
      console.error('Gagal menyimpan skor ke Supabase:', err.message)
    }
  }

  // --------------------------------------------------------------------------
  // LOGIKA LEVEL 1: EVALUASI FAKTA VS MITOS (DENGAN COMBO STREAK & STEMPEL)
  // --------------------------------------------------------------------------
  const handleSortCard = (chosenType) => {
    if (currentCardIndex >= deck.length || activeStamp) return
    const card = deck[currentCardIndex]
    const isCorrect = card.type === chosenType

    if (isCorrect) {
      const nextStreak = streakCount + 1
      setStreakCount(nextStreak)

      if (nextStreak >= 2) {
        playSound('combo', { streak: nextStreak })
      } else {
        playSound('correct')
      }

      // Tampilkan Efek Stempel Visual
      setActiveStamp({
        text: chosenType === 'fakta' ? 'FAKTA MEDIS!' : 'MITOS TERBONGKAR!',
        type: chosenType
      })
      playSound('stamp')

      if (chosenType === 'fakta') setFaktaCount(prev => prev + 1)
      else setMitosCount(prev => prev + 1)

      setTimeLeft(15)

      setTimeout(() => {
        setActiveStamp(null)
        // Cek apakah ini kartu terakhir
        if (currentCardIndex + 1 >= deck.length) {
          playSound('cring')
          setPhase('level1_complete')
        } else {
          setCurrentCardIndex(prev => prev + 1)
        }
      }, 450)
    } else {
      playSound('wrong')
      setStreakCount(0)
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 400)
      setLevel1Mistakes(prev => prev + 1)
      setEarnedScore(prev => Math.max(50, prev - 5))
      setFeedbackModal({
        isCorrect: false,
        card,
        chosenType,
        explanation: card.explanation
      })
    }
  }

  const dismissFeedbackModal = () => {
    const isTimeout = feedbackModal?.chosenType === 'timeout'
    setFeedbackModal(null)
    setTimeLeft(15)
    if (isTimeout) {
      if (currentCardIndex + 1 >= deck.length) {
        playSound('cring')
        setPhase('level1_complete')
      } else {
        setCurrentCardIndex(prev => prev + 1)
      }
    }
  }

  // DRAG & DROP HANDLERS (DESKTOP & TOUCH FRIENDLY)
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', deck[currentCardIndex]?.id)
  }

  const handleDragOver = (e, zone) => {
    e.preventDefault()
    setDragOverZone(zone)
  }

  const handleDragLeave = () => {
    setDragOverZone(null)
  }

  const handleDrop = (e, zone) => {
    e.preventDefault()
    setDragOverZone(null)
    handleSortCard(zone)
  }

  // --------------------------------------------------------------------------
  // LOGIKA LEVEL 2: MEMBANGUN ALUR ANEMIA
  // --------------------------------------------------------------------------
  const handleSelectPiece = (pieceId) => {
    playSound('click')
    // Jika piece sudah terpilih, batalkan pilihan
    if (selectedPieceId === pieceId) {
      setSelectedPieceId(null)
      return
    }

    // Jika ada slot kosong pertama, langsung masukkan piece ke slot tersebut
    const firstEmptyIndex = slots.findIndex(s => s === null)
    if (firstEmptyIndex !== -1) {
      const piece = availablePieces.find(p => p.id === pieceId)
      if (piece) {
        playSound('place')
        const newSlots = [...slots]
        newSlots[firstEmptyIndex] = piece
        setSlots(newSlots)
        setAvailablePieces(prev => prev.filter(p => p.id !== pieceId))
        setSelectedPieceId(null)
        setLevel2Validation(null)
        return
      }
    }

    setSelectedPieceId(pieceId)
  }

  const handleSlotClick = (index) => {
    // Jika slot terisi, kembalikan kepingan ke baki
    if (slots[index]) {
      playSound('click')
      const pieceToReturn = slots[index]
      setAvailablePieces(prev => [...prev, pieceToReturn])
      const newSlots = [...slots]
      newSlots[index] = null
      setSlots(newSlots)
      setLevel2Validation(null)
      return
    }

    // Jika ada kepingan yang sedang terpilih, masukkan ke slot kosong ini
    if (selectedPieceId) {
      const piece = availablePieces.find(p => p.id === selectedPieceId)
      if (piece) {
        playSound('place')
        const newSlots = [...slots]
        newSlots[index] = piece
        setSlots(newSlots)
        setAvailablePieces(prev => prev.filter(p => p.id !== selectedPieceId))
        setSelectedPieceId(null)
        setLevel2Validation(null)
      }
    }
  }

  const handleCheckSequence = () => {
    // Cek apakah semua 4 slot sudah terisi
    if (slots.some(s => s === null)) {
      playSound('wrong')
      alert('Lengkapi seluruh 4 puzzle alur terlebih dahulu sebelum memeriksa!')
      return
    }

    const isOrderCorrect =
      slots[0]?.order === 1 &&
      slots[1]?.order === 2 &&
      slots[2]?.order === 3 &&
      slots[3]?.order === 4

    if (isOrderCorrect) {
      playSound('cring')
      setLevel2Validation('correct')
      setActiveStamp({
        text: 'ALUR PATOFISIOLOGI TEPAT!',
        type: 'fakta'
      })
      playSound('stamp')
      setTimeout(() => {
        setActiveStamp(null)
        saveScoreToDatabase(earnedScore)
        setPhase('completed')
      }, 1500)
    } else {
      playSound('wrong')
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 400)
      setLevel2Validation('wrong')
      setLevel2Mistakes(prev => prev + 1)
      setEarnedScore(prev => Math.max(50, prev - 10))
      setShowLevel2WrongModal(true)
    }
  }

  const handleResetSlots = () => {
    playSound('click')
    initLevel2Pieces()
  }

  // --------------------------------------------------------------------------
  // ICON HELPER UNTUK PUZZLE PIECE
  // --------------------------------------------------------------------------
  const renderPuzzleIcon = (type) => {
    switch (type) {
      case 'food':
        return (
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-100 flex items-center justify-center p-0.5 shadow-inner border border-amber-300">
            <img src={imgSumberMakanan} alt="Makanan Zat Besi" className="w-full h-full object-contain" />
          </div>
        )
      case 'body':
        return (
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-rose-100 flex items-center justify-center p-0.5 shadow-inner border border-rose-300">
            <img src={imgPenyebab} alt="Proses Tubuh" className="w-full h-full object-contain" />
          </div>
        )
      case 'hb':
        return (
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-red-100 flex items-center justify-center p-0.5 shadow-inner border border-red-300">
            <img src={imgDarahO2} alt="Hemoglobin" className="w-full h-full object-contain" />
          </div>
        )
      case 'rbc':
        return (
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-100 flex items-center justify-center p-0.5 shadow-inner border border-emerald-300">
            <svg viewBox="0 0 48 48" className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow fill-red-500" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="18" fill="#E63946" />
              <ellipse cx="24" cy="24" rx="10" ry="7" fill="#C1121F" opacity="0.65" />
              <circle cx="16" cy="18" r="4" fill="#FFFFFF" opacity="0.3" />
            </svg>
          </div>
        )
      default:
        return null
    }
  }

  // --------------------------------------------------------------------------
  // RENDER UTAMA
  // --------------------------------------------------------------------------
  return (
    <div className="relative w-dvw h-dvh bg-gradient-to-b from-[#08332B] via-[#0E473D] to-[#05231D] overflow-hidden font-sans select-none flex flex-col justify-between">
      {/* DEKORASI AMBIENT GLOW LATAR SEGAR (BEBAS WARNA MERAH) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(16,185,129,0.12),transparent_70%)] pointer-events-none" />

      {/* =========================================================================
          TOP BAR NAVIGASI & PROFIL
         ========================================================================= */}
      <div className="relative z-30 flex items-center justify-between w-full px-3 py-1 sm:px-4 sm:py-1 bg-[#0B4F48]/95 backdrop-blur-md border-b-2 border-emerald-400/30 shadow-md flex-shrink-0">
        {/* TOMBOL KEMBALI (HANYA MUNCUL DI MENU AWAL, HILANG SAAT SEDANG MEMAINKAN GAME) */}
        {phase === 'intro' ? (
          <button
            onClick={() => {
              playSound('click')
              onBack && onBack()
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer shadow-sm"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Keluar</span>
          </button>
        ) : (
          <div className="w-6 sm:w-8" />
        )}

        {/* TITLE */}
        <div className="text-left">
          <h1 className="text-white font-black text-xs sm:text-sm md:text-base leading-tight tracking-wide drop-shadow-md">
            MISI SEHAT: MELAWAN ANEMIA
          </h1>
        </div>

        {/* PROFIL SISWA & SKOR (PRESISI DI DALAM WHITE PILL ASSET CROPPED) */}
        <div className="relative h-8 sm:h-9 md:h-10 flex items-center">
          <img
            src={gender === 'female' ? bgProfilWanita : bgProfilPria}
            alt="Profile Pill"
            className="h-full w-auto object-contain pointer-events-none drop-shadow-md"
          />
          <div className="absolute left-[28%] right-[4%] inset-y-0 flex items-center justify-center gap-1.5 sm:gap-2 px-1.5 pointer-events-none">
            <span className="text-[#8B0000] font-black text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[105px] uppercase drop-shadow-xs">
              {username}
            </span>
            <span className="text-[#003049] font-black text-xs sm:text-sm opacity-40">|</span>
            <span className="text-[#003049] font-extrabold text-xs sm:text-sm whitespace-nowrap">
              {totalScore} PTS
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          KONTEN BERDASARKAN FASE (BEBAS SCROLL, PAS 1 LAYAR PENUH)
         ========================================================================= */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center p-0.5 sm:p-1 overflow-y-auto custom-scrollbar">

        {/* -----------------------------------------------------------------------
            FASE 0: MAIN MENU & CONCEPT (RESPONSIF LANDSCAPE HP TANPA TERPOTONG)
           ----------------------------------------------------------------------- */}
        {phase === 'intro' && (
          <div className="w-full max-w-2xl sm:max-w-3xl bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 shadow-2xl border-3 border-emerald-600/40 flex flex-col items-center animate-fadeIn max-h-[92dvh] overflow-y-auto custom-scrollbar my-auto justify-between">
            <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center w-full my-auto">
              {/* MASCOT SISWI / DETEKTIF SEHAT */}
              <div className="col-span-4 flex flex-col items-center justify-center">
                <div className="relative w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-1 shadow-lg flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-[#E8F5E9] overflow-hidden flex items-end justify-center">
                    <img
                      src={mascotSiswi}
                      alt="Mascot Siswi"
                      className="w-full h-full object-contain scale-110 translate-y-1 pointer-events-none"
                    />
                  </div>
                  {/* Magnifying Glass Badge */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-amber-400 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[10px] sm:text-xs">
                    🔍
                  </div>
                </div>
                <span className="mt-1 text-slate-800 font-black text-[10px] sm:text-xs tracking-wide uppercase text-center leading-tight">
                  {username} <br className="sm:hidden" />(Detektif Anemia)
                </span>
              </div>

              {/* DESKRIPSI & TOMBOL MENU LEVEL */}
              <div className="col-span-8 flex flex-col gap-1.5 sm:gap-2 text-left">
                {/* SPEECH BUBBLE */}
                <div className="relative bg-[#F4F9F6] border border-emerald-300 rounded-xl p-1.5 sm:p-2 shadow-xs">
                  <div className="text-emerald-950 font-black text-[11px] sm:text-xs leading-tight">
                    MISI SEHAT: Melawan Anemia
                  </div>
                  <p className="text-emerald-800 text-[9.5px] sm:text-[10.5px] font-medium mt-0.5 leading-tight">
                    "Siswa mampu menilai kebenaran seputar tanda gejala dan menciptakan alur terjadinya anemia yang akurat tanpa mitos!"
                  </p>
                </div>

                {/* DUA TINGKAT LEVEL */}
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  {/* LEVEL 1 CARD */}
                  <div
                    onClick={() => {
                      if (alreadyCompleted) return
                      playSound('click')
                      setPhase('level1')
                    }}
                    className={`p-1.5 sm:p-2 rounded-xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 transition-all shadow-xs group ${
                      alreadyCompleted ? 'opacity-60 cursor-not-allowed' : 'hover:from-emerald-100 hover:to-teal-100 cursor-pointer hover:-translate-y-0.5 active:scale-95'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs sm:text-sm shadow-xs group-hover:scale-105 transition-transform flex-shrink-0">
                        🔎
                      </div>
                      <div className="min-w-0">
                        <span className="inline-block text-[7.5px] sm:text-[8px] font-black text-emerald-700 uppercase tracking-wider bg-emerald-200/70 px-1 py-0.2 rounded-full">
                          LEVEL 1
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-[10px] sm:text-xs leading-tight truncate">
                          Fakta vs Mitos
                        </h4>
                        <p className="text-slate-600 text-[8.5px] sm:text-[9.5px] leading-tight truncate">
                          Pilah tanda gejala
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* LEVEL 2 CARD */}
                  <div
                    onClick={() => {
                      if (alreadyCompleted) return
                      playSound('click')
                      setPhase('level2')
                    }}
                    className={`p-1.5 sm:p-2 rounded-xl border-2 border-teal-500 bg-gradient-to-br from-teal-50 to-cyan-50 transition-all shadow-xs group ${
                      alreadyCompleted ? 'opacity-60 cursor-not-allowed' : 'hover:from-teal-100 hover:to-cyan-100 cursor-pointer hover:-translate-y-0.5 active:scale-95'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center text-xs sm:text-sm shadow-xs group-hover:scale-105 transition-transform flex-shrink-0">
                        🧩
                      </div>
                      <div className="min-w-0">
                        <span className="inline-block text-[7.5px] sm:text-[8px] font-black text-teal-700 uppercase tracking-wider bg-teal-200/70 px-1 py-0.2 rounded-full">
                          LEVEL 2
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-[10px] sm:text-xs leading-tight truncate">
                          Alur Anemia
                        </h4>
                        <p className="text-slate-600 text-[8.5px] sm:text-[9.5px] leading-tight truncate">
                          Susun urutan puzzle
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TOMBOL MULAI UTAMA */}
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    onClick={() => {
                      playSound('click')
                      setPhase('level1')
                    }}
                    className="w-full py-1.5 sm:py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all text-center tracking-wide flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-400"
                  >
                    <span>Mulai Misi Sehat Sekarang</span>
                    <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            FASE 1: LEVEL 1 (EVALUASI FAKTA VS MITOS - LAYAR NAIK KE ATAS & KOMPAK)
           ----------------------------------------------------------------------- */}
        {phase === 'level1' && (
          <div className={`w-full max-w-4xl h-full flex flex-col items-center justify-between max-h-[calc(100dvh-48px)] overflow-hidden ${isShaking ? 'animate-shake' : ''}`}>
            {/* SUBHEADER PROGRESS LEVEL 1 DENGAN COMBO & TIMER */}
            <div className="w-full bg-white/90 backdrop-blur-md rounded-xl py-0.5 px-2.5 shadow-xs border border-emerald-600/30 flex items-center justify-between gap-2 mb-0.5 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[9px] sm:text-xs">
                  MISI 1
                </span>
                <span className="text-slate-800 font-extrabold text-xs sm:text-sm">
                  Pilah-Pilih Tanda Gejala
                </span>
                {/* COMBO STREAK BADGE */}
                {streakCount >= 2 && (
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[9px] sm:text-[10px] animate-bounce shadow flex items-center gap-0.5">
                    <span>🔥</span>
                    <span>{streakCount}x COMBO!</span>
                  </span>
                )}
              </div>

              {/* URGENSI WAKTU (TIMER ADRENALIN) */}
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border font-black text-[9px] sm:text-xs transition-all ${
                timeLeft <= 6
                  ? 'bg-rose-100 text-rose-700 border-rose-400 animate-danger-pulse'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}>
                <span>⏱️</span>
                <span>{timeLeft}s</span>
              </div>

              {/* PROGRESS BAR */}
              <div className="flex-1 max-w-[100px] sm:max-w-xs flex items-center gap-1.5">
                <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-300 rounded-full"
                    style={{ width: `${((currentCardIndex) / deck.length) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-black text-slate-700">
                  {currentCardIndex}/{deck.length}
                </span>
              </div>

              {/* POIN SKOR SEMENTARA */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-black text-[9.5px] sm:text-xs">
                <span>⭐ Skor:</span>
                <span className="text-amber-700">{earnedScore} PTS</span>
              </div>
            </div>

            {/* PETUNJUK SPEECH BUBBLE */}
            <div className="w-full bg-emerald-50/95 border border-emerald-400 rounded-lg px-2 py-0.5 text-center text-[9px] sm:text-[10px] font-semibold text-emerald-950 mb-0.5 shadow-xs flex items-center justify-center gap-1 flex-shrink-0">
              <span>💡</span>
              <span>
                Gunakan tombol <b>FAKTA</b> atau <b>MITOS</b>. Raih <b>Combo Streak</b> untuk respon akurat kilat!
              </span>
            </div>

            {/* AREA UTAMA PEMILAHAN: DROP ZONE FAKTA & MITOS */}
            <div className="w-full grid grid-cols-3 gap-1.5 sm:gap-2.5 items-stretch flex-1 min-h-0 py-0.5">

              {/* DROP ZONE FAKTA (HIJAU) */}
              <div
                onDragOver={(e) => handleDragOver(e, 'fakta')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'fakta')}
                className={`rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between items-center border-2 sm:border-3 transition-all duration-200 shadow-md ${
                  dragOverZone === 'fakta'
                    ? 'border-emerald-400 bg-emerald-500/30 scale-[1.01]'
                    : 'border-emerald-500/70 bg-gradient-to-b from-[#1E523C] to-[#123627]'
                }`}
              >
                <div className="w-full flex items-center justify-between pb-1 border-b border-emerald-400/40 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white text-emerald-700 font-black text-xs sm:text-sm flex items-center justify-center shadow">
                      ✓
                    </span>
                    <h3 className="text-white font-black text-xs sm:text-base tracking-wider">
                      FAKTA
                    </h3>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-300/30 text-emerald-100 text-[9px] font-bold">
                    {faktaCount} Tersaring
                  </span>
                </div>

                <div className="my-auto py-1 text-center flex-1 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500/30 border border-dashed border-emerald-300 flex items-center justify-center mb-1 text-sm sm:text-lg text-emerald-200">
                    📥
                  </div>
                  <p className="text-emerald-100 text-[9.5px] sm:text-[10.5px] font-medium px-1 leading-tight line-clamp-2">
                    Tarik kartu ke sini jika ini FAKTA medis anemia
                  </p>
                </div>

                {/* TOMBOL AKSESIBEL KLIK LANGSUNG */}
                <button
                  onClick={() => handleSortCard('fakta')}
                  className="w-full py-1.5 sm:py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-black text-xs shadow transition-all cursor-pointer border border-emerald-300 flex items-center justify-center gap-1 flex-shrink-0"
                >
                  <span>✓ Pilih FAKTA</span>
                </button>
              </div>

              {/* KARTU DI TENGAH DENGAN STEMPEL & FEVER GLOW */}
              <div className="flex flex-col items-center justify-center p-0.5 relative">
                {currentCardIndex < deck.length ? (
                  <div
                    draggable
                    onDragStart={handleDragStart}
                    className={`relative w-full max-w-[240px] bg-white rounded-2xl p-2 sm:p-2.5 shadow-xl border-2 sm:border-3 transition-all cursor-grab active:cursor-grabbing flex flex-col items-center text-center justify-between h-full max-h-[165px] sm:max-h-[185px] group animate-scaleUp ${
                      streakCount >= 3
                        ? 'animate-fever border-amber-400 ring-2 ring-amber-300'
                        : 'border-slate-300 hover:border-emerald-500'
                    }`}
                  >
                    {/* OVERLAY STEMPEL ADRENALIN */}
                    {activeStamp && (
                      <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none bg-black/15 rounded-2xl backdrop-blur-[0.5px]">
                        <div className={`px-3 py-1.5 rounded-xl border-3 font-black text-xs sm:text-sm tracking-wider uppercase shadow-2xl animate-stamp ${
                          activeStamp.type === 'fakta'
                            ? 'border-emerald-600 bg-emerald-500 text-white'
                            : 'border-rose-600 bg-rose-500 text-white'
                        }`}>
                          {activeStamp.text}
                        </div>
                      </div>
                    )}

                    <div className="w-full flex items-center justify-between flex-shrink-0">
                      <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800">
                        {deck[currentCardIndex].category}
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold">
                        #{currentCardIndex + 1}/{deck.length}
                      </span>
                    </div>

                    <div className="my-auto py-0.5 flex-1 flex flex-col items-center justify-center">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-sm mb-0.5 shadow-inner">
                        📄
                      </div>
                      <p className="text-slate-900 font-black text-xs sm:text-[12px] leading-snug line-clamp-3">
                        "{deck[currentCardIndex].text}"
                      </p>
                    </div>

                    <div className="w-full text-[8.5px] text-slate-400 font-bold border-t border-slate-200 pt-0.5 flex items-center justify-center gap-1 flex-shrink-0">
                      <span>Klik Tombol di Kiri / Kanan</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white/95 rounded-2xl shadow-lg text-center">
                    <p className="font-extrabold text-emerald-800 text-xs sm:text-sm">Semua kartu berhasil disaring!</p>
                  </div>
                )}
              </div>

              {/* DROP ZONE MITOS (MERAH) */}
              <div
                onDragOver={(e) => handleDragOver(e, 'mitos')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'mitos')}
                className={`rounded-2xl p-1.5 sm:p-2 flex flex-col justify-between items-center border-2 sm:border-3 transition-all duration-200 shadow-md ${
                  dragOverZone === 'mitos'
                    ? 'border-rose-400 bg-rose-500/30 scale-[1.01]'
                    : 'border-rose-500/70 bg-gradient-to-b from-[#8C141E] to-[#540B11]'
                }`}
              >
                <div className="w-full flex items-center justify-between pb-0.5 border-b border-rose-400/40 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white text-rose-700 font-black text-xs flex items-center justify-center shadow">
                      ✕
                    </span>
                    <h3 className="text-white font-black text-xs sm:text-sm tracking-wider">
                      MITOS
                    </h3>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-300/30 text-rose-100 text-[8.5px] font-bold">
                    {mitosCount} Disingkirkan
                  </span>
                </div>

                <div className="my-auto py-0.5 text-center flex-1 flex flex-col items-center justify-center">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-rose-500/30 border border-dashed border-rose-300 flex items-center justify-center mb-0.5 text-xs sm:text-base text-rose-200">
                    🗑️
                  </div>
                  <p className="text-rose-100 text-[9px] sm:text-[10px] font-medium px-1 leading-tight line-clamp-2">
                    Tarik atau tekan tombol di bawah jika ini MITOS
                  </p>
                </div>

                {/* TOMBOL AKSESIBEL KLIK LANGSUNG */}
                <button
                  onClick={() => handleSortCard('mitos')}
                  className="w-full py-1 sm:py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 active:scale-95 text-white font-black text-xs shadow transition-all cursor-pointer border border-rose-300 flex items-center justify-center gap-1 flex-shrink-0"
                >
                  <span>✕ Pilih MITOS</span>
                </button>
              </div>

            </div>
          </div>
        )}



        {/* -----------------------------------------------------------------------
            TRANSISI LEVEL 1 COMPLETE (MODAL MOCKUP 2 KE 3)
           ----------------------------------------------------------------------- */}
        {/* -----------------------------------------------------------------------
            TRANSISI LEVEL 1 COMPLETE (MODAL MOCKUP 2 KE 3) - KOMPAK FIT LAYAR
           ----------------------------------------------------------------------- */}
        {phase === 'level1_complete' && (
          <div className="w-full max-w-lg sm:max-w-xl bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-2xl border-3 border-emerald-500 flex flex-col items-center text-center animate-scaleUp max-h-[80vh] justify-between">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-xl sm:text-2xl mb-1 shadow-sm flex-shrink-0">
              ✨
            </div>
            <span className="text-[9.5px] font-black uppercase tracking-wider text-emerald-700 px-2.5 py-0.5 rounded-full bg-emerald-100 mb-0.5 flex-shrink-0">
              LEVEL 1 SELESAI
            </span>
            <h2 className="text-slate-900 font-black text-sm sm:text-base mt-0.5 flex-shrink-0">
              Teks Sudah Bersih dari Mitos!
            </h2>
            <p className="text-slate-600 text-[10.5px] sm:text-[11.5px] my-1 sm:my-1.5 leading-relaxed max-w-md">
              Kamu berhasil memilah seluruh tanda gejala fakta dan menyingkirkan mitos yang keliru. Sekarang, saatnya melangkah ke <b>Level 2</b> untuk merumuskan alur terjadinya anemia!
            </p>

            <div className="w-full max-w-md bg-emerald-50 rounded-xl p-1.5 border border-emerald-200 flex items-center justify-around my-1 text-[10.5px] sm:text-[11px] font-bold text-emerald-900 flex-shrink-0">
              <div>✅ Fakta Benar: {faktaCount}</div>
              <div>🚫 Mitos Disingkirkan: {mitosCount}</div>
            </div>

            <button
              onClick={() => {
                playSound('click')
                setPhase('level2')
              }}
              className="mt-1.5 w-full max-w-sm py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-400 flex-shrink-0"
            >
              <span>Lanjut ke Level 2: Ciptakan Alur</span>
              <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            FASE 2: LEVEL 2 (MEMBANGUN ALUR ANEMIA - LEBIH LAPANG, BEBAS BENTROK)
           ----------------------------------------------------------------------- */}
        {phase === 'level2' && (
          <div className={`w-full max-w-4xl h-full flex flex-col items-center justify-between max-h-[calc(100dvh-48px)] overflow-hidden relative ${isShaking ? 'animate-shake' : ''}`}>
            {/* OVERLAY STEMPEL KEMENANGAN ALUR */}
            {activeStamp && (
              <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/20 rounded-2xl backdrop-blur-[1px]">
                <div className="px-5 py-2.5 rounded-2xl border-4 border-emerald-500 bg-emerald-600 text-white font-black text-sm sm:text-base tracking-wider uppercase shadow-2xl animate-stamp">
                  {activeStamp.text}
                </div>
              </div>
            )}

            {/* SUBHEADER & TAG */}
            <div className="w-full bg-white/90 backdrop-blur-md rounded-xl py-0.5 px-2.5 shadow-xs border border-teal-600/30 flex items-center justify-between gap-2 mb-0.5 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-teal-700 text-white font-extrabold text-[9px] sm:text-xs">
                  MISI 2
                </span>
                <span className="text-slate-800 font-extrabold text-xs sm:text-sm">
                  Pasang 4 Puzzle Alur Anemia
                </span>
              </div>

              {/* SKOR SEMENTARA */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-black text-[9.5px] sm:text-xs">
                <span>⭐ Skor:</span>
                <span className="text-amber-700">{earnedScore} PTS</span>
              </div>
            </div>

            {/* TIMELINE PUZZLE TRACK [MULAI] -> [SLOT 1..4] -> [ANEMIA TERJADI] */}
            <div className="w-full bg-white/90 backdrop-blur-md rounded-xl p-1 shadow-sm border border-teal-700/30 mb-0.5 flex-shrink-0">
              {/* FLOWING BLOODLINE ENERGY BAR */}
              <div className="w-full h-1 bg-slate-200 rounded-full mb-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-rose-500 transition-all duration-500"
                  style={{ width: `${Math.max(10, (slots.filter(Boolean).length / 4) * 100)}%` }}
                />
              </div>

              <div className="flex flex-row items-center justify-between gap-1 sm:gap-1.5">

                {/* NODE MULAI (HIJAU) */}
                <div className="flex-shrink-0 flex items-center gap-1 bg-gradient-to-br from-emerald-600 to-teal-800 text-white px-1.5 py-1 rounded-lg shadow border border-emerald-300">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 flex items-center justify-center font-black text-[8px] text-emerald-950 shadow">
                    ▶
                  </div>
                  <div className="text-left leading-none">
                    <div className="text-[7px] text-emerald-200 font-extrabold uppercase tracking-wider">
                      Awal
                    </div>
                    <div className="text-[9.5px] font-black">
                      MULAI
                    </div>
                  </div>
                </div>

                {/* 4 PUZZLE INTERLOCKING SLOTS */}
                <div className="flex-1 w-full grid grid-cols-4 gap-1 sm:gap-1.5 my-0.2">
                  {slots.map((slotPiece, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSlotClick(idx)}
                      className={`relative min-h-[40px] sm:min-h-[46px] rounded-lg p-0.5 sm:p-1 flex flex-col justify-between items-center text-center transition-all cursor-pointer select-none border-2 ${
                        slotPiece
                          ? 'bg-gradient-to-b from-white to-emerald-50/80 border-emerald-500 shadow-xs hover:scale-[1.01]'
                          : 'bg-slate-100/80 border-dashed border-slate-400 hover:bg-slate-200/80 hover:border-teal-500'
                      }`}
                    >
                      {/* NOTCH / TAB INDIKATOR PUZZLE */}
                      <div className="w-full flex items-center justify-between leading-none">
                        <span className="text-[7.5px] font-black px-1 py-0.2 rounded-full bg-slate-200 text-slate-700">
                          Tahap {idx + 1}
                        </span>
                        {slotPiece && (
                          <span className="text-[7.5px] text-rose-500 font-bold hover:underline">
                            ✕ Lepas
                          </span>
                        )}
                      </div>

                      {slotPiece ? (
                        <>
                          <div className="my-0.2 scale-75">
                            {renderPuzzleIcon(slotPiece.iconType)}
                          </div>
                          <div className="text-[8.5px] sm:text-[9.5px] font-extrabold text-slate-900 leading-tight line-clamp-1">
                            {slotPiece.title}
                          </div>
                        </>
                      ) : (
                        <div className="my-auto text-center">
                          <span className="text-[10px] opacity-40">➕</span>
                          <p className="text-[7.5px] text-slate-500 font-bold">
                            Pasang di sini
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* NODE AKHIR (MERAH) */}
                <div className="flex-shrink-0 flex items-center gap-1 bg-gradient-to-br from-rose-600 to-red-800 text-white px-1.5 py-1 rounded-lg shadow border border-rose-300">
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-400 flex items-center justify-center font-black text-[8px] text-rose-950 shadow">
                    ⚠️
                  </div>
                  <div className="text-left leading-none">
                    <div className="text-[7px] text-rose-200 font-extrabold uppercase tracking-wider">
                      Hasil
                    </div>
                    <div className="text-[9.5px] font-black whitespace-nowrap">
                      ANEMIA TERJADI
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* BAKI KEPINGAN PUZZLE YANG TERSEDIA (LAPANG & TIDAK TERPOTONG) */}
            <div className="w-full bg-slate-900/85 backdrop-blur-md rounded-xl p-1.5 sm:p-2 border border-emerald-400/30 shadow-lg flex flex-col items-center flex-1 min-h-0 justify-between">
              <div className="w-full flex items-center justify-between mb-0.5 flex-shrink-0">
                <span className="text-emerald-300 font-extrabold text-[10px] flex items-center gap-1">
                  <span>📦</span> Kepingan Alur ({availablePieces.length}/4):
                </span>
                <span className="text-[8.5px] text-slate-300">
                  Ketuk kepingan untuk memasang
                </span>
              </div>

              {availablePieces.length > 0 ? (
                <div className="w-full grid grid-cols-4 gap-1 sm:gap-1.5 my-auto">
                  {availablePieces.map((piece) => {
                    const isSelected = selectedPieceId === piece.id
                    return (
                      <div
                        key={piece.id}
                        onClick={() => handleSelectPiece(piece.id)}
                        className={`bg-white rounded-xl p-1 sm:p-1.5 flex flex-col items-center text-center justify-between cursor-pointer transition-all shadow-xs active:scale-95 border-2 ${
                          isSelected
                            ? 'border-amber-400 ring-2 ring-amber-300 scale-105'
                            : 'border-slate-300 hover:border-emerald-500'
                        }`}
                      >
                        <div className="my-0.2 scale-80">
                          {renderPuzzleIcon(piece.iconType)}
                        </div>
                        <h5 className="font-extrabold text-slate-900 text-[8.5px] sm:text-[9.5px] leading-tight line-clamp-1">
                          {piece.title}
                        </h5>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-1 text-center text-emerald-200 text-[11px] font-bold my-auto">
                  ✨ Seluruh kepingan terpasang! Klik "Periksa Alur" di bawah.
                </div>
              )}

              {/* FEEDBACK VALIDASI STATUS */}
              {level2Validation === 'wrong' && (
                <div className="my-0.5 w-full bg-rose-500/90 text-white font-extrabold text-[9.5px] px-2 py-0.5 rounded-lg text-center shadow animate-shake flex-shrink-0">
                  ❌ Urutan alur belum tepat! Periksa urutan dari makanan, cadangan tubuh, hingga hemoglobin.
                </div>
              )}

              {level2Validation === 'correct' && (
                <div className="my-0.5 w-full bg-emerald-500/95 text-white font-black text-xs px-2 py-0.5 rounded-lg text-center shadow animate-bounce flex-shrink-0">
                  🎉 ALUR TEPAT DAN LENGKAP! Menghitung skor akhir...
                </div>
              )}

              {/* ACTION BUTTONS: PERIKSA & RESET */}
              <div className="w-full flex items-center justify-center gap-2 pt-0.5 border-t border-slate-700/60 flex-shrink-0">
                <button
                  onClick={handleResetSlots}
                  className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold text-[11px] transition-all cursor-pointer"
                >
                  🔄 Reset
                </button>
                <button
                  onClick={handleCheckSequence}
                  disabled={slots.some(s => s === null)}
                  className={`px-4 py-1 rounded-lg font-black text-[11px] shadow transition-all flex items-center gap-1.5 ${
                    slots.some(s => s === null)
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white cursor-pointer active:scale-95 border border-emerald-300'
                  }`}
                >
                  <span>✓ Periksa Alur Terjadinya Anemia</span>
                </button>
              </div>

            </div>
          </div>
        )}



        {/* -----------------------------------------------------------------------
            FASE 3: GAME OVER / SCORE & COMPLETION (KOMPAK TANPA SCROLL)
           ----------------------------------------------------------------------- */}
        {phase === 'completed' && (
          <div className="w-full max-w-xl bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 shadow-2xl border-4 border-emerald-600 flex flex-col items-center text-center animate-scaleUp max-h-[90vh] overflow-y-auto custom-scrollbar justify-between">
            {/* BADGE TITLE */}
            <div className="w-full bg-[#1B4D3E] text-white rounded-xl py-1.5 px-3 shadow mb-1 border border-emerald-400/40">
              <h2 className="text-sm sm:text-lg font-black tracking-wide">
                SELAMAT!
              </h2>
              <p className="text-emerald-200 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider">
                Anda Telah Merumuskan Alur Sehat Tanpa Mitos
              </p>
            </div>

            {/* BINTANG & SKOR */}
            <div className="flex flex-col items-center my-0.5">
              <div className="flex items-center gap-1 text-lg sm:text-xl text-amber-400 mb-0.5">
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
              </div>
              <div className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">
                Nilai Akhir Anda
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-800">
                {earnedScore} <span className="text-sm text-emerald-600 font-bold">PTS</span>
              </div>
            </div>

            {/* DUA KARTU KOMPETENSI (CHECKLIST INDIKATOR) */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-1.5 my-1">
              <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center gap-2 text-left shadow-xs">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-600 text-white font-black text-xs sm:text-sm flex items-center justify-center flex-shrink-0 shadow">
                  ✓
                </div>
                <div className="text-[10px] sm:text-[11px] font-extrabold text-emerald-950 leading-tight">
                  Siswa mampu menilai kebenaran tanda gejala anemia (C5)
                </div>
              </div>

              <div className="p-1.5 sm:p-2 rounded-xl bg-teal-50 border border-teal-300 flex items-center gap-2 text-left shadow-xs">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-teal-600 text-white font-black text-xs sm:text-sm flex items-center justify-center flex-shrink-0 shadow">
                  ✓
                </div>
                <div className="text-[10px] sm:text-[11px] font-extrabold text-teal-950 leading-tight">
                  Siswa mampu merumuskan alur sederhana terjadinya anemia (C6)
                </div>
              </div>
            </div>

            {/* RANGKUMAN ALUR YANG TELAH DIRUMUSKAN */}
            <div className="w-full bg-slate-50 rounded-xl p-1.5 sm:p-2 border border-slate-200 text-left my-1">
              <div className="text-[9.5px] font-black uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
                <span>🔗</span> Alur Terjadinya Anemia yang Terverifikasi:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-1.5 text-center">
                <div className="p-1 sm:p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[8.5px] sm:text-[9.5px] font-bold text-amber-950 leading-tight">
                  1. Kurang Asupan Zat Besi
                </div>
                <div className="p-1 sm:p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-[8.5px] sm:text-[9.5px] font-bold text-rose-950 leading-tight">
                  2. Cadangan Zat Besi Menurun
                </div>
                <div className="p-1 sm:p-1.5 rounded-lg bg-red-50 border border-red-200 text-[8.5px] sm:text-[9.5px] font-bold text-red-950 leading-tight">
                  3. Hemoglobin Rendah
                </div>
                <div className="p-1 sm:p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[8.5px] sm:text-[9.5px] font-bold text-emerald-950 leading-tight">
                  4. Anemia
                </div>
              </div>
            </div>

            {/* TOMBOL AKSI: SELESAI & SIMPAN SKOR (HANYA 1X MAIN - PENELITIAN) */}
            <div className="w-full flex items-center justify-center mt-1 pt-1.5 border-t border-slate-200">
              <button
                onClick={() => {
                  playSound('click')
                  onComplete && onComplete({ score: earnedScore })
                }}
                className="w-full max-w-sm py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-95 text-white font-black text-xs sm:text-sm shadow-lg transition-all cursor-pointer border border-emerald-400 flex items-center justify-center gap-2"
              >
                <span>✓ Selesai &amp; Simpan Skor</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* =========================================================================
          POPUP MODAL TERPUSAT (ROOT LEVEL: Z-[100] AGAR TIDAK TERTUTUP HEADER)
         ========================================================================= */}

      {/* 1. POPUP FEEDBACK JIKA SALAH SORTING (LEVEL 1) - FIT & FULL VIEWPORT */}
      {feedbackModal && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl p-3 sm:p-4 shadow-2xl border-3 border-amber-400 flex flex-col items-center text-center animate-bounceIn max-h-[92vh] overflow-y-auto custom-scrollbar my-auto">
            {/* HEADER BADGE DENGAN IKON KOMPAK */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-base sm:text-lg shadow-xs flex-shrink-0">
                ⚠️
              </div>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-rose-700 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200">
                Pilihan Kurang Tepat
              </span>
            </div>

            {/* INDIKATOR PENGURANGAN SKOR */}
            <div className="bg-rose-100 border border-rose-300 text-rose-700 text-[10px] sm:text-[11px] font-black px-3 py-0.5 rounded-full my-0.5">
              📉 Pengurangan Skor: -5 PTS
            </div>

            {/* KUTIPAN KARTU */}
            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm my-1 leading-snug">
              "{feedbackModal.card.text}"
            </h3>
            
            {/* PENJELASAN EDUKASI */}
            <p className="text-slate-800 text-[10.5px] sm:text-[11.5px] bg-amber-50 rounded-xl p-2 sm:p-2.5 border border-amber-200 my-1 leading-relaxed text-left font-medium max-h-[35vh] overflow-y-auto">
              {feedbackModal.explanation}
            </p>
            
            {/* TOMBOL LANJUTKAN */}
            <button
              onClick={dismissFeedbackModal}
              className="mt-1 w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs shadow transition-all cursor-pointer border border-amber-400"
            >
              Saya Mengerti, Lanjutkan!
            </button>
          </div>
        </div>
      )}

      {/* 2. POPUP FEEDBACK JIKA SALAH ALUR (LEVEL 2) - FIT & FULL VIEWPORT */}
      {showLevel2WrongModal && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl p-3 sm:p-4 shadow-2xl border-3 border-rose-500 flex flex-col items-center text-center animate-bounceIn max-h-[92vh] overflow-y-auto custom-scrollbar my-auto">
            {/* HEADER BADGE DENGAN IKON KOMPAK */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-base sm:text-lg shadow-xs flex-shrink-0">
                ⚠️
              </div>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-rose-700 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200">
                Urutan Alur Belum Tepat
              </span>
            </div>

            {/* INDIKATOR PENGURANGAN SKOR */}
            <div className="bg-rose-100 border border-rose-300 text-rose-700 text-[10px] sm:text-[11px] font-black px-3 py-0.5 rounded-full my-0.5">
              📉 Pengurangan Skor: -10 PTS
            </div>

            {/* JUDUL PERIKSA */}
            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm my-1 leading-snug">
              Periksa Kembali Urutan Alur Anemia!
            </h3>
            
            {/* PETUNJUK EDUKASI */}
            <p className="text-slate-800 text-[10.5px] sm:text-[11.5px] bg-rose-50 rounded-xl p-2 sm:p-2.5 border border-rose-200 my-1 leading-relaxed text-left font-medium max-h-[35vh] overflow-y-auto">
              💡 <b>Petunjuk:</b> Susun urutan mulai dari asupan makanan penyuplai zat besi (awal), habisnya cadangan besi di organ tubuh, penurunan kadar hemoglobin, hingga berkurangnya sel darah merah.
            </p>
            
            {/* TOMBOL COBA LAGI */}
            <button
              onClick={() => setShowLevel2WrongModal(false)}
              className="mt-1 w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs shadow transition-all cursor-pointer border border-rose-400"
            >
              Coba Susun Kembali
            </button>
          </div>
        </div>
      )}

      {/* 3. PROTEKSI 1X MAIN (PENELITIAN) - POPUP TELAH MENYELESAIKAN MISI */}
      {alreadyCompleted && phase !== 'completed' && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-sm bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center shadow-2xl border-4 border-emerald-500 flex flex-col items-center animate-bounceIn my-auto">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2 text-xl shadow-inner text-emerald-600 font-bold">
              ✔
            </div>
            <h2 className="text-[#003049] font-black text-base sm:text-lg mb-1">
              MISI LEVEL C TELAH SELESAI
            </h2>
            <p className="text-slate-600 text-xs mb-2 leading-relaxed">
              Kamu sudah menyelesaikan Misi Game 3 (Level C) sebelumnya dengan perolehan:
            </p>
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl py-2 px-6 mb-2.5 w-full">
              <span className="text-emerald-800 font-black text-2xl">
                {existingScore} PTS
              </span>
            </div>
            <p className="text-slate-500 text-[11px] mb-3 leading-tight">
              Setiap misi hanya dapat diakses 1 kali percobaan karena data diperuntukkan bagi evaluasi penelitian.
            </p>
            <button
              onClick={onBack}
              className="w-full bg-[#003049] hover:bg-[#002233] text-white font-black py-2.5 px-4 rounded-xl shadow text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
            >
              Kembali ke Menu Misi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
