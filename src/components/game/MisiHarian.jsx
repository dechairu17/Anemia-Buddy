import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

// IMPORT ASSET MISI HARIAN
import cardA from '../../assets/7/7. misi harian - A.png'
import cardB from '../../assets/7/7. misi harian - B.png'
import cardC from '../../assets/7/7. misi harian - C.png'
import cardD from '../../assets/7/7. misi harian - D.png'
import cardE from '../../assets/7/7. misi harian - E.png'

// IMPORT ASSET PROFIL PRIA & WANITA (CROPPED TANPA PADDING TRANSPARAN)
import bgProfilPria from '../../assets/6/game home - profil pria_crop.png'
import bgProfilWanita from '../../assets/6/game home - profil wanita_crop.png'
import { playSound } from '../../utils/audio'

function MisiHarian({ level = 1, onBack, onSelectMisi }) {
  const [gender, setGender] = useState('male')
  const [totalScore, setTotalScore] = useState(0)
  const [completedMissionsMap, setCompletedMissionsMap] = useState({})
  const [toastMessage, setToastMessage] = useState('')

  const username = localStorage.getItem('anemia_username') || 'Siswa'

  useEffect(() => {
    loadUserData()
  }, [])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage('')
    }, 3200)
  }

  const loadUserData = async () => {
    try {
      // 1. Ambil Gender Siswa
      const { data: userData } = await supabase
        .from('game_users')
        .select('gender')
        .eq('username', username)
        .maybeSingle()

      if (userData && userData.gender) {
        setGender(userData.gender.toLowerCase())
      }

      // 2. Ambil Riwayat Skor Game & Misi yang telah diselesaikan (1x percobaan per misi)
      const { data: scoreData } = await supabase
        .from('game_scores')
        .select('kategori_game, skor')
        .eq('username', username)

      if (scoreData && scoreData.length > 0) {
        const sumScore = scoreData.reduce((acc, curr) => acc + (curr.skor || 0), 0)
        setTotalScore(sumScore)

        // Peta misi selesai: { 'misi_h1_a': 100, ... }
        const map = {}
        scoreData.forEach((item) => {
          if (item.kategori_game) {
            map[item.kategori_game] = item.skor || 0
          }
        })
        setCompletedMissionsMap(map)
      }
    } catch (err) {
      console.error('Error loading profile:', err.message)
    }
  }

  // DATA KONTEN MISI BERDASARKAN LEVEL 1 DAN LEVEL 2
  const misiContent = {
    1: {
      title: 'HARI 1: EDUKASI ANEMIA',
      A: { type: 'materi', id: 'misi_h1_a', name: 'Misi A' },
      B: { type: 'game', id: 'misi_h1_b', name: 'Misi B' },
      C: { type: 'game', id: 'misi_h1_c', name: 'Misi C' }, // GAME 3 (MISI SEHAT: MELAWAN ANEMIA)
      D: { type: 'game', id: 'misi_h1_d', name: 'Misi D' }, // GAME 4 (MISI D)
      E: { type: 'game', id: 'misi_h1_e', name: 'Misi E' }, // GAME 4 (MISI E: DOKTER SEL DARAH)
    },
    2: {
      title: 'HARI 2: SUPERFOOD ANEMIA',
      A: { type: 'materi', id: 'misi_h2_a', name: 'Misi A' },
      B: { type: 'game', id: 'misi_h2_b', name: 'Misi B' },
      C: { type: 'game', id: 'misi_h2_c', name: 'Misi C' },
      D: { type: 'quiz', id: 'misi_h2_d', name: 'Misi D' },
      E: { type: 'evaluasi', id: 'misi_h2_e', name: 'Misi E' },
    }
  }

  const currentLevelConfig = misiContent[level] || misiContent[1]
  const missionKeys = ['A', 'B', 'C', 'D', 'E']

  // PENENTU STATUS MISI: 'completed' | 'unlocked' | 'locked'
  const getMissionStatus = (misiKey) => {
    const task = currentLevelConfig[misiKey]
    if (!task) return { status: 'locked', score: 0 }

    const isCompleted = completedMissionsMap[task.id] !== undefined
    const score = completedMissionsMap[task.id] || 0

    if (isCompleted) {
      return { status: 'completed', score }
    }

    // Cek apakah misi sebelumnya sudah selesai
    const keyIndex = missionKeys.indexOf(misiKey)
    if (keyIndex === 0) {
      // Misi A selalu terbuka pertama kali
      return { status: 'unlocked', score: 0 }
    }

    const prevKey = missionKeys[keyIndex - 1]
    const prevTask = currentLevelConfig[prevKey]
    const prevIsCompleted = completedMissionsMap[prevTask.id] !== undefined

    if (prevIsCompleted) {
      return { status: 'unlocked', score: 0 }
    } else {
      return { status: 'locked', score: 0, prevKey }
    }
  }

  const handleMisiClick = (misiKey) => {
    const { status, score, prevKey } = getMissionStatus(misiKey)

    // Aturan 1: Jika sudah selesai -> hanya 1x percobaan
    if (status === 'completed') {
      playSound('click')
      showToast(`Misi ${misiKey} sudah diselesaikan (${score} PTS)! Setiap misi hanya dapat diakses 1x percobaan.`)
      return
    }

    // Aturan 2: Jika misi sebelumnya belum selesai -> terkunci
    if (status === 'locked') {
      playSound('wrong')
      showToast(`Misi ${misiKey} masih terkunci! Selesaikan Misi ${prevKey} terlebih dahulu.`)
      return
    }

    // Misi terbuka -> mulai misi
    playSound('click')
    const selectedTask = currentLevelConfig[misiKey]
    onSelectMisi && onSelectMisi({
      level: level,
      misiKey: misiKey,
      taskData: selectedTask
    })
  }

  // RENDER KARTU MISI BESERTA INDIKATOR STATUS (SELESAI / TERKUNCI / TERBUKA)
  const renderMisiCard = (key, imageSrc, altText, gridClass) => {
    const { status, score, prevKey } = getMissionStatus(key)
    const isCompleted = status === 'completed'
    const isLocked = status === 'locked'
    const isUnlocked = status === 'unlocked'

    return (
      <div 
        onClick={() => handleMisiClick(key)}
        className={`${gridClass} relative flex items-center justify-center w-full h-full select-none transition-transform duration-200 ${
          isUnlocked 
            ? 'cursor-pointer hover:scale-[1.02] active:scale-95' 
            : isCompleted 
            ? 'cursor-pointer hover:scale-[1.02] active:scale-95' 
            : 'cursor-not-allowed'
        }`}
      >
        {/* GAMBAR ASLI KARTU MISI */}
        <img 
          src={imageSrc} 
          alt={altText} 
          className={`w-full h-full object-contain drop-shadow-md transition-all duration-200 ${
            isLocked ? 'brightness-[0.7] contrast-[0.9] grayscale-[0.4] opacity-85' : ''
          }`} 
        />

        {/* INDIKATOR SELESAI (BADGE CENTANG HIJAU ELEGAN DI ATAS KARTU) */}
        {isCompleted && (
          <div className="absolute top-1 right-2 sm:top-2 sm:right-3 pointer-events-none drop-shadow-md">
            <div className="flex items-center gap-1 bg-emerald-600 border-2 border-white text-white font-extrabold text-[9px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full shadow-lg">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{score} PTS</span>
            </div>
          </div>
        )}

        {/* INDIKATOR TERKUNCI (IKON GEMBOK ELEGAN DI TENGAH KARTU) */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-md">
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#001E30]/85 rounded-full flex items-center justify-center shadow-lg border-2 border-amber-400">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-dvh w-dvw bg-[#003049] relative overflow-hidden font-sans select-none touch-none flex flex-col items-center justify-center p-3 sm:p-6">
      
      {/* NOTIFIKASI TOAST / PERINGATAN KUNCI & SELESAI */}
      {toastMessage && (
        <div className="absolute top-3 sm:top-5 z-50 bg-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm px-5 py-2 rounded-full shadow-2xl border-2 border-white animate-bounce max-w-[90%] text-center">
          {toastMessage}
        </div>
      )}

      {/* TOMBOL KEMBALI */}
      <button 
        onClick={onBack}
        className="absolute top-3 left-3 sm:top-5 sm:left-5 z-40 text-white/90 hover:text-white cursor-pointer p-1 transition-transform active:scale-90"
        title="Kembali"
      >
        <svg className="w-6 h-6 sm:w-8 sm:h-8 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {/* HEADER PROFILE USER (NAMA | POIN DENGAN FRAME PRIA/WANITA) */}
      <div className="absolute top-2 sm:top-3 right-3 sm:right-5 z-40">
        <div className="relative h-11 sm:h-12 md:h-14 flex items-center">
          <img
            src={gender === 'female' ? bgProfilWanita : bgProfilPria}
            alt="Profile Frame"
            className="h-full w-auto object-contain pointer-events-none drop-shadow-md"
          />
          <div className="absolute left-[28%] right-[4%] inset-y-0 flex items-center justify-center gap-1.5 sm:gap-2 px-2 pointer-events-none">
            <span className="text-[#8B0000] font-black text-xs sm:text-sm md:text-base truncate max-w-[85px] sm:max-w-[115px] md:max-w-[140px] uppercase drop-shadow-xs">
              {username}
            </span>
            <span className="text-[#003049] font-black text-xs sm:text-sm opacity-40">
              |
            </span>
            <span className="text-[#003049] font-extrabold text-xs sm:text-sm md:text-base whitespace-nowrap">
              {totalScore} PTS
            </span>
          </div>
        </div>
      </div>

      {/* GRID KARTU MISI HARIAN (A s/d E DENGAN VALIDASI KUNCI BERURUTAN) */}
      <div className="w-full max-w-3xl max-h-[72vh] aspect-[16/9] grid grid-cols-3 grid-rows-2 gap-2 sm:gap-3 p-1 sm:p-2 mt-8 sm:mt-10">
        {/* KARTU A (KOLOM 1, 2 BARIS) */}
        {renderMisiCard('A', cardA, 'Misi Harian A', 'col-start-1 row-start-1 row-span-2')}

        {/* KARTU B (KOLOM 2, BARIS 1) */}
        {renderMisiCard('B', cardB, 'Misi B', 'col-start-2 row-start-1')}

        {/* KARTU C (KOLOM 2, BARIS 2) */}
        {renderMisiCard('C', cardC, 'Misi C', 'col-start-2 row-start-2')}

        {/* KARTU D (KOLOM 3, BARIS 1) */}
        {renderMisiCard('D', cardD, 'Misi D', 'col-start-3 row-start-1')}

        {/* KARTU E (KOLOM 3, BARIS 2) */}
        {renderMisiCard('E', cardE, 'Misi E', 'col-start-3 row-start-2')}
      </div>

    </div>
  )
}

export default MisiHarian