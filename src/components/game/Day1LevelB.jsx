import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

// IMPORT ASET GAMBAR MISI 1B
import bgTexture from '../../assets/9. day 1 level B/background 9.png'
import bannerMisiCrop from '../../assets/9. day 1 level B/misi_crop.png'
import karakterSiswiCrop from '../../assets/9. day 1 level B/karakter_crop.png'
import berhasilTercatatCrop from '../../assets/9. day 1 level B/berhasil_tercatat_crop.png'
import selanjutnyaCrop from '../../assets/9. day 1 level B/selanjutnya_crop.png'
import tombolKlikImg from '../../assets/9. day 1 level B/tombol klik.png'

// MODAL IMAGES (UNTUK POPUP DITEMUKAN - GAMBAR 2)
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
const playAudioFeedback = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const now = ctx.currentTime

    if (type === 'click') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(480, now)
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.08)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.08)
    } else if (type === 'found') {
      const notes = [523.25, 659.25, 783.99, 1046.50]
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + idx * 0.07)
        gain.gain.setValueAtTime(0.25, now + idx * 0.07)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.18)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + idx * 0.07)
        osc.stop(now + idx * 0.07 + 0.18)
      })
    } else if (type === 'correct') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, now)
      osc.frequency.setValueAtTime(880, now + 0.1)
      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.35)
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(220, now)
      osc.frequency.setValueAtTime(164.81, now + 0.12)
      gain.gain.setValueAtTime(0.25, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.28)
    } else if (type === 'win') {
      const fanfare = [523.25, 659.25, 783.99, 1046.50, 1318.51]
      fanfare.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + idx * 0.1)
        gain.gain.setValueAtTime(0.3, now + idx * 0.1)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + idx * 0.1)
        osc.stop(now + idx * 0.1 + 0.35)
      })
    }
  } catch {
    // Autoplay policy browser
  }
}

// 4 DATA GEJALA SISWI DENGAN KOORDINAT PERSENTASE RELATIF TERHADAP KARAKTER (URUTAN PERSIS GAMBAR 2 & GAMBAR 1)
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

// DAFTAR 8 LOG AKTIVITAS (TAHAP 2: 4 PENYEBAB & 4 BUKAN PENYEBAB)
const LOG_ACTIVITIES_LIST = [
  {
    id: 'act_teh',
    text: 'Sering minum teh/kopi setelah makan',
    isCause: true
  },
  {
    id: 'act_vitc',
    text: 'Sering mengonsumsi vitamin C',
    isCause: false
  },
  {
    id: 'act_diet',
    text: 'Jarang mengonsumsi sumber makanan mengandung zat besi',
    isCause: true
  },
  {
    id: 'act_ttd',
    text: 'Tidak meminum Tablet Tambah Darah (TTD) saat menstruasi',
    isCause: true
  },
  {
    id: 'act_gula',
    text: 'Sering mengonsumsi makanan tinggi gula',
    isCause: false
  },
  {
    id: 'act_begadang',
    text: 'Sering tidur tengah malam (begadang)',
    isCause: true
  },
  {
    id: 'act_olahraga',
    text: 'Rutin olahraga ringan & istirahat teratur',
    isCause: false
  },
  {
    id: 'act_natrium',
    text: 'Sering mengonsumsi makanan tinggi natrium',
    isCause: false
  },
  {
    id: 'act_sayur',
    text: 'Sering mengonsumsi sayur bayam dan kangkung',
    isCause: false
  },
  {
    id: 'act_air',
    text: 'Minum air putih minimal 8 gelas sehari',
    isCause: false
  },
  {
    id: 'act_ekskul',
    text: 'Mengikuti kegiatan ekstrakurikuler sekolah',
    isCause: false
  }
]

// OPSI LOG AKTIVITAS DENGAN ALUR BIOLOGIS (TAHAP 2: BUKU CATATAN DETEKTIF)
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

function Day1LevelB({ onBack, onComplete }) {
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
        .eq('kategori_game', 'misi_h1_b')
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
          kategori_game: 'misi_h1_b',
          skor: finalScore,
          durasi_detik: durationSeconds
        }
      ])
      setTotalScore((prev) => prev + finalScore)
      setAlreadyCompleted(true)
      setExistingScore(finalScore)
    } catch (err) {
      console.error('Gagal menyimpan skor:', err.message)
    }
  }

  // TAHAP 1
  const handleSpotClick = (symptom) => {
    playAudioFeedback('click')
    if (!discoveredSymptoms.includes(symptom.id)) {
      playAudioFeedback('found')
      setDiscoveredSymptoms((prev) => [...prev, symptom.id])
    }
    setActivePopupSymptom(symptom)
  }

  const handleNextToStage2 = () => {
    if (discoveredSymptoms.length < 4) {
      showToast('Temukan seluruh 4 tanda dan gejala anemia terlebih dahulu!')
      return
    }
    playAudioFeedback('correct')
    setActivePopupSymptom(null)
    setStage('match_causes')
  }

  // TAHAP 2: TOGGLE MEMILIH 4 LOG AKTIVITAS
  const toggleActivitySelection = (id) => {
    if (isSubmitted) return // Kunci pilihan setelah submit
    playAudioFeedback('click')
    setSelectedActivityIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id)
      } else {
        if (prev.length >= 4) {
          showToast('Maksimal memilih 4 log aktivitas penyebab anemia!')
          return prev
        }
        return [...prev, id]
      }
    })
  }

  const handleSubmitFinalAnalysis = () => {
    if (selectedActivityIds.length < 4) {
      playAudioFeedback('wrong')
      showToast('Pilih 4 log aktivitas terlebih dahulu!')
      return
    }

    // Hitung berapa pilihan user yang merupakan penyebab anemia
    let correctCount = 0
    selectedActivityIds.forEach((id) => {
      const option = MATCHING_OPTIONS.find((o) => o.id === id)
      if (option && option.isCause) {
        correctCount++
      }
    })

    const calculatedScore = Math.round((correctCount / 4) * 100)
    setEarnedScore(calculatedScore)

    playAudioFeedback(correctCount > 2 ? 'win' : 'wrong')
    saveScoreToSupabase(calculatedScore)
    setIsSubmitted(true)
    setShowScoreModal(true)
  }

  return (
    <div
      className="w-dvw h-dvh overflow-hidden font-sans select-none relative flex items-center justify-center"
      style={{
        backgroundImage: `url("${bgTexture}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* FULL RESPONSIVE GAME CONTAINER - FULL LAYAR TANPA BLACK BAR */}
      <div className="relative w-full h-full max-w-[1440px] overflow-hidden">
        {/* TOMBOL KEMBALI DI POJOK KIRI ATAS */}
        <button
          onClick={() => {
            if (stage === 'match_causes') {
              setStage('identify')
            } else {
              onBack && onBack()
            }
          }}
          className="absolute top-[4%] left-[2.5%] z-40 text-white/90 hover:text-white p-1.5 bg-black/40 hover:bg-black/60 rounded-full transition-transform active:scale-90 cursor-pointer"
          title="Kembali"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        {/* TOAST NOTIFIKASI */}
        {toastMessage && (
          <div className="absolute top-[3%] left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 font-black text-xs sm:text-sm px-5 py-2 rounded-full shadow-2xl border-2 border-white animate-bounce max-w-[90%] text-center">
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
              <h2 className="text-[#003049] font-black text-lg sm:text-xl mb-1">MISI B TELAH SELESAI</h2>
              <p className="text-slate-600 text-xs mb-3">
                Kamu sudah menyelesaikan Misi Harian B sebelumnya dengan perolehan:
              </p>
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl py-2 px-6 mb-4 w-full">
                <span className="text-emerald-800 font-black text-2xl">{existingScore} PTS</span>
              </div>
              <p className="text-slate-500 text-[11px] mb-4">Setiap misi harian hanya dapat diakses 1 kali percobaan.</p>
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
            TAHAP 1: IDENTIFIKASI 4 GEJALA ANEMIA (PERSIS GAMBAR 1 & GAMBAR 2)
           ========================================================================= */}
        {stage === 'identify' && (
          <div className="relative w-full h-full">
            
            {/* 1. BANNER MISI ATAS */}
            <div className="absolute top-[4.5%] left-1/2 -translate-x-1/2 w-[88%] max-w-[1280px] pointer-events-none flex justify-center">
              <img
                src={bannerMisiCrop}
                alt="Misi Detektif: Identifikasilah 4 tanda & gejala anemia!"
                className="w-full h-auto max-h-[17vh] object-contain drop-shadow-md"
              />
            </div>

            {/* 2. PAPAN CLIPBOARD KIRI ("Berhasil Tercatat!") */}
            <div className="absolute left-[6%] top-[30%] w-[30%] max-w-[340px] h-[58%] flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={berhasilTercatatCrop}
                  alt="Berhasil Tercatat"
                  className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
                />

                {/* INDIKATOR 1/4 S/D 4/4 PAS DI DALAM KAPSUL MERAH */}
                <div className="absolute top-[16%] left-[28%] w-[44%] h-[9.5%] flex items-center justify-center pointer-events-none">
                  <span className="text-white font-black text-xs sm:text-sm md:text-base tracking-wider leading-none drop-shadow-sm">
                    {discoveredSymptoms.length}/4
                  </span>
                </div>
              </div>
            </div>

            {/* 3. KARAKTER SISWI DENGAN 4 TITIK SENTUH KUNING DI TENGAH */}
            <div className="absolute left-[38%] top-[25%] h-[72%] aspect-[404/1027]">
              {/* GAMBAR SISWI */}
              <img
                src={karakterSiswiCrop}
                alt="Siswi Mengalami Anemia"
                className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)] pointer-events-none"
              />

              {/* 4 TITIK SENTUH TOMBOL KLIK KUNING (SCALED BERSAMA KARAKTER) */}
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

            {/* 4. POPUP KANAN SAAT TITIK DIKLIK ("Ditemukan!" - DIPOSISIKAN BERSIH AGAR TIDAK MENABRAK TOMBOL SELANJUTNYA) */}
            {activePopupSymptom && (
              <div className="absolute right-[4%] top-[24%] w-[31%] max-w-[340px] aspect-[1446/964] z-30 animate-in zoom-in-95 duration-150">
                <div className="relative w-full h-full">
                  <img
                    src={activePopupSymptom.modalImg}
                    alt={activePopupSymptom.name}
                    className="w-full h-full object-contain drop-shadow-[0_14px_35px_rgba(0,0,0,0.55)] cursor-pointer"
                    onClick={() => setActivePopupSymptom(null)}
                    title="Klik untuk menutup popup"
                  />
                  {/* HOTSPOT TOMBOL "X" TRANSPARAN DI POJOK KANAN ATAS GAMBAR ASLI */}
                  <button
                    onClick={() => setActivePopupSymptom(null)}
                    className="absolute top-[2%] right-[2%] w-[18%] h-[24%] cursor-pointer focus:outline-none rounded-tr-3xl active:bg-white/20"
                    title="Tutup"
                  />
                </div>
              </div>
            )}

            {/* 5. TOMBOL SELANJUTNYA DI POJOK KANAN BAWAH (UKURAN PROPORSIONAL & TIDAK MENUTUPI POPUP) */}
            {discoveredSymptoms.length === 4 && (
              <div className="absolute right-[4.5%] bottom-[4.5%] z-30 flex justify-end">
                <button
                  onClick={handleNextToStage2}
                  className="cursor-pointer transition-transform duration-150 hover:scale-105 active:scale-95 animate-bounce"
                  title="Lanjut ke Log Aktivitas"
                >
                  <img
                    src={selanjutnyaCrop}
                    alt="SELANJUTNYA"
                    className="w-24 sm:w-32 md:w-40 max-w-[160px] h-auto object-contain drop-shadow-[0_6px_15px_rgba(0,0,0,0.5)]"
                  />
                </button>
              </div>
            )}

          </div>
        )}





        {/* =========================================================================
            TAHAP 3: BUKU CATATAN DETEKTIF - HASIL INVESTIGASI (GAMBAR 1 USER)
           ========================================================================= */}
        {/* =========================================================================
            TAHAP 2: BUKU CATATAN DETEKTIF - HASIL INVESTIGASI (MEMILIH JAWABAN)
           ========================================================================= */}
        {/* =========================================================================
            TAHAP 2: BUKU CATATAN DETEKTIF - HASIL INVESTIGASI (MEMILIH 4 PENYEBAB)
            {/* =========================================================================
            TAHAP 2: BUKU CATATAN DETEKTIF - HASIL INVESTIGASI (MEMILIH 4 PENYEBAB)
           ========================================================================= */}
        {stage === 'match_causes' && (
          <div className="relative w-full h-full pt-4 pb-2 px-2 sm:px-3 flex items-center justify-center">
            {/* PAPAN BUKU: 4 GEJALA & 8 LOG AKTIVITAS */}
            <div className="relative w-[96%] max-w-[1080px] h-[89%] max-h-[560px] bg-white rounded-2xl sm:rounded-3xl border-[4px] sm:border-[6px] border-[#3B82F6] shadow-[0_15px_40px_rgba(0,0,0,0.55)] p-2 sm:p-2.5 flex flex-col justify-between overflow-hidden">
              
              {/* CLIP KAYU ATAS */}
              <div className="absolute -top-3 sm:-top-3.5 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-4.5 sm:h-5.5 bg-[#D97706] rounded-t-lg border-2 border-[#B45309] shadow-sm flex items-center justify-center z-20">
                <div className="w-3 h-3 rounded-full border-2 border-white bg-white shadow-xs" />
              </div>

              {/* HEADER MODAL */}
              <div className="flex items-center justify-between border-b pb-1 border-slate-200 mt-0.5 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg">📋</span>
                  <h2 className="text-[#1E293B] font-black text-xs sm:text-sm uppercase tracking-wide">
                    {isSubmitted ? 'BUKU CATATAN DETEKTIF: REVIU HASIL INVESTIGASI' : 'BUKU CATATAN DETEKTIF: HASIL INVESTIGASI'}
                  </h2>
                </div>
                
                <div className="flex items-center gap-2">
                  {isSubmitted && (
                    <div className="bg-amber-100 text-amber-900 font-extrabold text-[9px] sm:text-[10px] px-3 py-0.5 rounded-full shadow-2xs">
                      Skor: {earnedScore} PTS
                    </div>
                  )}
                  <div className="bg-[#E0E7FF] text-[#4338CA] font-extrabold text-[9px] sm:text-[10px] px-3 py-0.5 rounded-full shadow-2xs">
                    Progress: {selectedActivityIds.length} / 4 Terpilih
                  </div>
                </div>
              </div>

              {/* DUA KOLOM: 4 GEJALA DITEMUKAN (TIDAK BISA DIKLIK) & 8 LOG AKTIVITAS */}
              <div className="grid grid-cols-12 gap-2 sm:gap-3 flex-1 min-h-0 my-1 items-stretch">
                
                {/* KOLOM KIRI: 4 GEJALA DITEMUKAN (STATIS / TIDAK BISA DIPILLH) */}
                <div className="col-span-5 flex flex-col justify-between gap-1 h-full min-h-0">
                  <span className="text-slate-500 font-bold text-[8px] sm:text-[9px] uppercase tracking-wider shrink-0 mb-0.2">
                    HASIL ANALISIS GEJALA:
                  </span>

                  {SYMPTOMS_DATA.map((symptom) => (
                    <div
                      key={symptom.id}
                      className="w-full px-2.5 py-1 sm:py-1.5 rounded-xl border border-slate-200 bg-white text-left flex items-center gap-2 flex-1 min-h-0 shadow-2xs"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-slate-100 shrink-0 shadow-2xs flex items-center justify-center overflow-hidden bg-white">
                        <img src={symptom.circleImg} className="w-full h-full object-cover" alt={symptom.name} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-[#1E3A8A] font-extrabold text-[9.5px] sm:text-[11px] truncate leading-tight">
                          {symptom.name}
                        </div>
                        
                        {symptom.subtitle && (
                          <div className="text-slate-400 font-medium text-[7px] sm:text-[8px] leading-none mt-0.2">
                            {symptom.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* GARIS PEMBATAS VERTIKAL & KOLOM KANAN: LOG AKTIVITAS */}
                <div className="col-span-7 flex flex-col gap-1 h-full min-h-0 pl-2 sm:pl-2.5 border-l-2 border-dashed border-slate-200">
                  <span className="text-slate-500 font-bold text-[8px] sm:text-[9px] uppercase tracking-wider shrink-0 mb-0.2">
                    {isSubmitted ? 'EVALUASI LOG AKTIVITAS (SEMUA OPSI):' : 'LOG AKTIVITAS (CENTANG 4 PENYEBAB GEJALA):'}
                  </span>

                  <div className="flex-1 overflow-y-auto pr-1 pb-1 flex flex-col gap-2 custom-scrollbar">
                    {MATCHING_OPTIONS.map((option) => {
                      const isChecked = selectedActivityIds.includes(option.id)
                      const isCause = option.isCause

                      // JIKA BELUM SUBMIT: TAMPILKAN CHECKBOX BIASA
                      if (!isSubmitted) {
                        return (
                          <div
                            key={option.id}
                            onClick={() => toggleActivitySelection(option.id)}
                            className={`rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 transition-all cursor-pointer flex-none flex items-center gap-2.5 ${
                              isChecked
                                ? 'border-2 border-[#2563EB] bg-blue-50/90 text-[#1E3A8A] shadow-xs'
                                : 'border border-rose-200 bg-white hover:bg-rose-50/40 text-slate-800'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-md flex items-center justify-center border shrink-0 transition-all ${
                                isChecked
                                  ? 'bg-[#2563EB] border-[#2563EB] text-white font-black'
                                  : 'border-2 border-slate-300 bg-white'
                              }`}
                            >
                              {isChecked && (
                                <svg className="w-2.5 h-2.5 stroke-[4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>

                            <span className="text-xs sm:text-base shrink-0">{option.icon}</span>
                            
                            <span className={`text-[9.5px] sm:text-[11px] font-bold leading-snug flex-1 ${isChecked ? 'text-[#1E3A8A]' : 'text-slate-800'}`}>
                              {option.title}
                            </span>
                          </div>
                        )
                      }

                      // JIKA SUDAH SUBMIT: TAMPILKAN HASIL EVALUASI PERSIS GAMBAR 3 UNTUK SELURUH OPSI (TERMASUK YANG TIDAK DIJAWAB)
                      let cardStyle = ''
                      let iconBg = ''
                      let iconSymbol = ''
                      let badgeTag = null
                      let boxStyle = ''
                      let boxTitleStyle = ''
                      let boxTextStyle = ''
                      let boxLabel = ''

                      if (isCause && isChecked) {
                        // 1. BENAR (Penyebab & Dicentang)
                        cardStyle = 'bg-[#F0FDF4] border-[#22C55E]'
                        iconBg = 'bg-[#10B981] text-white'
                        iconSymbol = '✓'
                        badgeTag = <span className="bg-[#10B981] text-white text-[7.5px] sm:text-[8.5px] font-black px-2 py-0.2 rounded-full shrink-0">✅ BENAR</span>
                        boxStyle = 'bg-[#DCFCE7] border-[#86EFAC] text-emerald-950'
                        boxTitleStyle = 'text-[#15803D]'
                        boxTextStyle = 'text-[#14532D]'
                        boxLabel = 'ALUR SEBAB-AKIBAT (HUBUNGAN BIOLOGIS):'
                      } else if (!isCause && isChecked) {
                        // 2. SALAH (Pengecoh & Dicentang)
                        cardStyle = 'bg-[#FEF2F2] border-[#EF4444]'
                        iconBg = 'bg-[#EF4444] text-white'
                        iconSymbol = '✕'
                        badgeTag = <span className="bg-[#EF4444] text-white text-[7.5px] sm:text-[8.5px] font-black px-2 py-0.2 rounded-full shrink-0">❌ SALAH (PENGECOH)</span>
                        boxStyle = 'bg-[#FFE4E6] border-[#FECDD3] text-rose-950'
                        boxTitleStyle = 'text-[#BE123C]'
                        boxTextStyle = 'text-[#881337]'
                        boxLabel = 'EVALUASI ANALISIS (ALUR BIOLOGIS):'
                      } else if (isCause && !isChecked) {
                        // 3. TERLEWAT (Penyebab tapi Tidak Dicentang)
                        cardStyle = 'bg-[#FFFBEB] border-[#F59E0B]'
                        iconBg = 'bg-[#F59E0B] text-white'
                        iconSymbol = '⚠️'
                        badgeTag = <span className="bg-[#F59E0B] text-white text-[7.5px] sm:text-[8.5px] font-black px-2 py-0.2 rounded-full shrink-0">⚠️ TERLEWAT (PENYEBAB)</span>
                        boxStyle = 'bg-[#FEF3C7] border-[#FDE68A] text-amber-950'
                        boxTitleStyle = 'text-[#B45309]'
                        boxTextStyle = 'text-[#78350F]'
                        boxLabel = 'ALUR SEBAB-AKIBAT (PENYEBAB ANEMIA):'
                      } else {
                        // 4. TEPAT DIHINDARI (Pengecoh & Tidak Dicentang)
                        cardStyle = 'bg-slate-50 border-slate-300'
                        iconBg = 'bg-slate-600 text-white'
                        iconSymbol = '✓'
                        badgeTag = <span className="bg-slate-600 text-white text-[7.5px] sm:text-[8.5px] font-black px-2 py-0.2 rounded-full shrink-0">✓ TIDAK BERHUBUNGAN</span>
                        boxStyle = 'bg-white border-slate-200 text-slate-900'
                        boxTitleStyle = 'text-slate-600'
                        boxTextStyle = 'text-slate-700'
                        boxLabel = 'PENJELASAN EVALUASI:'
                      }

                      return (
                        <div
                          key={option.id}
                          className={`p-1.5 sm:p-2 rounded-xl border transition-all shadow-xs flex-none flex flex-col ${cardStyle}`}
                        >
                          <div className="flex items-center justify-between gap-1.5 mb-0.5">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded font-black text-[10px] sm:text-xs flex items-center justify-center shrink-0 shadow-xs ${iconBg}`}>
                                {iconSymbol}
                              </div>
                              <span className="text-xs shrink-0">{option.icon}</span>
                              <span className="text-[9.5px] sm:text-[10.5px] font-black leading-tight text-slate-900 truncate">
                                {option.title}
                              </span>
                            </div>
                            {badgeTag}
                          </div>

                          {/* KARTU KETERANGAN EVALUASI PERSIS GAMBAR 3 */}
                          <div className={`mt-0.5 rounded-lg px-2 py-1 border ${boxStyle}`}>
                            <div className={`text-[7px] sm:text-[8px] font-black uppercase tracking-wider flex items-center gap-1 mb-0.5 ${boxTitleStyle}`}>
                              <span>💡</span>
                              <span>{boxLabel}</span>
                            </div>
                            <p className={`text-[8px] sm:text-[9px] font-bold leading-snug ${boxTextStyle}`}>
                              {option.bioExplanation}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>

              {/* FOOTER TAHAP 2 */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-slate-100 relative shrink-0">
                {!isSubmitted ? (
                  <button
                    onClick={handleSubmitFinalAnalysis}
                    className="w-full sm:w-auto bg-[#4338CA] hover:bg-[#3730A3] active:scale-95 text-white font-extrabold text-[11px] sm:text-xs px-8 sm:px-12 py-1.5 rounded-full shadow-lg transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <span>🚀</span>
                    <span>SUBMIT ANALISIS</span>
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-between gap-2">
                    <button
                      onClick={() => setShowScoreModal(true)}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] sm:text-xs px-4 py-1.5 rounded-full shadow transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>⭐ Lihat Skor Modal</span>
                    </button>

                    <button
                      onClick={() => {
                        onComplete && onComplete({ score: earnedScore, missionId: 'misi_h1_b' })
                        onBack && onBack()
                      }}
                      className="bg-[#800000] hover:bg-[#640000] text-white font-extrabold text-[10.5px] sm:text-xs px-6 sm:px-8 py-1.5 rounded-full shadow-lg transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      <span>🏠</span>
                      <span>BALIK KE MENU ➔</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            POPUP NILAI SKOR (RINGKAS & RESPONSIF LANDSCAPE)
           ========================================================================= */}
        {showScoreModal && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 max-w-sm sm:max-w-md w-full text-center shadow-2xl border-4 border-amber-400 flex flex-col items-center animate-in zoom-in duration-200 max-h-[92dvh] overflow-y-auto custom-scrollbar my-auto">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-amber-100 rounded-full flex items-center justify-center mb-1 text-xl sm:text-2xl shadow-inner flex-shrink-0">
                🕵️‍♀️
              </div>
              
              <h2 className="text-[#003049] font-black text-sm sm:text-base mb-1 uppercase tracking-wide">
                HASIL EVALUASI INVESTIGASI
              </h2>
              
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 px-3 sm:px-4 mb-2.5 flex items-center justify-between w-full">
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

              <div className="w-full flex flex-col gap-1.5 flex-shrink-0">
                <button
                  onClick={() => setShowScoreModal(false)}
                  className="w-full bg-[#4338CA] hover:bg-[#3730A3] active:scale-95 text-white font-extrabold py-2 px-4 rounded-full shadow-md text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <span>🔍 CEK HASIL ANALISIS</span>
                </button>

                <button
                  onClick={() => {
                    onComplete && onComplete({ score: earnedScore, missionId: 'misi_h1_b' })
                    onBack && onBack()
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-extrabold py-2 px-4 rounded-full border border-slate-300 shadow-xs text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1"
                >
                  <span>SELESAI &amp; BALIK KE MENU ➔</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Day1LevelB
