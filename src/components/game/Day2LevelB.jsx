import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { playSound } from '../../utils/audio'

// BACKGROUND DAN ASET UTAMA DAY 2B
import bgImg from '../../assets/14. day 2B/background.png'
import piringImg from '../../assets/14. day 2B/aset/piring.png'
import karakterImg from '../../assets/14. day 2B/aset/karakter.PNG'
import aturanPoinImg from '../../assets/14. day 2B/aset/aturan poin.PNG'

// ASET PAPAN & KARTU YANG SUDAH DI-CROP (PRESISI TANPA MARGIN TRANSPARAN KOSONG)
import warningCrop from '../../assets/14. day 2B/aset/warning_crop.png'
import startCrop from '../../assets/14. day 2B/aset/start_crop.png'
import listZatBesiCrop from '../../assets/14. day 2B/aset/list_zat_besi_crop.png'
import listVitCCrop from '../../assets/14. day 2B/aset/list_vit_c_crop.png'
import listTaninCrop from '../../assets/14. day 2B/aset/list_tanin_crop.png'

// PROFIL AVATAR
import bgProfilPria from '../../assets/6/game home - profil pria_crop.png'
import bgProfilWanita from '../../assets/6/game home - profil wanita_crop.png'

// ASET BAHAN MAKANAN (+1: HEWANI / ZAT BESI HEME)
import ayamImg from '../../assets/14. day 2B/aset/+1/ayam.png'
import cumiImg from '../../assets/14. day 2B/aset/+1/cumi.png'
import dagingImg from '../../assets/14. day 2B/aset/+1/daging.png'
import hatiAyamImg from '../../assets/14. day 2B/aset/+1/hati ayam.png'
import ikanImg from '../../assets/14. day 2B/aset/+1/ikan.png'
import telurImg from '../../assets/14. day 2B/aset/+1/telur.png'

// ASET BAHAN MAKANAN (+0,5: NABATI & VITAMIN C)
import anggurImg from '../../assets/14. day 2B/aset/+0,5/anggur.png'
import bayamImg from '../../assets/14. day 2B/aset/+0,5/bayam.png'
import brokoliImg from '../../assets/14. day 2B/aset/+0,5/brokoli.png'
import esJerukImg from '../../assets/14. day 2B/aset/+0,5/es jeruk.png'
import jamurKupingImg from '../../assets/14. day 2B/aset/+0,5/jamur kuping.png'
import jerukImg from '../../assets/14. day 2B/aset/+0,5/jeruk.png'
import jusManggaImg from '../../assets/14. day 2B/aset/+0,5/jus mangga.png'
import kacangMerahImg from '../../assets/14. day 2B/aset/+0,5/kacang merah.png'
import kelorImg from '../../assets/14. day 2B/aset/+0,5/kelor.png'
import lemonImg from '../../assets/14. day 2B/aset/+0,5/lemon.png'
import pepayaImg from '../../assets/14. day 2B/aset/+0,5/pepaya.png'
import tahuImg from '../../assets/14. day 2B/aset/+0,5/tahu.png'
import tempeImg from '../../assets/14. day 2B/aset/+0,5/tempe.png'

// ASET BAHAN MAKANAN (-1,5: PENCURI ZAT BESI / TANIN)
import coklatImg from '../../assets/14. day 2B/aset/-1,5/coklat.png'
import esTehImg from '../../assets/14. day 2B/aset/-1,5/es teh.png'
import kopiImg from '../../assets/14. day 2B/aset/-1,5/kopi.png'
import matchaImg from '../../assets/14. day 2B/aset/-1,5/matcha.png'

// ASET BAHAN MAKANAN (0: NETRAL / JUNK FOOD)
import basoAciImg from '../../assets/14. day 2B/aset/0 (tidak memberi poin apapun)/baso aci.png'
import cilokImg from '../../assets/14. day 2B/aset/0 (tidak memberi poin apapun)/cilok.png'
import colaImg from '../../assets/14. day 2B/aset/0 (tidak memberi poin apapun)/cola.png'
import donatImg from '../../assets/14. day 2B/aset/0 (tidak memberi poin apapun)/donat.png'
import jamuImg from '../../assets/14. day 2B/aset/0 (tidak memberi poin apapun)/jamu.png'
import mieImg from '../../assets/14. day 2B/aset/0 (tidak memberi poin apapun)/mie.png'
import pudingImg from '../../assets/14. day 2B/aset/0 (tidak memberi poin apapun)/puding.png'
import rotiImg from '../../assets/14. day 2B/aset/0 (tidak memberi poin apapun)/roti.png'
import sosisImg from '../../assets/14. day 2B/aset/0 (tidak memberi poin apapun)/sosis.png'
import ususImg from '../../assets/14. day 2B/aset/0 (tidak memberi poin apapun)/usus.png'
import waffleImg from '../../assets/14. day 2B/aset/0 (tidak memberi poin apapun)/waffle.png'

// MASTER DATA DAFTAR MAKANAN
export const ALL_FOODS = [
  // HEWANI (+1 Hb)
  { id: 'h_ayam', name: 'Ayam', category: 'hewani', hb: 1.0, pts: 15, image: ayamImg },
  { id: 'h_cumi', name: 'Cumi-cumi', category: 'hewani', hb: 1.0, pts: 15, image: cumiImg },
  { id: 'h_daging', name: 'Daging Sapi', category: 'hewani', hb: 1.0, pts: 15, image: dagingImg },
  { id: 'h_hati', name: 'Hati Ayam', category: 'hewani', hb: 1.0, pts: 15, image: hatiAyamImg },
  { id: 'h_ikan', name: 'Ikan', category: 'hewani', hb: 1.0, pts: 15, image: ikanImg },
  { id: 'h_telur', name: 'Telur', category: 'hewani', hb: 1.0, pts: 15, image: telurImg },

  // NABATI (+0.5 Hb)
  { id: 'n_bayam', name: 'Bayam', category: 'nabati', hb: 0.5, pts: 10, image: bayamImg },
  { id: 'n_brokoli', name: 'Brokoli', category: 'nabati', hb: 0.5, pts: 10, image: brokoliImg },
  { id: 'n_jamur', name: 'Jamur Kuping', category: 'nabati', hb: 0.5, pts: 10, image: jamurKupingImg },
  { id: 'n_kacang', name: 'Kacang Merah', category: 'nabati', hb: 0.5, pts: 10, image: kacangMerahImg },
  { id: 'n_kelor', name: 'Daun Kelor', category: 'nabati', hb: 0.5, pts: 10, image: kelorImg },
  { id: 'n_tahu', name: 'Tahu', category: 'nabati', hb: 0.5, pts: 10, image: tahuImg },
  { id: 'n_tempe', name: 'Tempe', category: 'nabati', hb: 0.5, pts: 10, image: tempeImg },

  // VITAMIN C (+0.5 Hb)
  { id: 'v_jeruk', name: 'Jeruk', category: 'vit_c', hb: 0.5, pts: 10, image: jerukImg },
  { id: 'v_es_jeruk', name: 'Es Jeruk', category: 'vit_c', hb: 0.5, pts: 10, image: esJerukImg },
  { id: 'v_jus_mangga', name: 'Jus Mangga', category: 'vit_c', hb: 0.5, pts: 10, image: jusManggaImg },
  { id: 'v_lemon', name: 'Lemon', category: 'vit_c', hb: 0.5, pts: 10, image: lemonImg },
  { id: 'v_pepaya', name: 'Pepaya', category: 'vit_c', hb: 0.5, pts: 10, image: pepayaImg },
  { id: 'v_anggur', name: 'Anggur', category: 'vit_c', hb: 0.5, pts: 10, image: anggurImg },

  // TANIN (-1.5 Hb)
  { id: 't_es_teh', name: 'Es Teh', category: 'tanin', hb: -1.5, pts: -10, image: esTehImg },
  { id: 't_kopi', name: 'Kopi', category: 'tanin', hb: -1.5, pts: -10, image: kopiImg },
  { id: 't_coklat', name: 'Cokelat', category: 'tanin', hb: -1.5, pts: -10, image: coklatImg },
  { id: 't_matcha', name: 'Matcha', category: 'tanin', hb: -1.5, pts: -10, image: matchaImg },

  // NETRAL (0 Hb)
  { id: '0_baso_aci', name: 'Baso Aci', category: 'netral', hb: 0, pts: 0, image: basoAciImg },
  { id: '0_cilok', name: 'Cilok', category: 'netral', hb: 0, pts: 0, image: cilokImg },
  { id: '0_cola', name: 'Minuman Soda', category: 'netral', hb: 0, pts: 0, image: colaImg },
  { id: '0_donat', name: 'Donat', category: 'netral', hb: 0, pts: 0, image: donatImg },
  { id: '0_jamu', name: 'Jamu', category: 'netral', hb: 0, pts: 0, image: jamuImg },
  { id: '0_mie', name: 'Mie Instan', category: 'netral', hb: 0, pts: 0, image: mieImg },
  { id: '0_puding', name: 'Puding', category: 'netral', hb: 0, pts: 0, image: pudingImg },
  { id: '0_roti', name: 'Roti', category: 'netral', hb: 0, pts: 0, image: rotiImg },
  { id: '0_sosis', name: 'Sosis', category: 'netral', hb: 0, pts: 0, image: sosisImg },
  { id: '0_usus', name: 'Usus Goreng', category: 'netral', hb: 0, pts: 0, image: ususImg },
  { id: '0_waffle', name: 'Waffle', category: 'netral', hb: 0, pts: 0, image: waffleImg },
]

export default function Day2LevelB({ misiId = 'misi_h2_b', onBack, onComplete }) {
  // STAGES:
  // 1: Warning 4 Jurus
  // 2: Aturan Poin & Miskah
  // 3: 3 List Makanan
  // 4: Start Catcher
  // 5: Gameplay Catcher
  // 6: Victory Screen
  const [stage, setStage] = useState(1)

  // USER & SCORE
  const [currentUser, setCurrentUser] = useState(null)
  const [currentScore, setCurrentScore] = useState(100)
  const [totalUserScore, setTotalUserScore] = useState(0)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)
  const [existingScore, setExistingScore] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [hemoglobin, setHemoglobin] = useState(1.0) // Mulai dari 1,0 g/dl
  const targetHb = 12.0

  // GAMEPLAY STATE
  const [plateX, setPlateX] = useState(50) // Persentase 0-100%
  const [fallingItems, setFallingItems] = useState([])
  const [floatingFeedbacks, setFloatingFeedbacks] = useState([])
  const [caughtStats, setCaughtStats] = useState({
    hewani: 0,
    nabati: 0,
    vitC: 0,
    tanin: 0,
    netral: 0,
    comboCount: 0,
  })
  const [lastCaughtCategory, setLastCaughtCategory] = useState(null)
  const [isPlateBouncing, setIsPlateBouncing] = useState(false)

  // REFS
  const arenaRef = useRef(null)
  const plateRef = useRef(null)
  const animationFrameRef = useRef(null)
  const spawnTimerRef = useRef(null)
  const plateXRef = useRef(50)
  const hemoglobinRef = useRef(1.0)
  const isPlayingRef = useRef(false)
  const startTimeRef = useRef(Date.now())
  const spawnedCountRef = useRef(0)
  const isVictoryTriggeredRef = useRef(false)

  // TOTAL MAKANAN YANG DIKELUARKAN (25 MAKANAN)
  const TOTAL_SPAWN_FOODS = 25
  const [spawnedCount, setSpawnedCount] = useState(0)

  useEffect(() => {
    plateXRef.current = plateX
  }, [plateX])

  useEffect(() => {
    hemoglobinRef.current = hemoglobin
  }, [hemoglobin])

  // LOAD USER PROFILE & INTEGRASI SUPABASE
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

        // Ambil riwayat skor & cek apakah Misi B sudah pernah dikerjakan (1x percobaan)
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
      } catch (e) {
        console.error('Error load user Supabase Day 2 Level B:', e)
        setCurrentUser({ username: uName, gender: 'female' })
      }
    }
    fetchUser()
  }, [misiId])

  // KONTROL KEYBOARD PIRING
  useEffect(() => {
    if (stage !== 5) return

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setPlateX((prev) => Math.max(10, prev - 4))
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setPlateX((prev) => Math.min(90, prev + 4))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [stage])

  // KONTROL MOUSE / TOUCH
  const handlePointerMove = (e) => {
    if (stage !== 5 || !arenaRef.current) return
    const rect = arenaRef.current.getBoundingClientRect()
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX)
    if (clientX === undefined) return
    const relativeX = clientX - rect.left
    const percentage = (relativeX / rect.width) * 100
    const clamped = Math.max(10, Math.min(90, percentage))
    setPlateX(clamped)
  }

  // SPAWN MAKANAN JATUH
  const spawnFoodItem = () => {
    if (isVictoryTriggeredRef.current) return
    if (hemoglobinRef.current >= targetHb) return
    if (spawnedCountRef.current >= TOTAL_SPAWN_FOODS) return

    spawnedCountRef.current += 1
    setSpawnedCount(spawnedCountRef.current)

    const rand = Math.random()
    let pool = []
    if (rand < 0.35) {
      pool = ALL_FOODS.filter((f) => f.category === 'hewani')
    } else if (rand < 0.65) {
      pool = ALL_FOODS.filter((f) => f.category === 'nabati' || f.category === 'vit_c')
    } else if (rand < 0.83) {
      pool = ALL_FOODS.filter((f) => f.category === 'tanin')
    } else {
      pool = ALL_FOODS.filter((f) => f.category === 'netral')
    }

    const selectedFood = pool[Math.floor(Math.random() * pool.length)]
    const randomLane = 10 + Math.random() * 80
    const speed = 0.45 + Math.random() * 0.2

    const newItem = {
      instanceId: `${selectedFood.id}_${Date.now()}_${Math.random()}`,
      food: selectedFood,
      x: randomLane,
      y: -10,
      speed: speed,
    }

    setFallingItems((prev) => [...prev, newItem])
  }

  // GAME LOOP (stage === 5)
  useEffect(() => {
    if (stage !== 5) {
      isPlayingRef.current = false
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current)
      return
    }

    isPlayingRef.current = true
    isVictoryTriggeredRef.current = false
    spawnedCountRef.current = 0
    setSpawnedCount(0)

    const scheduleNextSpawn = () => {
      if (!isPlayingRef.current || isVictoryTriggeredRef.current) return
      if (spawnedCountRef.current < TOTAL_SPAWN_FOODS && hemoglobinRef.current < targetHb) {
        spawnFoodItem()
        const nextDelay = 1050 + Math.random() * 350
        spawnTimerRef.current = setTimeout(scheduleNextSpawn, nextDelay)
      }
    }
    scheduleNextSpawn()

    let lastTime = performance.now()
    const loop = (currentTime) => {
      const deltaTime = Math.min(currentTime - lastTime, 32)
      lastTime = currentTime

      if (!isPlayingRef.current) return

      setFallingItems((prevItems) => {
        const nextItems = []
        const currentPlateX = plateXRef.current
        const plateWidth = 22

        prevItems.forEach((item) => {
          const nextY = item.y + item.speed * (deltaTime / 16) * 1.5
          // Makanan langsung tertangkap saat menyentuh bagian atas piring (Y: 66% s/d 84%)
          const hitY = nextY >= 66 && nextY <= 84
          const hitX = Math.abs(item.x - currentPlateX) <= plateWidth / 2

          if (hitY && hitX) {
            handleItemCatch(item.food, item.x)
          } else if (nextY > 105) {
            // Lolos ke bawah
          } else {
            nextItems.push({ ...item, y: nextY })
          }
        })

        // KONDISI SELESAI: SEMUA MAKANAN TELAH KELUAR DAN SEMUA SUDAH JATUH/TERTANGKAP, ATAU HB PENUH
        if (
          !isVictoryTriggeredRef.current &&
          ((spawnedCountRef.current >= TOTAL_SPAWN_FOODS && nextItems.length === 0) || hemoglobinRef.current >= targetHb)
        ) {
          setTimeout(() => {
            triggerVictory()
          }, 400)
        }

        return nextItems
      })

      animationFrameRef.current = requestAnimationFrame(loop)
    }

    animationFrameRef.current = requestAnimationFrame(loop)

    return () => {
      isPlayingRef.current = false
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current)
    }
  }, [stage])

  // SAAT MAKANAN TERTANGKAP
  const handleItemCatch = (food, catchX) => {
    if (isVictoryTriggeredRef.current) return

    setIsPlateBouncing(true)
    setTimeout(() => setIsPlateBouncing(false), 200)

    let hbDelta = food.hb
    let isDuetCombo = false

    if (
      (food.category === 'vit_c' && (lastCaughtCategory === 'hewani' || lastCaughtCategory === 'nabati')) ||
      ((food.category === 'hewani' || food.category === 'nabati') && lastCaughtCategory === 'vit_c')
    ) {
      hbDelta += 0.5
      isDuetCombo = true
    }

    setCaughtStats((prev) => ({
      ...prev,
      hewani: prev.hewani + (food.category === 'hewani' ? 1 : 0),
      nabati: prev.nabati + (food.category === 'nabati' ? 1 : 0),
      vitC: prev.vitC + (food.category === 'vit_c' ? 1 : 0),
      tanin: prev.tanin + (food.category === 'tanin' ? 1 : 0),
      netral: prev.netral + (food.category === 'netral' ? 1 : 0),
      comboCount: prev.comboCount + (isDuetCombo ? 1 : 0),
    }))

    setLastCaughtCategory(food.category)

    // HITUNG NILAI HEMOGLOBIN SECARA SINKRON MELALUI REF
    const currentHb = hemoglobinRef.current
    const calculatedHb = Math.min(targetHb, Math.max(1.0, +(currentHb + hbDelta).toFixed(1)))
    hemoglobinRef.current = calculatedHb
    setHemoglobin(calculatedHb)

    if (food.category === 'tanin') {
      playSound('wrong')
      setCurrentScore((prev) => Math.max(60, prev - 5))
    } else if (food.category === 'netral') {
      playSound('click')
    } else {
      playSound('correct')
    }

    // FLOATING FEEDBACK
    const feedbackId = Date.now() + Math.random()
    let feedbackText = ''
    let feedbackColor = ''

    if (isDuetCombo) {
      feedbackText = `DUET MAUT! +${hbDelta} g/dl (Vit C + Besi!) 🎉`
      feedbackColor = 'bg-amber-500 text-white border-amber-300'
    } else if (food.category === 'hewani') {
      feedbackText = `+1,0 g/dl (${food.name})`
      feedbackColor = 'bg-emerald-600 text-white border-emerald-400'
    } else if (food.category === 'nabati') {
      feedbackText = `+0,5 g/dl (${food.name})`
      feedbackColor = 'bg-teal-600 text-white border-teal-400'
    } else if (food.category === 'vit_c') {
      feedbackText = `+0,5 g/dl (${food.name})`
      feedbackColor = 'bg-orange-500 text-white border-orange-300'
    } else if (food.category === 'tanin') {
      feedbackText = `-1,5 g/dl (${food.name} - Tanin!) ⚠️`
      feedbackColor = 'bg-rose-600 text-white border-rose-400 animate-pulse'
    } else {
      feedbackText = `+0 g/dl (${food.name})`
      feedbackColor = 'bg-slate-700 text-slate-200 border-slate-500'
    }

    setFloatingFeedbacks((prev) => [
      ...prev,
      { id: feedbackId, text: feedbackText, color: feedbackColor, x: catchX, y: 64 },
    ])

    setTimeout(() => {
      setFloatingFeedbacks((prev) => prev.filter((f) => f.id !== feedbackId))
    }, 1100)

    // JIKA HEMOGLOBIN PENUH (12 g/dl) -> LANGSUNG TRIGGER KEMENANGAN!
    if (calculatedHb >= targetHb) {
      triggerVictory()
    }
  }

  // FAIL-SAFE GUARD: PASTIKAN POP-UP SKOR MUNCUL KETIKA MAKANAN SELESAI ATAU HB MENCAPAI TARGET
  useEffect(() => {
    if (stage !== 5) return
    if (isVictoryTriggeredRef.current) return

    if (hemoglobin >= targetHb) {
      triggerVictory()
      return
    }

    if (spawnedCountRef.current >= TOTAL_SPAWN_FOODS && fallingItems.length === 0) {
      const timer = setTimeout(() => {
        triggerVictory()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [hemoglobin, fallingItems, stage])

  useEffect(() => {
    if (stage === 5) {
      startTimeRef.current = Date.now()
    }
  }, [stage])

  // TRIGGER VICTORY
  const triggerVictory = async () => {
    if (isVictoryTriggeredRef.current) return
    isVictoryTriggeredRef.current = true
    isPlayingRef.current = false

    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current)
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)

    playSound('levelComplete')
    setIsSaving(true)

    try {
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
      localStorage.setItem('misi_h2_b_completed', 'true')
      localStorage.setItem('misi_h2_b_score', currentScore.toString())

      // Pastikan username valid sesuai database (case-matched ke game_users)
      let validUser = currentUser?.username || localStorage.getItem('anemia_username') || 'ais'
      const { data: dbUser } = await supabase
        .from('game_users')
        .select('username')
        .ilike('username', validUser)
        .maybeSingle()

      if (dbUser?.username) {
        validUser = dbUser.username
        localStorage.setItem('anemia_username', validUser)
      }

      const { error: insertErr } = await supabase.from('game_scores').insert([
        {
          username: validUser,
          kategori_game: misiId,
          skor: currentScore,
          durasi_detik: durationSeconds,
        },
      ])

      if (insertErr) {
        console.error('Gagal menyimpan skor Day 2 Level B ke Supabase:', insertErr)
      } else {
        console.log('Berhasil menyimpan skor Day 2 Level B ke Supabase!')
        setIsSaved(true)
        setTotalUserScore((prev) => prev + currentScore)
        setAlreadyCompleted(true)
        setExistingScore(currentScore)
      }
    } catch (err) {
      console.warn('Gagal menyimpan skor ke Supabase:', err)
    } finally {
      setIsSaving(false)
    }

    setTimeout(() => {
      setStage(6)
    }, 600)
  }

  // PERSENTASE PENGISIAN BAR HEMOGLOBIN (MINIMAL 20% AGAR BADGE ANGKA LEGA)
  const hbPercent = Math.min(100, Math.max(20, (hemoglobin / targetHb) * 100))

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#003049] flex flex-col justify-between select-none font-sans">
      
      {/* =========================================================================
          TOP NAVY BAR (PERSIS GAMBAR REFERENSI DENGAN GAUGE HEMOGLOBIN RAPI)
          ========================================================================= */}
      <header className="relative z-30 w-full h-[14vh] min-h-[70px] max-h-[105px] bg-[#003049] flex items-center justify-between px-3 sm:px-6 md:px-8 border-b border-sky-950/40">
        {/* TOMBOL KELUAR */}
        <button
          onClick={() => {
            playSound('click')
            onBack && onBack()
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all shadow-sm"
        >
          <span>←</span>
          <span>Keluar</span>
        </button>

        {/* INDIKATOR HEMOGLOBIN (TAHAP 2 S/D 5): TEKS RAPI SATU BARIS TANPA TERPOTONG */}
        {stage >= 2 && stage <= 5 ? (
          <div className="flex flex-col items-center">
            <span className="text-white font-black text-xs sm:text-sm md:text-base tracking-wide mb-1 drop-shadow-sm">
              Hemoglobin
            </span>
            {/* KAPSUL TRACK PUTIH */}
            <div className="relative w-64 sm:w-80 md:w-[380px] h-8 sm:h-9 md:h-10 bg-white rounded-full p-1 flex items-center shadow-lg border border-white/60">
              {/* PILL MERAH KADAR HEMOGLOBIN SAAT INI (MIN-WIDTH LEGA & SATU BARIS) */}
              <div
                className="h-full bg-[#8B0000] text-white rounded-full flex items-center justify-center font-black text-xs sm:text-sm whitespace-nowrap transition-all duration-300 shadow-inner px-3 min-w-[85px] leading-none"
                style={{ width: `${hbPercent}%` }}
              >
                {hemoglobin.toFixed(1).replace('.', ',')} g/dl
              </div>
              {/* TARGET 12g/dl DI KANAN */}
              <span className="absolute right-3.5 text-[#003049] font-black text-xs sm:text-sm pointer-events-none whitespace-nowrap">
                12g/dl
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* PROFIL & SKOR PENGGUNA */}
        <div className="flex items-center gap-2">
          {stage === 5 && (
            <div className="hidden sm:flex px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-400/40 text-cyan-200 text-xs font-bold shadow-sm whitespace-nowrap">
              🍲 Makanan: {Math.min(spawnedCount, TOTAL_SPAWN_FOODS)}/{TOTAL_SPAWN_FOODS}
            </div>
          )}
          <div className="px-3 py-1 rounded-full bg-black/30 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-bold shadow-sm whitespace-nowrap">
            ⭐ {currentScore} PTS
          </div>
          <div className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-0.5 rounded-full bg-white/10 border border-white/20">
            <img
              src={currentUser?.gender === 'male' ? bgProfilPria : bgProfilWanita}
              alt="Avatar"
              className="w-6 h-6 rounded-full object-cover border border-amber-300"
            />
            <span className="text-[11px] font-bold text-white hidden sm:inline uppercase">
              {currentUser?.username || 'Ais'}
            </span>
          </div>
        </div>
      </header>

      {/* =========================================================================
          CENTER CANTEEN ARENA (AREA BERMAIN LEBIH LUAS KARENA FOOTER MEFET KE BAWAH)
          ========================================================================= */}
      <main
        ref={arenaRef}
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
        className="relative flex-1 w-full overflow-hidden flex items-center justify-center"
        style={{
          backgroundImage: `url("${bgImg}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* TAHAP 1: PAPAN WARNING LEBIH BESAR, BERSIH, PROPORSIONAL ANTARA DUA BAR BIRU */}
        {stage === 1 && (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 animate-fade-in">
            <img
              src={warningCrop}
              alt="Peringatan 4 Jurus Anti Anemia"
              onClick={() => {
                playSound('click')
                setStage(2)
              }}
              className="h-[68vh] max-h-[580px] w-auto max-w-[92vw] object-contain drop-shadow-2xl cursor-pointer hover:scale-[1.01] active:scale-95 transition-all"
            />
          </div>
        )}

        {/* TAHAP 2: ATURAN POIN & KARAKTER MISKAH */}
        {stage === 2 && (
          <div className="relative w-full h-full flex items-center justify-center px-4 md:px-12 animate-fade-in">
            {/* KARTU ATURAN POIN DI KIRI */}
            <div className="flex-1 max-w-3xl flex items-center justify-center">
              <img
                src={aturanPoinImg}
                alt="Aturan Poin Anti Anemia"
                className="w-full max-h-[72vh] object-contain drop-shadow-2xl"
              />
            </div>
            {/* KARAKTER MISKAH DI KANAN */}
            <div className="w-[30%] max-w-[280px] -ml-8 sm:-ml-16 md:-ml-24 z-10 flex items-center justify-center pointer-events-none">
              <img
                src={karakterImg}
                alt="Miskah"
                className="w-full max-h-[72vh] object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        )}

        {/* TAHAP 3: 3 KARTU MAKANAN DIPERBESAR MENDEKATI BATAS ATAS TANPA MENUTUP HEADER */}
        {stage === 3 && (
          <div className="relative w-full h-full flex items-center justify-center px-2 sm:px-4 md:px-6 py-1 overflow-hidden animate-fade-in">
            <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-5 max-w-5xl w-full h-[64vh] sm:h-[66vh] max-h-[530px]">
              <div className="h-full flex items-center justify-center">
                <img
                  src={listZatBesiCrop}
                  alt="Makanan Zat Besi"
                  className="h-full max-h-[63vh] sm:max-h-[65vh] w-auto object-contain drop-shadow-xl hover:scale-102 transition-transform"
                />
              </div>
              <div className="h-full flex items-center justify-center">
                <img
                  src={listVitCCrop}
                  alt="Makanan Vitamin C"
                  className="h-full max-h-[63vh] sm:max-h-[65vh] w-auto object-contain drop-shadow-xl hover:scale-102 transition-transform"
                />
              </div>
              <div className="h-full flex items-center justify-center">
                <img
                  src={listTaninCrop}
                  alt="Makanan Tanin"
                  className="h-full max-h-[63vh] sm:max-h-[65vh] w-auto object-contain drop-shadow-xl hover:scale-102 transition-transform"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAHAP 4: PAPAN MULAI DENGAN TOMBOL ASSET ASLI TANPA TEKS / TOMBOL TAMBAHAN */}
        {stage === 4 && (
          <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4 animate-fade-in">
            <div className="relative inline-block">
              <img
                src={startCrop}
                alt="Petunjuk & Tombol Mulai"
                className="h-[56vh] max-h-[450px] w-auto max-w-[92vw] object-contain drop-shadow-2xl select-none pointer-events-none"
              />
              {/* AREA KLIK TEPAT DI ATAS TOMBOL START GAMBAR ASSET (TANPA TEKS / OVERLAY TAMBAHAN) */}
              <button
                onClick={() => {
                  playSound('click')
                  setStage(5)
                }}
                className="absolute bottom-[8.5%] left-1/2 -translate-x-1/2 w-[25%] h-[26%] rounded-full bg-transparent hover:bg-white/15 active:scale-95 cursor-pointer transition-all focus:outline-none"
                title="Klik untuk Mulai"
              />
            </div>
          </div>
        )}

        {/* TAHAP 5: GAMEPLAY CATCHER MAKANAN (AREA LEBIH LUAS, PIRING LEBIH KECIL & ANIMASI SMOOTH) */}
        {stage === 5 && (
          <div className="relative z-10 w-full h-full overflow-hidden cursor-crosshair">
            {/* MAKANAN JATUH DARI ATAS MEJA KANTIN */}
            {fallingItems.map((item) => (
              <div
                key={item.instanceId}
                className="absolute pointer-events-none will-change-transform flex flex-col items-center"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '64px',
                  height: '64px',
                }}
              >
                <img
                  src={item.food.image}
                  alt={item.food.name}
                  className="w-full h-full object-contain drop-shadow-lg"
                />
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black/75 text-white whitespace-nowrap -mt-1 shadow">
                  {item.food.name}
                </span>
              </div>
            ))}

            {/* FLOATING FEEDBACK BADGE */}
            {floatingFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className={`absolute pointer-events-none px-3 py-1 rounded-full text-xs md:text-sm font-black border shadow-lg z-30 animate-bounce whitespace-nowrap ${fb.color}`}
                style={{
                  left: `${fb.x}%`,
                  top: `${fb.y}%`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                {fb.text}
              </div>
            ))}

            {/* PIRING PENANGKAP MAKANAN (GERAKAN HALUS & RESPONSIVE TANPA LAG TRANSISI) */}
            <div
              ref={plateRef}
              className="absolute bottom-1 sm:bottom-2 pointer-events-none z-20 will-change-transform flex flex-col items-center"
              style={{
                left: `${plateX}%`,
                transform: `translateX(-50%) ${isPlateBouncing ? 'scale(1.12)' : 'scale(1)'}`,
                transition: 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)',
                width: '130px',
                maxWidth: '30vw',
              }}
            >
              <img
                src={piringImg}
                alt="Piring Miskah"
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
            </div>

            {/* TOMBOL SENTUH KIRI-KANAN UNTUK MOBILE */}
            <div className="md:hidden absolute bottom-2 left-0 right-0 z-30 flex justify-between px-6 pointer-events-auto">
              <button
                onClick={() => setPlateX((prev) => Math.max(10, prev - 12))}
                className="w-12 h-12 rounded-full bg-black/60 active:bg-amber-500 border-2 border-white/40 text-white font-black text-xl flex items-center justify-center shadow-lg"
              >
                ◀
              </button>
              <button
                onClick={() => setPlateX((prev) => Math.min(90, prev + 12))}
                className="w-12 h-12 rounded-full bg-black/60 active:bg-amber-500 border-2 border-white/40 text-white font-black text-xl flex items-center justify-center shadow-lg"
              >
                ▶
              </button>
            </div>
          </div>
        )}

        {/* TAHAP 6: MODAL HASIL SELESAI MISI */}
        {stage === 6 && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 overflow-y-auto overscroll-contain py-4 animate-fade-in">
            <div className="relative max-w-sm sm:max-w-md w-full bg-[#003049] text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xl border-2 border-amber-400/50 flex flex-col items-center text-center max-h-[92dvh] overflow-y-auto custom-scrollbar my-auto">
              
              {/* TOMBOL TUTUP / KEMBALI */}
              <button
                onClick={() => {
                  playSound('click')
                  onBack && onBack()
                }}
                className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs flex items-center justify-center cursor-pointer transition-all active:scale-90"
                title="Kembali ke Menu"
              >
                ✕
              </button>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-xl sm:text-2xl shadow-lg mb-1">
                🏆
              </div>

              <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-300 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 mb-1">
                HARI 2 - MISI B SELESAI
              </div>

              <h2 className="text-sm sm:text-base font-black text-white mb-0.5">
                {hemoglobin >= targetHb
                  ? 'Hemoglobin Miskah Mencapai 12,0 g/dl!'
                  : `Misi Selesai: Hemoglobin Terkumpul ${hemoglobin.toFixed(1).replace('.', ',')} g/dl!`}
              </h2>

              <p className="text-[11px] sm:text-xs text-slate-300 mb-2 leading-tight">
                {hemoglobin >= targetHb
                  ? 'Hebat! Kamu berhasil memilih makanan bergizi tinggi zat besi & vitamin C, serta menghindari zat pencuri tanin!'
                  : 'Bagus! Seluruh pilihan makanan telah kamu pilah. Terus perbanyak konsumsi makanan kaya zat besi dan vitamin C ya!'}
              </p>

              {/* STATISTIK TANGKAPAN */}
              <div className="w-full grid grid-cols-2 gap-1.5 p-2 rounded-xl bg-white/5 border border-white/10 mb-2 text-left text-[11px]">
                <div>🍗 Hewani: <strong className="text-emerald-400">{caughtStats.hewani}x</strong></div>
                <div>🥦 Nabati: <strong className="text-teal-400">{caughtStats.nabati}x</strong></div>
                <div>🍊 Vitamin C: <strong className="text-amber-400">{caughtStats.vitC}x</strong></div>
                <div>☕ Tanin: <strong className="text-rose-400">{caughtStats.tanin}x</strong></div>
              </div>

              {/* KOTAK SKOR */}
              <div className="w-full flex items-center justify-around py-1.5 px-3 rounded-xl bg-amber-500/20 border border-amber-400/40 mb-3">
                <div>
                  <div className="text-[9px] text-amber-200 font-bold uppercase">Skor Misi B</div>
                  <div className="text-base sm:text-lg font-black text-amber-300">+{currentScore} PTS</div>
                </div>
                <div className="h-6 w-px bg-white/20" />
                <div>
                  <div className="text-[9px] text-slate-300 font-bold uppercase">Status</div>
                  <div className="text-[11px] font-bold text-emerald-400 mt-0.5">
                    {isSaving ? 'Menyimpan...' : 'Tersimpan ✓'}
                  </div>
                </div>
                <div className="h-6 w-px bg-white/20" />
                <div>
                  <div className="text-[9px] text-slate-300 font-bold uppercase">Hemoglobin</div>
                  <div className="text-base sm:text-lg font-black text-emerald-400">
                    {hemoglobin.toFixed(1).replace('.', ',')} g/dl
                  </div>
                </div>
              </div>

              {/* TOMBOL LANJUT KE MISI C & KEMBALI */}
              <div className="w-full flex flex-col gap-1.5">
                <button
                  onClick={() => {
                    playSound('click')
                    onComplete &&
                      onComplete({
                        score: currentScore,
                        missionId: misiId,
                        nextMission: 'c',
                      })
                  }}
                  className="w-full py-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 font-black text-xs sm:text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  Lanjut ke Game Selanjutnya: Misi C ➔
                </button>
                <button
                  onClick={() => {
                    playSound('click')
                    onBack && onBack()
                  }}
                  className="w-full py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 font-bold text-[11px] sm:text-xs transition-all active:scale-95 cursor-pointer"
                >
                  Kembali ke Menu Misi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            PROTEKSI 1X PERCOBAAN: JIKA SUDAH PERNAH MENYELESAIKAN MISI B HARI 2
            ===================================================================== */}
        {alreadyCompleted && stage !== 6 && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#002236] border-2 border-emerald-400 rounded-3xl p-6 sm:p-7 max-w-sm w-full text-center shadow-2xl flex flex-col items-center animate-zoom-in">
              <div className="w-14 h-14 bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 rounded-full flex items-center justify-center text-3xl mb-3 shadow-inner">
                ✓
              </div>
              <h2 className="text-white font-black text-base sm:text-lg mb-1">
                Misi B Hari 2 Selesai!
              </h2>
              <p className="text-slate-300 text-xs mb-4 leading-relaxed">
                Kamu telah menyelesaikan misi ini dengan skor <strong className="text-amber-400">{existingScore} PTS</strong>. Data capaian telah tersimpan di sistem.
              </p>
              <div className="w-full flex flex-col gap-2">
                <button
                  onClick={() => {
                    playSound('click')
                    onComplete &&
                      onComplete({
                        score: existingScore,
                        missionId: misiId,
                        nextMission: 'c',
                      })
                  }}
                  className="w-full py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Lanjut ke Misi C ➔
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
      </main>

      {/* =========================================================================
          BOTTOM NAVY BAR (DIRAMPINGKAN & MEPET KE BAWAH AGAR AREA BERMAIN LEBIH LUAS)
          ========================================================================= */}
      <footer className="relative z-30 w-full h-8 sm:h-9 bg-[#003049] flex items-center justify-between px-3 sm:px-6 md:px-8 border-t border-sky-950/40">
        {stage === 1 && (
          <button
            onClick={() => {
              playSound('click')
              setStage(2)
            }}
            className="ml-auto px-5 py-1 rounded-full bg-[#FFF494] hover:bg-[#FFE866] active:scale-95 text-slate-900 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Lanjut</span>
            <span>➔</span>
          </button>
        )}

        {stage === 2 && (
          <button
            onClick={() => {
              playSound('click')
              setStage(3)
            }}
            className="ml-auto px-5 py-1 rounded-full bg-[#FFF494] hover:bg-[#FFE866] active:scale-95 text-slate-900 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Lanjut ke Daftar Makanan</span>
            <span>➔</span>
          </button>
        )}

        {stage === 3 && (
          <button
            onClick={() => {
              playSound('click')
              setStage(4)
            }}
            className="ml-auto px-5 py-1 rounded-full bg-[#FFF494] hover:bg-[#FFE866] active:scale-95 text-slate-900 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Saya Siap Mulai</span>
            <span>➔</span>
          </button>
        )}

        {stage === 4 && (
          <div className="w-full flex items-center justify-center text-slate-300 text-[10px] sm:text-[11px] font-medium text-center">
            <span>💡 Ketuk tombol <strong>START</strong> di tengah untuk mulai menangkap makanan!</span>
          </div>
        )}

        {stage === 5 && (
          <div className="w-full flex items-center justify-center text-slate-300 text-[10px] sm:text-[11px] font-medium text-center">
            <span>💡 Geser mouse / jari atau gunakan <strong>Panah Kiri ◀ / Kanan ▶</strong> untuk mengarahkan piring ke makanan bergizi!</span>
          </div>
        )}

        {stage === 6 && (
          <div className="w-full text-center text-xs text-amber-300 font-bold">
            Misi B Hari 2 Berhasil Diselesaikan!
          </div>
        )}
      </footer>

    </div>
  )
}
