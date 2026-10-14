import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { playSound } from '../../utils/audio'
import ScoreRaceLeaderboardModal from './ScoreRaceLeaderboardModal'

// ASSETS
import bgProfilPria from '../../assets/6/game home - profil pria_crop.png'
import bgProfilWanita from '../../assets/6/game home - profil wanita_crop.png'
import mascotSiswi from '../../assets/9. day 1 level B/karakter.png'

export default function Day1LevelE({ onBack, onComplete, misiId = 'misi_h1_e' }) {
  const [stage, setStage] = useState('intro') // 'intro' | 'playing' | 'completed'
  const [gender, setGender] = useState('male')
  const [totalUserScore, setTotalUserScore] = useState(0)
  const [earnedScore, setEarnedScore] = useState(100)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)
  const [existingScore, setExistingScore] = useState(0)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const username = localStorage.getItem('anemia_username') || 'Siswa'
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      // 1. Profil gender
      const { data: userData } = await supabase
        .from('game_users')
        .select('gender')
        .eq('username', username)
        .maybeSingle()

      if (userData?.gender) {
        setGender(userData.gender.toLowerCase())
      }

      // 2. Cek apakah Misi E sudah selesai
      const { data: scoreData } = await supabase
        .from('game_scores')
        .select('kategori_game, skor')
        .eq('username', username)

      if (scoreData && scoreData.length > 0) {
        const sum = scoreData.reduce((acc, curr) => acc + (curr.skor || 0), 0)
        setTotalUserScore(sum)

        const existing = scoreData.find(item => item.kategori_game === misiId)
        if (existing) {
          setAlreadyCompleted(true)
          setExistingScore(existing.skor || 0)
        }
      }
    } catch (err) {
      console.error('Gagal memuat profil Level E:', err.message)
    }
  }

  // SIMPAN SKOR KE SUPABASE
  const saveScoreToDatabase = async (finalScore = 100) => {
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
      setTotalUserScore(prev => prev + finalScore)
      setAlreadyCompleted(true)
      setExistingScore(finalScore)
    } catch (err) {
      console.error('Gagal menyimpan skor Level E ke Supabase:', err.message)
    }
  }

  // SELESAIKAN MISI E DENGAN SUARA CRINGGG
  const handleFinishMisiE = () => {
    playSound('cring')
    saveScoreToDatabase(earnedScore)
    setStage('completed')
  }

  return (
    <div className="relative w-dvw h-dvh bg-gradient-to-b from-[#1E1B4B] via-[#2E1065] to-[#0F172A] overflow-hidden font-sans select-none flex flex-col justify-between">
      {/* AMBIENT GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(168,85,247,0.18),transparent_70%)] pointer-events-none" />

      {/* =========================================================================
          TOP BAR NAVIGASI & PROFIL SISWA
         ========================================================================= */}
      <div className="relative z-30 flex items-center justify-between w-full px-3 py-1 sm:px-4 sm:py-1.5 bg-[#1E1B4B]/95 backdrop-blur-md border-b-2 border-purple-400/30 shadow-md flex-shrink-0">
        {/* TOMBOL KEMBALI */}
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

        {/* TITLE */}
        <div className="text-left">
          <h1 className="text-white font-black text-xs sm:text-sm md:text-base leading-tight tracking-wide drop-shadow-md flex items-center gap-1.5">
            <span>✨</span> GAME 5: MISI LEVEL E
          </h1>
          <p className="text-purple-200 text-[9px] sm:text-[10px] font-semibold">
            Modul Khusus Level E (Mandiri &amp; Terpisah dari Game D)
          </p>
        </div>

        {/* PROFIL SISWA & SKOR */}
        <div className="relative h-8 sm:h-9 md:h-10 flex items-center">
          <img
            src={gender === 'female' ? bgProfilWanita : bgProfilPria}
            alt="Profile Pill"
            className="h-full w-auto object-contain pointer-events-none drop-shadow-md"
          />
          <div className="absolute left-[28%] right-[4%] inset-y-0 flex items-center justify-center gap-1.5 sm:gap-2 px-1.5 pointer-events-none">
            <span className="text-[#8B0000] font-black text-[11px] sm:text-xs md:text-sm truncate max-w-[70px] sm:max-w-[100px] uppercase drop-shadow-xs">
              {username}
            </span>
            <span className="text-[#003049] font-black text-xs opacity-40">|</span>
            <span className="text-[#003049] font-extrabold text-[11px] sm:text-xs md:text-sm whitespace-nowrap">
              {totalUserScore} PTS
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          KONTEN LEVEL E
         ========================================================================= */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-y-auto custom-scrollbar">
        {stage === 'intro' && (
          <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl border-3 border-purple-500 flex flex-col items-center text-center animate-fadeIn my-auto">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2 text-2xl shadow-inner text-purple-700">
              🎮
            </div>

            <h2 className="text-[#1E1B4B] font-black text-base sm:text-lg mb-1">
              MISI LEVEL E
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mb-3 leading-relaxed">
              Selamat datang di Misi Level E! Ruang permainan ini khusus disiapkan terpisah dari Misi D untuk konsep dan gameplay spesifik Level E.
            </p>

            <div className="w-full bg-purple-50 rounded-xl p-3 border border-purple-200 text-left mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 block mb-1">
                📌 Status Misi E:
              </span>
              <p className="text-[11px] text-purple-800 leading-snug">
                Misi ini independen dan memiliki pencatatan skor tersendiri (<code className="font-bold">misi_h1_e</code>). Selesaikan misi ini untuk mengumpulkan poin tambahan penelitian.
              </p>
            </div>

            <button
              onClick={() => {
                if (alreadyCompleted) return
                playSound('click')
                setStage('playing')
              }}
              disabled={alreadyCompleted}
              className={`w-full py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                alreadyCompleted
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white cursor-pointer active:scale-95 border border-purple-400'
              }`}
            >
              <span>🚀</span>
              <span>{alreadyCompleted ? 'Misi E Sudah Diselesaikan' : 'Mulai Main Level E'}</span>
            </button>
          </div>
        )}

        {stage === 'playing' && (
          <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl border-3 border-purple-500 flex flex-col items-center text-center animate-scaleUp my-auto">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2 text-2xl shadow-inner text-emerald-700">
              ⭐
            </div>

            <h3 className="text-[#1E1B4B] font-black text-base sm:text-lg mb-1">
              Arena Permainan Level E
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mb-3">
              Konsep dan materi gameplay Level E siap diterapkan sesuai instruksi penelitian Anda.
            </p>

            <div className="w-full bg-indigo-50 rounded-xl p-3 border border-indigo-200 text-left mb-3 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-semibold">Tantangan Level E:</span>
                <span className="font-bold text-indigo-700">Tersedia</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-semibold">Estimasi Skor Maksimal:</span>
                <span className="font-black text-emerald-600">100 PTS</span>
              </div>
            </div>

            <button
              onClick={handleFinishMisiE}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-xs sm:text-sm shadow-lg transition-all cursor-pointer border border-emerald-400 flex items-center justify-center gap-2"
            >
              <span>✓ Selesaikan Misi &amp; Simpan Skor</span>
            </button>
          </div>
        )}

        {stage === 'completed' && (
          <div className="w-full max-w-sm bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center shadow-2xl border-4 border-purple-500 flex flex-col items-center animate-bounceIn my-auto">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-2 text-2xl shadow-inner">
              🏆
            </div>
            <h2 className="text-[#1E1B4B] font-black text-base sm:text-lg mb-0.5 uppercase">
              MISI LEVEL E SELESAI!
            </h2>
            <p className="text-slate-600 text-xs mb-2">
              Selamat! Kamu telah berhasil menuntaskan tantangan Misi Level E.
            </p>

            <div className="bg-purple-50 border-2 border-purple-300 rounded-xl py-2 px-6 mb-3 w-full">
              <span className="text-purple-900 font-black text-2xl">
                +{earnedScore} PTS
              </span>
            </div>

            <button
              onClick={() => {
                playSound('click')
                setShowLeaderboard(true)
              }}
              className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-slate-950 font-black py-2.5 px-4 rounded-xl shadow-lg text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2 border border-amber-300"
            >
              <span>Lanjut (Lihat Balapan Skor 🏁)</span>
              <span className="text-sm font-black">➔</span>
            </button>
          </div>
        )}
      </div>

      {/* POPUP 1X COBA */}
      {alreadyCompleted && stage !== 'completed' && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-sm bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center shadow-2xl border-4 border-purple-500 flex flex-col items-center animate-bounceIn my-auto">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2 text-xl shadow-inner text-purple-600 font-bold">
              ✔
            </div>
            <h2 className="text-[#1E1B4B] font-black text-base sm:text-lg mb-1">
              MISI LEVEL E TELAH SELESAI
            </h2>
            <p className="text-slate-600 text-xs mb-2 leading-relaxed">
              Kamu sudah menyelesaikan Misi Level E sebelumnya dengan perolehan:
            </p>
            <div className="bg-purple-50 border-2 border-purple-300 rounded-xl py-2 px-6 mb-2.5 w-full">
              <span className="text-purple-800 font-black text-2xl">
                {existingScore} PTS
              </span>
            </div>
            <p className="text-slate-500 text-[11px] mb-3 leading-tight">
              Setiap misi hanya dapat diakses 1 kali percobaan karena data diperuntukkan bagi evaluasi penelitian.
            </p>
            <button
              onClick={() => {
                playSound('click')
                onBack && onBack()
              }}
              className="w-full bg-[#1E1B4B] hover:bg-[#110E38] text-white font-black py-2.5 px-4 rounded-xl shadow text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
            >
              Kembali ke Menu Misi
            </button>
          </div>
        </div>
      )}
      {/* MODAL BALAPAN SKOR / LEADERBOARD */}
      <ScoreRaceLeaderboardModal
        isOpen={showLeaderboard}
        currentMissionId="misi_h1_e"
        currentMissionTitle="Misi E: Dokter Mandiri"
        currentScore={earnedScore}
        nextMissionKey={null}
        nextMissionTitle="Selesai Misi Hari 1"
        onNext={() => {
          onComplete && onComplete({ score: earnedScore, missionId: 'misi_h1_e' })
          onBack && onBack()
        }}
        onBackToMenu={() => {
          onComplete && onComplete({ score: earnedScore, missionId: 'misi_h1_e' })
          onBack && onBack()
        }}
      />
    </div>
  )
}
