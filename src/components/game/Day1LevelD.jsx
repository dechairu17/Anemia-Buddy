import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

// IMPORT ASET RESMI PROYEK
import mascotSiswi from '../../assets/9. day 1 level B/karakter.png'
import bgProfilPria from '../../assets/6/game home - profil pria_crop.png'
import bgProfilWanita from '../../assets/6/game home - profil wanita_crop.png'

// AUDIO SYNTHESIZER UNTUK SOUND EFFECT REAL-TIME
const playSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const now = ctx.currentTime

    if (type === 'click') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(450, now)
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.08)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.08)
    } else if (type === 'positive') {
      const notes = [523.25, 659.25, 783.99, 1046.50]
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + idx * 0.06)
        gain.gain.setValueAtTime(0.25, now + idx * 0.06)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.15)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + idx * 0.06)
        osc.stop(now + idx * 0.06 + 0.15)
      })
    } else if (type === 'neutral') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, now)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.15)
    } else if (type === 'win') {
      const fanfare = [523.25, 659.25, 783.99, 1046.50, 1318.51]
      fanfare.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + idx * 0.09)
        gain.gain.setValueAtTime(0.3, now + idx * 0.09)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.3)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + idx * 0.09)
        osc.stop(now + idx * 0.09 + 0.3)
      })
    }
  } catch {
    // Autoplay browser policy safe fallback
  }
}

// -----------------------------------------------------------------------------
// DATA SKENARIO PENELITIAN: SIKAP MENGHARGAI (PENYEBAB) & BERTANGGUNG JAWAB (GEJALA)
// -----------------------------------------------------------------------------
const SCENARIOS = [
  // ---------------- KELOMPOK 1: SIKAP MENGHARGAI INFORMASI PENYEBAB ANEMIA ----------------
  {
    id: 1,
    indicatorCategory: 'menghargai',
    indicatorTitle: 'Sikap Menghargai Informasi Penyebab Anemia',
    badge: 'Kasus 1: Pola Makan & Zat Besi',
    topic: 'Penyebab: Kurang Asupan Zat Besi',
    speaker: 'Raka (Teman Sekelas)',
    avatar: '👦',
    contextText: 'Raka curhat hendak melakukan diet ketat ekstrem dan hanya makan cemilan tanpa sayur atau lauk hewani karena menganggap makanan bernutrisi itu merepotkan.',
    promptText: 'Bagaimana sikapmu dalam menghargai informasi bahwa kekurangan asupan zat besi adalah penyebab utama anemia?',
    options: [
      {
        id: 'A',
        scoreMenghargai: 25,
        scoreTanggungJawab: 0,
        text: 'Menghargai informasi medis secara penuh: Mengingatkan Raka bahwa zat besi dari makanan bergizi adalah bahan baku utama sel darah merah agar tidak terkena anemia.',
        feedbackTitle: 'Sikap Menghargai Sangat Tinggi! (+25 PTS)',
        feedbackDesc: 'Kamu menjunjung tinggi nilai informasi penyebab anemia dan menggunakannya secara bijak untuk mencegah risiko kesehatan temanmu.',
        type: 'best'
      },
      {
        id: 'B',
        scoreMenghargai: 12,
        scoreTanggungJawab: 0,
        text: 'Mengetahui fakta tersebut penting, tetapi membiarkan Raka karena menganggap itu pilihan pribadinya.',
        feedbackTitle: 'Sikap Netral / Menimbang (+12 PTS)',
        feedbackDesc: 'Kamu paham akan informasinya, namun sikap menghargai informasi akan lebih bermakna jika berani disampaikan dengan baik.',
        type: 'medium'
      },
      {
        id: 'C',
        scoreMenghargai: 5,
        scoreTanggungJawab: 0,
        text: 'Mengabaikan fakta penyebab anemia dan mendukung diet tanpa nutrisi apa pun.',
        feedbackTitle: 'Kurang Menghargai Informasi (+5 PTS)',
        feedbackDesc: 'Mengabaikan fakta medis tentang zat besi dapat membahayakan pembentukan hemoglobin dalam tubuh.',
        type: 'low'
      }
    ]
  },
  {
    id: 2,
    indicatorCategory: 'menghargai',
    indicatorTitle: 'Sikap Menghargai Informasi Penyebab Anemia',
    badge: 'Kasus 2: Minum Teh & Penyerapan Besi',
    topic: 'Penyebab: Penghambat Penyerapan Zat Besi',
    speaker: 'Dito (Teman di Kantin)',
    avatar: '🥤',
    contextText: 'Dito terbiasa langsung meminum es teh manis kental setelah makan daging atau telur. Ketika diingatkan bahwa tanin dalam teh menghambat penyerapan zat besi, ia berkata: "Ah, itu cuma info berlebihan!"',
    promptText: 'Bagaimana sikapmu dalam menghargai informasi ilmiah mengenai penyebab hambatan penyerapan zat besi ini?',
    options: [
      {
        id: 'A',
        scoreMenghargai: 25,
        scoreTanggungJawab: 0,
        text: 'Menghargai bukti ilmiah: Menjelaskan dengan santun bahwa senyawa tanin memang terbukti mengikat zat besi, serta membiasakan diri memberi jeda 1-2 jam setelah makan.',
        feedbackTitle: 'Sikap Menghargai Sangat Baik! (+25 PTS)',
        feedbackDesc: 'Luar biasa! Sikap menghargai fakta ilmiah ini terbukti mampu mengoptimalkan penyerapan zat besi ke dalam sirkulasi darah.',
        type: 'best'
      },
      {
        id: 'B',
        scoreMenghargai: 12,
        scoreTanggungJawab: 0,
        text: 'Mempercayai info tersebut tetapi ragu menerapkannya karena sudah terlanjur suka minum teh manis sehabis makan.',
        feedbackTitle: 'Cukup Menghargai (+12 PTS)',
        feedbackDesc: 'Kamu mengakui kebenarannya. Langkah selanjutnya adalah membiasakan minum air putih atau jus bervitamin C saat makan.',
        type: 'medium'
      },
      {
        id: 'C',
        scoreMenghargai: 5,
        scoreTanggungJawab: 0,
        text: 'Ikut mengabaikan informasi dan tetap meminum teh pekat setiap selesai makan besar.',
        feedbackTitle: 'Kurang Menghargai Fakta Medis (+5 PTS)',
        feedbackDesc: 'Meremehkan faktor penghambat penyerapan zat besi merupakan salah satu pemicu utama anemia pada remaja usia sekolah.',
        type: 'low'
      }
    ]
  },

  // ---------------- KELOMPOK 2: SIKAP BERTANGGUNG JAWAB ATAS TANDA GEJALA ANEMIA ----------------
  {
    id: 3,
    indicatorCategory: 'tanggung_jawab',
    indicatorTitle: 'Sikap Bertanggung Jawab atas Informasi Tanda Gejala Anemia',
    badge: 'Kasus 3: Teman Mengalami Gejala di Kelas',
    topic: 'Tanda Gejala: 5L & Wajah Pucat',
    speaker: 'Nisa (Teman Sebangku)',
    avatar: '👧',
    contextText: 'Nisa tampak pucat pada kelopak mata dan bibir, sering menunduk lemas (gejala 5L), serta mengaku pusing berkunang-kunang saat menyimak pelajaran.',
    promptText: 'Sebagai siswa yang mengetahui informasi tanda gejala anemia, apa bentuk tanggung jawab yang kamu tunjukkan?',
    options: [
      {
        id: 'A',
        scoreMenghargai: 0,
        scoreTanggungJawab: 25,
        text: 'Bertanggung jawab secara aktif: Mengajak Nisa ke UKS, melapor ke guru piket, dan menyarankannya mengonsumsi Tablet Tambah Darah (TTD) serta makanan bergizi.',
        feedbackTitle: 'Tanggung Jawab Teladan! (+25 PTS)',
        feedbackDesc: 'Tindakanmu mencerminkan tanggung jawab sosial dan kepedulian nyata berbekal pemahaman tanda gejala anemia.',
        type: 'best'
      },
      {
        id: 'B',
        scoreMenghargai: 0,
        scoreTanggungJawab: 12,
        text: 'Menanyakan keadaannya sekilas, lalu membiarkannya tidur di meja kelas tanpa mencari bantuan medis UKS.',
        feedbackTitle: 'Tanggung Jawab Terbatas (+12 PTS)',
        feedbackDesc: 'Kamu peduli, namun membiarkan teman tanpa bantuan saat ada tanda gejala anemia bisa memperparah kondisinya.',
        type: 'medium'
      },
      {
        id: 'C',
        scoreMenghargai: 0,
        scoreTanggungJawab: 5,
        text: 'Mengabaikannya dan menganggap Nisa hanya pura-pura lelah agar tidak mengikuti tugas.',
        feedbackTitle: 'Tidak Bertanggung Jawab (+5 PTS)',
        feedbackDesc: 'Menyepelekan tanda gejala klinis 5L dan pucat dapat menghambat pertolongan pertama bagi penderita anemia.',
        type: 'low'
      }
    ]
  },
  {
    id: 4,
    indicatorCategory: 'tanggung_jawab',
    indicatorTitle: 'Sikap Bertanggung Jawab atas Informasi Tanda Gejala Anemia',
    badge: 'Kasus 4: Bertanggung Jawab pada Diri Sendiri & Komitmen',
    topic: 'Tanda Gejala: Cepat Lelah & Sulit Konsentrasi',
    speaker: 'Refleksi Diri Sendiri',
    avatar: '🩺',
    contextText: 'Kamu mulai merasakan tanda gejala anemia pada dirimu sendiri: sering mengantuk di kelas meski tidur cukup, napas tersengal saat olahraga ringan, dan kuku tampak rapuh/pucat.',
    promptText: 'Bagaimana komitmen sikap tanggung jawabmu atas informasi tanda gejala yang kamu ketahui terhadap kesehatan tubuhmu sendiri?',
    options: [
      {
        id: 'A',
        scoreMenghargai: 0,
        scoreTanggungJawab: 25,
        text: 'Bertanggung jawab penuh: Segera melapor ke orang tua/UKS untuk cek darah Hb, rutin minum Tablet Tambah Darah (TTD) seminggu sekali, dan memperbanyak lauk hewani kaya zat besi.',
        feedbackTitle: 'Tanggung Jawab Diri Sangat Tinggi! (+25 PTS)',
        feedbackDesc: 'Kamu membuktikan tanggung jawab moral dan personal dalam menjaga kesehatan diri agar sel darah merah Hemo selalu sehat prima!',
        type: 'best'
      },
      {
        id: 'B',
        scoreMenghargai: 0,
        scoreTanggungJawab: 12,
        text: 'Mengetahui itu tanda anemia, tetapi menunda periksa dan hanya berharap gejalanya hilang sendiri.',
        feedbackTitle: 'Tanggung Jawab Pasif (+12 PTS)',
        feedbackDesc: 'Menunda tindakan atas tanda gejala yang sudah dikenali bisa menyebabkan kadar Hb semakin merosot.',
        type: 'medium'
      },
      {
        id: 'C',
        scoreMenghargai: 0,
        scoreTanggungJawab: 5,
        text: 'Mengabaikan seluruh tanda gejala tersebut dan tetap begadang serta mengonsumsi junk food.',
        feedbackTitle: 'Lalai Terhadap Kesehatan Diri (+5 PTS)',
        feedbackDesc: 'Sikap abai terhadap tanda gejala anemia merugikan konsentrasi belajar dan prestasi di sekolah.',
        type: 'low'
      }
    ]
  }
]

export default function Day1LevelD({ onBack, onComplete, misiId = 'misi_h1_d' }) {
  // STAGE: 'intro' | 'playing' | 'completed'
  const [stage, setStage] = useState('intro')
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0)

  const [gender, setGender] = useState('male')
  const [totalUserScore, setTotalUserScore] = useState(0)

  // SKOR RISET SIKAP (TOTAL MAKS 100 PTS)
  const [scoreMenghargai, setScoreMenghargai] = useState(0) // Maks 50 PTS
  const [scoreTanggungJawab, setScoreTanggungJawab] = useState(0) // Maks 50 PTS

  // MODAL FEEDBACK SKENARIO
  const [activeFeedback, setActiveFeedback] = useState(null)

  // STATE PROTEKSI PENELITIAN (1X MAIN)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)
  const [existingScore, setExistingScore] = useState(0)

  const username = localStorage.getItem('anemia_username') || 'Siswa'
  const startTimeRef = useRef(Date.now())

  // LOAD USER PROFILE & SKOR PREVIOUS
  useEffect(() => {
    loadUserData()
  }, [])

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
        setTotalUserScore(sum)

        const existing = scoreData.find(item => item.kategori_game === misiId)
        if (existing) {
          setAlreadyCompleted(true)
          setExistingScore(existing.skor || 0)
        }
      }
    } catch (err) {
      console.error('Gagal memuat profil Supabase:', err.message)
    }
  }

  // SIMPAN SKOR AKHIR SIKAP KE DATABASE SUPABASE
  const saveScoreToDatabase = async (finalTotal) => {
    try {
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
      await supabase.from('game_scores').insert([
        {
          username: username,
          kategori_game: misiId,
          skor: finalTotal,
          durasi_detik: durationSeconds
        }
      ])
      setTotalUserScore(prev => prev + finalTotal)
      setAlreadyCompleted(true)
      setExistingScore(finalTotal)
    } catch (err) {
      console.error('Gagal menyimpan skor sikap ke Supabase:', err.message)
    }
  }

  // PILIH RESPON DALAM SKENARIO
  const handleSelectOption = (option) => {
    playSound('click')
    if (option.type === 'best') playSound('positive')
    else playSound('neutral')

    setScoreMenghargai(prev => prev + option.scoreMenghargai)
    setScoreTanggungJawab(prev => prev + option.scoreTanggungJawab)

    setActiveFeedback({
      option,
      scenario: SCENARIOS[currentScenarioIndex]
    })
  }

  // LANJUT KE SKENARIO BERIKUTNYA ATAU KE LAYAR SELESAI
  const handleNextScenario = () => {
    setActiveFeedback(null)
    if (currentScenarioIndex + 1 < SCENARIOS.length) {
      setCurrentScenarioIndex(prev => prev + 1)
    } else {
      playSound('win')
      const finalSum = Math.min(100, Math.max(20, scoreMenghargai + scoreTanggungJawab))
      saveScoreToDatabase(finalSum)
      setStage('completed')
    }
  }

  const currentScenario = SCENARIOS[currentScenarioIndex]
  const totalEarnedScore = Math.min(100, scoreMenghargai + scoreTanggungJawab)

  // STATUS KESEHATAN HEMO SESUAI SKOR
  const getHemoMood = () => {
    if (totalEarnedScore >= 80) return { icon: '🩸✨', text: 'Sangat Sehat & Bugar', color: 'text-emerald-600', badge: 'bg-emerald-100' }
    if (totalEarnedScore >= 50) return { icon: '🩸👍', text: 'Cukup Bertenaga', color: 'text-teal-600', badge: 'bg-teal-100' }
    return { icon: '🩸🥺', text: 'Butuh Perhatian Medis', color: 'text-rose-600', badge: 'bg-rose-100' }
  }

  const hemoState = getHemoMood()

  return (
    <div className="relative w-dvw h-dvh bg-gradient-to-b from-[#062B26] via-[#0B3D35] to-[#041D1A] overflow-hidden font-sans select-none flex flex-col justify-between">
      {/* DEKORASI AMBIENT GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(13,148,136,0.14),transparent_70%)] pointer-events-none" />

      {/* =========================================================================
          TOP BAR NAVIGASI & PROFIL SISWA
         ========================================================================= */}
      <div className="relative z-30 flex items-center justify-between w-full px-3 py-1 sm:px-4 sm:py-1.5 bg-[#0B4F48]/95 backdrop-blur-md border-b-2 border-teal-400/30 shadow-md flex-shrink-0">
        {/* TOMBOL KEMBALI (HANYA MUNCUL DI MENU AWAL, HILANG SAAT SEDANG BERMAIN) */}
        {stage === 'intro' ? (
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

        {/* TITLE INDIKATOR PENELITIAN */}
        <div className="text-left">
          <h1 className="text-white font-black text-xs sm:text-sm md:text-base leading-tight tracking-wide drop-shadow-md flex items-center gap-1.5">
            <span>🩺</span> GAME 4: EVALUASI SIKAP MENGENAI ANEMIA
          </h1>
          <p className="text-teal-200 text-[9px] sm:text-[10px] font-semibold">
            Sikap Menghargai (Penyebab) &amp; Bertanggung Jawab (Tanda Gejala)
          </p>
        </div>

        {/* PROFIL SISWA & SKOR DATABASE */}
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
          KONTEN BERDASARKAN TAHAP PERMAINAN (FIT & RESPONSIVE LANDSCAPE)
         ========================================================================= */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center p-1 sm:p-2.5 overflow-y-auto custom-scrollbar">

        {/* -----------------------------------------------------------------------
            STAGE 0: MENU AWAL (INTRO INDIKATOR SIKAP - RESPONSIF LANDSCAPE HP)
           ----------------------------------------------------------------------- */}
        {stage === 'intro' && (
          <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-2xl border-3 border-teal-500 flex flex-col items-center animate-fadeIn max-h-[92dvh] overflow-y-auto custom-scrollbar my-auto">
            <div className="w-full flex flex-col gap-2 text-left">
              <div className="bg-[#F0FDF4] border border-emerald-300 rounded-xl p-2 shadow-xs">
                <div className="text-emerald-950 font-black text-xs sm:text-sm flex items-center gap-1.5">
                  <span>📋</span> Rubrik Penilaian Sikap Mengenai Anemia (Penelitian)
                </div>
                <p className="text-emerald-800 text-[10px] sm:text-xs font-medium mt-0.5 leading-snug">
                  Uji sikapmu melalui 4 skenario situasional nyata seputar penyebab dan tanda gejala anemia.
                </p>
              </div>

              {/* 2 KARTU INDIKATOR */}
              <div className="flex flex-col gap-1.5">
                <div className="p-2 rounded-xl bg-teal-50 border border-teal-300 flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0">
                    1
                  </span>
                  <div className="text-[10px] sm:text-[11px] font-extrabold text-teal-950 leading-tight">
                    <b>Sikap Menghargai:</b> Informasi seputar <span className="text-teal-700">Penyebab Anemia</span> (Maks 50 PTS)
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0">
                    2
                  </span>
                  <div className="text-[10px] sm:text-[11px] font-extrabold text-emerald-950 leading-tight">
                    <b>Sikap Bertanggung Jawab:</b> Tindakan atas <span className="text-emerald-700">Tanda Gejala Anemia</span> (Maks 50 PTS)
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (alreadyCompleted) return
                  playSound('click')
                  setStage('playing')
                }}
                className={`mt-1 w-full py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 ${
                  alreadyCompleted
                    ? 'bg-slate-400 text-slate-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white cursor-pointer active:scale-95 border border-teal-400'
                }`}
              >
                <span>Mulai Evaluasi Sikap ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            STAGE 1: BERMAIN GAME AKSI DOKTER (SKENARIO 1 S/D 4)
           ----------------------------------------------------------------------- */}
        {stage === 'playing' && currentScenario && (
          <div className="w-full max-w-xl bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-2xl border-3 border-teal-500 flex flex-col items-center animate-fadeIn max-h-[94dvh] overflow-y-auto custom-scrollbar my-auto">
            {/* STATUS BAR VITALITAS PASIEN HEMO */}
            <div className="w-full flex items-center justify-between bg-slate-900 text-white rounded-lg px-2.5 py-1 shadow-xs flex-shrink-0 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🩸</span>
                <span className="font-black text-teal-300">
                  Pasien Hemo: <span className={hemoState.color}>{hemoState.text}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-slate-300">Vitalitas:</span>
                <div className="w-16 sm:w-24 h-2 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-500"
                    style={{ width: `${Math.max(15, totalEarnedScore)}%` }}
                  />
                </div>
                <span className="font-black text-amber-300">{totalEarnedScore} PTS</span>
              </div>
            </div>

            {/* HEADER KASUS & TARGET INDIKATOR */}
            <div className="w-full flex items-center justify-between bg-slate-100 rounded-lg px-2 py-0.5 border border-slate-200 mt-1 flex-shrink-0 text-[9.5px]">
              <span className="font-black uppercase text-slate-800">
                {currentScenario.badge} ({currentScenarioIndex + 1}/{SCENARIOS.length})
              </span>
              <span className={`font-black px-1.5 py-0.2 rounded-full ${
                currentScenario.indicatorCategory === 'menghargai'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {currentScenario.indicatorCategory === 'menghargai' ? '⭐ Sikap Menghargai' : '🛡️ Sikap Bertanggung Jawab'}
              </span>
            </div>

            {/* BUBBLE KASUS PASIEN / REKAN */}
            <div className="my-1 p-1.5 sm:p-2 rounded-xl bg-teal-50/90 border border-teal-200 w-full text-left flex items-start gap-2 flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-200 border border-teal-300 flex items-center justify-center text-sm sm:text-base flex-shrink-0 shadow-inner">
                {currentScenario.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between leading-tight">
                  <span className="text-[9.5px] font-black text-teal-800 uppercase tracking-wider">
                    {currentScenario.speaker}
                  </span>
                  <span className="text-[8.5px] font-semibold text-slate-500">
                    Fokus: {currentScenario.topic}
                  </span>
                </div>
                <p className="text-slate-800 text-[10px] sm:text-[11px] font-medium leading-snug mt-0.5">
                  "{currentScenario.contextText}"
                </p>
              </div>
            </div>

            {/* PERTANYAAN AKSI DOKTER */}
            <div className="w-full text-left my-0.5 flex-shrink-0">
              <span className="text-[10px] sm:text-[11px] font-black text-slate-900 flex items-center gap-1">
                <span>🩺</span> <b>Pilih Tindakan Sikap Terbaikmu:</b>
              </span>
            </div>

            {/* KARTU AKSI DOKTER (PILIHAN RESPON INTERAKTIF - SELALU TERBUKA & DAPAT DIAKSES) */}
            <div className="w-full flex-1 min-h-[110px] overflow-y-auto custom-scrollbar flex flex-col gap-1.5 my-0.5 pr-0.5">
              {currentScenario.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt)}
                  className="w-full p-2 rounded-xl bg-white hover:bg-teal-50 active:scale-98 border-2 border-slate-200 hover:border-teal-400 text-left transition-all cursor-pointer shadow-xs flex items-center gap-2 group"
                >
                  <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-teal-700 to-emerald-600 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    {opt.id}
                  </span>
                  <span className="text-[10.5px] sm:text-[11.5px] font-bold text-slate-800 group-hover:text-teal-950 leading-tight">
                    {opt.text}
                  </span>
                </button>
              ))}
            </div>

            {/* MINI STATUS BAR PENELITIAN */}
            <div className="w-full flex items-center justify-between pt-1 border-t border-slate-200 text-[8.5px] sm:text-[9.5px] text-slate-600 font-bold flex-shrink-0">
              <div>Sikap Menghargai: {scoreMenghargai}/50 PTS</div>
              <div>Bertanggung Jawab: {scoreTanggungJawab}/50 PTS</div>
              <div className="text-emerald-700 font-extrabold">Total: {totalEarnedScore}/100 PTS</div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            STAGE 2: LAYAR HASIL AKHIR & BREAKDOWN NILAI PENELITIAN
           ----------------------------------------------------------------------- */}
        {stage === 'completed' && (
          <div className="w-full max-w-xl bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl border-4 border-emerald-600 flex flex-col items-center text-center animate-scaleUp max-h-[90vh] overflow-y-auto custom-scrollbar justify-between">
            {/* BADGE TITLE */}
            <div className="w-full bg-[#0D4D44] text-white rounded-xl py-1 px-3 shadow mb-1 border border-emerald-400/40">
              <h2 className="text-xs sm:text-sm font-black tracking-wide">
                🎉 EVALUASI SIKAP ANEMIA SELESAI
              </h2>
              <p className="text-emerald-200 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                Laporan Penilaian Sikap Berdasarkan Rubrik Penelitian
              </p>
            </div>

            {/* BINTANG & TOTAL SKOR */}
            <div className="flex flex-col items-center my-0.5">
              <div className="flex items-center gap-1 text-base sm:text-lg text-amber-400 mb-0.5">
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
              </div>
              <div className="text-slate-500 text-[8.5px] font-bold uppercase tracking-widest">
                Nilai Akhir Sikap
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-800 leading-tight">
                {totalEarnedScore} <span className="text-xs text-emerald-600 font-bold">/ 100 PTS</span>
              </div>
              <div className={`mt-0.5 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[9.5px] font-extrabold ${hemoState.badge} ${hemoState.color}`}>
                Status Pasien Hemo: {hemoState.text} {hemoState.icon}
              </div>
            </div>

            {/* BREAKDOWN DUA INDIKATOR SIKAP PENELITIAN */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-1.5 my-1">
              {/* INDIKATOR 1: MENGHARGAI PENYEBAB */}
              <div className="p-2 rounded-xl bg-amber-50/80 border-2 border-amber-300 text-left flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9.5px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1">
                    <span>⭐</span> 1. Sikap Menghargai
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 font-black text-[9px]">
                    {scoreMenghargai} / 50 PTS
                  </span>
                </div>
                <div className="text-[10px] sm:text-[10.5px] font-extrabold text-slate-800 leading-tight">
                  Sasaran didik menunjukkan sikap menghargai informasi mengenai penyebab anemia
                </div>
                <div className="mt-1 text-[9px] text-amber-800 font-semibold">
                  Materi: Kurang zat besi &amp; inhibitor penyerapan teh/kopi
                </div>
              </div>

              {/* INDIKATOR 2: BERTANGGUNG JAWAB TANDA GEJALA */}
              <div className="p-2 rounded-xl bg-emerald-50/80 border-2 border-emerald-300 text-left flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9.5px] font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1">
                    <span>🛡️</span> 2. Sikap Bertanggung Jawab
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-900 font-black text-[9px]">
                    {scoreTanggungJawab} / 50 PTS
                  </span>
                </div>
                <div className="text-[10px] sm:text-[10.5px] font-extrabold text-slate-800 leading-tight">
                  Sasaran didik menunjukkan sikap bertanggung jawab atas informasi mengenai tanda gejala anemia
                </div>
                <div className="mt-1 text-[9px] text-emerald-800 font-semibold">
                  Materi: Gejala 5L, kelopak/bibir pucat &amp; konsumsi TTD
                </div>
              </div>
            </div>

            {/* KESIMPULAN PENELITI */}
            <div className="w-full bg-slate-50 rounded-xl p-2 border border-slate-200 text-left my-0.5">
              <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-600 block mb-0.5">
                📝 Ringkasan Karakter Sikap Siswa:
              </span>
              <p className="text-[10px] sm:text-[10.5px] text-slate-700 leading-snug font-medium">
                Siswa telah menunjukkan kesiapan menghargai faktor penyebab anemia dan menunjukkan tanggung jawab moral dalam bertindak saat mengenali tanda gejala pada diri sendiri maupun teman sebaya.
              </p>
            </div>

            {/* TOMBOL AKSI: SELESAI & SIMPAN SKOR (HANYA 1X MAIN - PENELITIAN) */}
            <div className="w-full flex items-center justify-center mt-1 pt-1 border-t border-slate-200">
              <button
                onClick={() => {
                  playSound('click')
                  onComplete && onComplete({ score: totalEarnedScore })
                }}
                className="w-full max-w-sm py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-95 text-white font-black text-xs sm:text-sm shadow-lg transition-all cursor-pointer border border-emerald-400 flex items-center justify-center gap-2"
              >
                <span>✓ Selesai &amp; Simpan Skor Penelitian</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
          POPUP MODAL FEEDBACK EDUKASI TANPA MENGHAKIMI (ROOT LEVEL: Z-[100])
         ========================================================================= */}
      {activeFeedback && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl p-3 sm:p-4 shadow-2xl border-3 border-teal-400 flex flex-col items-center text-center animate-bounceIn max-h-[92vh] overflow-y-auto custom-scrollbar my-auto">
            {/* BADGE INDIKATOR */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">
                {activeFeedback.option.type === 'best' ? '🌟' : activeFeedback.option.type === 'medium' ? '💡' : '⚠️'}
              </span>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-teal-800 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200">
                {activeFeedback.scenario.indicatorTitle}
              </span>
            </div>

            {/* JUDUL FEEDBACK */}
            <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm my-0.5 leading-snug">
              {activeFeedback.option.feedbackTitle}
            </h3>

            {/* TEKS RESPON PILIHAN */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-left my-1 w-full">
              <span className="text-[9px] font-bold text-slate-500 uppercase block mb-0.5">Respon yang Kamu Pilih:</span>
              <p className="text-[10.5px] sm:text-[11px] text-slate-800 font-semibold italic">
                "{activeFeedback.option.text}"
              </p>
            </div>

            {/* PENJELASAN EDUKASI */}
            <p className="text-slate-800 text-[10.5px] sm:text-[11.5px] bg-teal-50 rounded-xl p-2.5 border border-teal-200 my-1 leading-relaxed text-left font-medium w-full">
              {activeFeedback.option.feedbackDesc}
            </p>

            {/* TOMBOL LANJUTKAN */}
            <button
              onClick={handleNextScenario}
              className="mt-1 w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-black text-xs shadow transition-all cursor-pointer border border-teal-400"
            >
              Lanjutkan Skenario Berikutnya ➔
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          PROTEKSI 1X MAIN (PENELITIAN) - POPUP TELAH MENYELESAIKAN MISI
         ========================================================================= */}
      {alreadyCompleted && stage !== 'completed' && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-sm bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center shadow-2xl border-4 border-teal-500 flex flex-col items-center animate-bounceIn my-auto">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-2 text-xl shadow-inner text-teal-600 font-bold">
              ✔
            </div>
            <h2 className="text-[#003049] font-black text-base sm:text-lg mb-1">
              {misiId === 'misi_h1_e' ? 'MISI LEVEL E TELAH SELESAI' : 'MISI LEVEL D TELAH SELESAI'}
            </h2>
            <p className="text-slate-600 text-xs mb-2 leading-relaxed">
              Kamu sudah menyelesaikan Game 4 (Evaluasi Sikap Mengenai Anemia) sebelumnya dengan perolehan:
            </p>
            <div className="bg-teal-50 border-2 border-teal-300 rounded-xl py-2 px-6 mb-2.5 w-full">
              <span className="text-teal-800 font-black text-2xl">
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
