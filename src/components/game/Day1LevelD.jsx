import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

// IMPORT ASET GAMBAR MISI DETEKTIF GEJALA
import bgTexture from '../../assets/9. day 1 level B/background 9.png'
import bgPapanUngu from '../../assets/9. day 1 level B/background papann ungu.png'
import bannerMisiCrop from '../../assets/9. day 1 level B/misi_crop.png'
import karakterSiswiCrop from '../../assets/9. day 1 level B/karakter_crop.png'
import berhasilTercatatCrop from '../../assets/9. day 1 level B/berhasil_tercatat_crop.png'
import selanjutnyaCrop from '../../assets/9. day 1 level B/selanjutnya_crop.png'
import tombolKlikImg from '../../assets/9. day 1 level B/tombol klik.png'

// MODAL IMAGES (UNTUK POPUP DITEMUKAN)
import mataModalImg from '../../assets/9. day 1 level B/mata pucat_modal.png'
import bibirModalImg from '../../assets/9. day 1 level B/bibir pucat_modal.png'
import kukuModalImg from '../../assets/9. day 1 level B/kuku pucat_modal.png'
import lelahModalImg from '../../assets/9. day 1 level B/mudah lelah_modal.png'

// CIRCLE IMAGES (UNTUK TAHAP 2 & TAHAP 3)
import mataCircleImg from '../../assets/9. day 1 level B/mata_circle.png'
import bibirCircleImg from '../../assets/9. day 1 level B/bibir_circle.png'
import kukuCircleImg from '../../assets/9. day 1 level B/kuku_circle.png'
import lelahCircleImg from '../../assets/9. day 1 level B/mudah_lelah_circle.png'

// AUDIO SYNTHESIZER UNTUK SOUND EFFECT
import { playSound } from '../../utils/audio'
import ScoreRaceLeaderboardModal from './ScoreRaceLeaderboardModal'

const playAudioFeedback = (type) => playSound(type)

// 4 DATA GEJALA SISWI DENGAN KOORDINAT PERSENTASE RELATIF TERHADAP KARAKTER
const SYMPTOMS_DATA = [
  {
    id: 'mata',
    name: 'Konjungtiva Mata Pucat',
    shortName: 'Konjungtiva Mata Pucat',
    icon: '👁️',
    iconBg: 'bg-blue-100',
    subtitle: '',
    modalImg: mataModalImg,
    circleImg: mataCircleImg,
    pos: { top: '12%', left: '30%' },
    causeId: 'act_teh',
    causeBioFlow: 'Zat Tanin pada Teh ➔ Menghambat Serapan Zat Besi ➔ Kadar Hb Turun ➔ Mata Pucat'
  },
  {
    id: 'kuku',
    name: 'Kuku Pucat',
    shortName: 'Kuku Pucat',
    icon: '💅',
    iconBg: 'bg-purple-100',
    subtitle: '',
    modalImg: kukuModalImg,
    circleImg: kukuCircleImg,
    pos: { top: '67%', left: '78%' },
    causeId: 'act_diet',
    causeBioFlow: 'Diet Rendah Zat Besi ➔ Sintesis Hemoglobin Menurun ➔ Perfusi Jaringan Perifer Turun ➔ Kuku Pucat'
  },
  {
    id: 'bibir',
    name: 'Bibir Pucat',
    shortName: 'Bibir Pucat',
    icon: '👄',
    iconBg: 'bg-rose-100',
    subtitle: '',
    modalImg: bibirModalImg,
    circleImg: bibirCircleImg,
    pos: { top: '24%', left: '34%' },
    causeId: 'act_ttd',
    causeBioFlow: 'Kehilangan Darah Haid Tanpa Suplementasi TTD ➔ Cadangan Besi Drop ➔ Mikrosirkulasi Menurun ➔ Bibir Pucat'
  },
  {
    id: 'lelah',
    name: '5L (Lelah, Lesu, dll)',
    shortName: '5L',
    icon: '🥱',
    iconBg: 'bg-amber-100',
    subtitle: 'Tubuh cepat capek',
    modalImg: lelahModalImg,
    circleImg: lelahCircleImg,
    pos: { top: '40%', left: '72%' },
    causeId: 'act_begadang',
    causeBioFlow: 'Begadang Malam ➔ Regenerasi Sel Darah Merah Terganggu + Kelelahan Seluler ➔ Tubuh Cepat Lelah (5L)'
  }
]

// OPSI LOG AKTIVITAS DENGAN ALUR BIOLOGIS
const MATCHING_OPTIONS = [
  {
    id: 'act_vitc',
    icon: '🍊',
    title: 'Sering mengonsumsi buah kaya vitamin C',
    isCause: false,
    bioExplanation: 'Buah kaya Vitamin C justru membantu penyerapan zat besi secara optimal di usus, sehingga mencegah anemia!'
  },
  {
    id: 'act_teh',
    icon: '☕',
    title: 'Minum teh es manis setelah makan siang',
    isCause: true,
    bioExplanation: 'Zat Tanin pada Teh ➔ Menghambat Serapan Zat Besi ➔ Kadar Hb Turun ➔ Mata Pucat'
  },
  {
    id: 'act_sayur',
    icon: '🥗',
    title: 'Sering mengonsumsi sayur bayam dan kangkung',
    isCause: false,
    bioExplanation: 'Sayuran hijau merupakan sumber nutrisi nabati yang membantu mensuplai pembentukan sel darah merah.'
  },
  {
    id: 'act_ttd',
    icon: '💊',
    title: 'Tidak minum Tablet Tambah Darah (TTD) saat haid',
    isCause: true,
    bioExplanation: 'Kehilangan Darah Haid Tanpa Suplementasi TTD ➔ Cadangan Besi Drop ➔ Mikrosirkulasi Menurun ➔ Bibir Pucat'
  },
  {
    id: 'act_air',
    icon: '💧',
    title: 'Minum air putih minimal 8 gelas sehari',
    isCause: false,
    bioExplanation: 'Minum air putih adalah pola hidup sehat untuk menjaga hidrasi sel, bukan penyebab gangguan hemoglobin.'
  },
  {
    id: 'act_begadang',
    icon: '🎮',
    title: 'Begadang main game sampai jam 2 malam',
    isCause: true,
    bioExplanation: 'Begadang Malam ➔ Regenerasi Sel Darah Merah Terganggu + Kelelahan Seluler ➔ Tubuh Lemas & Cepat Lelah (5L)'
  },
  {
    id: 'act_ekskul',
    icon: '🏃',
    title: 'Mengikuti kegiatan ekstrakurikuler sekolah',
    isCause: false,
    bioExplanation: 'Aktivitas fisik teratur menjaga kebugaran tubuh dan tidak memicu anemia selama gizi seimbang.'
  },
  {
    id: 'act_diet',
    icon: '🥩',
    title: 'Menolak makan hati ayam/tempe karena diet',
    isCause: true,
    bioExplanation: 'Diet Rendah Zat Besi ➔ Bahan Baku Hemoglobin Kurang ➔ Perfusi Jaringan Perifer Turun ➔ Kuku Pucat'
  }
]

export default function Day1LevelD({ onBack, onComplete, misiId = 'misi_h1_d' }) {
  // STAGES: 'identify' -> 'match_causes' -> 'completed'
  const [stage, setStage] = useState('identify')

  // DATA USER & POIN
  const [totalScore, setTotalScore] = useState(0)
  const [earnedScore, setEarnedScore] = useState(100)
  const [toastMessage, setToastMessage] = useState('')
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)
  const [existingScore, setExistingScore] = useState(0)

  // STATE POPUP & SUBMISI
  const [showScoreModal, setShowScoreModal] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // TAHAP 1: IDENTIFIKASI GEJALA
  const [discoveredSymptoms, setDiscoveredSymptoms] = useState([])
  const [activePopupSymptom, setActivePopupSymptom] = useState(null)

  // TAHAP 2: MEMILIH 4 LOG AKTIVITAS
  const [selectedActivityIds, setSelectedActivityIds] = useState([])

  const startTimeRef = useRef(Date.now())
  const username = localStorage.getItem('anemia_username') || 'Siswa'

  useEffect(() => {
    loadUserData()
  }, [])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const loadUserData = async () => {
    try {
      const { data: scoreData } = await supabase
        .from('game_scores')
        .select('skor')
        .eq('username', username)

      if (scoreData && scoreData.length > 0) {
        const sum = scoreData.reduce((acc, curr) => acc + (curr.skor || 0), 0)
        setTotalScore(sum)
      }

      const { data: existing } = await supabase
        .from('game_scores')
        .select('skor')
        .eq('username', username)
        .eq('kategori_game', misiId)
        .maybeSingle()

      if (existing) {
        setAlreadyCompleted(true)
        setExistingScore(existing.skor || 0)
      }
    } catch (err) {
      console.error('Error loading user data:', err.message)
    }
  }

  const saveScoreToSupabase = async (finalScore = earnedScore) => {
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
      console.error('Gagal menyimpan skor:', err.message)
    }
  }

  // KLIK TITIK PADA KARAKTER (TAHAP 1)
  const handleSpotClick = (symptom) => {
    if (!discoveredSymptoms.includes(symptom.id)) {
      playAudioFeedback('correct')
      setDiscoveredSymptoms(prev => [...prev, symptom.id])
    } else {
      playAudioFeedback('click')
    }
    setActivePopupSymptom(symptom)
  }

  // LANJUT DARI TAHAP 1 KE TAHAP 2
  const handleGoToMatchCauses = () => {
    if (discoveredSymptoms.length < 4) {
      playAudioFeedback('wrong')
      showToast('Temukan semua 4 gejala pada tubuh siswi terlebih dahulu!')
      return
    }
    playAudioFeedback('cring')
    setStage('match_causes')
  }

  // KLIK OPSI KARTU LOG AKTIVITAS (TAHAP 2)
  const handleToggleActivityOption = (optionId) => {
    if (isSubmitted) return
    playAudioFeedback('click')

    if (selectedActivityIds.includes(optionId)) {
      setSelectedActivityIds(prev => prev.filter(id => id !== optionId))
    } else {
      if (selectedActivityIds.length >= 4) {
        playAudioFeedback('wrong')
        showToast('Kamu hanya dapat memilih maksimal 4 aktivitas penyebab!')
        return
      }
      setSelectedActivityIds(prev => [...prev, optionId])
    }
  }

  // SUBMIT HASIL EVALUASI (TAHAP 2)
  const handleSubmitFinalAnalysis = () => {
    if (selectedActivityIds.length < 4) {
      playAudioFeedback('wrong')
      showToast(`Pilih 4 aktivitas penyebab! (Saat ini: ${selectedActivityIds.length}/4)`)
      return
    }

    let correctCount = 0
    selectedActivityIds.forEach(id => {
      const opt = MATCHING_OPTIONS.find(o => o.id === id)
      if (opt && opt.isCause) correctCount++
    })

    const finalPoints = Math.round((correctCount / 4) * 100)
    setEarnedScore(finalPoints)
    setIsSubmitted(true)

    if (finalPoints >= 75) {
      playAudioFeedback('cring')
    } else {
      playAudioFeedback('wrong')
    }

    saveScoreToSupabase(finalPoints)
    setShowScoreModal(true)
  }

  return (
    <div className="relative w-dvw h-dvh overflow-hidden select-none font-sans bg-[#1B122C]">
      
      {/* BACKGROUND PAPAN UNGU */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: `url("${bgTexture}")` }}
      />

      {/* FRAME KONTEN FIT SCREEN LANDSCAPE */}
      <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
        
        {/* HEADER TOP BAR DENGAN TITLE LEVEL D */}
        <div className="relative z-30 flex items-center justify-between w-full px-3 py-1 bg-[#1E1236]/90 backdrop-blur-md border-b-2 border-purple-400/30 shadow-md">
          <button
            onClick={() => {
              playAudioFeedback('click')
              onBack && onBack()
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs border border-white/20 cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Keluar</span>
          </button>

          <div className="text-center">
            <h1 className="text-white font-black text-xs sm:text-sm md:text-base leading-tight tracking-wide drop-shadow flex items-center gap-1.5 justify-center">
              <span>🕵️‍♀️</span> GAME 4: MISI DETEKTIF TANDA &amp; GEJALA ANEMIA (LEVEL D)
            </h1>
            <p className="text-purple-200 text-[9px] sm:text-[10px] font-semibold">
              Identifikasi 4 Tanda Gejala Klinis &amp; Hubungkan Aktivitas Pemicunya
            </p>
          </div>

          <div className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full border border-white shadow">
            Skor: {totalScore} PTS
          </div>
        </div>

        {/* TOAST MESSAGE */}
        {toastMessage && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 font-black text-xs px-4 py-2 rounded-full shadow-2xl border-2 border-white animate-bounce">
            {toastMessage}
          </div>
        )}

        {/* =========================================================================
            PROTEKSI 1X PERCOBAAN
           ========================================================================= */}
        {alreadyCompleted && !isSubmitted && stage !== 'completed' && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border-4 border-amber-400 flex flex-col items-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-3 text-2xl shadow-inner text-emerald-600 font-bold">
                ✔
              </div>
              <h2 className="text-[#003049] font-black text-lg sm:text-xl mb-1">MISI LEVEL D TELAH SELESAI</h2>
              <p className="text-slate-600 text-xs mb-3">
                Kamu sudah menyelesaikan Misi Detektif Gejala sebelumnya dengan perolehan:
              </p>
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl py-2 px-6 mb-4 w-full">
                <span className="text-emerald-800 font-black text-2xl">{existingScore} PTS</span>
              </div>
              <p className="text-slate-500 text-[11px] mb-4">Setiap misi hanya dapat diakses 1 kali percobaan.</p>
              <button
                onClick={onBack}
                className="w-full bg-[#003049] hover:bg-[#002233] text-white font-bold py-2.5 px-4 rounded-full shadow text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
              >
                Kembali ke Menu Misi
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAHAP 1: IDENTIFIKASI 4 GEJALA ANEMIA
           ========================================================================= */}
        {stage === 'identify' && (
          <div className="relative w-full h-full flex-1">
            
            {/* 1. BANNER MISI ATAS */}
            <div className="absolute top-[2%] left-1/2 -translate-x-1/2 w-[88%] max-w-[1280px] pointer-events-none flex justify-center">
              <img
                src={bannerMisiCrop}
                alt="Misi Detektif: Identifikasilah 4 tanda & gejala anemia!"
                className="w-full h-auto max-h-[15vh] object-contain drop-shadow-md"
              />
            </div>

            {/* 2. PAPAN CLIPBOARD KIRI */}
            <div className="absolute left-[6%] top-[25%] w-[30%] max-w-[340px] h-[65%] flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={berhasilTercatatCrop}
                  alt="Berhasil Tercatat"
                  className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
                />
                <div className="absolute top-[16%] left-[28%] w-[44%] h-[9.5%] flex items-center justify-center pointer-events-none">
                  <span className="text-white font-black text-xs sm:text-sm md:text-base tracking-wider leading-none drop-shadow-sm">
                    {discoveredSymptoms.length}/4
                  </span>
                </div>
              </div>
            </div>

            {/* 3. KARAKTER SISWI DENGAN 4 TITIK SENTUH */}
            <div className="absolute left-[38%] top-[22%] h-[74%] aspect-[404/1027]">
              <img
                src={karakterSiswiCrop}
                alt="Siswi Mengalami Anemia"
                className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)] pointer-events-none animate-heartbeat"
              />

              {SYMPTOMS_DATA.map((symptom) => {
                const isFound = discoveredSymptoms.includes(symptom.id)
                return (
                  <button
                    key={symptom.id}
                    onClick={() => handleSpotClick(symptom)}
                    style={{ top: symptom.pos.top, left: symptom.pos.left }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-[24%] aspect-square cursor-pointer transition-transform duration-150 hover:scale-115 active:scale-95 focus:outline-none"
                    title={symptom.name}
                  >
                    <div className="relative w-full h-full">
                      <img
                        src={tombolKlikImg}
                        alt={`Periksa ${symptom.name}`}
                        className={`w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] ${
                          !isFound ? 'animate-pulse' : ''
                        }`}
                      />
                      {isFound && (
                        <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs font-black border-2 border-white shadow-md">
                          ✓
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* 4. POPUP KANAN SAAT TITIK DIKLIK */}
            {activePopupSymptom && (
              <div className="absolute right-[4%] top-[22%] w-[31%] max-w-[340px] aspect-[1446/964] z-30 animate-in zoom-in-95 duration-150">
                <div className="relative w-full h-full">
                  <div className="absolute top-[4%] left-[5%] z-40 bg-emerald-600 text-white font-black text-[9px] sm:text-[11px] px-2 py-0.5 rounded-lg border border-emerald-300 shadow-md animate-stamp">
                    ✓ TERDETEKSI!
                  </div>
                  <img
                    src={activePopupSymptom.modalImg}
                    alt={activePopupSymptom.name}
                    className="w-full h-full object-contain drop-shadow-[0_14px_35px_rgba(0,0,0,0.55)] cursor-pointer"
                    onClick={() => setActivePopupSymptom(null)}
                    title="Klik untuk menutup popup"
                  />
                  <button
                    onClick={() => setActivePopupSymptom(null)}
                    className="absolute top-[4%] right-[4%] w-[12%] h-[18%] cursor-pointer hover:bg-black/10 rounded-full"
                    title="Tutup Popup"
                  />
                </div>
              </div>
            )}

            {/* 5. TOMBOL SELANJUTNYA */}
            {discoveredSymptoms.length === 4 && (
              <div className="absolute right-[6%] bottom-[5%] z-40 animate-bounce">
                <button
                  onClick={handleGoToMatchCauses}
                  className="cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none"
                >
                  <img
                    src={selanjutnyaCrop}
                    alt="Selanjutnya"
                    className="w-36 sm:w-44 md:w-52 h-auto object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
                  />
                </button>
              </div>
            )}

          </div>
        )}

        {/* =========================================================================
            TAHAP 2: BUKU CATATAN DETEKTIF (ANALISIS LOG PENYEBAB ANEMIA)
           ========================================================================= */}
        {stage === 'match_causes' && (
          <div className="relative w-full flex-1 max-w-4xl mx-auto my-1 bg-white/95 rounded-2xl p-2.5 sm:p-4 shadow-2xl border-3 border-purple-500 flex flex-col justify-between overflow-hidden">
            
            {/* HEADER TAHAP 2 */}
            <div className="flex items-center justify-between pb-1 border-b border-purple-200">
              <div className="text-left">
                <span className="text-[9px] font-black uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  TAHAP 2: IDENTIFIKASI PENYEBAB
                </span>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">
                  Pilihlah 4 Aktivitas yang Menjadi Pemicu Gejala Anemia Siswi!
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-extrabold text-purple-900 bg-purple-50 border border-purple-300 px-2.5 py-1 rounded-xl">
                  Terpilih: {selectedActivityIds.length}/4
                </span>
              </div>
            </div>

            {/* DAFTAR KARTU AKTIVITAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 my-1 overflow-y-auto max-h-[60vh] pr-1">
              {MATCHING_OPTIONS.map((opt) => {
                const isSelected = selectedActivityIds.includes(opt.id)
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleToggleActivityOption(opt.id)}
                    className={`p-2 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg shrink-0">{opt.icon}</span>
                      <div className="text-left flex-1 min-w-0">
                        <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-900 block leading-snug">
                          {opt.title}
                        </span>
                        {isSubmitted && (
                          <div className={`mt-1 text-[8.5px] p-1.5 rounded-lg border font-semibold ${
                            opt.isCause
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                              : 'bg-rose-50 border-rose-300 text-rose-900'
                          }`}>
                            <span className="font-black uppercase block mb-0.5">
                              {opt.isCause ? '✓ PENYEBAB ANEMIA' : '✕ BUKAN PENYEBAB'}
                            </span>
                            {opt.bioExplanation}
                          </div>
                        )}
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        isSelected ? 'bg-purple-600 text-white' : 'border border-slate-300 text-transparent'
                      }`}>
                        ✓
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* FOOTER BUTTONS */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              {!isSubmitted ? (
                <button
                  onClick={handleSubmitFinalAnalysis}
                  className="w-full sm:w-auto bg-[#4338CA] hover:bg-[#3730A3] active:scale-95 text-white font-extrabold text-[11px] sm:text-xs px-8 sm:px-12 py-2 rounded-full shadow-lg transition-all cursor-pointer uppercase tracking-wider mx-auto flex items-center justify-center gap-2"
                >
                  <span>🚀</span>
                  <span>SUBMIT ANALISIS DETEKTIF</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="w-full py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-300"
                >
                  <span>Lanjut (Lihat Balapan Skor 🏁)</span>
                  <span className="text-base font-black">➔</span>
                </button>
              )}
            </div>

          </div>
        )}

        {/* =========================================================================
            POPUP HASIL SKOR DETEKTIF
           ========================================================================= */}
        {showScoreModal && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 max-w-sm sm:max-w-md w-full text-center shadow-2xl border-4 border-amber-400 flex flex-col items-center animate-in zoom-in duration-200 max-h-[92dvh] overflow-y-auto custom-scrollbar my-auto">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-1 text-2xl shadow-inner flex-shrink-0">
                🕵️‍♀️
              </div>
              
              <h2 className="text-[#003049] font-black text-sm sm:text-base mb-1 uppercase tracking-wide">
                HASIL EVALUASI INVESTIGASI (LEVEL D)
              </h2>
              
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 px-3 sm:px-4 mb-2 flex items-center justify-between w-full">
                <div className="text-left">
                  <span className="text-slate-600 font-bold text-[10px] sm:text-xs block">
                    Skor Detektif Medis:
                  </span>
                  <span className="text-amber-700 font-black text-[10px] sm:text-xs">
                    {earnedScore >= 100 ? '⭐⭐⭐ Detektif Medis Handal' : earnedScore >= 75 ? '⭐⭐ Detektif Medis Teliti' : '⭐ Detektif Pemula'}
                  </span>
                </div>
                <span className="text-amber-600 font-black text-xl sm:text-2xl">
                  {earnedScore} PTS
                </span>
              </div>

              {/* GELAR DETEKTIF MEDIS */}
              <div className="w-full mb-3 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-amber-950 font-black text-[10px] sm:text-[11px] shadow-sm border border-amber-300 flex items-center justify-center gap-1.5 animate-bounce">
                <span>🎖️</span>
                <span>GELAR: {earnedScore >= 100 ? 'DETEKTIF MEDIS CERMAT & TANGGAP' : 'DETEKTIF MEDIS PEMBELAJAR'}</span>
              </div>

              <div className="w-full flex flex-col gap-1.5 flex-shrink-0">
                <button
                  onClick={() => {
                    setShowScoreModal(false)
                    setShowLeaderboard(true)
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-slate-950 font-black py-2.5 px-4 rounded-full shadow-lg text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5 border border-amber-300"
                >
                  <span>Lanjut (Lihat Balapan Skor 🏁)</span>
                  <span className="text-sm font-black">➔</span>
                </button>

                <button
                  onClick={() => setShowScoreModal(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-extrabold py-2 px-4 rounded-full border border-slate-300 text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1"
                >
                  <span>🔍 Review Jawaban Buku</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL BALAPAN SKOR / LEADERBOARD */}
        <ScoreRaceLeaderboardModal
          isOpen={showLeaderboard}
          currentMissionId="misi_h1_d"
          currentMissionTitle="Misi D: Detektif Gejala"
          currentScore={earnedScore}
          nextMissionKey="E"
          nextMissionTitle="Misi E (Dokter Mandiri)"
          onNext={() => {
            onComplete && onComplete({ score: earnedScore, missionId: 'misi_h1_d', nextMission: 'e' })
          }}
          onBackToMenu={() => {
            onComplete && onComplete({ score: earnedScore, missionId: 'misi_h1_d' })
            onBack && onBack()
          }}
        />

      </div>
    </div>
  )
}
