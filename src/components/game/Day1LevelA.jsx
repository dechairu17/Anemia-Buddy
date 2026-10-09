import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

// IMPORT ASET GAMBAR
import bgDay1A from '../../assets/8. day 1 level A/8 BACKGROUND .png'
import cardBackImg from '../../assets/8. day 1 level A/46.png'
import mascotImg from '../../assets/9. day 1 level B/karakter.png'
import { playSound } from '../../utils/audio'

// KOMPONEN LONCENG 3D NOTIFIKASI
function NotificationBell() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full drop-shadow-md"
        style={{ transform: 'rotate(12deg)' }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bellGrad" x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#FFF275" />
            <stop offset="25%" stopColor="#FFCA28" />
            <stop offset="60%" stopColor="#FFA000" />
            <stop offset="100%" stopColor="#E65100" />
          </linearGradient>
          <linearGradient id="bellSpec" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="clapperGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="50%" stopColor="#FFB300" />
            <stop offset="100%" stopColor="#BF360C" />
          </radialGradient>
          <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFA000" />
            <stop offset="50%" stopColor="#FFF176" />
            <stop offset="100%" stopColor="#E65100" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#B45309" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Pegangan Lonceng Atas */}
        <ellipse cx="58" cy="22" rx="9" ry="10" stroke="#FF9E00" strokeWidth="5" fill="none" />
        <ellipse cx="58" cy="22" rx="9" ry="10" stroke="#FFF59D" strokeWidth="2" fill="none" />

        {/* Bandul / Clapper Lonceng */}
        <circle cx="58" cy="84" r="10" fill="url(#clapperGrad)" />

        {/* Badan Lonceng Utama */}
        <path
          d="M58 22 C42 23, 34 42, 30 62 C27 72, 20 76, 17 80 C15.5 82, 17 85, 21 85 L95 85 C99 85, 100.5 82, 99 80 C96 76, 89 72, 86 62 C82 42, 74 23, 58 22 Z"
          fill="url(#bellGrad)"
          filter="url(#softGlow)"
        />

        {/* Bibir Bawah Lonceng */}
        <ellipse cx="58" cy="85" rx="41" ry="6.5" fill="url(#rimGrad)" />
        <ellipse cx="58" cy="84" rx="39" ry="4" fill="#FFE082" opacity="0.6" />

        {/* Kilau 3D Highlight */}
        <path
          d="M38 32 C33 44, 30 56, 29 70"
          stroke="url(#bellSpec)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <ellipse cx="44" cy="36" rx="3.5" ry="6" fill="#FFFFFF" opacity="0.75" transform="rotate(-18 44 36)" />
      </svg>

      {/* Badge Angka Notifikasi Merah */}
      <div 
        className="absolute top-1 right-1 sm:top-2 sm:right-2 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md select-none"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #FF4D6D, #D90429, #7F0010)'
        }}
      >
        <span className="text-white font-black text-[11px] sm:text-xs md:text-sm leading-none drop-shadow-xs">
          1
        </span>
      </div>
    </div>
  )
}

// 6 GAMBAR KARTU ISI (47 s/d 52)
import card47 from '../../assets/8. day 1 level A/card_47.png'
import card48 from '../../assets/8. day 1 level A/card_48.png'
import card49 from '../../assets/8. day 1 level A/card_49.png'
import card50 from '../../assets/8. day 1 level A/card_50.png'
import card51 from '../../assets/8. day 1 level A/card_51.png'
import card52 from '../../assets/8. day 1 level A/card_52.png'

// Asset Profile Frame Pria & Wanita
import bgProfilPria from '../../assets/6/game home - profil pria.png'
import bgProfilWanita from '../../assets/6/game home - profil wanita.png'

// DEFINISI 3 PASANG KARTU EDUKASI ANEMIA (6 KARTU TOTAL)
// Pasangan 1: Pengertian Anemia (47) <-> Definisi Anemia (48)
// Pasangan 2: Gejala Anemia (49) <-> 5L (50)
// Pasangan 3: Penyebab Anemia (51) <-> Kurang Makan Zat Besi (52)
const initialCardPairs = [
  { id: 0, pairId: 'pair_anemia', frontImg: card47, label: 'Pengertian Anemia' },
  { id: 1, pairId: 'pair_anemia', frontImg: card48, label: 'Definisi Anemia' },
  { id: 2, pairId: 'pair_gejala', frontImg: card49, label: 'Gejala Anemia' },
  { id: 3, pairId: 'pair_gejala', frontImg: card50, label: '5L' },
  { id: 4, pairId: 'pair_penyebab', frontImg: card51, label: 'Penyebab Anemia' },
  { id: 5, pairId: 'pair_penyebab', frontImg: card52, label: 'Penyebab Zat Besi' },
]

// ALGORITMA PENGACAKAN POSISI KARTU (FISHER-YATES SHUFFLE)
// Menjamin setiap anak / setiap permainan mendapatkan susunan acak yang berbeda
function getShuffledCards() {
  const list = [...initialCardPairs]
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}

function Day1LevelA({ onBack, onComplete }) {
  const [gameState, setGameState] = useState('intro') // 'intro' | 'playing' | 'completed'
  const [cards, setCards] = useState(() => getShuffledCards()) // Kartu dengan posisi acak
  const [flippedIndices, setFlippedIndices] = useState([]) // Maksimal 2 kartu terbuka
  const [matchedPairs, setMatchedPairs] = useState([]) // Pasangan yang berhasil cocok
  const [wrongAttempts, setWrongAttempts] = useState(0) // Jumlah salah klik pencocokan
  const [isProcessing, setIsProcessing] = useState(false)
  const [gender, setGender] = useState('male')
  const [totalScore, setTotalScore] = useState(0)
  const [earnedScore, setEarnedScore] = useState(100) // Skor awal 100
  const [matchMessage, setMatchMessage] = useState('')
  
  // Status proteksi 1x percobaan
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)
  const [existingScore, setExistingScore] = useState(0)

  // Durasi pengerjaan
  const startTimeRef = useRef(Date.now())

  const username = localStorage.getItem('anemia_username') || 'Siswa'

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      // 1. Ambil Data Gender
      const { data: userData } = await supabase
        .from('game_users')
        .select('gender')
        .eq('username', username)
        .maybeSingle()

      if (userData && userData.gender) {
        setGender(userData.gender.toLowerCase())
      }

      // 2. Ambil Riwayat Skor Total
      const { data: scoreData } = await supabase
        .from('game_scores')
        .select('skor')
        .eq('username', username)

      if (scoreData && scoreData.length > 0) {
        const sumScore = scoreData.reduce((acc, curr) => acc + (curr.skor || 0), 0)
        setTotalScore(sumScore)
      }

      // 3. Proteksi 1x Percobaan: Cek apakah Misi A sudah pernah diselesaikan
      const { data: existingEntry } = await supabase
        .from('game_scores')
        .select('skor')
        .eq('username', username)
        .eq('kategori_game', 'misi_h1_a')
        .maybeSingle()

      if (existingEntry) {
        setAlreadyCompleted(true)
        setExistingScore(existingEntry.skor || 0)
      }
    } catch (err) {
      console.error('Error loading profile:', err.message)
    }
  }

  // FUNGSI MEMULAI GAME DENGAN SUSUNAN KARTU BARU (ACAK)
  const startNewGame = () => {
    playSound('click')
    startTimeRef.current = Date.now()
    setCards(getShuffledCards())
    setFlippedIndices([])
    setMatchedPairs([])
    setWrongAttempts(0)
    setEarnedScore(100)
    setMatchMessage('')
    setIsProcessing(false)
    setGameState('playing')
  }

  // SIMPAN SKOR SESUAI SKEMA SUPABASE: username, kategori_game, skor, durasi_detik
  const saveScoreToSupabase = async (finalScore = earnedScore) => {
    try {
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
      await supabase.from('game_scores').insert([
        {
          username: username,
          kategori_game: 'misi_h1_a', // Kolom kategori_game varchar
          skor: finalScore,           // Kolom skor int4
          durasi_detik: durationSeconds, // Kolom durasi_detik int4
        }
      ])
      setTotalScore(prev => prev + finalScore)
      setAlreadyCompleted(true)
      setExistingScore(finalScore)
    } catch (err) {
      console.error('Gagal menyimpan skor:', err.message)
    }
  }

  // HANDLE KLIK KARTU (MAKSIMAL 2 KARTU TERBUKA BERSAMAAN)
  const handleCardClick = (index) => {
    if (isProcessing) return // Sedang proses pengecekan 2 kartu
    if (flippedIndices.includes(index)) return // Kartu sudah terbuka
    const clickedCard = cards[index]
    if (matchedPairs.includes(clickedCard.pairId)) return // Kartu sudah cocok

    // Buka kartu dengan efek suara klik/flip
    playSound('click')
    const newFlipped = [...flippedIndices, index]
    setFlippedIndices(newFlipped)

    // JIKA 2 KARTU TERBUKA, LAKUKAN PENGECEKAN KECOCOKAN
    if (newFlipped.length === 2) {
      setIsProcessing(true)
      const firstCard = cards[newFlipped[0]]
      const secondCard = cards[newFlipped[1]]

      if (firstCard.pairId === secondCard.pairId && firstCard.id !== secondCard.id) {
        // PASANGAN COCOK!
        playSound('match')
        setTimeout(() => {
          const updatedMatched = [...matchedPairs, firstCard.pairId]
          setMatchedPairs(updatedMatched)
          setFlippedIndices([])
          setIsProcessing(false)
          setMatchMessage('Pasangan Cocok! Hebat! 🎉')
          setTimeout(() => setMatchMessage(''), 1400)

          // JIKA SEMUA 3 PASANGAN (6 KARTU) SELESAI
          if (updatedMatched.length === 3) {
            setTimeout(() => {
              playSound('cring')
              saveScoreToSupabase(earnedScore)
              setGameState('completed')
            }, 600)
          }
        }, 700)
      } else {
        // PASANGAN TIDAK COCOK:
        playSound('wrong')
        // Hitung penalti jika salah pencocokan > 3 kali
        const nextWrong = wrongAttempts + 1
        setWrongAttempts(nextWrong)

        let newCalculatedScore = 100
        if (nextWrong > 3) {
          // Setiap kesalahan di atas 3 kali mengurangi 10 poin
          newCalculatedScore = Math.max(0, 100 - (nextWrong - 3) * 10)
        }
        setEarnedScore(newCalculatedScore)

        if (nextWrong > 3) {
          setMatchMessage(`Belum cocok! Salah ke-${nextWrong} (-10 Poin) ❌`)
        } else {
          setMatchMessage(`Belum cocok! (Percobaan salah: ${nextWrong}/3) ⚠️`)
        }

        // TUTUP KEMBALI KARTU SETELAH 1 DETIK
        setTimeout(() => {
          setFlippedIndices([])
          setIsProcessing(false)
          setMatchMessage('')
        }, 1100)
      }
    }
  }

  return (
    <div 
      className={`h-dvh w-dvw ${gameState === 'playing' ? 'bg-cover bg-center bg-no-repeat' : 'bg-[#003049]'} relative overflow-hidden font-sans select-none touch-none flex flex-col items-center justify-center p-3 sm:p-6`}
      style={{ backgroundImage: gameState === 'playing' ? `url("${bgDay1A}")` : 'none' }}
    >
      {/* TOMBOL KEMBALI (HANYA MUNCUL DI INTRO, HILANG SAAT SEDANG BERMAIN) */}
      {gameState === 'intro' && (
        <button 
          onClick={() => onBack && onBack()}
          className="absolute top-3 left-3 sm:top-5 sm:left-5 z-40 text-white/90 hover:text-white cursor-pointer p-1 transition-transform active:scale-90"
          title="Kembali"
        >
          <svg className="w-6 h-6 sm:w-8 sm:h-8 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      )}

      {/* POPUP SUDAH PERNAH DIKERJAKAN (HANYA 1X PERCOBAAN) */}
      {alreadyCompleted && gameState !== 'completed' && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full text-center shadow-2xl border-4 border-emerald-400 flex flex-col items-center animate-zoom-in">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-3 text-2xl shadow-inner text-emerald-600 font-bold">
              ✔
            </div>
            <h2 className="text-[#003049] font-black text-lg sm:text-xl mb-1">
              MISI TELAH SELESAI
            </h2>
            <p className="text-slate-600 text-xs mb-3">
              Kamu sudah menyelesaikan Misi Harian A sebelumnya dengan perolehan:
            </p>
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl py-2 px-6 mb-4 w-full">
              <span className="text-emerald-800 font-black text-2xl">
                {existingScore} PTS
              </span>
            </div>
            <p className="text-slate-500 text-[11px] mb-4">
              Setiap misi hanya dapat diakses 1 kali percobaan saja.
            </p>
            <button
              onClick={onBack}
              className="w-full bg-[#003049] hover:bg-[#002233] text-white font-bold py-2.5 px-4 rounded-full shadow text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
            >
              Kembali ke Menu Misi
            </button>
          </div>
        </div>
      )}

      {/* HEADER PROFILE USER (NAMA | POIN DENGAN FRAME PRIA/WANITA) */}
      {gameState !== 'intro' && (
        <div className="absolute top-1 sm:top-2 right-2 sm:right-4 z-40">
          <div 
            className="relative w-64 sm:w-72 md:w-80 h-18 sm:h-22 md:h-24 bg-contain bg-no-repeat bg-right flex items-center justify-end pr-2 sm:pr-3.5 pl-8"
            style={{ backgroundImage: `url("${gender === 'female' ? bgProfilWanita : bgProfilPria}")` }}
          >
            <div className="flex items-center gap-1.5 sm:gap-2 pr-0.5 sm:pr-1">
              <span className="text-[#8B0000] font-black text-xs sm:text-sm md:text-base truncate max-w-[90px] sm:max-w-[120px] md:max-w-[140px] uppercase drop-shadow-sm">
                {username}
              </span>
              <span className="text-[#003049] font-black text-xs sm:text-sm md:text-base opacity-40">
                |
              </span>
              <span className="text-[#003049] font-extrabold text-xs sm:text-sm md:text-base whitespace-nowrap">
                {totalScore} PTS
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          FASE 1: TAMPILAN AWAL (CARA BERMAIN)
         ========================================================================= */}
      {/* =========================================================================
          FASE 1: TAMPILAN AWAL (CARA BERMAIN)
         ========================================================================= */}
      {gameState === 'intro' && (
        <div className="relative w-full max-w-[85%] sm:max-w-sm md:max-w-md flex flex-col items-center justify-center px-2 py-1 z-30 animate-zoom-in">
          
          {/* KARTU CARA BERMAIN (UKURAN LEBIH COMPACT & PAS DI LAYAR LANDSCAPE) */}
          <div className="relative w-full bg-white rounded-[20px] sm:rounded-[24px] border-[4px] border-[#FFAE19] shadow-[0_10px_35px_rgba(0,0,0,0.35)] px-4 sm:px-6 py-3 sm:py-4">
            
            {/* BADGE LONCENG NOTIFIKASI 3D DI SUDUT KANAN ATAS */}
            <div className="absolute -top-4 -right-2.5 sm:-top-5 sm:-right-3 w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.22)] p-1.5 z-40">
              <NotificationBell />
            </div>

            {/* JUDUL */}
            <h2 className="text-center font-bold text-[11px] sm:text-xs md:text-sm text-black tracking-wide mb-1 sm:mb-2">
              CARA BERMAIN :
            </h2>

            {/* KONTEN PETUNJUK */}
            <div className="text-[#1A1A1A] font-medium text-[9.5px] sm:text-[10px] md:text-[11.5px] leading-snug space-y-1 sm:space-y-1.5">
              <p>
                Buka setiap kartu untuk dipasangkan dengan pasangan definisinya
              </p>

              <div className="space-y-0.5 mt-1">
                <p>Contoh :</p>
                <p>Kartu 1 : Pengertian Demam</p>
                <p>Kartu 2 : Gejala Demam</p>
                <p>Kartu 3 : Suhu tubuh panas saat dipegang</p>
                <p>Kartu 4 : Kondisi saat suhu tubuh naik di atas normal, yaitu lebih dari 37,5°C atau 38°C</p>
              </div>

              <p className="mt-1">
                Maka, pasangkan kartu 1 &amp; 4 dan 2 &amp; 3
              </p>

              <p className="mt-1">
                Klik MULAI GAME SEKARANG untuk memulai permainan
              </p>
            </div>
          </div>

          {/* TOMBOL MULAI GAME SEKARANG */}
          <div className="mt-4 sm:mt-5 mb-2 flex justify-center w-full">
            <button
              onClick={startNewGame}
              className="bg-[#A0081C] hover:bg-[#850616] active:scale-95 text-white font-extrabold text-[10px] sm:text-[11px] md:text-xs tracking-wider uppercase px-6 sm:px-8 py-2 rounded-full border-2 border-white shadow-[0_4px_16px_rgba(160,8,28,0.4)] cursor-pointer transition-all duration-150"
            >
              MULAI GAME SEKARANG
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          FASE 2: GAMEPLAY 6 KARTU FLIP (3 KOLOM X 2 BARIS)
         ========================================================================= */}
      {gameState === 'playing' && (
        <div className="w-full max-w-3xl h-[72vh] max-h-[480px] flex flex-col items-center justify-center relative mt-4 sm:mt-6 px-3">
          
          {/* BAR INDIKATOR SKOR & KESALAHAN LIVE */}
          <div className="flex items-center gap-2.5 sm:gap-4 bg-black/45 backdrop-blur-sm px-4 sm:px-6 py-1 sm:py-1.5 rounded-full text-white text-[10px] sm:text-xs font-bold mb-2 sm:mb-3 shadow-md border border-white/20">
            <span>
              ⭐ Skor: <strong className="text-amber-300 font-extrabold">{earnedScore} PTS</strong>
            </span>
            <span className="text-white/40">|</span>
            <span>
              ⚠️ Salah: <strong className={wrongAttempts > 3 ? "text-rose-400 font-extrabold" : "text-emerald-300 font-extrabold"}>{wrongAttempts}x</strong>
              {wrongAttempts > 3 && (
                <span className="text-rose-300 font-normal ml-1">
                  (-{(wrongAttempts - 3) * 10} PTS)
                </span>
              )}
            </span>
          </div>

          {/* PESAN NOTIFIKASI MATCH */}
          {matchMessage && (
            <div className="absolute -top-6 sm:-top-7 z-50 bg-emerald-500 text-white font-black text-xs sm:text-sm px-5 py-1 rounded-full shadow-lg animate-bounce">
              {matchMessage}
            </div>
          )}

          {/* GRID 6 KARTU (3 KOLOM X 2 BARIS DENGAN POSISI ACAK / SHUFFLE) */}
          <div 
            className="w-full h-full grid gap-2 sm:gap-3 md:gap-4"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
            }}
          >
            {cards.map((card, index) => {
              const isFlipped = flippedIndices.includes(index) || matchedPairs.includes(card.pairId)
              const isMatched = matchedPairs.includes(card.pairId)

              return (
                <div
                  key={`${card.id}-${index}`}
                  onClick={() => handleCardClick(index)}
                  className="perspective-1000 w-full h-full cursor-pointer select-none group flex items-center justify-center p-0.5"
                >
                  {/* KARTU DENGAN 3D ROTASI FLIP ANIMATION */}
                  <div
                    className="w-full h-full relative preserve-3d transition-transform duration-500 rounded-xl sm:rounded-2xl shadow-md"
                    style={{
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    
                    {/* -------------------------------------------------------------
                        SISI BELAKANG (TERTUTUP - COVER ANEMIA BUDDY 46.PNG)
                       ------------------------------------------------------------- */}
                    <div className="backface-hidden absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl flex flex-col items-center justify-center drop-shadow-md overflow-hidden group-hover:scale-[1.02] transition-transform">
                      {cardBackImg ? (
                        <img 
                          src={cardBackImg} 
                          alt="Cover Kartu Anemia Buddy" 
                          className="w-full h-full object-contain pointer-events-none"
                        />
                      ) : (
                        <div className="w-full h-full border border-dashed border-[#9E0825]/60 rounded-lg flex flex-col items-center justify-center p-1 relative bg-[#FFF7E2]">
                          <img 
                            src={mascotImg} 
                            alt="Anemia Buddy Mascot" 
                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-sm"
                          />
                          <span className="text-[#9E0825] font-black text-[10px] sm:text-xs font-serif">
                            Anemia Buddy
                          </span>
                        </div>
                      )}
                    </div>

                    {/* -------------------------------------------------------------
                        SISI DEPAN (TERBUKA - GAMBAR 47-52)
                       ------------------------------------------------------------- */}
                    <div
                      className={`backface-hidden absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl flex items-center justify-center text-center drop-shadow-md overflow-hidden transition-all ${
                        isMatched 
                          ? 'ring-4 ring-emerald-400' 
                          : ''
                      }`}
                      style={{
                        transform: 'rotateY(180deg)',
                      }}
                    >
                      <img 
                        src={card.frontImg} 
                        alt={`Isi Kartu ${card.label}`} 
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    </div>

                  </div>
                </div>
              )
            })}
          </div>

        </div>
      )}

      {/* =========================================================================
          FASE 3: POPUP MENANG / SELESAI (RESPONSIF LANDSCAPE HP)
         ========================================================================= */}
      {gameState === 'completed' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 max-w-sm sm:max-w-md w-full text-center shadow-2xl border-4 border-amber-400 flex flex-col items-center animate-in fade-in zoom-in duration-300 max-h-[92dvh] overflow-y-auto custom-scrollbar my-auto">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-amber-100 rounded-full flex items-center justify-center mb-1 text-xl sm:text-2xl shadow-inner flex-shrink-0">
              🏆
            </div>
            <h2 className="text-[#003049] font-black text-base sm:text-lg mb-0.5">
              LUAR BIASA!
            </h2>
            <p className="text-slate-600 text-[10.5px] sm:text-xs mb-2 leading-tight">
              Kamu berhasil mencocokkan semua kartu definisi anemia dengan tepat!
            </p>

            {/* RINCIAN PERHITUNGAN SKOR */}
            <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-2 sm:p-3 mb-2.5 space-y-1 text-left text-[11px] sm:text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Total Salah Klik:</span>
                <span className="font-bold text-slate-800">{wrongAttempts} kali</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Penalti (&gt; 3x salah):</span>
                <span className={`font-bold ${wrongAttempts > 3 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {wrongAttempts > 3 ? `-${(wrongAttempts - 3) * 10} PTS` : '0 PTS'}
                </span>
              </div>
              <div className="border-t border-amber-200 pt-1 flex justify-between items-center">
                <span className="text-amber-900 font-bold uppercase tracking-wider text-[10px] sm:text-xs">Skor Diperoleh:</span>
                <span className="text-amber-600 font-black text-lg sm:text-xl">+{earnedScore} PTS</span>
              </div>
            </div>

            <div className="w-full flex-shrink-0">
              <button
                onClick={() => {
                  onComplete && onComplete({ score: earnedScore, missionId: 'misi_h1_a' })
                  onBack && onBack()
                }}
                className="w-full bg-[#b10825] hover:bg-[#8B0000] text-white font-extrabold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer text-xs uppercase tracking-wider"
              >
                Selesai &amp; Lanjut ➡️
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Day1LevelA
