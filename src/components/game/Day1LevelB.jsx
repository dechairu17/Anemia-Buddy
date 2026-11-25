import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { playSound } from '../../utils/audio'

// IMPORT ASET RESMI SCENE 16:9 DARI "9. day 1 level b BARU"
import scene89 from '../../assets/9. day 1 level b BARU/89.png'
import scene90 from '../../assets/9. day 1 level b BARU/90.png'
import scene91 from '../../assets/9. day 1 level b BARU/91.png'
import scene92 from '../../assets/9. day 1 level b BARU/92.png'
import scene93 from '../../assets/9. day 1 level b BARU/93.png'
import scene94 from '../../assets/9. day 1 level b BARU/94.png'
import scene95 from '../../assets/9. day 1 level b BARU/95.png'
import scenePujian from '../../assets/9. day 1 level b BARU/8. pujian akhir.png'

// IMPORT PROFIL
import bgProfilPria from '../../assets/6/game home - profil pria_crop.png'
import bgProfilWanita from '../../assets/6/game home - profil wanita_crop.png'

export default function Day1LevelB({ onBack, onComplete, misiId = 'misi_h1_b' }) {
  // ALUR LANGKAH CERITA INTERAKTIF (SESUAI MOCKUP 89 s/d 95 & PUJIAN)
  const [step, setStep] = useState('step1_prompt')

  // DATA PENGGUNA & SKOR
  const [gender, setGender] = useState('male')
  const [totalScore, setTotalScore] = useState(0)
  const [earnedScore, setEarnedScore] = useState(0)
  const [isEarlyExit, setIsEarlyExit] = useState(false)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)
  const [existingScore, setExistingScore] = useState(0)
  const [showCompletionModal, setShowCompletionModal] = useState(false)

  const username = localStorage.getItem('anemia_username') || 'Siswa'
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      // 1. Ambil data profil siswa
      const { data: userData } = await supabase
        .from('game_users')
        .select('gender')
        .eq('username', username)
        .maybeSingle()

      if (userData?.gender) {
        setGender(userData.gender.toLowerCase())
      }

      // 2. Cek apakah misi B sudah pernah diselesaikan
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
      console.error('Error load profil Level B:', err.message)
    }
  }

  // SIMPAN SKOR KE DATABASE
  const saveScoreToDatabase = async (finalScore = 100) => {
    try {
      localStorage.setItem('misi_h1_b_completed', 'true')
      localStorage.setItem('misi_h1_b_score', finalScore.toString())
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
      console.error('Error menyimpan skor Level B:', err.message)
    }
  }

  // AKSI 1: Abaikan Mia (skor -25, dokter sel darah: "sikapmu kurang tepat")
  const handleAbaikan = () => {
    playSound('wrong')
    setEarnedScore(prev => Math.max(0, prev - 25))
    setStep('step2_abaikan')
  }

  // AKSI 2: Mari Kita Bantu (skor +25, pemandu: "Baik, mari kita bantu...")
  const handleMariKitaBantu = () => {
    playSound('correct')
    setEarnedScore(prev => Math.min(100, prev + 25))
    setStep('step3_terima')
  }

  // AKSI 3: Mulai Bantu Mia (Lanjut ke tawaran definisi)
  const handleMulaiBantu = () => {
    playSound('click')
    setStep('step4_offer')
  }

  // AKSI 4: Tolak Mendengarkan Definisi (skor -50 & langsung muncul skor akhir -> kembali ke menu)
  const handleTolakPenjelasan = () => {
    playSound('wrong')
    const finalScore = Math.max(0, earnedScore - 50)
    setEarnedScore(finalScore)
    saveScoreToDatabase(finalScore)
    setIsEarlyExit(true)
    setShowCompletionModal(true)
  }

  // AKSI 5: Terima Mendengarkan Definisi (skor +25, lanjut ke penjelasan definisi)
  const handleTerimaPenjelasan = () => {
    playSound('correct')
    setEarnedScore(prev => Math.min(100, prev + 25))
    setStep('step6_pengertian')
  }

  // AKSI 6: Apa Penyebabnya! (skor +25, lanjut ke penjelasan penyebab)
  const handleApaPenyebabnya = () => {
    playSound('correct')
    setEarnedScore(prev => Math.min(100, prev + 25))
    setStep('step7_penyebab')
  }

  // AKSI 7: Cukup (skor -25 & langsung muncul skor akhir)
  const handleCukup = () => {
    playSound('click')
    const finalScore = Math.max(0, earnedScore - 25)
    setEarnedScore(finalScore)
    saveScoreToDatabase(finalScore)
    setIsEarlyExit(true)
    setShowCompletionModal(true)
  }

  // AKSI 8: Saya Sudah Paham (Lanjut ke pujian lalu skor akhir)
  const handlePaham = () => {
    playSound('cring')
    const finalScore = Math.min(100, earnedScore + 25)
    setEarnedScore(finalScore)
    saveScoreToDatabase(finalScore)
    setStep('step8_pujian')
  }

  return (
    <div className="relative w-dvw h-dvh bg-[#FFF59F] overflow-hidden font-sans select-none flex flex-col justify-between">
      
      {/* =========================================================================
          TOP BAR NAVIGASI & PROFIL
         ========================================================================= */}
      <div className="relative z-30 flex items-center justify-between w-full px-3 py-1.5 sm:px-6 sm:py-2 bg-[#FFF59F]/90 backdrop-blur-xs border-b border-amber-300/50 shadow-xs flex-shrink-0">
        {/* TOMBOL KEMBALI */}
        <button
          onClick={() => {
            playSound('click')
            onBack && onBack()
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#003049] hover:bg-[#002233] active:scale-95 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm"
        >
          <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Kembali</span>
        </button>

        {/* JUDUL MISI */}
        <div className="text-center">
          <h1 className="text-[#003049] font-black text-xs sm:text-base md:text-lg tracking-wide flex items-center justify-center gap-1.5">
            <span>🤝</span> GAME 2: MISI BANTU MIA
          </h1>
          <p className="text-amber-900/80 text-[10px] sm:text-xs font-semibold hidden sm:block">
            Tunjukkan Sikap Empati &amp; Kesiapan Belajar Edukasi Anemia
          </p>
        </div>

        {/* PROFIL SISWA */}
        <div className="relative h-10 sm:h-12 flex items-center">
          <img
            src={gender === 'female' ? bgProfilWanita : bgProfilPria}
            alt="Profil"
            className="h-full w-auto object-contain pointer-events-none drop-shadow-sm"
          />
          <div className="absolute left-[28%] right-[4%] inset-y-0 flex items-center justify-center gap-1.5 px-2 pointer-events-none">
            <span className="text-[#8B0000] font-black text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[120px] uppercase">
              {username}
            </span>
            <span className="text-[#003049] font-black text-xs opacity-40">|</span>
            <span className="text-[#003049] font-extrabold text-xs sm:text-sm whitespace-nowrap">
              {totalScore} PTS
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          AREA UTAMA GAMEPLAY (STAGE 16:9 PROPORTIONAL - PERSIS DESAIN 89 - 95)
         ========================================================================= */}
      <div className="relative z-10 flex-1 w-full h-full min-h-0 flex items-center justify-center p-0 overflow-hidden bg-[#FFF59F]">
        
        {/* PROTEKSI 1X PERCOBAAN: JIKA SUDAH PERNAH SELESAI */}
        {alreadyCompleted && step !== 'step8_pujian' ? (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl border-4 border-amber-400 text-center animate-scaleUp mx-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-3xl mx-auto mb-2 shadow-sm">
              ✅
            </div>
            <h2 className="text-[#003049] font-black text-base sm:text-lg mb-1">
              Misi B Sudah Diselesaikan!
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mb-4 leading-relaxed">
              Kamu telah menyelesaikan misi ini dengan skor <b>{existingScore} PTS</b>. Data evaluasi sikap telah tersimpan.
            </p>
            <div className="flex flex-col gap-2">
              {existingScore < 100 && (
                <button
                  onClick={() => {
                    playSound('click')
                    setAlreadyCompleted(false)
                    setEarnedScore(0)
                    setStep('step1_prompt')
                    setIsEarlyExit(false)
                    setShowCompletionModal(false)
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 px-6 rounded-2xl shadow-md transition-all active:scale-95 text-xs sm:text-sm cursor-pointer"
                >
                  🔄 Ulangi Misi (Perbaiki Sikap &amp; Skor)
                </button>
              )}
              <button
                onClick={() => {
                  playSound('click')
                  onComplete && onComplete({ score: existingScore, missionId: misiId, nextMission: 'c' })
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black py-2.5 px-6 rounded-2xl shadow-md transition-all active:scale-95 text-xs sm:text-sm cursor-pointer"
              >
                Lanjut ke Misi C ➔
              </button>
              <button
                onClick={onBack}
                className="w-full bg-[#003049] hover:bg-[#002233] text-white font-extrabold py-2 px-6 rounded-2xl shadow-md transition-all active:scale-95 text-xs sm:text-sm cursor-pointer"
              >
                Kembali ke Menu Misi
              </button>
            </div>
          </div>
        ) : (
          /* CONTAINER STAGE 16:9 YANG MENJAGA PROPORSI & TIDAK PERNAH TERPOTONG HEADER */
          <div className="@container relative w-full h-full max-h-[calc(100dvh-60px)] aspect-[16/9] max-w-[calc((100dvh-60px)*16/9)] flex items-center justify-center select-none">
            
            {/* STEP 1: 89.png - Karakter Mia lemas minta bantuan */}
            {step === 'step1_prompt' && (
              <div key="step1" className="relative w-full h-full animate-fadeIn">
                <img
                  src={scene89}
                  alt="Mia Lemas Minta Tolong"
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
                <button
                  onClick={handleMariKitaBantu}
                  className="absolute left-[36.8%] top-[54.4%] w-[26.4%] h-[8.7%] bg-[#003049] hover:bg-[#002233] active:scale-95 text-white font-extrabold text-[clamp(11px,2.1cqw,18px)] rounded-full shadow-lg transition-all flex items-center justify-center cursor-pointer select-none px-2"
                >
                  Mari kita bantu
                </button>
                <button
                  onClick={handleAbaikan}
                  className="absolute left-[36.8%] top-[69.0%] w-[26.4%] h-[8.8%] bg-[#003049] hover:bg-[#002233] active:scale-95 text-white font-extrabold text-[clamp(11px,2.1cqw,18px)] rounded-full shadow-lg transition-all flex items-center justify-center cursor-pointer select-none px-2"
                >
                  Abaikan
                </button>
              </div>
            )}

            {/* STEP 2: 90.png - Sikap Kurang Tepat (Dokter di Kiri + Mia di Kanan) */}
            {step === 'step2_abaikan' && (
              <div key="step2" className="relative w-full h-full animate-fadeIn">
                <img
                  src={scene90}
                  alt="Sikap Kurang Tepat"
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
                <button
                  onClick={() => {
                    playSound('click')
                    setStep('step3_terima')
                  }}
                  className="absolute left-[34.0%] top-[77.4%] w-[34.2%] h-[11.5%] bg-[#003049] hover:bg-[#002233] active:scale-95 text-white font-extrabold text-[clamp(11px,2.1cqw,18px)] rounded-full shadow-lg transition-all flex items-center justify-center cursor-pointer select-none px-2"
                >
                  Mari bantu, Mia
                </button>
              </div>
            )}

            {/* STEP 3: 91.png - Baik mari kita bantu Mia! */}
            {step === 'step3_terima' && (
              <div key="step3" className="relative w-full h-full animate-fadeIn">
                <img
                  src={scene91}
                  alt="Baik mari kita bantu Mia!"
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
                <button
                  onClick={handleMulaiBantu}
                  className="absolute left-[33.9%] top-[78.1%] w-[34.5%] h-[9.4%] bg-[#003049] hover:bg-[#002233] active:scale-95 text-white font-extrabold text-[clamp(11px,2.1cqw,18px)] rounded-full shadow-lg transition-all flex items-center justify-center cursor-pointer select-none px-2"
                >
                  Mulai bantu, Mia
                </button>
              </div>
            )}

            {/* STEP 4: 92.png - Dokter Ceritakan Ulang Definisi -> Terima / Tolak */}
            {step === 'step4_offer' && (
              <div key="step4" className="relative w-full h-full animate-fadeIn">
                <img
                  src={scene92}
                  alt="Sebelum membantu Mia, mari aku ceritakan ulang definisi anemia"
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
                <button
                  onClick={handleTerimaPenjelasan}
                  className="absolute left-[61.8%] top-[65.3%] w-[34.5%] h-[9.4%] bg-[#003049] hover:bg-[#002233] active:scale-95 text-white font-extrabold text-[clamp(11px,2.1cqw,18px)] rounded-full shadow-lg transition-all flex items-center justify-center cursor-pointer select-none px-2"
                >
                  Terima
                </button>
                <button
                  onClick={handleTolakPenjelasan}
                  className="absolute left-[61.8%] top-[76.6%] w-[34.5%] h-[9.4%] bg-[#003049] hover:bg-[#002233] active:scale-95 text-white font-extrabold text-[clamp(11px,2.1cqw,18px)] rounded-full shadow-lg transition-all flex items-center justify-center cursor-pointer select-none px-2"
                >
                  Tolak
                </button>
              </div>
            )}

            {/* STEP 5: 93.png - Dokter: Sangat Disayangkan Melewatkan... */}
            {step === 'step5_tolak' && (
              <div key="step5" className="relative w-full h-full animate-fadeIn">
                <img
                  src={scene93}
                  alt="Sangat disayangkan melewatkan informasi penting ini"
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
                <button
                  onClick={() => {
                    playSound('click')
                    setStep('step4_offer')
                  }}
                  className="absolute left-[61.8%] top-[58.0%] w-[34.5%] h-[9.4%] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-[clamp(10px,1.9cqw,16px)] rounded-full shadow-lg transition-all flex items-center justify-center cursor-pointer select-none px-2"
                >
                  💡 Dengarkan Penjelasan
                </button>
                <button
                  onClick={onBack}
                  className="absolute left-[61.8%] top-[72.1%] w-[34.5%] h-[17.2%] bg-[#003049] hover:bg-[#002233] active:scale-95 text-white font-extrabold text-[clamp(10px,2.0cqw,17px)] rounded-full shadow-lg transition-all flex items-center justify-center cursor-pointer select-none px-2 text-center"
                >
                  Kembali Ke Menu Utama
                </button>
              </div>
            )}

            {/* STEP 6: 94.png - Penjelasan Pengertian Anemia */}
            {step === 'step6_pengertian' && (
              <div key="step6" className="relative w-full h-full animate-fadeIn">
                <img
                  src={scene94}
                  alt="Pengertian Anemia Defisiensi Zat Besi"
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
                <button
                  onClick={handleApaPenyebabnya}
                  className="absolute left-[61.5%] top-[68.1%] w-[34.5%] h-[10.5%] bg-[#003049] hover:bg-[#002233] active:scale-95 text-white font-extrabold text-[clamp(11px,2.1cqw,18px)] rounded-full shadow-lg transition-all flex items-center justify-center cursor-pointer select-none px-2"
                >
                  Apa penyebabnya?
                </button>
                <button
                  onClick={handleCukup}
                  className="absolute left-[61.5%] top-[80.5%] w-[34.5%] h-[9.4%] bg-[#003049] hover:bg-[#002233] active:scale-95 text-white font-extrabold text-[clamp(11px,2.1cqw,18px)] rounded-full shadow-lg transition-all flex items-center justify-center cursor-pointer select-none px-2"
                >
                  Cukup
                </button>
              </div>
            )}

            {/* STEP 7: 95.png - Penjelasan Penyebab Anemia */}
            {step === 'step7_penyebab' && (
              <div key="step7" className="relative w-full h-full animate-fadeIn">
                <img
                  src={scene95}
                  alt="Penyebab Anemia Defisiensi Zat Besi"
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
                <button
                  onClick={handlePaham}
                  className="absolute left-[59.8%] top-[75.4%] w-[34.5%] h-[10.6%] bg-[#003049] hover:bg-[#002233] active:scale-95 text-white font-extrabold text-[clamp(11px,2.1cqw,18px)] rounded-full shadow-lg transition-all flex items-center justify-center cursor-pointer select-none px-2"
                >
                  Saya sudah paham
                </button>
              </div>
            )}

            {/* STEP 8: 8. pujian akhir.png - Pujian Ditampilkan Penuh Sebelum Popup Skor */}
            {step === 'step8_pujian' && (
              <div key="step8" className="relative w-full h-full animate-fadeIn flex items-center justify-center">
                <img
                  src={scenePujian}
                  alt="Keren! Kamu mau membuka diri terhadap informasi baru"
                  className="w-full h-full object-contain pointer-events-none select-none"
                />

                {/* TOMBOL LIHAT HASIL SKOR - DITAMPILKAN DI ATAS SLIDE PUJIAN */}
                <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2 z-20 w-full max-w-xs sm:max-w-sm px-4">
                  <button
                    onClick={() => {
                      playSound('cring')
                      setShowCompletionModal(true)
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-slate-950 font-black text-xs sm:text-sm py-3 px-6 rounded-full shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2 border-2 border-amber-300 animate-pulse"
                  >
                    <span>Lanjut (Lihat Skor Misi ⭐)</span>
                    <span className="text-base font-black">➔</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL POPUP SELESAI MISI B (MUNCUL SETELAH PUJIAN ATAU PILIHAN KELUAR)
         ========================================================================= */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain py-3 sm:py-6">
          <div className="relative bg-white rounded-3xl p-5 sm:p-6 max-w-xs sm:max-w-sm md:max-w-md w-full text-center shadow-2xl border-4 border-amber-400 flex flex-col items-center animate-scaleUp max-h-[92dvh] overflow-y-auto custom-scrollbar my-auto">
            {/* TOMBOL TUTUP / KELUAR CEPAT */}
            <button
              onClick={() => {
                playSound('click')
                onBack && onBack()
              }}
              className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 w-7 h-7 rounded-full bg-slate-100 hover:bg-rose-500 text-slate-500 hover:text-white font-black text-xs flex items-center justify-center shadow transition-all active:scale-90 cursor-pointer border border-slate-300 z-10"
              title="Keluar"
            >
              ✕
            </button>
            
            <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 font-black text-[11px] sm:text-xs px-3.5 py-1 rounded-full mb-2.5 shadow-2xs">
              <span>{isEarlyExit ? '⚠️' : '🌟'}</span>
              <span>{isEarlyExit ? 'SKOR EVALUASI AKHIR' : 'MISI B SELESAI'}</span>
            </div>

            <h3 className="text-lg sm:text-2xl font-black text-[#003049] mb-1">
              {isEarlyExit ? 'Evaluasi Keputusan' : 'Luar Biasa!'}
            </h3>

            <p className="text-slate-600 text-xs sm:text-sm mb-3.5 leading-relaxed px-1 sm:px-2">
              {isEarlyExit
                ? 'Misi diakhiri lebih awal. Kamu tetap memperoleh evaluasi skor sesuai keputusan yang diambil.'
                : 'Kamu memiliki sikap empati tinggi dan siap membantu sesama serta menyerap ilmu baru.'}
            </p>

            <div className={`w-full rounded-2xl py-2 sm:py-2.5 px-4 border-2 mb-4 flex items-center justify-center gap-2 shadow-2xs ${
              earnedScore > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <span className="text-xl sm:text-2xl">{earnedScore > 0 ? '⭐' : '⚪'}</span>
              <span className="font-black text-base sm:text-xl">
                {isEarlyExit ? `${earnedScore} PTS` : `+${earnedScore} PTS`}
              </span>
            </div>

            <div className="w-full flex flex-col gap-2">
              {!isEarlyExit && (
                <button
                  onClick={() => {
                    playSound('click')
                    onComplete && onComplete({ score: earnedScore, missionId: misiId, nextMission: 'c' })
                  }}
                  className="w-full bg-[#003049] hover:bg-[#002233] active:scale-95 text-white font-black text-xs sm:text-sm md:text-base py-3 sm:py-3.5 px-5 rounded-full shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Lanjut ke Misi C (Detektif)</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              )}

              <button
                onClick={() => {
                  playSound('click')
                  onComplete && onComplete({ score: earnedScore, missionId: misiId })
                  onBack && onBack()
                }}
                className={`w-full py-2.5 px-4 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                  isEarlyExit
                    ? 'bg-[#003049] hover:bg-[#002233] text-white shadow-lg'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                }`}
              >
                <span>🏠 Kembali ke Menu Utama</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
