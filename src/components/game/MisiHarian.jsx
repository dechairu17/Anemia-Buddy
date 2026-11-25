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

function MisiHarian({ level = 1, onBack, onSelectMisi, onGoToLevel2, onGoToLevel1 }) {
  const [gender, setGender] = useState('male')
  const [totalScore, setTotalScore] = useState(0)
  const [completedMissionsMap, setCompletedMissionsMap] = useState({})
  const [isAdminLevel2Unlocked, setIsAdminLevel2Unlocked] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const username = localStorage.getItem('anemia_username') || 'Siswa'

  useEffect(() => {
    loadUserData()
  }, [level])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage('')
    }, 3200)
  }

  const loadUserData = async () => {
    try {
      // 0. Cek Konfigurasi Sakelar Admin Hari 2
      const { data: config } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'h2_game_enabled')
        .maybeSingle()

      const adminUnlocked = config ? (config.value === true || config.value === 'true') : false
      setIsAdminLevel2Unlocked(adminUnlocked)

      // 1. Ambil Data Pengguna (case-insensitive)
      const { data: userData } = await supabase
        .from('game_users')
        .select('username, gender')
        .ilike('username', username)
        .maybeSingle()

      const canonicalUser = userData?.username || username
      if (userData?.username) {
        localStorage.setItem('anemia_username', userData.username)
      }
      if (userData && userData.gender) {
        setGender(userData.gender.toLowerCase())
      }

      // 2. Ambil Riwayat Skor Game & Misi yang telah diselesaikan
      const { data: scoreData } = await supabase
        .from('game_scores')
        .select('kategori_game, skor')
        .ilike('username', canonicalUser)

      const map = {}
      let sumScore = 0

      if (scoreData && scoreData.length > 0) {
        // Ambil skor unik tertinggi per kategori_game
        scoreData.forEach((item) => {
          if (item.kategori_game) {
            if (map[item.kategori_game] === undefined || (item.skor || 0) > map[item.kategori_game]) {
              map[item.kategori_game] = item.skor || 0
            }
          }
        })
        sumScore = Object.values(map).reduce((acc, curr) => acc + curr, 0)
      }

      // 3. Sumber Kebenaran Data Adalah Database Supabase:
      // Bersihkan seluruh localStorage palsu/stale jika misi tidak tercatat di database untuk user ini!
      const allMissions = [
        'misi_h1_a', 'misi_h1_b', 'misi_h1_c', 'misi_h1_d', 'misi_h1_e',
        'misi_h2_a', 'misi_h2_b', 'misi_h2_c'
      ]
      allMissions.forEach((mId) => {
        if (map[mId] === undefined) {
          // Tidak ada data di database untuk user ini! Hapus flag localStorage
          localStorage.removeItem(`${mId}_completed`)
          localStorage.removeItem(`${mId}_score`)
        } else {
          // Pastikan localStorage sinkron dengan data asli database
          localStorage.setItem(`${mId}_completed`, 'true')
          localStorage.setItem(`${mId}_score`, map[mId].toString())
        }
      })

      setTotalScore(sumScore)
      setCompletedMissionsMap(map)

      // Hari 2 HANYA terbuka jika: misi E hari 1 selesai di database DAN sakelar Hari 2 telah dibuka oleh Admin
      const hasCompletedDay1 = map['misi_h1_e'] !== undefined || map['day1_level_e'] !== undefined
      if (hasCompletedDay1 && adminUnlocked) {
        localStorage.setItem('day2_unlocked', 'true')
      } else {
        localStorage.removeItem('day2_unlocked')
      }
    } catch (err) {
      console.error('Error loading profile:', err.message)
    }
  }

  // DATA KONTEN MISI BERDASARKAN LEVEL 1 DAN LEVEL 2
  const misiContent = {
    1: {
      levelName: 'LEVEL 1',
      title: 'HARI 1: EDUKASI & PENGENALAN ANEMIA',
      A: { type: 'game', id: 'misi_h1_a', name: 'Misi A (Flip Kartu Edukasi)' },
      B: { type: 'game', id: 'misi_h1_b', name: 'Misi B (Bantu Mia)' },
      C: { type: 'game', id: 'misi_h1_c', name: 'Misi C (Detektif Gejala Anemia)' },
      D: { type: 'game', id: 'misi_h1_d', name: 'Misi D (Tong Sampah Fakta vs Mitos)' },
      E: { type: 'game', id: 'misi_h1_e', name: 'Misi E (Dokter Sel Darah Mandiri)' },
    },
    2: {
      levelName: 'LEVEL 2',
      title: 'HARI 2: GIZI & SUPERFOOD ANTI ANEMIA',
      A: { type: 'game', id: 'misi_h2_a', name: 'Misi A (Pemilahan Gejala & Dampak)' },
      B: { type: 'game', id: 'misi_h2_b', name: 'Misi B (Catcher Makanan Anti Anemia)' },
      C: { type: 'game', id: 'misi_h2_c', name: 'Misi C (Isi Piringku Sehari)' },
      D: { type: 'placeholder', id: 'misi_h2_d', name: 'Misi D (Segera Hadir)', isComingSoon: true },
      E: { type: 'placeholder', id: 'misi_h2_e', name: 'Misi E (Segera Hadir)', isComingSoon: true },
    }
  }

  const currentLevelConfig = misiContent[level] || misiContent[1]
  const missionKeys = ['A', 'B', 'C', 'D', 'E']

  // PENENTU STATUS MISI: 'completed' | 'unlocked' | 'locked' | 'coming_soon'
  const getMissionStatus = (misiKey) => {
    const task = currentLevelConfig[misiKey]
    if (!task) return { status: 'locked', score: 0 }

    if (task.isComingSoon) {
      return { status: 'coming_soon', score: 0 }
    }

    const isCompleted = completedMissionsMap[task.id] !== undefined
    const score = completedMissionsMap[task.id] || 0

    if (isCompleted) {
      return { status: 'completed', score }
    }

    // Cek apakah misi sebelumnya sudah selesai untuk urutan bermain
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
    const task = currentLevelConfig[misiKey]
    const { status, score, prevKey } = getMissionStatus(misiKey)

    // Kasus 1: Misi segera hadir (misal D & E pada Level 2)
    if (status === 'coming_soon') {
      playSound('wrong')
      showToast(`Misi ${misiKey} Level 2 segera hadir pada pembaruan materi berikutnya! 🚧`)
      return
    }

    // Kasus 2: Misi masih terkunci (harus selesaikan misi sebelumnya)
    if (status === 'locked') {
      playSound('wrong')
      showToast(`Misi ${misiKey} masih terkunci! Selesaikan Misi ${prevKey} Level ${level} terlebih dahulu. 🔒`)
      return
    }

    // Kasus 3: Misi sudah selesai (TETAP DIIZINKAN MASUK UNTUK TESTING & LATIHAN)
    if (status === 'completed') {
      playSound('click')
      onSelectMisi && onSelectMisi({
        level: level,
        misiKey: misiKey,
        taskData: task,
        isReplay: true
      })
      return
    }

    // Kasus 4: Misi terbuka -> mulai misi
    playSound('click')
    onSelectMisi && onSelectMisi({
      level: level,
      misiKey: misiKey,
      taskData: task,
      isReplay: false
    })
  }

  // RENDER KARTU MISI BESERTA INDIKATOR STATUS
  const renderMisiCard = (key, imageSrc, altText, gridClass) => {
    const { status, score } = getMissionStatus(key)
    const isCompleted = status === 'completed'
    const isLocked = status === 'locked'
    const isUnlocked = status === 'unlocked'
    const isComingSoon = status === 'coming_soon'

    return (
      <div 
        onClick={() => handleMisiClick(key)}
        className={`${gridClass} relative flex items-center justify-center w-full h-full select-none transition-transform duration-200 cursor-pointer ${
          isUnlocked || isCompleted
            ? 'hover:scale-[1.02] active:scale-95' 
            : 'hover:scale-[1.01] active:scale-95'
        }`}
        title={`Misi ${key} (${level === 1 ? 'Hari 1' : 'Hari 2'})`}
      >
        {/* GAMBAR ASLI KARTU MISI */}
        <img 
          src={imageSrc} 
          alt={altText} 
          className={`w-full h-full object-contain drop-shadow-md transition-all duration-200 ${
            isLocked || isComingSoon ? 'brightness-[0.7] contrast-[0.9] grayscale-[0.35] opacity-85' : ''
          }`} 
        />

        {/* LABEL TINGKAT LEVEL DI SUDUT KARTU A */}
        {key === 'A' && (
          <div className="absolute top-2 left-2 pointer-events-none drop-shadow-md">
            <span className={`text-[10px] sm:text-xs font-black px-2 sm:px-2.5 py-0.5 rounded-full border shadow-md tracking-wider ${
              level === 1 ? 'bg-amber-500 text-slate-950 border-white' : 'bg-cyan-500 text-slate-950 border-white'
            }`}>
              {level === 1 ? 'LEVEL 1' : 'LEVEL 2'}
            </span>
          </div>
        )}

        {/* INDIKATOR SELESAI (BADGE CENTANG HIJAU DENGAN SKOR) */}
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

        {/* INDIKATOR TERKUNCI (IKON GEMBOK EMAS ELEGAN) */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-md">
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#001E30]/85 rounded-full flex items-center justify-center shadow-lg border-2 border-amber-400">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}

        {/* INDIKATOR SEGERA HADIR (COMING SOON) */}
        {isComingSoon && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none drop-shadow-md">
            <div className="bg-slate-900/90 text-amber-300 border border-amber-400/80 rounded-full px-2.5 py-1 flex items-center gap-1 text-[9px] sm:text-xs font-black shadow-lg">
              <span>🔒 Segera Hadir</span>
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
        title="Kembali ke Menu Game"
      >
        <svg className="w-6 h-6 sm:w-8 sm:h-8 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {/* HEADER UTAMA: PENANDA LEVEL 1 ATAU LEVEL 2 DENGAN JELAS */}
      <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center select-none pointer-events-none text-center">
        <div className={`px-4 sm:px-6 py-1 sm:py-1.5 rounded-full border-2 shadow-2xl flex items-center gap-2 ${
          level === 1 
            ? 'bg-gradient-to-r from-red-900 via-amber-700 to-red-900 border-amber-400 text-amber-200' 
            : 'bg-gradient-to-r from-emerald-950 via-teal-800 to-emerald-950 border-cyan-400 text-cyan-200'
        }`}>
          <span className="text-sm sm:text-base">
            {level === 1 ? '🩸' : '🥗'}
          </span>
          <span className="font-black text-xs sm:text-sm md:text-base tracking-widest uppercase text-white drop-shadow-md">
            {level === 1 ? 'MISI HARIAN • LEVEL 1' : 'MISI HARIAN • LEVEL 2'}
          </span>
        </div>
        <span className="text-[10px] sm:text-xs font-bold text-amber-300/90 tracking-wide mt-0.5 drop-shadow hidden xs:inline-block">
          {level === 1 ? 'Hari 1: Edukasi & Gejala Anemia' : 'Hari 2: Gizi & Superfood Anti Anemia'}
        </span>
      </div>

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
      <div className="w-full max-w-3xl max-h-[70vh] aspect-[16/9] grid grid-cols-3 grid-rows-2 gap-2 sm:gap-3 p-1 sm:p-2 mt-10 sm:mt-12">
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

      {/* TOMBOL NAVIGASI ANTARA LEVEL 1 DAN LEVEL 2 */}
      <div className="mt-2 sm:mt-3 z-30 flex items-center gap-3">
        {level === 1 && isAdminLevel2Unlocked && (completedMissionsMap['misi_h1_e'] !== undefined || completedMissionsMap['day1_level_e'] !== undefined) && (
          <button
            onClick={() => {
              playSound('click')
              onGoToLevel2 && onGoToLevel2()
            }}
            className="px-5 sm:px-7 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-slate-950 font-black text-xs sm:text-sm shadow-xl border border-amber-300 flex items-center gap-2 cursor-pointer animate-pulse"
          >
            <span>🎉 Masuk ke Misi Hari 2 (Level 2)</span>
            <span>➔</span>
          </button>
        )}

        {level === 2 && (
          <button
            onClick={() => {
              playSound('click')
              onGoToLevel1 && onGoToLevel1()
            }}
            className="px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-lg border border-white/30 flex items-center gap-2 cursor-pointer transition-all"
          >
            <span>⬅ Lihat Misi Hari 1 (Level 1)</span>
          </button>
        )}
      </div>

    </div>
  )
}

export default MisiHarian
