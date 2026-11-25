import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { playSound } from '../../utils/audio'
import ScoreRaceLeaderboardModal from './ScoreRaceLeaderboardModal'

// ASSET BACKGROUND ASLI DARI FOLDER 12. day 1 game E/background
import bgKelas from '../../assets/12. day 1 game E/background/12. background - kelas.png'
import bgUks from '../../assets/12. day 1 game E/background/12. background - uks.png'

// ASSET KARAKTER ASLI DARI FOLDER 12. day 1 game E/aset
import miskahThinkingImg from '../../assets/12. day 1 game E/aset/116.png'
import miskahHappyImg from '../../assets/12. day 1 game E/aset/117.png'
import miskahWorriedImg from '../../assets/12. day 1 game E/aset/118.png'
import ibuGuruImg from '../../assets/12. day 1 game E/aset/119.png'

// ASSET DIALOG ASLI DARI FOLDER 12. day 1 game E/aset
import dialog1Img from '../../assets/12. day 1 game E/aset/dialog 1.PNG'
import dialog2Img from '../../assets/12. day 1 game E/aset/dialog 2.PNG'
import dialog3Img from '../../assets/12. day 1 game E/aset/dialog 3.PNG'
import dialog4Img from '../../assets/12. day 1 game E/aset/dialog 4.PNG'
import dialog5Img from '../../assets/12. day 1 game E/aset/dialog 5.PNG'
import dialog6Img from '../../assets/12. day 1 game E/aset/dialog 6.PNG'

// ASSET PROFIL SISWA
import bgProfilPria from '../../assets/6/game home - profil pria_crop.png'
import bgProfilWanita from '../../assets/6/game home - profil wanita_crop.png'

export default function Day1LevelE({ onBack, onComplete, misiId = 'misi_h1_e' }) {
  // ALUR LANGKAH 1 s/d 8
  const [currentSlide, setCurrentSlide] = useState(1) // 1 s/d 8
  const [stage, setStage] = useState('playing') // 'playing' | 'completed'

  // STATUS KESEHATAN MISKAH SECARA DINAMIS
  const [hemoglobin, setHemoglobin] = useState(8.0) // Awal 8.0 g/dl (anemia defisiensi zat besi)
  const [energy, setEnergy] = useState(0) // Awal 0% (mulai dari 0)
  const [earnedScore, setEarnedScore] = useState(0) // SKOR DIMULAI DARI 0 PTS
  const [isFlashingAlarm, setIsFlashingAlarm] = useState(false) // Kedap-kedip alarm layar

  // DATA PENGGUNA & RIWAYAT SELESAI
  const [gender, setGender] = useState('male')
  const [totalUserScore, setTotalUserScore] = useState(0)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)
  const [existingScore, setExistingScore] = useState(0)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  // MULTI-SELECT JAWABAN SLIDE 8
  const [selectedSlide8Choices, setSelectedSlide8Choices] = useState([])

  // FEEDBACK TOAST NOTIFICATION
  const [toastMessage, setToastMessage] = useState(null)
  const [toastType, setToastType] = useState('info') // 'info' | 'success' | 'warning'
  const toastTimerRef = useRef(null)

  const username = localStorage.getItem('anemia_username') || 'Siswa'
  const startTimeRef = useRef(Date.now())

  const showToast = (msg, type = 'info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToastMessage(msg)
    setToastType(type)
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null)
    }, 3200)
  }

  useEffect(() => {
    loadUserData()
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  const loadUserData = async () => {
    try {
      // 1. Profil gender
      const { data: userData } = await supabase
        .from('game_users')
        .select('gender')
        .ilike('username', username)
        .maybeSingle()

      if (userData?.gender) {
        setGender(userData.gender.toLowerCase())
      }

      // 2. Cek apakah Misi E sudah pernah diselesaikan
      const { data: scoreData } = await supabase
        .from('game_scores')
        .select('kategori_game, skor')
        .ilike('username', username)

      if (scoreData && scoreData.length > 0) {
        const sum = scoreData.reduce((acc, curr) => acc + (curr.skor || 0), 0)
        setTotalUserScore(sum)

        const existing = scoreData.find(item => item.kategori_game === misiId || item.kategori_game === 'day1_level_e')
        if (existing) {
          setAlreadyCompleted(true)
          setExistingScore(existing.skor || 0)
          localStorage.setItem('misi_h1_e_completed', 'true')
        }
      }
    } catch (err) {
      console.error('Gagal memuat profil Level E:', err.message)
    }
  }

  // SIMPAN SKOR KE SUPABASE
  const saveScoreToDatabase = async (finalScore = 100) => {
    try {
      // Tandai di localStorage bahwa Hari 1 Misi E selesai
      localStorage.setItem('misi_h1_e_completed', 'true')

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

  // FINISH GAME E
  const handleFinishGameE = (finalScore) => {
    playSound('celebration')
    localStorage.setItem('misi_h1_e_completed', 'true')
    saveScoreToDatabase(finalScore)
    setTimeout(() => {
      setStage('completed')
    }, 1200)
  }

  // =========================================================================
  // HELPER RESPON: SALAH (ALARM & PENALTI) VS BENAR (LANJUT & BERTAMBAH)
  // Aturan Evaluasi:
  // - Jawaban Benar: HB + 0,5, Energi bertambah (+12.5% per langkah benar)
  // - Jawaban Salah: HB + 0 (tidak berkurang), Energi + 0 (tidak berkurang)
  // =========================================================================
  const triggerAlarmAndPenalty = (alertMsg = '') => {
    playSound('alarm')
    setIsFlashingAlarm(true)
    setTimeout(() => {
      setIsFlashingAlarm(false)
    }, 1500)

    // Sesuai aturan penelitian: ketika jawaban salah, HB + 0 dan energi + 0
    if (alertMsg) {
      showToast(alertMsg, 'warning')
    }
  }

  const triggerCorrectAndAdvance = (addScore = 15, nextSlide = null, successMsg = '') => {
    playSound('correct')
    setEarnedScore(prev => Math.min(100, prev + addScore))
    // Sesuai aturan: jawaban benar HB + 0.5
    setHemoglobin(prev => Math.min(12.0, Number((prev + 0.5).toFixed(1))))
    // Energi mulai dari 0 dan setiap jawaban benar bertambah (+12.5%)
    setEnergy(prev => Math.min(100, Math.round(prev + 12.5)))

    if (successMsg) {
      showToast(successMsg, 'success')
    }

    if (nextSlide) {
      setCurrentSlide(nextSlide)
    }
  }

  // =========================================================================
  // LOGIKA RESPON TIAP LANGKAH (ALUR 1 S/D 8)
  // =========================================================================
  const handleAlur1Abaikan = () => {
    triggerAlarmAndPenalty(
      '⚠️ PERINGATAN ALARM! Hemoglobin Miskah rendah (8,0 g/dl). Jangan diabaikan, segera ambil tindakan untuk membantu Miskah!'
    )
  }

  const handleAlur1AmbilTantangan = () => {
    playSound('click')
    setCurrentSlide(2)
    showToast('Tantangan diterima! Dengarkan keluhan fisik yang dialami Miskah.', 'info')
  }

  const handleAlur2Benar = () => {
    triggerCorrectAndAdvance(
      15,
      3,
      'Tepat sekali! Bibir pucat, 5L, pusing, dan pica es batu merupakan tanda anemia. (+15 PTS, Hb +0,5)'
    )
  }

  const handleAlur2Salah = () => {
    triggerAlarmAndPenalty(
      'Kurang tepat! Bibir pucat, lemas, dan pusing bukan hal biasa, melainkan tanda bahaya anemia! (Hb +0)'
    )
  }

  const handleAlur3Benar = () => {
    triggerCorrectAndAdvance(
      15,
      4,
      'Keputusan bijak! Mengantar Miskah ke UKS untuk berkonsultasi dengan petugas. (+15 PTS, Hb +0,5)'
    )
  }

  const handleAlur3Salah = () => {
    triggerAlarmAndPenalty(
      'Jangan biarkan Miskah sendirian! Keluhan anemia harus segera dikonsultasikan ke UKS! (Hb +0)'
    )
  }

  const handleAlur4Lanjut = () => {
    triggerCorrectAndAdvance(
      15,
      5,
      'Bagus! Miskah menceritakan kembali gejalanya kepada Ibu Guru di UKS. (+15 PTS, Hb +0,5)'
    )
  }

  const handleAlur4Abaikan = () => {
    triggerAlarmAndPenalty(
      'Jangan abaikan Miskah! Dengarkan konfirmasi dari Ibu Guru. (Hb +0)'
    )
  }

  const handleAlur5Lanjut = () => {
    triggerCorrectAndAdvance(
      15,
      6,
      'Paham! Pemeriksaan Hb langsung sangat krusial untuk memastikan diagnosis. (+15 PTS, Hb +0,5)'
    )
  }

  const handleAlur5Abaikan = () => {
    triggerAlarmAndPenalty(
      'Pemeriksaan kadar hemoglobin sangat penting, jangan diabaikan! (Hb +0)'
    )
  }

  const handleAlur6Lanjut = () => {
    triggerCorrectAndAdvance(
      15,
      7,
      'Bagus! Mengetahui penyebab anemia adalah kunci utama pencegahan. (+15 PTS, Hb +0,5)'
    )
  }

  const handleAlur6Abaikan = () => {
    triggerAlarmAndPenalty(
      'Mari cari tahu penyebab mengapa seseorang bisa mengalami anemia! (Hb +0)'
    )
  }

  const handleAlur7Lanjut = () => {
    triggerCorrectAndAdvance(
      15,
      8,
      'Paham! Anemia terjadi karena tubuh kekurangan asupan zat besi pembentuk Hb. (+15 PTS, Hb +0,5)'
    )
  }

  const handleAlur7Abaikan = () => {
    triggerAlarmAndPenalty(
      'Pahami penjelasannya: anemia disebabkan oleh kekurangan asupan zat besi! (Hb +0)'
    )
  }

  const toggleSlide8Choice = (id) => {
    playSound('click')
    setSelectedSlide8Choices(prev => {
      if (prev.includes(id)) {
        return prev.filter(c => c !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleConfirmSlide8 = () => {
    const has1 = selectedSlide8Choices.includes(1)
    const has4 = selectedSlide8Choices.includes(4)
    const correctCount = (has1 ? 1 : 0) + (has4 ? 1 : 0)

    let addedScore = 0
    let addedHb = 0
    let addedEnergy = 0

    if (correctCount === 2) {
      addedScore = 10
      addedHb = 1.0 // 2 jawaban benar x 0.5 = +1.0 Hb
      addedEnergy = 25 // 2 jawaban benar x 12.5% = +25% Energi
      showToast('Luar biasa! Dua solusi tepat dipilih (+10 PTS, Hb +1,0). Hemoglobin Miskah kembali normal!', 'success')
    } else if (correctCount === 1) {
      addedScore = 5
      addedHb = 0.5 // 1 jawaban benar = +0.5 Hb
      addedEnergy = 13 // 1 jawaban benar = +13% Energi
      showToast('Bagus! Satu solusi tepat dipilih (+5 PTS, Hb +0,5).', 'info')
    } else {
      addedScore = 0
      addedHb = 0
      addedEnergy = 0
      showToast('Belum ada solusi tepat yang dipilih (+0 PTS, Hb +0).', 'warning')
    }

    const calculatedFinalScore = Math.min(100, earnedScore + addedScore)
    const finalHb = Math.min(12.0, Number((hemoglobin + addedHb).toFixed(1)))
    const finalEnergy = Math.min(100, Math.round(energy + addedEnergy))

    setEarnedScore(calculatedFinalScore)
    setHemoglobin(finalHb)
    setEnergy(finalEnergy)

    handleFinishGameE(calculatedFinalScore)
  }

  // Background aktif: Kelas (Slide 1-3) vs UKS (Slide 4-8)
  const currentBackground = currentSlide <= 3 ? bgKelas : bgUks

  return (
    <div
      className="relative w-dvw h-dvh overflow-hidden font-sans select-none flex flex-col justify-between bg-slate-950"
    >
      {/* =========================================================================
          EFEK KEDAP-KEDIP MERAH SAAT ALARM PERINGATAN / ABAIKAN
         ========================================================================= */}
      {isFlashingAlarm && (
        <div className="absolute inset-0 z-50 pointer-events-none bg-rose-600/35 border-8 border-rose-500 animate-pulse transition-all shadow-[inset_0_0_80px_rgba(225,29,72,0.8)]" />
      )}

      {/* =========================================================================
          AREA UTAMA STAGE 16:9 PROPORTIONAL
         ========================================================================= */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-0 overflow-hidden">
        
        {/* POPUP SUDAH PERNAH MENYELESAIKAN (1X PERCOBAAN) */}
        {alreadyCompleted && stage !== 'completed' ? (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 max-w-xs w-full shadow-2xl border-3 sm:border-4 border-sky-500 text-center animate-scaleUp mx-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-xl sm:text-2xl mx-auto mb-1.5 shadow-sm">
              ✅
            </div>
            <h2 className="text-[#003049] font-black text-sm sm:text-base mb-0.5">
              Misi Level E Sudah Selesai!
            </h2>
            <p className="text-slate-600 text-[11px] sm:text-xs mb-3 leading-relaxed">
              Kamu telah menyelesaikan misi ini dengan perolehan <b>{existingScore} PTS</b>. Data evaluasi telah tersimpan.
            </p>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setShowLeaderboard(true)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-2 px-4 rounded-xl shadow-md transition-all active:scale-95 text-xs cursor-pointer"
              >
                🏆 Lihat Balapan Skor
              </button>
              <button
                onClick={onBack}
                className="w-full bg-[#003049] hover:bg-[#002233] text-white font-extrabold py-1.5 px-4 rounded-xl shadow-md transition-all active:scale-95 text-xs cursor-pointer"
              >
                Kembali ke Menu Misi
              </button>
            </div>
          </div>
        ) : (
          /* CONTAINER STAGE FULL SCREEN (100% LEBAR & TINGGI LAYAR TANPA BORDER HITAM) */
          <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden bg-slate-900">
            
            {/* 1. BACKGROUND RESMI ASLI (KELAS ATAU UKS) - FULL COVER EDGE TO EDGE */}
            <img
              src={currentBackground}
              alt="Background Game E"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
            />

            {/* ===================================================================
                STATUS BAR ATAS DINAMIS (HEMOGLOBIN, ENERGI, SKOR, PROFIL, FULLSCREEN)
               =================================================================== */}
            <div className="absolute top-0 left-0 right-0 h-[15.5%] bg-[#003049] z-20 flex items-center border-b border-sky-950/40 shadow-md">
              <div className="w-full max-w-6xl mx-auto flex items-center justify-between px-3 sm:px-6">
                
                {/* TOMBOL KEMBALI */}
                <div className="flex items-center shrink-0">
                  <button
                    onClick={() => {
                      playSound('click')
                      onBack && onBack()
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-[10px] sm:text-xs border border-white/20 transition-all cursor-pointer shadow-sm"
                  >
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Keluar</span>
                  </button>
                </div>

                {/* INDIKATOR HEMOGLOBIN & ENERGI */}
                <div className="flex items-center justify-center gap-3 sm:gap-6 flex-1 max-w-2xl px-2">
                  
                  {/* 1. HEMOGLOBIN GAUGE */}
                  <div className="flex-1 max-w-[240px]">
                    <div className="text-center text-white text-[9.5px] sm:text-xs font-bold leading-tight mb-0.5">
                      Hemoglobin
                    </div>
                    <div className="relative h-6 sm:h-7 bg-white rounded-full p-0.5 flex items-center justify-between shadow-inner border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 flex items-center justify-center ${
                          hemoglobin < 11
                            ? 'bg-[#8B0000]'
                            : 'bg-emerald-600'
                        }`}
                        style={{
                          width: `${Math.min(96, Math.max(26, (hemoglobin / 12) * 92))}%`,
                        }}
                      >
                        <span className="text-white font-black text-[9px] sm:text-[11px] whitespace-nowrap px-1.5 drop-shadow-xs">
                          {hemoglobin.toFixed(1).replace('.', ',')} g/dl
                        </span>
                      </div>
                      <span className="text-[#003049] font-black text-[9px] sm:text-[11px] pr-2.5">
                        12g/dl
                      </span>
                    </div>
                  </div>

                  {/* 2. ENERGI GAUGE */}
                  <div className="flex-1 max-w-[240px]">
                    <div className="text-center text-white text-[9.5px] sm:text-xs font-bold leading-tight mb-0.5">
                      Energi
                    </div>
                    <div className="relative h-6 sm:h-7 bg-white rounded-full p-0.5 flex items-center justify-between shadow-inner border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 flex items-center justify-center ${
                          energy === 0 ? 'bg-slate-300' : 'bg-[#B2E28E]'
                        }`}
                        style={{
                          width: energy === 0 ? '26px' : `${Math.min(96, Math.max(20, (energy / 100) * 92))}%`,
                          minWidth: '26px'
                        }}
                      >
                        <span className="text-slate-800 font-black text-[9px] sm:text-[11px] whitespace-nowrap px-1">
                          {Math.round(energy)}%
                        </span>
                      </div>
                      <span className="text-[#003049] font-black text-[9px] sm:text-[11px] pr-2.5">
                        100%
                      </span>
                    </div>
                  </div>

                </div>

                {/* SKOR DINAMIS & PROFIL SISWA */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="bg-amber-400 text-slate-950 font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-full shadow-md border border-amber-300">
                    ⭐ {earnedScore} PTS
                  </div>

                  <div className="relative h-7 sm:h-8 hidden md:flex items-center">
                    <img
                      src={gender === 'female' ? bgProfilWanita : bgProfilPria}
                      alt="Profile"
                      className="h-full w-auto object-contain pointer-events-none"
                    />
                    <div className="absolute left-[28%] right-[4%] inset-y-0 flex items-center justify-center gap-1 px-1 pointer-events-none">
                      <span className="text-[#8B0000] font-black text-[10px] truncate max-w-[65px] uppercase">
                        {username}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* ===================================================================
                2. AREA TENGAH: PERAKITAN KARAKTER & DIALOG ASLI DARI ASET
               =================================================================== */}
            <div className="absolute top-[15.5%] bottom-[19%] left-0 right-0 z-10 pointer-events-none flex items-end justify-center overflow-hidden">
              
              {/* --- SLIDE 1: MISKAH KEBINGUNGAN DENGAN TITIK DARAH DI KELAS --- */}
              {currentSlide === 1 && (
                <div className="relative w-full max-w-5xl xl:max-w-6xl h-full mx-auto flex items-end justify-center">
                  <img
                    src={miskahThinkingImg}
                    alt="Miskah Khawatir"
                    className="h-[96%] max-h-full object-contain pointer-events-none drop-shadow-xl animate-fade-in"
                  />
                </div>
              )}

              {/* --- SLIDE 2: MISKAH MENYAMPAIKAN KELUHAN FISIK DI KELAS --- */}
              {currentSlide === 2 && (
                <div className="relative w-full max-w-5xl xl:max-w-6xl h-full mx-auto">
                  {/* Miskah di kiri */}
                  <img
                    src={miskahWorriedImg}
                    alt="Miskah Mengeluh"
                    className="absolute left-[6%] bottom-0 h-[92%] object-contain pointer-events-none drop-shadow-xl animate-fade-in"
                  />
                  {/* Bubble Dialog 1 di kanan atas Miskah */}
                  <img
                    src={dialog1Img}
                    alt="Keluhan Miskah"
                    className="absolute left-[24%] top-[4%] h-[92%] max-w-[55%] object-contain pointer-events-none drop-shadow-2xl animate-scaleUp"
                  />
                </div>
              )}

              {/* --- SLIDE 3: MISKAH BERTANYA "BETULKAH?" DI KELAS --- */}
              {currentSlide === 3 && (
                <div className="relative w-full max-w-5xl xl:max-w-6xl h-full mx-auto">
                  {/* Miskah di kiri */}
                  <img
                    src={miskahWorriedImg}
                    alt="Miskah Bertanya"
                    className="absolute left-[6%] bottom-0 h-[92%] object-contain pointer-events-none drop-shadow-xl animate-fade-in"
                  />
                  {/* Bubble Dialog 2 "Betulkah?" */}
                  <img
                    src={dialog2Img}
                    alt="Betulkah?"
                    className="absolute left-[26%] top-[18%] h-[64%] max-w-[34%] object-contain pointer-events-none drop-shadow-2xl animate-scaleUp"
                  />
                </div>
              )}

              {/* --- SLIDE 4: DI RUANG UKS - MISKAH MENCERITAKAN GEJALA KE IBU GURU --- */}
              {currentSlide === 4 && (
                <div className="relative w-full max-w-5xl xl:max-w-6xl h-full mx-auto">
                  {/* Ibu Guru di kiri */}
                  <img
                    src={ibuGuruImg}
                    alt="Ibu Guru Petugas UKS"
                    className="absolute left-[3%] bottom-0 h-[98%] object-contain pointer-events-none drop-shadow-xl"
                  />
                  {/* Miskah di kanan */}
                  <img
                    src={miskahWorriedImg}
                    alt="Miskah di UKS"
                    className="absolute right-[3%] bottom-0 h-[88%] object-contain pointer-events-none drop-shadow-xl"
                  />
                  {/* Bubble Dialog 3 (Pertanyaan Miskah ke Ibu Guru) */}
                  <img
                    src={dialog3Img}
                    alt="Pertanyaan Miskah ke Ibu Guru"
                    className="absolute left-[28%] top-[2%] h-[94%] max-w-[48%] object-contain pointer-events-none drop-shadow-2xl animate-scaleUp"
                  />
                </div>
              )}

              {/* --- SLIDE 5: DI RUANG UKS - IBU GURU MENYARANKAN PERIKSA HB --- */}
              {currentSlide === 5 && (
                <div className="relative w-full max-w-5xl xl:max-w-6xl h-full mx-auto">
                  {/* Ibu Guru di kiri */}
                  <img
                    src={ibuGuruImg}
                    alt="Ibu Guru Menjelaskan"
                    className="absolute left-[3%] bottom-0 h-[98%] object-contain pointer-events-none drop-shadow-xl"
                  />
                  {/* Miskah di kanan */}
                  <img
                    src={miskahWorriedImg}
                    alt="Miskah Mendengar"
                    className="absolute right-[3%] bottom-0 h-[88%] object-contain pointer-events-none drop-shadow-xl"
                  />
                  {/* Bubble Dialog 4 (Penjelasan Ibu Guru tentang cek Hb) */}
                  <img
                    src={dialog4Img}
                    alt="Saran Cek Hemoglobin"
                    className="absolute left-[21%] top-[4%] h-[90%] max-w-[48%] object-contain pointer-events-none drop-shadow-2xl animate-scaleUp"
                  />
                </div>
              )}

              {/* --- SLIDE 6: DI RUANG UKS - MISKAH BERTANYA PENYEBAB ANEMIA --- */}
              {currentSlide === 6 && (
                <div className="relative w-full max-w-5xl xl:max-w-6xl h-full mx-auto">
                  {/* Ibu Guru di kiri */}
                  <img
                    src={ibuGuruImg}
                    alt="Ibu Guru"
                    className="absolute left-[3%] bottom-0 h-[98%] object-contain pointer-events-none drop-shadow-xl"
                  />
                  {/* Miskah di kanan */}
                  <img
                    src={miskahWorriedImg}
                    alt="Miskah"
                    className="absolute right-[3%] bottom-0 h-[88%] object-contain pointer-events-none drop-shadow-xl"
                  />
                  {/* Bubble Dialog 5 ("Kenapa aku bisa mengalami anemia?") */}
                  <img
                    src={dialog5Img}
                    alt="Kenapa bisa anemia?"
                    className="absolute left-[40%] top-[20%] h-[70%] max-w-[38%] object-contain pointer-events-none drop-shadow-2xl animate-scaleUp"
                  />
                </div>
              )}

              {/* --- SLIDE 7: DI RUANG UKS - IBU GURU JELASKAN DEFISIENSI BESI --- */}
              {currentSlide === 7 && (
                <div className="relative w-full max-w-5xl xl:max-w-6xl h-full mx-auto">
                  {/* Ibu Guru di kiri */}
                  <img
                    src={ibuGuruImg}
                    alt="Ibu Guru"
                    className="absolute left-[3%] bottom-0 h-[98%] object-contain pointer-events-none drop-shadow-xl"
                  />
                  {/* Miskah di kanan */}
                  <img
                    src={miskahWorriedImg}
                    alt="Miskah"
                    className="absolute right-[3%] bottom-0 h-[88%] object-contain pointer-events-none drop-shadow-xl"
                  />
                  {/* Bubble Dialog 6 ("Anemia disebabkan tubuh kekurangan zat besi") */}
                  <img
                    src={dialog6Img}
                    alt="Penyebab Zat Besi"
                    className="absolute left-[22%] top-[6%] h-[88%] max-w-[46%] object-contain pointer-events-none drop-shadow-2xl animate-scaleUp"
                  />
                </div>
              )}

              {/* --- SLIDE 8: DI RUANG UKS - KEPUTUSAN SOLUSI & PENCEGAHAN --- */}
              {currentSlide === 8 && (
                <div className="relative w-full max-w-5xl xl:max-w-6xl h-full mx-auto flex items-center justify-between px-6 sm:px-12 pointer-events-auto">
                  {/* Miskah Berpikir di Kiri */}
                  <div className="relative h-full w-[45%] flex items-end justify-center pointer-events-none">
                    <img
                      src={miskahThinkingImg}
                      alt="Miskah Memikirkan Solusi"
                      className="h-[96%] max-h-full object-contain pointer-events-none drop-shadow-2xl animate-fade-in"
                    />
                  </div>

                  {/* Panel Pilihan Solusi di Kanan */}
                  <div className="w-[52%] max-w-lg flex flex-col justify-center gap-1.5 sm:gap-2 z-20 py-2">
                    
                    {/* Banner Pertanyaan Kuning */}
                    <div className="bg-[#FFF494] text-[#8B0000] font-black text-center py-2 px-4 rounded-full text-[clamp(11px,1.5cqw,16px)] border border-amber-300 shadow-md">
                      Apa yang harus Miskah lakukan? <span className="text-[#B21D2D] font-extrabold">(Bisa pilih lebih dari 1)</span>
                    </div>

                    {/* 4 Pilihan Solusi (Tombol Merah Interaktif) */}
                    {/* PILIHAN 1 (BENAR) */}
                    <button
                      onClick={() => toggleSlide8Choice(1)}
                      className={`w-full py-2 sm:py-2.5 px-4 rounded-full font-bold text-[clamp(10px,1.3cqw,13.5px)] leading-tight text-white transition-all shadow-md flex items-center justify-between cursor-pointer border ${
                        selectedSlide8Choices.includes(1)
                          ? 'bg-[#C1121F] border-emerald-400 ring-2 ring-emerald-400 scale-[1.02]'
                          : 'bg-[#B21D2D] hover:bg-[#C1121F] border-rose-300/40 active:scale-98'
                      }`}
                    >
                      <span className="text-left">Periksa hemoglobin ke fasilitas kesehatan</span>
                      {selectedSlide8Choices.includes(1) && (
                        <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full ml-2 shrink-0">
                          ✔ Terpilih
                        </span>
                      )}
                    </button>

                    {/* PILIHAN 2 (SALAH) */}
                    <button
                      onClick={() => toggleSlide8Choice(2)}
                      className={`w-full py-2 sm:py-2.5 px-4 rounded-full font-bold text-[clamp(10px,1.3cqw,13.5px)] leading-tight text-white transition-all shadow-md flex items-center justify-between cursor-pointer border ${
                        selectedSlide8Choices.includes(2)
                          ? 'bg-[#C1121F] border-amber-400 ring-2 ring-amber-400 scale-[1.02]'
                          : 'bg-[#B21D2D] hover:bg-[#C1121F] border-rose-300/40 active:scale-98'
                      }`}
                    >
                      <span className="text-left">Makan semangka merah</span>
                      {selectedSlide8Choices.includes(2) && (
                        <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full ml-2 shrink-0">
                          ✔ Terpilih
                        </span>
                      )}
                    </button>

                    {/* PILIHAN 3 (SALAH) */}
                    <button
                      onClick={() => toggleSlide8Choice(3)}
                      className={`w-full py-2 sm:py-2.5 px-4 rounded-full font-bold text-[clamp(10px,1.3cqw,13.5px)] leading-tight text-white transition-all shadow-md flex items-center justify-between cursor-pointer border ${
                        selectedSlide8Choices.includes(3)
                          ? 'bg-[#C1121F] border-amber-400 ring-2 ring-amber-400 scale-[1.02]'
                          : 'bg-[#B21D2D] hover:bg-[#C1121F] border-rose-300/40 active:scale-98'
                      }`}
                    >
                      <span className="text-left">Minum air putih</span>
                      {selectedSlide8Choices.includes(3) && (
                        <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full ml-2 shrink-0">
                          ✔ Terpilih
                        </span>
                      )}
                    </button>

                    {/* PILIHAN 4 (BENAR) */}
                    <button
                      onClick={() => toggleSlide8Choice(4)}
                      className={`w-full py-2 sm:py-2.5 px-4 rounded-full font-bold text-[clamp(10px,1.3cqw,13.5px)] leading-tight text-white transition-all shadow-md flex items-center justify-between cursor-pointer border ${
                        selectedSlide8Choices.includes(4)
                          ? 'bg-[#C1121F] border-emerald-400 ring-2 ring-emerald-400 scale-[1.02]'
                          : 'bg-[#B21D2D] hover:bg-[#C1121F] border-rose-300/40 active:scale-98'
                      }`}
                    >
                      <span className="text-left">Meningkatkan konsumsi makanan mengandung zat besi</span>
                      {selectedSlide8Choices.includes(4) && (
                        <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full ml-2 shrink-0">
                          ✔ Terpilih
                        </span>
                      )}
                    </button>

                  </div>
                </div>
              )}

            </div>

            {/* ===================================================================
                3. BOTTOM BAR INTERAKTIF (TOMBOL KEPUTUSAN ALUR 1 S/D 8)
               =================================================================== */}
            
            {/* --- ALUR 1: ABAIKAN vs AMBIL TANTANGAN SELANJUTNYA --- */}
            {currentSlide === 1 && (
              <div className="absolute bottom-0 left-0 right-0 h-[19%] bg-[#003049] z-20 flex items-center border-t border-sky-950/40">
                <div className="w-full max-w-5xl xl:max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8">
                  <div className="text-left text-white text-[clamp(10px,1.5cqw,15px)] font-bold max-w-[55%] leading-snug">
                    <p>Hemoglobin Miskah rendah. Tubuh Miskah butuh asupan zat besi!</p>
                    <p className="text-amber-300 text-[clamp(9.5px,1.3cqw,13px)] font-extrabold mt-0.5">
                      Tanyakan tanda dan gejala anemia yang dirasakan oleh Miskah!
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <button
                      onClick={handleAlur1Abaikan}
                      className="bg-[#FFF494] hover:bg-[#FFE866] active:scale-95 text-slate-900 font-extrabold text-[clamp(10px,1.4cqw,14px)] py-2 sm:py-3 px-4 sm:px-6 rounded-2xl shadow-lg transition-all cursor-pointer border border-amber-300"
                    >
                      Abaikan
                    </button>
                    <button
                      onClick={handleAlur1AmbilTantangan}
                      className="bg-[#FFF494] hover:bg-[#FFE866] active:scale-95 text-slate-900 font-black text-[clamp(10px,1.4cqw,14px)] py-2 sm:py-3 px-4 sm:px-6 rounded-2xl shadow-lg transition-all cursor-pointer border border-amber-300"
                    >
                      Ambil Tantangan Selanjutnya
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* --- ALUR 2: IDENTIFIKASI TANDA GEJALA ANEMIA --- */}
            {currentSlide === 2 && (
              <div className="absolute bottom-0 left-0 right-0 h-[19%] bg-[#003049] z-20 flex items-center border-t border-sky-950/40">
                <div className="w-full max-w-5xl xl:max-w-6xl mx-auto flex items-center justify-end px-4 sm:px-8 gap-2.5 sm:gap-4">
                  <button
                    onClick={handleAlur2Benar}
                    className="bg-[#FFF494] hover:bg-[#FFE866] active:scale-95 text-slate-900 font-extrabold text-[clamp(10px,1.4cqw,14px)] py-2 sm:py-3 px-4 sm:px-6 rounded-2xl shadow-lg transition-all cursor-pointer max-w-[48%] text-center border border-amber-300 leading-tight"
                  >
                    Ini tanda gejala anemia. Harus segera ditangani!
                  </button>
                  <button
                    onClick={handleAlur2Salah}
                    className="bg-[#FFF494] hover:bg-[#FFE866] active:scale-95 text-slate-900 font-extrabold text-[clamp(10px,1.4cqw,14px)] py-2 sm:py-3 px-4 sm:px-6 rounded-2xl shadow-lg transition-all cursor-pointer max-w-[48%] text-center border border-amber-300 leading-tight"
                  >
                    Ini bukan gejala anemia. Biasa saja!
                  </button>
                </div>
              </div>
            )}

            {/* --- ALUR 3: KEPUTUSAN MEMBAWA KE UKS --- */}
            {currentSlide === 3 && (
              <div className="absolute bottom-0 left-0 right-0 h-[19%] bg-[#003049] z-20 flex items-center border-t border-sky-950/40">
                <div className="w-full max-w-5xl xl:max-w-6xl mx-auto flex items-center justify-end px-4 sm:px-8 gap-2.5 sm:gap-4">
                  <button
                    onClick={handleAlur3Benar}
                    className="bg-[#FFF494] hover:bg-[#FFE866] active:scale-95 text-slate-900 font-extrabold text-[clamp(10px,1.4cqw,14px)] py-2 sm:py-3 px-4 sm:px-6 rounded-2xl shadow-lg transition-all cursor-pointer max-w-[48%] text-center border border-amber-300 leading-tight"
                  >
                    Iya, mari kita ke UKS untuk berkonsultasi
                  </button>
                  <button
                    onClick={handleAlur3Salah}
                    className="bg-[#FFF494] hover:bg-[#FFE866] active:scale-95 text-slate-900 font-extrabold text-[clamp(10px,1.4cqw,14px)] py-2 sm:py-3 px-4 sm:px-6 rounded-2xl shadow-lg transition-all cursor-pointer max-w-[48%] text-center border border-amber-300 leading-tight"
                  >
                    Ini bukan gejala anemia. Biasa saja!
                  </button>
                </div>
              </div>
            )}

            {/* --- ALUR 4: KONSULTASI KE IBU GURU DI UKS --- */}
            {currentSlide === 4 && (
              <div className="absolute bottom-0 left-0 right-0 h-[19%] bg-[#003049] z-20 flex items-center border-t border-sky-950/40">
                <div className="w-full max-w-5xl xl:max-w-6xl mx-auto flex items-center justify-center px-4 sm:px-8 gap-3 sm:gap-6">
                  <button
                    onClick={handleAlur4Abaikan}
                    className="bg-[#FFF494] hover:bg-[#FFE866] active:scale-95 text-slate-900 font-extrabold text-[clamp(11px,1.6cqw,15px)] py-2 px-8 sm:px-12 rounded-full shadow-lg transition-all cursor-pointer border border-amber-300 min-w-[130px]"
                  >
                    Abaikan
                  </button>
                  <button
                    onClick={handleAlur4Lanjut}
                    className="bg-[#FFF494] hover:bg-[#FFE866] active:scale-95 text-slate-900 font-black text-[clamp(11px,1.6cqw,15px)] py-2 px-8 sm:px-12 rounded-full shadow-lg transition-all cursor-pointer border border-amber-300 min-w-[130px]"
                  >
                    Lanjut
                  </button>
                </div>
              </div>
            )}

            {/* --- ALUR 5: SARAN CEK HEMOGLOBIN --- */}
            {currentSlide === 5 && (
              <div className="absolute bottom-0 left-0 right-0 h-[19%] bg-[#003049] z-20 flex items-center border-t border-sky-950/40">
                <div className="w-full max-w-5xl xl:max-w-6xl mx-auto flex items-center justify-center px-4 sm:px-8 gap-3 sm:gap-6">
                  <button
                    onClick={handleAlur5Abaikan}
                    className="bg-[#FFF494] hover:bg-[#FFE866] active:scale-95 text-slate-900 font-extrabold text-[clamp(11px,1.6cqw,15px)] py-2 px-8 sm:px-12 rounded-full shadow-lg transition-all cursor-pointer border border-amber-300 min-w-[130px]"
                  >
                    Abaikan
                  </button>
                  <button
                    onClick={handleAlur5Lanjut}
                    className="bg-[#FFF494] hover:bg-[#FFE866] active:scale-95 text-slate-900 font-black text-[clamp(11px,1.6cqw,15px)] py-2 px-8 sm:px-12 rounded-full shadow-lg transition-all cursor-pointer border border-amber-300 min-w-[130px]"
                  >
                    Lanjut
                  </button>
                </div>
              </div>
            )}

            {/* --- ALUR 6: MISKAH BERTANYA PENYEBAB --- */}
            {currentSlide === 6 && (
              <div className="absolute bottom-0 left-0 right-0 h-[19%] bg-[#003049] z-20 flex items-center border-t border-sky-950/40">
                <div className="w-full max-w-5xl xl:max-w-6xl mx-auto flex items-center justify-center px-4 sm:px-8 gap-3 sm:gap-6">
                  <button
                    onClick={handleAlur6Abaikan}
                    className="bg-[#FFF494] hover:bg-[#FFE866] active:scale-95 text-slate-900 font-extrabold text-[clamp(11px,1.6cqw,15px)] py-2 px-8 sm:px-12 rounded-full shadow-lg transition-all cursor-pointer border border-amber-300 min-w-[130px]"
                  >
                    Abaikan
                  </button>
                  <button
                    onClick={handleAlur6Lanjut}
                    className="bg-[#FFF494] hover:bg-[#FFE866] active:scale-95 text-slate-900 font-black text-[clamp(11px,1.6cqw,15px)] py-2 px-8 sm:px-12 rounded-full shadow-lg transition-all cursor-pointer border border-amber-300 min-w-[130px]"
                  >
                    Lanjut
                  </button>
                </div>
              </div>
            )}

            {/* --- ALUR 7: IBU GURU JELASKAN DEFISIENSI BESI --- */}
            {currentSlide === 7 && (
              <div className="absolute bottom-0 left-0 right-0 h-[19%] bg-[#003049] z-20 flex items-center border-t border-sky-950/40">
                <div className="w-full max-w-5xl xl:max-w-6xl mx-auto flex items-center justify-center px-4 sm:px-8 gap-3 sm:gap-6">
                  <button
                    onClick={handleAlur7Abaikan}
                    className="bg-[#FFF494] hover:bg-[#FFE866] active:scale-95 text-slate-900 font-extrabold text-[clamp(11px,1.6cqw,15px)] py-2 px-8 sm:px-12 rounded-full shadow-lg transition-all cursor-pointer border border-amber-300 min-w-[130px]"
                  >
                    Abaikan
                  </button>
                  <button
                    onClick={handleAlur7Lanjut}
                    className="bg-[#FFF494] hover:bg-[#FFE866] active:scale-95 text-slate-900 font-black text-[clamp(11px,1.6cqw,15px)] py-2 px-8 sm:px-12 rounded-full shadow-lg transition-all cursor-pointer border border-amber-300 min-w-[130px]"
                  >
                    Lanjut
                  </button>
                </div>
              </div>
            )}

            {/* --- ALUR 8: TOMBOL KONFIRMASI SOLUSI AKHIR --- */}
            {currentSlide === 8 && (
              <div className="absolute bottom-0 left-0 right-0 h-[19%] bg-[#003049] z-20 flex items-center border-t border-sky-950/40">
                <div className="w-full max-w-5xl xl:max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8">
                  <div className="text-left text-white text-[clamp(10px,1.4cqw,14px)] font-bold">
                    <span>Pilih solusi yang tepat untuk Miskah! <span className="text-yellow-300 font-extrabold">(Bisa pilih lebih dari 1)</span> </span>
                    <span className="text-amber-300">
                      ({selectedSlide8Choices.length} pilihan terpilih)
                    </span>
                  </div>
                  <button
                    onClick={handleConfirmSlide8}
                    className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 active:scale-95 text-slate-950 font-black text-[clamp(11px,1.6cqw,15px)] py-2.5 px-6 sm:px-10 rounded-full shadow-xl transition-all cursor-pointer border border-amber-200"
                  >
                    Konfirmasi Solusi Terpilih ➔
                  </button>
                </div>
              </div>
            )}

            {/* NOTIFIKASI TOAST FLOATING */}
            {toastMessage && (
              <div
                className={`absolute top-[17%] left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full shadow-2xl border text-xs sm:text-sm font-black animate-bounce backdrop-blur-md max-w-[90%] text-center ${
                  toastType === 'success'
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400'
                    : toastType === 'warning'
                    ? 'bg-rose-950/95 text-rose-300 border-rose-400'
                    : 'bg-slate-900/90 text-amber-300 border-amber-400'
                }`}
              >
                {toastMessage}
              </div>
            )}

          </div>
        )}

      </div>

      {/* =========================================================================
          POPUP MODAL KELULUSAN / SKOR AKHIR MISI E
         ========================================================================= */}
      {stage === 'completed' && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto overscroll-contain py-3 sm:py-6">
          <div className="relative w-full max-w-[310px] sm:max-w-xs bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4.5 text-center shadow-2xl border-3 border-emerald-400 flex flex-col items-center animate-bounceIn my-auto max-h-[92dvh] overflow-y-auto custom-scrollbar">
            {/* TOMBOL TUTUP / KELUAR CEPAT */}
            <button
              onClick={() => {
                playSound('click')
                onBack && onBack()
              }}
              className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-7 h-7 rounded-full bg-slate-100 hover:bg-rose-500 text-slate-500 hover:text-white font-black text-xs flex items-center justify-center shadow transition-all active:scale-90 cursor-pointer border border-slate-300 z-10"
              title="Keluar"
            >
              ✕
            </button>

            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-full flex items-center justify-center mb-1 text-xl sm:text-2xl shadow-inner border border-amber-300">
              🏆
            </div>
            <h2 className="text-[#003049] font-black text-sm sm:text-base mb-0.5 uppercase tracking-wide">
              MISI LEVEL E SELESAI!
            </h2>
            <p className="text-slate-600 text-[10.5px] sm:text-xs mb-2 leading-snug px-1">
              Luar biasa! Kamu telah mengidentifikasi gejala dan solusi yang tepat untuk membantu Miskah.
            </p>

            <div className="bg-emerald-50 border border-emerald-300 rounded-xl py-1 sm:py-1.5 px-4 mb-2.5 w-full">
              <span className="text-emerald-900 font-black text-xl sm:text-2xl">
                +{earnedScore} PTS
              </span>
            </div>

            <button
              onClick={() => {
                playSound('click')
                setShowLeaderboard(true)
              }}
              className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-slate-950 font-black py-2 sm:py-2.5 px-3 rounded-xl shadow-md text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5 border border-amber-300"
            >
              <span>Lanjut (Lihat Balapan Skor 🏁)</span>
              <span className="text-xs font-black">➔</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL BALAPAN SKOR / LEADERBOARD
         ========================================================================= */}
      <ScoreRaceLeaderboardModal
        isOpen={showLeaderboard}
        currentMissionId="misi_h1_e"
        currentMissionTitle="Misi E: Konsultasi Miskah"
        currentScore={earnedScore}
        nextMissionKey="home"
        nextMissionTitle="Kembali ke Menu Game"
        onNext={() => {
          onComplete && onComplete({ score: earnedScore, missionId: 'misi_h1_e', backToGameHome: true })
          onBack && onBack()
        }}
        onBackToMenu={() => {
          onComplete && onComplete({ score: earnedScore, missionId: 'misi_h1_e', backToGameHome: true })
          onBack && onBack()
        }}
      />
    </div>
  )
}
