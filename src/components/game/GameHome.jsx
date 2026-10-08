import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

// IMPORT ASET GAMBAR
import bgMerah from '../../assets/6/6. game home - background merah.png'
import jalanLevel from '../../assets/6/6. game home - jalan level.png'
import titleLevel from '../../assets/6/6. game home - level.png'
import btnLevel1 from '../../assets/6/6. game home - level 1.png'
import btnLevel2 from '../../assets/6/6. game home - level 2.png'
import imgGembok from '../../assets/6/6. game home - gembok.png'

// Asset Profile Frame Pria & Wanita
import bgProfilPria from '../../assets/6/game home - profil pria.png'
import bgProfilWanita from '../../assets/6/game home - profil wanita.png'

function GameHome({ onBack, onSelectLevel }) {
  const [isLevel2Unlocked, setIsLevel2Unlocked] = useState(false)
  const [gender, setGender] = useState('male')
  const [totalScore, setTotalScore] = useState(0)
  const [alertMessage, setAlertMessage] = useState('')

  const username = localStorage.getItem('anemia_username') || 'Siswa'

  useEffect(() => {
    loadGameHomeData()
  }, [])

  const loadGameHomeData = async () => {
    try {
      const { data: config } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'h2_game_enabled')
        .maybeSingle()

      if (config) {
        setIsLevel2Unlocked(config.value === true || config.value === 'true')
      }

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
        .select('skor')
        .eq('username', username)

      if (scoreData && scoreData.length > 0) {
        const sumScore = scoreData.reduce((acc, curr) => acc + (curr.skor || 0), 0)
        setTotalScore(sumScore)
      }
    } catch (err) {
      console.error('Gagal memuat data Game Home:', err.message)
    }
  }

  const handleLevelSelect = (levelNum) => {
    if (levelNum === 2 && !isLevel2Unlocked) {
      setAlertMessage('Level 2 belum dibuka oleh Admin!')
      setTimeout(() => setAlertMessage(''), 3000)
      return
    }
    onSelectLevel && onSelectLevel(levelNum)
  }

  return (
    <div 
      className="h-dvh w-dvw bg-cover bg-center bg-no-repeat relative overflow-hidden font-sans select-none touch-none flex flex-col items-center justify-between p-2 sm:p-4"
      style={{ backgroundImage: `url("${bgMerah}")` }}
    >
      {/* TOMBOL KEMBALI */}
      <button 
        onClick={onBack}
        className="absolute top-3 left-3 sm:top-4 sm:left-4 z-40 text-white/90 hover:text-white cursor-pointer p-1 transition-transform active:scale-90"
      >
        <svg className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {/* ALERT NOTIFIKASI PENGUNCIAN */}
      {alertMessage && (
        <div className="absolute top-2 z-50 bg-amber-400 text-slate-900 font-extrabold text-xs px-4 py-1.5 rounded-full shadow-lg animate-bounce">
          {alertMessage}
        </div>
      )}

      {/* HEADER PROFILE USER (NAMA | POIN) */}
      <div className="absolute -top-1 right-2 sm:top-0 sm:right-4 z-40">
        <div 
          className="relative w-64 sm:w-72 md:w-80 h-20 sm:h-24 md:h-26 bg-contain bg-no-repeat bg-right flex items-center justify-end pr-2 sm:pr-3.5 pl-8"
          style={{ backgroundImage: `url("${gender === 'female' ? bgProfilWanita : bgProfilPria}")` }}
        >
          {/* FORMAT TAMPILAN: NAMA | POIN */}
          <div className="flex items-center gap-1.5 sm:gap-2 pr-0.5 sm:pr-1">
            {/* NAMA SISWA DARI DATABASE */}
            <span className="text-[#8B0000] font-black text-xs sm:text-sm md:text-base truncate max-w-[90px] sm:max-w-[120px] md:max-w-[140px] uppercase drop-shadow-sm">
              {username}
            </span>

            {/* GARIS PEMISAH | */}
            <span className="text-[#003049] font-black text-xs sm:text-sm md:text-base opacity-40">
              |
            </span>

            {/* SKOR SISWA DARI DATABASE */}
            <span className="text-[#003049] font-extrabold text-xs sm:text-sm md:text-base whitespace-nowrap">
              {totalScore} PTS
            </span>
          </div>
        </div>
      </div>

      {/* TITLE LOGO "LEVEL" (LEBIH RAPAT KE ATAS) */}
      <div className="mt-1 sm:mt-2 z-20 flex-shrink-0">
        <img 
          src={titleLevel} 
          alt="LEVEL Title" 
          className="w-40 sm:w-52 md:w-60 object-contain pointer-events-none drop-shadow-lg"
        />
      </div>

      {/* MAP UTAMA: JALANAN + TOMBOL LEVEL (DINAIKKAN DENGAN MARGIN NEGATIF AGAR TERLIHAT SEMUA LEKUKANNYA) */}
      <div className="relative w-full max-w-2xl sm:max-w-3xl md:max-w-4xl h-[55vh] sm:h-[60vh] -mt-6 sm:-mt-8 mb-auto flex items-center justify-center">
        
        {/* GAMBAR JALANAN UTAMA */}
        <img 
          src={jalanLevel} 
          alt="Level Road" 
          className="w-full h-full object-contain pointer-events-none z-10"
        />

        {/* ================= LEVEL 1 (DI UJUNG JALAN KIRI) ================= */}
        <div className="absolute left-[20%] sm:left-[24%] top-[23%] sm:top-[20%] z-20 -translate-x-1/2 -translate-y-1/2">
          <button
            onClick={() => handleLevelSelect(1)}
            className="group relative cursor-pointer transition-transform hover:scale-110 active:scale-95 focus:outline-none"
          >
            <img 
              src={btnLevel1} 
              alt="Level 1" 
              className="w-24 sm:w-32 md:w-36 object-contain pointer-events-none drop-shadow-xl"
            />
          </button>
        </div>

        {/* ================= LEVEL 2 (DI UJUNG JALAN KANAN) ================= */}
        <div className="absolute right-[20%] sm:right-[24%] top-[23%] sm:top-[20%] z-20 translate-x-1/2 -translate-y-1/2">
          <button
            onClick={() => handleLevelSelect(2)}
            className={`group relative transition-transform focus:outline-none ${
              isLevel2Unlocked ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-not-allowed'
            }`}
          >
            <img 
              src={btnLevel2} 
              alt="Level 2" 
              className="w-24 sm:w-32 md:w-36 object-contain pointer-events-none drop-shadow-xl"
            />

            {/* ASET RANTAI & GEMBOK (JIKA TERKUNCI) */}
            {!isLevel2Unlocked && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <img 
                  src={imgGembok} 
                  alt="Locked" 
                  className="w-16 sm:w-20 md:w-20 object-contain drop-shadow-2xl scale-110"
                />
              </div>
            )}
          </button>
        </div>

      </div>

    </div>
  )
}

export default GameHome