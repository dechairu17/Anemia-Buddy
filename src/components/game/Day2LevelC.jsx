import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { playSound } from '../../utils/audio'
import ScoreRaceLeaderboardModal from './ScoreRaceLeaderboardModal'

// ASET GAMBAR UTAMA GAME C DAY 2
import bgImg from '../../assets/15 day 2C/background 2c.png'
import lemariImg from '../../assets/15 day 2C/aset/lemari_crop.png'
import omprengImg from '../../assets/15 day 2C/aset/ompreng_crop.png'
import arahan1Img from '../../assets/15 day 2C/aset/arahan/arahan_1_crop.png'
import arahan2Img from '../../assets/15 day 2C/aset/arahan/arahan_2_crop.png'

// ASET MAKANAN LEMARI KIRI
import nasiImg from '../../assets/15 day 2C/aset/nasi.png'
import kentangImg from '../../assets/15 day 2C/aset/kentang.png'
import jagungImg from '../../assets/15 day 2C/aset/jagung.png'
import nuggetImg from '../../assets/15 day 2C/aset/nugget.png'
import ayamImg from '../../assets/15 day 2C/aset/ayam .png'
import ususImg from '../../assets/15 day 2C/aset/usus.png'
import telurImg from '../../assets/15 day 2C/aset/telur.png'
import dagingImg from '../../assets/15 day 2C/aset/daging.png'
import pepayaImg from '../../assets/15 day 2C/aset/pepaya.png'
import cabaiImg from '../../assets/15 day 2C/aset/cabai.png'

// ASET MAKANAN LEMARI KANAN
import kacangMerahImg from '../../assets/15 day 2C/aset/kacang merah.png'
import coklatImg from '../../assets/15 day 2C/aset/coklat.png'
import tempeImg from '../../assets/15 day 2C/aset/tempe.png'
import tahuImg from '../../assets/15 day 2C/aset/tahu.png'
import brokoliImg from '../../assets/15 day 2C/aset/brokoli.png'
import wortelImg from '../../assets/15 day 2C/aset/wortel.png'
import bayamImg from '../../assets/15 day 2C/aset/bayam.png'
import kerupukImg from '../../assets/15 day 2C/aset/kerupuk.png'
import anggurImg from '../../assets/15 day 2C/aset/anggur.png'
import jerukImg from '../../assets/15 day 2C/aset/jeruk.png'

// ASET PROFIL
import bgProfilPria from '../../assets/6/game home - profil pria.png'
import bgProfilWanita from '../../assets/6/game home - profil wanita.png'

// DATABASE MAKANAN DAN KATEGORINYA
const FOOD_DATABASE = [
  // Lemari Kiri (Rak 0 - 4)
  {
    id: 'nasi',
    name: 'Nasi Putih',
    category: 'karbohidrat',
    side: 'left',
    shelf: 0,
    slot: 0,
    img: nasiImg,
    isSuperfood: false,
    benefit: 'Karbohidrat utama penghasil energi tubuh',
    isDistractor: false
  },
  {
    id: 'kentang',
    name: 'Kentang Rebus',
    category: 'karbohidrat',
    side: 'left',
    shelf: 0,
    slot: 1,
    img: kentangImg,
    isSuperfood: false,
    benefit: 'Karbohidrat kompleks kaya mineral & serat',
    isDistractor: false
  },
  {
    id: 'jagung',
    name: 'Jagung',
    category: 'karbohidrat',
    side: 'left',
    shelf: 1,
    slot: 0,
    img: jagungImg,
    isSuperfood: false,
    benefit: 'Karbohidrat serat tinggi pencegah lesu',
    isDistractor: false
  },
  {
    id: 'nugget',
    name: 'Nugget Ayam',
    category: 'protein_hewani',
    side: 'left',
    shelf: 1,
    slot: 1,
    img: nuggetImg,
    isSuperfood: false,
    warning: 'Nugget adalah makanan olahan berlemak dan minim zat besi murni!',
    isDistractor: false,
    isWrong: true
  },
  {
    id: 'ayam',
    name: 'Ayam Goreng',
    category: 'protein_hewani',
    side: 'left',
    shelf: 2,
    slot: 0,
    img: ayamImg,
    isSuperfood: true,
    benefit: 'Protein hewani kaya zat besi heme pencegah anemia',
    isDistractor: false
  },
  {
    id: 'usus',
    name: 'Sate Usus',
    category: 'protein_hewani',
    side: 'left',
    shelf: 2,
    slot: 1,
    img: ususImg,
    isSuperfood: false,
    warning: 'Sate usus tinggi kolesterol dan minim zat besi heme dibanding daging murni!',
    isDistractor: false,
    isWrong: true
  },
  {
    id: 'telur',
    name: 'Telur Rebus',
    category: 'protein_hewani',
    side: 'left',
    shelf: 3,
    slot: 0,
    img: telurImg,
    isSuperfood: true,
    benefit: 'Zat besi heme, asam folat & protein lengkap',
    isDistractor: false
  },
  {
    id: 'daging',
    name: 'Daging Sapi',
    category: 'protein_hewani',
    side: 'left',
    shelf: 3,
    slot: 1,
    img: dagingImg,
    isSuperfood: true,
    benefit: 'Superfood zat besi heme terbaik pembentuk sel darah merah',
    isDistractor: false
  },
  {
    id: 'pepaya',
    name: 'Pepaya Potong',
    category: 'buah',
    side: 'left',
    shelf: 4,
    slot: 0,
    img: pepayaImg,
    isSuperfood: true,
    benefit: 'Kaya Vitamin C pembantu penyerapan zat besi',
    isDistractor: false
  },
  {
    id: 'cabai',
    name: 'Cabai Merah',
    category: 'sayur',
    side: 'left',
    shelf: 4,
    slot: 1,
    img: cabaiImg,
    isSuperfood: false,
    warning: 'Cabai adalah bumbu pedas pelengkap, bukan sayuran piring gizi seimbang!',
    isDistractor: false,
    isWrong: true
  },

  // Lemari Kanan (Rak 0 - 4)
  {
    id: 'kacang_merah',
    name: 'Kacang Merah',
    category: 'protein_nabati',
    side: 'right',
    shelf: 0,
    slot: 0,
    img: kacangMerahImg,
    isSuperfood: true,
    benefit: 'Kaya zat besi nabati, protein & asam folat',
    isDistractor: false
  },
  {
    id: 'coklat',
    name: 'Cokelat',
    category: 'protein_nabati',
    side: 'right',
    shelf: 0,
    slot: 1,
    img: coklatImg,
    isSuperfood: false,
    warning: 'Cokelat adalah camilan manis tinggi gula, bukan lauk nabati bergizi seimbang!',
    isDistractor: false,
    isWrong: true
  },
  {
    id: 'tempe',
    name: 'Tempe Goreng',
    category: 'protein_nabati',
    side: 'right',
    shelf: 1,
    slot: 0,
    img: tempeImg,
    isSuperfood: true,
    benefit: 'Superfood fermentasi kaya zat besi & protein nabati',
    isDistractor: false
  },
  {
    id: 'tahu',
    name: 'Tahu Goreng',
    category: 'protein_nabati',
    side: 'right',
    shelf: 1,
    slot: 1,
    img: tahuImg,
    isSuperfood: false,
    benefit: 'Protein nabati baik & kalsium sehat',
    isDistractor: false
  },
  {
    id: 'brokoli',
    name: 'Brokoli Segar',
    category: 'sayur',
    side: 'right',
    shelf: 2,
    slot: 0,
    img: brokoliImg,
    isSuperfood: true,
    benefit: 'Kaya zat besi & Vitamin C sekaligus pelipatganda serapan darah',
    isDistractor: false
  },
  {
    id: 'wortel',
    name: 'Wortel Iris',
    category: 'sayur',
    side: 'right',
    shelf: 2,
    slot: 1,
    img: wortelImg,
    isSuperfood: false,
    benefit: 'Sayuran kaya serat dan provitamin A',
    isDistractor: false
  },
  {
    id: 'bayam',
    name: 'Bayam Hijau',
    category: 'sayur',
    side: 'right',
    shelf: 3,
    slot: 0,
    img: bayamImg,
    isSuperfood: true,
    benefit: 'Superfood sayuran hijau juara zat besi pencegah anemia',
    isDistractor: false
  },
  {
    id: 'kerupuk',
    name: 'Kerupuk',
    category: 'karbohidrat',
    side: 'right',
    shelf: 3,
    slot: 1,
    img: kerupukImg,
    isSuperfood: false,
    warning: 'Kerupuk minim zat gizi dan bukan sumber karbohidrat piring gizi seimbang!',
    isDistractor: false,
    isWrong: true
  },
  {
    id: 'anggur',
    name: 'Anggur Segar',
    category: 'buah',
    side: 'right',
    shelf: 4,
    slot: 0,
    img: anggurImg,
    isSuperfood: false,
    benefit: 'Buah kaya antioksidan & kesegaran alami',
    isDistractor: false
  },
  {
    id: 'jeruk',
    name: 'Jeruk Segar',
    category: 'buah',
    side: 'right',
    shelf: 4,
    slot: 1,
    img: jerukImg,
    isSuperfood: true,
    benefit: 'Superfood Vitamin C tinggi pembantu serapan zat besi maksimal',
    isDistractor: false
  }
]

// 5 MAKANAN SALAH / JUNK YANG TIDAK MENDAPATKAN POIN (CABAI, KERUPUK, COKLAT, NUGGET, SATE USUS)
export const WRONG_FOOD_IDS = ['cabai', 'kerupuk', 'coklat', 'nugget', 'usus']

// 3 SESI WAKTU MAKAN SEHARI
const SESSIONS = [
  { key: 'pagi', title: 'Makan Pagi', icon: '☀️', hint: 'Awali pagimu dengan sarapan bergizi seimbang!' },
  { key: 'siang', title: 'Makan Siang', icon: '🌤️', hint: 'Isi ulang energimu dengan piring kaya zat besi!' },
  { key: 'malam', title: 'Makan Malam', icon: '🌙', hint: 'Lengkapi gizi harianmu untuk pemulihan optimal!' }
]

export default function Day2LevelC({ misiId = 'misi_h2_c', onBack, onComplete }) {
  // TAHAP ALUR:
  // 1: Arahan 1 (Konsep Isi Piringku)
  // 2: Arahan 2 (Menu Sehari Pagi, Siang, Malam)
  // 3: Gameplay Menyusun Isi Piringku
  // 4: Selesai & Evaluasi 3 Menu Sehari
  const [stage, setStage] = useState(1)

  // SESI SAAT INI (0: Pagi, 1: Siang, 2: Malam)
  const [sessionIndex, setSessionIndex] = useState(0)

  // DATA PIRING / OMPRENG UNTUK KETIGA SESI
  const [dailyPlates, setDailyPlates] = useState({
    pagi: { karbohidrat: null, protein_hewani: null, protein_nabati: null, sayur: null, buah: null },
    siang: { karbohidrat: null, protein_hewani: null, protein_nabati: null, sayur: null, buah: null },
    malam: { karbohidrat: null, protein_hewani: null, protein_nabati: null, sayur: null, buah: null }
  })

  // MODAL SESI SELESAI (POPUP REVIEW SETELAH KLIK "SELESAI" PADA SESI PAGI & SIANG)
  const [sessionReviewModal, setSessionReviewModal] = useState(null)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  // TOAST DAN MODAL MATERI BANTUAN
  const [toastMsg, setToastMsg] = useState('')
  const [shakingFoodId, setShakingFoodId] = useState(null)
  const [showMateriModal, setShowMateriModal] = useState(false)

  // USER & SCORE STATE
  const [currentUser, setCurrentUser] = useState(null)
  const [totalUserScore, setTotalUserScore] = useState(0)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)
  const [existingScore, setExistingScore] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const startTimeRef = useRef(Date.now())

  // PENGACAKAN MAKANAN DI RAK (SETIAP ANAK / SESI BERMAIN MENDAPATKAN SUSUNAN ACAK YANG MENARIK)
  const [shuffledLeftFoods] = useState(() => {
    const leftItems = FOOD_DATABASE.filter(f => f.side === 'left')
    return [...leftItems].sort(() => Math.random() - 0.5)
  })
  const [shuffledRightFoods] = useState(() => {
    const rightItems = FOOD_DATABASE.filter(f => f.side === 'right')
    return [...rightItems].sort(() => Math.random() - 0.5)
  })

  // STATE DRAG AND DROP
  const [draggingFood, setDraggingFood] = useState(null)
  const [dragOverCategory, setDragOverCategory] = useState(null)
  const [touchDrag, setTouchDrag] = useState(null)
  const touchStartRef = useRef(null)

  const handleTouchStart = (e, food) => {
    const touch = e.touches[0]
    touchStartRef.current = {
      food,
      startX: touch.clientX,
      startY: touch.clientY,
      hasMoved: false
    }
  }

  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return
    const touch = e.touches[0]
    const dx = touch.clientX - touchStartRef.current.startX
    const dy = touch.clientY - touchStartRef.current.startY
    if (Math.hypot(dx, dy) > 8) {
      touchStartRef.current.hasMoved = true
      setTouchDrag({
        food: touchStartRef.current.food,
        x: touch.clientX,
        y: touch.clientY
      })
    }
  }

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return
    const { food, hasMoved } = touchStartRef.current
    if (hasMoved) {
      const touch = e.changedTouches[0]
      const elem = document.elementFromPoint(touch.clientX, touch.clientY)
      const trayElem = elem?.closest('[data-drop-zone="tray"]')
      if (trayElem) {
        handleSelectFood(food)
      }
    }
    touchStartRef.current = null
    setTouchDrag(null)
  }

  // SESI AKTIF & PIRING AKTIF SAAT INI
  const currentSessionKey = SESSIONS[sessionIndex]?.key || 'pagi'
  const currentPlate = dailyPlates[currentSessionKey]
  const currentPlateFoodIds = Object.values(currentPlate).filter(Boolean).map((f) => f.id)

  // SETIAP LEMARI SELALU MENAMPILKAN PENUH 10 BAHAN MAKANAN (2 BAHAN PER RAK, 5 RAK = 10 BAHAN)
  // TIDAK ADA RAK YANG KOSONG PADA SESI APAPUN (PAGI, SIANG, MALAM)
  const leftShelves = [
    shuffledLeftFoods.slice(0, 2),
    shuffledLeftFoods.slice(2, 4),
    shuffledLeftFoods.slice(4, 6),
    shuffledLeftFoods.slice(6, 8),
    shuffledLeftFoods.slice(8, 10),
  ]

  const rightShelves = [
    shuffledRightFoods.slice(0, 2),
    shuffledRightFoods.slice(2, 4),
    shuffledRightFoods.slice(4, 6),
    shuffledRightFoods.slice(6, 8),
    shuffledRightFoods.slice(8, 10),
  ]

  // PERHITUNGAN NILAI:
  // (100 / 3) / 5 = 100 / 15 point per slot benar (3 sesi x 5 variabel = 15 total slot = 100 PTS max)
  // Cabai, kerupuk, coklat, nugget, sate usus = SALAH (0 PTS). 15 makanan lain = BENAR.
  const countCorrectInPlate = (plate) => {
    return Object.values(plate).filter((f) => f && !WRONG_FOOD_IDS.includes(f.id)).length
  }

  const calculateTotalScore = (plates) => {
    let correctCount = 0
    ;['pagi', 'siang', 'malam'].forEach((key) => {
      correctCount += countCorrectInPlate(plates[key])
    })
    return Math.min(100, Math.round(correctCount * (100 / 15)))
  }

  const [currentScore, setCurrentScore] = useState(100)

  // LOAD USER & INTEGRASI DATABASE SUPABASE
  useEffect(() => {
    const uName = localStorage.getItem('anemia_username') || 'ais'
    const fetchUser = async () => {
      try {
        const { data: userData } = await supabase
          .from('game_users')
          .select('username, gender')
          .ilike('username', uName)
          .maybeSingle()

        const canonicalUser = userData?.username || uName
        if (userData) {
          setCurrentUser(userData)
          localStorage.setItem('anemia_username', userData.username)
        } else {
          setCurrentUser({ username: uName, gender: 'female' })
        }

        // Ambil riwayat skor & proteksi 1x percobaan
        const { data: scoreData } = await supabase
          .from('game_scores')
          .select('kategori_game, skor')
          .ilike('username', canonicalUser)

        if (scoreData && scoreData.length > 0) {
          const sum = scoreData.reduce((acc, curr) => acc + (curr.skor || 0), 0)
          setTotalUserScore(sum)

          const existing = scoreData.find((item) => item.kategori_game === misiId)
          if (existing) {
            setAlreadyCompleted(true)
            setExistingScore(existing.skor || 0)
          }
        }
      } catch (err) {
        console.error('Error load profil Day 2 Level C:', err)
        setCurrentUser({ username: uName, gender: 'female' })
      }
    }
    fetchUser()
  }, [misiId])

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  // WAKTU SAAT GAMEPLAY DIMULAI
  useEffect(() => {
    if (stage === 3) {
      startTimeRef.current = Date.now()
    }
  }, [stage])

  // MENGHITUNG JUMLAH SLOT YANG TERISI (0/5 S/D 5/5)
  const filledCount = Object.values(currentPlate).filter(Boolean).length

  // HANDLER DROP MAKANAN KE OMPRENG
  const handleDropFood = (e, targetCategory) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverCategory(null)
    const foodId = e.dataTransfer?.getData('text/plain')
    const food = FOOD_DATABASE.find((f) => f.id === foodId) || draggingFood
    if (food) {
      handleSelectFood(food)
    }
    setDraggingFood(null)
  }

  // MEMILIH MAKANAN (KLIK / DRAG & DROP KE OMPRENG)
  // CATATAN PENELITIAN: Suara dibuat seragam netral ('click') dan tanpa animasi salah/goyang
  // agar responden memilih secara objektif murni berdasarkan pengetahuan mereka.
  const handleSelectFood = (food) => {
    if (!food) return
    playSound('click')

    // Masukkan ke kategori yang sesuai di ompreng
    const categoryKey = food.category // 'karbohidrat' | 'protein_hewani' | 'protein_nabati' | 'sayur' | 'buah'

    setDailyPlates((prev) => ({
      ...prev,
      [currentSessionKey]: {
        ...prev[currentSessionKey],
        [categoryKey]: food
      }
    }))
  }

  // MENGHAPUS MAKANAN DARI OMPRENG
  const handleRemoveFromPlate = (categoryKey) => {
    playSound('click')
    setDailyPlates((prev) => ({
      ...prev,
      [currentSessionKey]: {
        ...prev[currentSessionKey],
        [categoryKey]: null
      }
    }))
  }

  // SELESAIKAN SATU SESI (PAGI -> SIANG -> MALAM)
  const handleFinishCurrentSession = () => {
    if (filledCount < 5) {
      playSound('wrong')
      showToast('⚠️ Lengkapi kelima bagian Isi Piringku (Karbohidrat, Lauk Hewani, Lauk Nabati, Sayur, & Buah)!')
      return
    }

    playSound('celebration')

    const currentSession = SESSIONS[sessionIndex]
    const plate = dailyPlates[currentSession.key]

    const correctCount = countCorrectInPlate(plate)
    const wrongItems = Object.values(plate).filter((f) => f && WRONG_FOOD_IDS.includes(f.id))
    const sessionPts = Math.round(correctCount * (100 / 15) * 10) / 10

    // Evaluasi superfood
    const superfoods = Object.values(plate).filter((f) => f && f.isSuperfood)
    const hasAnimalIron = plate.protein_hewani && plate.protein_hewani.isSuperfood
    const hasVegetableIron = (plate.sayur && plate.sayur.isSuperfood) || (plate.protein_nabati && plate.protein_nabati.isSuperfood)
    const hasVitC = plate.buah && plate.buah.isSuperfood

    let praise = 'Menu gizi seimbang tersusun rapi!'
    if (wrongItems.length > 0) {
      praise = `Terdapat ${wrongItems.length} pilihan kurang tepat (${wrongItems.map((f) => f.name).join(', ')}). Hindari makanan junk/olahan untuk hasil pencegahan anemia yang optimal!`
    } else if (hasAnimalIron && hasVitC) {
      praise = '🔥 Luar Biasa! Duet Zat Besi Hewani & Vitamin C membuat penyerapan darah sangat optimal!'
    } else if (hasVegetableIron && hasVitC) {
      praise = '🥦 Mantap! Zat Besi Nabati diduetkan dengan Vitamin C sehingga terserap sempurna!'
    } else if (superfoods.length >= 2) {
      praise = '✨ Menu kaya zat besi & mikronutrien penting pencegah anemia!'
    }

    setSessionReviewModal({
      sessionTitle: currentSession.title,
      sessionIcon: currentSession.icon,
      plate: plate,
      praise: praise,
      correctCount: correctCount,
      wrongItems: wrongItems,
      sessionPts: sessionPts,
      superfoodCount: superfoods.length,
      isLastSession: sessionIndex === SESSIONS.length - 1
    })
  }

  // LANJUT KE SESI BERIKUTNYA ATAU KE LAYAR VICTORY
  const handleProceedNextSession = () => {
    playSound('click')
    setSessionReviewModal(null)

    if (sessionIndex < SESSIONS.length - 1) {
      setSessionIndex((prev) => prev + 1)
    } else {
      // Semua 3 sesi selesai -> Kemenangan Akhir
      handleFinishGame()
    }
  }

  // TRIGGER KEMENANGAN AKHIR & SIMPAN KE DATABASE
  const handleFinishGame = async () => {
    playSound('celebration')
    const finalScore = calculateTotalScore(dailyPlates)
    setCurrentScore(finalScore)
    setStage(4)
    setIsSaving(true)

    try {
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))

      localStorage.setItem('misi_h2_c_completed', 'true')
      localStorage.setItem('misi_h2_c_score', finalScore.toString())

      // Pastikan username valid sesuai database
      let targetUser = currentUser?.username || localStorage.getItem('anemia_username') || 'ais'
      const { data: dbUser } = await supabase
        .from('game_users')
        .select('username')
        .ilike('username', targetUser)
        .maybeSingle()

      if (dbUser?.username) {
        targetUser = dbUser.username
        localStorage.setItem('anemia_username', targetUser)
      }

      const { error: insertErr } = await supabase.from('game_scores').insert([
        {
          username: targetUser,
          kategori_game: misiId,
          skor: finalScore,
          durasi_detik: durationSeconds
        }
      ])

      if (insertErr) {
        console.error('Error insert game_scores Day 2 Level C:', insertErr)
      } else {
        console.log('Berhasil menyimpan skor Day 2 Level C ke Supabase!')
        setIsSaved(true)
        setTotalUserScore((prev) => prev + finalScore)
        setAlreadyCompleted(true)
        setExistingScore(finalScore)
      }
    } catch (err) {
      console.error('Error simpan skor Day 2 Level C:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // =========================================================================
  // RENDER INTERFACE UTAMA
  // =========================================================================
  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col justify-between select-none font-sans bg-[#FBF3E4]">
      
      {/* LATAR BELAKANG RUANGAN MEJA MAKAN (PERSIS BACKGROUND 2C) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url("${bgImg}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* TOP COMPACT BAR / HEADER NAVIGASI */}
      <header className="relative z-30 w-full h-11 sm:h-12 bg-[#2D0C13]/90 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 border-b border-amber-900/40 shadow-md">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              playSound('click')
              onBack && onBack()
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs border border-white/20 transition-all shadow-sm cursor-pointer"
          >
            <span>←</span>
            <span>Keluar</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-black text-xs sm:text-sm tracking-wider uppercase">
              HARI 2 - MISI C
            </span>
            <span className="text-slate-400 text-xs hidden md:inline">|</span>
            <span className="text-slate-200 text-xs font-semibold hidden md:inline">
              Konsep Isi Piringku Sehari
            </span>
          </div>
        </div>

        {/* INDIKATOR TAHAP SESI WAKTU MAKAN */}
        {stage === 3 && (
          <div className="hidden sm:flex items-center gap-1.5 bg-black/40 px-3 py-0.5 rounded-full border border-amber-500/30">
            {SESSIONS.map((sess, idx) => (
              <div
                key={sess.key}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                  idx === sessionIndex
                    ? 'bg-amber-500 text-slate-950 shadow-sm scale-105'
                    : idx < sessionIndex
                    ? 'bg-emerald-600/60 text-emerald-100'
                    : 'text-slate-400'
                }`}
              >
                <span>{sess.icon}</span>
                <span>{sess.title}</span>
                {idx < sessionIndex && <span>✓</span>}
              </div>
            ))}
          </div>
        )}

        {/* PROFIL & SKOR PENGGUNA */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playSound('click')
              setShowMateriModal(true)
            }}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold transition cursor-pointer"
          >
            <span>📖</span>
            <span>Panduan Gizi</span>
          </button>

          <div className="px-2.5 py-1 rounded-full bg-black/40 border border-amber-400/40 text-amber-300 text-xs font-bold shadow-sm whitespace-nowrap">
            ⭐ {currentScore} PTS
          </div>

          <div className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-0.5 rounded-full bg-white/10 border border-white/20">
            <img
              src={currentUser?.gender === 'male' ? bgProfilPria : bgProfilWanita}
              alt="Avatar"
              className="w-5 h-5 rounded-full object-cover border border-amber-300"
            />
            <span className="text-[11px] font-bold text-white hidden sm:inline uppercase">
              {currentUser?.username || 'Ais'}
            </span>
          </div>
        </div>
      </header>

      {/* =====================================================================
          TAHAP 1: MODAL ARAHAN 1 (KONSEP ISI PIRINGKU)
          ===================================================================== */}
      {stage === 1 && (
        <div className="relative z-20 flex-1 w-full flex items-center justify-center p-3 animate-fade-in">
          <div className="relative max-w-2xl sm:max-w-3xl md:max-w-4xl w-full flex flex-col items-center">
            <img
              src={arahan1Img}
              alt="Konsep Isi Piringku"
              className="w-full h-auto max-h-[84vh] object-contain drop-shadow-2xl"
            />

            {/* AREA KLIK TOMBOL NEXT INTERAKTIF TEPAT DI ATAS TOMBOL PAPAN (HANYA 1 NEXT) */}
            <button
              onClick={() => {
                playSound('click')
                setStage(2)
              }}
              style={{
                left: '37%',
                width: '26%',
                top: '78%',
                height: '18%',
              }}
              className="absolute rounded-full cursor-pointer hover:bg-white/10 active:scale-95 transition-all focus:outline-none"
              title="Klik untuk Lanjut (NEXT)"
            />
          </div>
        </div>
      )}

      {/* =====================================================================
          TAHAP 2: MODAL ARAHAN 2 (SUSUN MENU SEHARI: PAGI, SIANG, MALAM)
          ===================================================================== */}
      {stage === 2 && (
        <div className="relative z-20 flex-1 w-full flex items-center justify-center p-3 animate-fade-in">
          <div className="relative max-w-2xl sm:max-w-3xl md:max-w-4xl w-full flex flex-col items-center">
            <img
              src={arahan2Img}
              alt="Susun Menu Sehari"
              className="w-full h-auto max-h-[84vh] object-contain drop-shadow-2xl"
            />

            {/* AREA KLIK TOMBOL START INTERAKTIF TEPAT DI ATAS TOMBOL PAPAN (HANYA 1 START) */}
            <button
              onClick={() => {
                playSound('click')
                setStage(3)
              }}
              style={{
                left: '35%',
                width: '30%',
                top: '74%',
                height: '19%',
              }}
              className="absolute rounded-full cursor-pointer hover:bg-white/10 active:scale-95 transition-all focus:outline-none"
              title="Klik untuk Mulai (START)"
            />
          </div>
        </div>
      )}

      {/* =====================================================================
          TAHAP 3: ARENA GAMEPLAY MENYUSUN MENU OMPRENG ISI PIRINGKU
          ===================================================================== */}
      {stage === 3 && (
        <main className="relative z-10 flex-1 w-full flex items-center justify-between px-2 sm:px-4 md:px-6 lg:px-8 py-1 sm:py-2 overflow-hidden gap-2 sm:gap-4 md:gap-6">
          
          {/* ---------------------------------------------------------------
              LEMARI KIRI (RAK KAYU 5 TINGKAT: 10 MAKANAN)
              --------------------------------------------------------------- */}
          <div
            className="relative h-full max-h-[85vh] aspect-[438/1080] flex-shrink-0 flex flex-col justify-between py-[1.5%] rounded-lg drop-shadow-2xl select-none"
            style={{
              backgroundImage: `url("${lemariImg}")`,
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {[0, 1, 2, 3, 4].map((shelfIdx) => {
              const shelfFoods = leftShelves[shelfIdx] || []
              return (
                <div
                  key={`left-shelf-${shelfIdx}`}
                  className="w-full h-[20%] flex items-end justify-between px-[12%] pb-[3.5%]"
                >
                  {shelfFoods.map((food) => {
                    const isShaking = shakingFoodId === food.id
                    const isSelectedInPlate = currentPlateFoodIds.includes(food.id)
                    return (
                      <button
                        key={food.id}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', food.id)
                          e.dataTransfer.effectAllowed = 'copy'
                          setDraggingFood(food)
                        }}
                        onDragEnd={() => {
                          setDraggingFood(null)
                          setDragOverCategory(null)
                        }}
                        onTouchStart={(e) => handleTouchStart(e, food)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onClick={() => {
                          if (isSelectedInPlate) {
                            handleRemoveFromPlate(food.category)
                          } else {
                            handleSelectFood(food)
                          }
                        }}
                        className={`group relative flex items-center justify-center p-0 transition-transform cursor-grab active:cursor-grabbing focus:outline-none ${
                          isShaking
                            ? 'animate-bounce'
                            : 'hover:scale-115 active:scale-95'
                        }`}
                        title={isSelectedInPlate ? `${food.name} sudah di piring (ketuk untuk lepas)` : `Tarik atau ketuk untuk memasukkan ${food.name}`}
                      >
                        <img
                          src={food.img}
                          alt={food.name}
                          draggable={false}
                          className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-17 lg:h-17 object-contain drop-shadow-md transition-all pointer-events-none ${
                            isSelectedInPlate ? 'opacity-40 filter grayscale-30 scale-95' : 'opacity-100'
                          }`}
                        />
                        {isSelectedInPlate && (
                          <span className="absolute -top-1 -right-1 bg-emerald-500 text-white font-black text-[9px] sm:text-[10px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md border-1.5 border-white">
                            ✓
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* ---------------------------------------------------------------
              TENGAH: JUDUL SESI + OMPRENG 5 SEKAT + TOMBOL SELESAI
              --------------------------------------------------------------- */}
          <div className="flex-1 h-full max-h-[85vh] flex flex-col items-center justify-between px-2 sm:px-4 py-1 select-none">
            
            {/* JUDUL INSTRUKSI DI ATAS SESUAI GAMBAR 3.PNG */}
            <div className="flex flex-col items-center text-center mt-0.5 sm:mt-1">
              <h2 className="text-slate-900 font-extrabold text-sm sm:text-base md:text-lg lg:text-xl drop-shadow-xs tracking-tight">
                Susunlah Menu Untuk {SESSIONS[sessionIndex]?.title}
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-700 font-semibold mt-0.5">
                Tarik (drag & drop) atau ketuk bahan makanan di lemari untuk mengisi sekat piring!
              </p>
            </div>

            {/* AREA OMPRENG STAINLESS STEEL DENGAN 5 SEKAT INTERAKTIF & DRAG-AND-DROP (RASIO TERKUNCI & TIDAK GEPENG) */}
            <div
              data-drop-zone="tray"
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'copy'
              }}
              onDrop={(e) => handleDropFood(e)}
              className={`relative flex items-center justify-center my-auto drop-shadow-2xl select-none transition-all ${
                draggingFood ? 'ring-4 ring-amber-400/60 rounded-2xl' : ''
              }`}
              style={{
                aspectRatio: '1053 / 833',
                height: 'min(48vh, 360px)',
                width: 'auto',
                maxWidth: 'min(92%, 455px)',
                maxHeight: '48vh'
              }}
            >
              {/* GAMBAR DASAR OMPRENG 100% PROPORSI ASLI */}
              <img
                src={omprengImg}
                alt="Nampan Isi Piringku"
                className="w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />

              {/* 1. SEKAT PROTEIN NABATI (KIRI ATAS) */}
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  e.dataTransfer.dropEffect = 'copy'
                  if (dragOverCategory !== 'protein_nabati') setDragOverCategory('protein_nabati')
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget)) return
                  setDragOverCategory(null)
                }}
                onDrop={(e) => handleDropFood(e, 'protein_nabati')}
                className={`absolute top-[3%] left-[5%] w-[26%] h-[41%] flex flex-col items-center justify-center cursor-pointer p-1 transition-all rounded-xl ${
                  dragOverCategory === 'protein_nabati'
                    ? 'ring-4 ring-amber-400 bg-amber-400/30'
                    : draggingFood?.category === 'protein_nabati'
                    ? 'ring-2 ring-emerald-400/80 bg-emerald-400/20'
                    : ''
                }`}
                onClick={() => currentPlate.protein_nabati && handleRemoveFromPlate('protein_nabati')}
              >
                {currentPlate.protein_nabati && (
                  <div className="relative group w-full h-full flex flex-col items-center justify-center animate-scale-up">
                    <img
                      src={currentPlate.protein_nabati.img}
                      alt={currentPlate.protein_nabati.name}
                      className="w-9 h-9 sm:w-11 sm:h-11 md:w-13 md:h-13 object-contain drop-shadow-md"
                    />
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-900 bg-white/95 px-1 rounded shadow-xs leading-none mt-0.5 truncate max-w-[85%] text-center">
                      {currentPlate.protein_nabati.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFromPlate('protein_nabati')
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center shadow hover:bg-rose-700"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* 2. SEKAT PROTEIN HEWANI (TENGAH ATAS) */}
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  e.dataTransfer.dropEffect = 'copy'
                  if (dragOverCategory !== 'protein_hewani') setDragOverCategory('protein_hewani')
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget)) return
                  setDragOverCategory(null)
                }}
                onDrop={(e) => handleDropFood(e, 'protein_hewani')}
                className={`absolute top-[3%] left-[33%] w-[34%] h-[41%] flex flex-col items-center justify-center cursor-pointer p-1 transition-all rounded-xl ${
                  dragOverCategory === 'protein_hewani'
                    ? 'ring-4 ring-amber-400 bg-amber-400/30'
                    : draggingFood?.category === 'protein_hewani'
                    ? 'ring-2 ring-emerald-400/80 bg-emerald-400/20'
                    : ''
                }`}
                onClick={() => currentPlate.protein_hewani && handleRemoveFromPlate('protein_hewani')}
              >
                {currentPlate.protein_hewani && (
                  <div className="relative group w-full h-full flex flex-col items-center justify-center animate-scale-up">
                    <img
                      src={currentPlate.protein_hewani.img}
                      alt={currentPlate.protein_hewani.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain drop-shadow-md"
                    />
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-900 bg-white/95 px-1 rounded shadow-xs leading-none mt-0.5 truncate max-w-[85%] text-center">
                      {currentPlate.protein_hewani.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFromPlate('protein_hewani')
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center shadow hover:bg-rose-700"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* 3. SEKAT BUAH (KANAN ATAS) */}
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  e.dataTransfer.dropEffect = 'copy'
                  if (dragOverCategory !== 'buah') setDragOverCategory('buah')
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget)) return
                  setDragOverCategory(null)
                }}
                onDrop={(e) => handleDropFood(e, 'buah')}
                className={`absolute top-[3%] left-[69%] w-[26%] h-[41%] flex flex-col items-center justify-center cursor-pointer p-1 transition-all rounded-xl ${
                  dragOverCategory === 'buah'
                    ? 'ring-4 ring-amber-400 bg-amber-400/30'
                    : draggingFood?.category === 'buah'
                    ? 'ring-2 ring-emerald-400/80 bg-emerald-400/20'
                    : ''
                }`}
                onClick={() => currentPlate.buah && handleRemoveFromPlate('buah')}
              >
                {currentPlate.buah && (
                  <div className="relative group w-full h-full flex flex-col items-center justify-center animate-scale-up">
                    <img
                      src={currentPlate.buah.img}
                      alt={currentPlate.buah.name}
                      className="w-9 h-9 sm:w-11 sm:h-11 md:w-13 md:h-13 object-contain drop-shadow-md"
                    />
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-900 bg-white/95 px-1 rounded shadow-xs leading-none mt-0.5 truncate max-w-[85%] text-center">
                      {currentPlate.buah.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFromPlate('buah')
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center shadow hover:bg-rose-700"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* 4. SEKAT KARBOHIDRAT (KIRI BAWAH - LINGKARAN BUNDAR) */}
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  e.dataTransfer.dropEffect = 'copy'
                  if (dragOverCategory !== 'karbohidrat') setDragOverCategory('karbohidrat')
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget)) return
                  setDragOverCategory(null)
                }}
                onDrop={(e) => handleDropFood(e, 'karbohidrat')}
                className={`absolute top-[48%] left-[5%] w-[33%] h-[47%] rounded-full flex flex-col items-center justify-center cursor-pointer p-1 transition-all ${
                  dragOverCategory === 'karbohidrat'
                    ? 'ring-4 ring-amber-400 bg-amber-400/30'
                    : draggingFood?.category === 'karbohidrat'
                    ? 'ring-2 ring-emerald-400/80 bg-emerald-400/20'
                    : ''
                }`}
                onClick={() => currentPlate.karbohidrat && handleRemoveFromPlate('karbohidrat')}
              >
                {currentPlate.karbohidrat && (
                  <div className="relative group w-full h-full flex flex-col items-center justify-center animate-scale-up">
                    <img
                      src={currentPlate.karbohidrat.img}
                      alt={currentPlate.karbohidrat.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-15 md:h-15 object-contain drop-shadow-md"
                    />
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-900 bg-white/95 px-1 rounded shadow-xs leading-none mt-0.5 truncate max-w-[85%] text-center">
                      {currentPlate.karbohidrat.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFromPlate('karbohidrat')
                      }}
                      className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center shadow hover:bg-rose-700"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* 5. SEKAT SAYUR (KANAN BAWAH - PERSEGI PANJANG LEBAR) */}
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  e.dataTransfer.dropEffect = 'copy'
                  if (dragOverCategory !== 'sayur') setDragOverCategory('sayur')
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget)) return
                  setDragOverCategory(null)
                }}
                onDrop={(e) => handleDropFood(e, 'sayur')}
                className={`absolute top-[48%] left-[40%] w-[55%] h-[47%] flex flex-col items-center justify-center cursor-pointer p-1 transition-all rounded-xl ${
                  dragOverCategory === 'sayur'
                    ? 'ring-4 ring-amber-400 bg-amber-400/30'
                    : draggingFood?.category === 'sayur'
                    ? 'ring-2 ring-emerald-400/80 bg-emerald-400/20'
                    : ''
                }`}
                onClick={() => currentPlate.sayur && handleRemoveFromPlate('sayur')}
              >
                {currentPlate.sayur && (
                  <div className="relative group w-full h-full flex flex-col items-center justify-center animate-scale-up">
                    <img
                      src={currentPlate.sayur.img}
                      alt={currentPlate.sayur.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-15 md:h-15 object-contain drop-shadow-md"
                    />
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-900 bg-white/95 px-1 rounded shadow-xs leading-none mt-0.5 truncate max-w-[85%] text-center">
                      {currentPlate.sayur.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFromPlate('sayur')
                      }}
                      className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center shadow hover:bg-rose-700"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* TOMBOL SELESAI DI BAWAH OMPRENG SESUAI GAMBAR 3.PNG */}
            <div className="w-full flex flex-col items-center mt-1 mb-1">
              <button
                onClick={handleFinishCurrentSession}
                className={`px-12 sm:px-16 py-1.5 sm:py-2 rounded-full font-black text-xs sm:text-sm tracking-widest transition-all cursor-pointer shadow-xl ${
                  filledCount === 5
                    ? 'bg-[#033452] hover:bg-[#054b77] text-white border-2 border-cyan-400 active:scale-95 animate-pulse'
                    : 'bg-[#033452] hover:bg-[#054b77] text-white active:scale-95'
                }`}
              >
                SELESAI
              </button>
            </div>

          </div>

          {/* ---------------------------------------------------------------
              LEMARI KANAN (RAK KAYU 5 TINGKAT: 10 MAKANAN)
              --------------------------------------------------------------- */}
          <div
            className="relative h-full max-h-[85vh] aspect-[438/1080] flex-shrink-0 flex flex-col justify-between py-[1.5%] rounded-lg drop-shadow-2xl select-none"
            style={{
              backgroundImage: `url("${lemariImg}")`,
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {[0, 1, 2, 3, 4].map((shelfIdx) => {
              const shelfFoods = rightShelves[shelfIdx] || []
              return (
                <div
                  key={`right-shelf-${shelfIdx}`}
                  className="w-full h-[20%] flex items-end justify-between px-[12%] pb-[3.5%]"
                >
                  {shelfFoods.map((food) => {
                    const isShaking = shakingFoodId === food.id
                    const isSelectedInPlate = currentPlateFoodIds.includes(food.id)
                    return (
                      <button
                        key={food.id}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', food.id)
                          e.dataTransfer.effectAllowed = 'copy'
                          setDraggingFood(food)
                        }}
                        onDragEnd={() => {
                          setDraggingFood(null)
                          setDragOverCategory(null)
                        }}
                        onTouchStart={(e) => handleTouchStart(e, food)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onClick={() => {
                          if (isSelectedInPlate) {
                            handleRemoveFromPlate(food.category)
                          } else {
                            handleSelectFood(food)
                          }
                        }}
                        className={`group relative flex items-center justify-center p-0 transition-transform cursor-grab active:cursor-grabbing focus:outline-none ${
                          isShaking
                            ? 'animate-bounce'
                            : 'hover:scale-115 active:scale-95'
                        }`}
                        title={isSelectedInPlate ? `${food.name} sudah di piring (ketuk untuk lepas)` : `Tarik atau ketuk untuk memasukkan ${food.name}`}
                      >
                        <img
                          src={food.img}
                          alt={food.name}
                          draggable={false}
                          className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-17 lg:h-17 object-contain drop-shadow-md transition-all pointer-events-none ${
                            isSelectedInPlate ? 'opacity-40 filter grayscale-30 scale-95' : 'opacity-100'
                          }`}
                        />
                        {isSelectedInPlate && (
                          <span className="absolute -top-1 -right-1 bg-emerald-500 text-white font-black text-[9px] sm:text-[10px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md border-1.5 border-white">
                            ✓
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>

        </main>
      )}

      {/* =====================================================================
          MODAL EVALUASI SESI MAKAN (PAGI / SIANG / MALAM)
          ===================================================================== */}
      {sessionReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 overflow-y-auto overscroll-contain py-4 animate-fade-in">
          <div className="relative bg-[#1c0a0e] text-white border-2 border-amber-500/80 rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl flex flex-col items-center text-center max-h-[92dvh] overflow-y-auto custom-scrollbar my-auto">
            {/* TOMBOL TUTUP / LANJUT */}
            <button
              onClick={handleProceedNextSession}
              className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs flex items-center justify-center cursor-pointer transition-all active:scale-90"
              title="Lanjut"
            >
              ✕
            </button>

            <div className="text-3xl mb-1">{sessionReviewModal.sessionIcon}</div>
            <h3 className="text-amber-400 font-black text-base sm:text-lg mb-1">
              Menu {sessionReviewModal.sessionTitle} Berhasil Disusun!
            </h3>
            <p className="text-slate-300 text-xs mb-3">
              {sessionReviewModal.praise}
            </p>

            {/* DAFTAR 5 MAKANAN TERPILIH DENGAN INDIKATOR BENAR / SALAH */}
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-2.5 mb-2 grid grid-cols-5 gap-1.5 text-center">
              {[
                { label: 'Karbo', item: sessionReviewModal.plate.karbohidrat },
                { label: 'Hewani', item: sessionReviewModal.plate.protein_hewani },
                { label: 'Nabati', item: sessionReviewModal.plate.protein_nabati },
                { label: 'Sayur', item: sessionReviewModal.plate.sayur },
                { label: 'Buah', item: sessionReviewModal.plate.buah }
              ].map(({ label, item }) => {
                const isItemWrong = item && WRONG_FOOD_IDS.includes(item.id)
                return (
                  <div key={label} className="relative flex flex-col items-center">
                    <span className="text-[8px] text-slate-400 uppercase font-bold block mb-1">{label}</span>
                    <div className="relative">
                      <img src={item?.img} alt="" className="w-8 h-8 object-contain" />
                      <span
                        className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[8px] font-black flex items-center justify-center shadow ${
                          isItemWrong ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                        }`}
                      >
                        {isItemWrong ? '✕' : '✓'}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-bold block truncate mt-1 max-w-full ${
                        isItemWrong ? 'text-rose-300 line-through' : 'text-amber-200'
                      }`}
                      title={item?.name}
                    >
                      {item?.name}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="text-[11px] font-bold text-amber-300 bg-black/40 px-3 py-1 rounded-full border border-amber-500/30 mb-3">
              Poin Sesi Ini: +{sessionReviewModal.sessionPts} PTS ({sessionReviewModal.correctCount}/5 Benar)
            </div>

            <button
              onClick={handleProceedNextSession}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg active:scale-95 transition cursor-pointer"
            >
              {sessionReviewModal.isLastSession ? 'Lihat Hasil Akhir Sehari ➔' : `Lanjut ke ${SESSIONS[sessionIndex + 1]?.title} ➔`}
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAHAP 4: LAYAR HASIL AKHIR & KEMENANGAN (VICTORY SEHARI PENUH)
          ===================================================================== */}
      {stage === 4 && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 overflow-y-auto overscroll-contain py-4 animate-fade-in">
          <div className="relative bg-[#1c0a0e] text-white border-2 border-amber-400/80 rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl flex flex-col items-center text-center max-h-[92dvh] overflow-y-auto custom-scrollbar my-auto">
            
            {/* TOMBOL TUTUP / KEMBALI */}
            <button
              onClick={() => {
                playSound('click')
                onBack && onBack()
              }}
              className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs flex items-center justify-center cursor-pointer transition-all active:scale-90"
              title="Kembali ke Menu"
            >
              ✕
            </button>

            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-3xl shadow-lg mb-2">
              🏆
            </div>

            <div className="text-[10px] font-black uppercase tracking-widest text-amber-300 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 mb-1.5">
              HARI 2 - MISI C SELESAI
            </div>

            <h2 className="text-lg sm:text-xl font-black text-amber-400 mb-1">
              Pakar Menu Isi Piringku Anti Anemia!
            </h2>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Luar biasa! Kamu berhasil menyusun menu gizi seimbang kaya zat besi dan vitamin C lengkap untuk 3 kali makan sehari!
            </p>

            {/* RINGKASAN MENU 3 WAKTU MAKAN */}
            <div className="w-full space-y-2 mb-4 text-left">
              {SESSIONS.map((sess) => {
                const p = dailyPlates[sess.key]
                const correctCount = countCorrectInPlate(p)
                return (
                  <div key={sess.key} className="bg-white/5 border border-white/10 rounded-xl p-2 sm:p-2.5">
                    <div className="text-xs font-bold text-amber-300 flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <span>{sess.icon}</span>
                        <span>{sess.title}</span>
                      </div>
                      <span className="text-[10px] text-amber-200 font-bold bg-black/40 px-2 py-0.5 rounded-full">
                        {correctCount}/5 Benar (+{Math.round(correctCount * (100 / 15) * 10) / 10} PTS)
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 text-center text-[9px] text-slate-200">
                      {[
                        { icon: '🍚', item: p.karbohidrat },
                        { icon: '🍗', item: p.protein_hewani },
                        { icon: '🥜', item: p.protein_nabati },
                        { icon: '🥦', item: p.sayur },
                        { icon: '🍊', item: p.buah }
                      ].map(({ icon, item }, idx) => {
                        const isItemWrong = item && WRONG_FOOD_IDS.includes(item.id)
                        return (
                          <div
                            key={idx}
                            className={`p-1 rounded truncate flex flex-col items-center ${
                              isItemWrong ? 'bg-rose-950/60 text-rose-300 line-through border border-rose-500/40' : 'bg-black/30'
                            }`}
                            title={item?.name}
                          >
                            <span>{icon} {item?.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* KOTAK SKOR & STATUS PENYIMPANAN */}
            <div className="w-full flex items-center justify-around py-2 px-4 rounded-xl bg-amber-500/20 border border-amber-400/40 mb-4">
              <div>
                <div className="text-[10px] text-amber-200 font-bold uppercase">Skor Misi C</div>
                <div className="text-xl font-black text-amber-300">+{currentScore} PTS</div>
              </div>
              <div className="h-7 w-px bg-white/20" />
              <div>
                <div className="text-[10px] text-slate-300 font-bold uppercase">Status</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5">
                  {isSaving ? 'Menyimpan...' : 'Tersimpan ✓'}
                </div>
              </div>
            </div>

            {/* TOMBOL SELESAI MISI HARI 2 & BALAPAN SKOR */}
            <div className="w-full flex flex-col gap-2">
              <button
                onClick={() => {
                  playSound('click')
                  setShowLeaderboard(true)
                }}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-amber-300"
              >
                <span>🏁 Lihat Balapan Skor Hari 2</span>
                <span className="text-base font-black">➔</span>
              </button>

              <button
                onClick={() => {
                  playSound('click')
                  onComplete &&
                    onComplete({
                      score: currentScore,
                      missionId: misiId,
                      nextMission: null
                    })
                }}
                className="w-full py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                🎉 Misi Hari 2 Selesai! Kembali ke Menu Misi ➔
              </button>

              <button
                onClick={() => {
                  playSound('click')
                  onBack && onBack()
                }}
                className="w-full py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                Kembali ke Menu Misi
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL BALAPAN SKOR / LEADERBOARD HARI 2 */}
      <ScoreRaceLeaderboardModal
        isOpen={showLeaderboard}
        currentMissionId="misi_h2_c"
        currentMissionTitle="Misi C Hari 2: Isi Piringku"
        currentScore={currentScore}
        nextMissionKey={null}
        nextMissionTitle="Selesai Misi Hari 2"
        onNext={() => {
          setShowLeaderboard(false)
          onComplete &&
            onComplete({
              score: currentScore,
              missionId: misiId,
              nextMission: null
            })
          onBack && onBack()
        }}
        onBackToMenu={() => {
          setShowLeaderboard(false)
          onComplete &&
            onComplete({
              score: currentScore,
              missionId: misiId,
              nextMission: null
            })
          onBack && onBack()
        }}
      />

      {/* =====================================================================
          PROTEKSI 1X PERCOBAAN (JIKA SUDAH SELESAI SEBELUMNYA)
          ===================================================================== */}
      {alreadyCompleted && stage !== 4 && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c0a0e] border-2 border-emerald-400 rounded-3xl p-6 sm:p-7 max-w-sm w-full text-center shadow-2xl flex flex-col items-center animate-zoom-in">
            <div className="w-14 h-14 bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 rounded-full flex items-center justify-center text-3xl mb-3 shadow-inner">
              ✓
            </div>
            <h2 className="text-white font-black text-base sm:text-lg mb-1">
              Misi C Hari 2 Selesai!
            </h2>
            <p className="text-slate-300 text-xs mb-4 leading-relaxed">
              Kamu telah menyelesaikan misi penyusunan Isi Piringku ini dengan skor <strong className="text-amber-400">{existingScore} PTS</strong>. Setiap misi hanya dapat diakses 1x percobaan.
            </p>
            <div className="w-full flex flex-col gap-2">
              <button
                onClick={() => {
                  playSound('click')
                  onComplete &&
                    onComplete({
                      score: existingScore,
                      missionId: misiId,
                      nextMission: 'd'
                    })
                }}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Lanjut ke Misi D ➔
              </button>
              <button
                onClick={() => {
                  playSound('click')
                  onBack && onBack()
                }}
                className="w-full py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                Kembali ke Menu Misi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL PANDUAN GIZI (BISA DIBUKA SEWAKTU-WAKTU DARI HEADER)
          ===================================================================== */}
      {showMateriModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
          <div className="relative max-w-lg w-full bg-[#1c0a0e] text-white border-2 border-amber-500/60 rounded-3xl p-4 sm:p-5 flex flex-col items-center">
            <button
              onClick={() => {
                playSound('click')
                setShowMateriModal(false)
              }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-rose-600 text-white font-bold flex items-center justify-center transition cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-amber-400 font-black text-sm sm:text-base mb-2">
              📖 Panduan Konsep Isi Piringku
            </h3>
            <img
              src={arahan1Img}
              alt="Panduan Isi Piringku"
              className="w-full h-auto max-h-[60vh] object-contain rounded-xl mb-3 shadow"
            />
            <button
              onClick={() => {
                playSound('click')
                setShowMateriModal(false)
              }}
              className="px-6 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow cursor-pointer"
            >
              Tutup & Lanjut Susun Menu
            </button>
          </div>
        </div>
      )}

      {/* FLOATING DRAG CLONE UNTUK PERANGKAT SENTUH / MOBILE */}
      {touchDrag && (
        <div
          className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 filter drop-shadow-2xl scale-125"
          style={{
            left: `${touchDrag.x}px`,
            top: `${touchDrag.y}px`
          }}
        >
          <img
            src={touchDrag.food.img}
            alt={touchDrag.food.name}
            className="w-16 h-16 object-contain animate-pulse"
          />
        </div>
      )}

      {/* =====================================================================
          TOAST FEEDBACK EDUKASI KARTUN MELAYANG
          ===================================================================== */}
      {toastMsg && (
        <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-950/95 border border-amber-400/80 text-amber-200 text-xs sm:text-sm font-bold shadow-2xl animate-fade-in text-center max-w-[90vw]">
          {toastMsg}
        </div>
      )}

    </div>
  )
}
