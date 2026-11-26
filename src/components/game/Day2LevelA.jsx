import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { playSound } from '../../utils/audio'

// ASET BUKU, KACA PEMBESAR, KERANJANG & PIRING
import bukuTertutupImg from '../../assets/13. day 2 A/aset/buku untuk dibuka dgn kaca pembesar.png'
import kacaPembesarImg from '../../assets/13. day 2 A/aset/kaca pembesar.png'
import bukuMateriImg from '../../assets/13. day 2 A/aset/buku isi materi.png'
import keranjangTandaGejalaImg from '../../assets/13. day 2 A/aset/keranjang tanda gejala.png'
import keranjangDampakImg from '../../assets/13. day 2 A/aset/keranjang dampak.png'
import piringImg from '../../assets/13. day 2 A/aset/piring.png'

// 13 KARTU KONDISI PILIHAN RESMI
import card132 from '../../assets/13. day 2 A/aset/isi pilihan/132_20261028_114411_0006.png'
import card133 from '../../assets/13. day 2 A/aset/isi pilihan/133_20261028_114411_0007.png'
import card134 from '../../assets/13. day 2 A/aset/isi pilihan/134_20261028_114411_0008.png'
import card135 from '../../assets/13. day 2 A/aset/isi pilihan/135_20261028_114411_0009.png'
import card136 from '../../assets/13. day 2 A/aset/isi pilihan/136_20261028_114412_0010.png'
import card137 from '../../assets/13. day 2 A/aset/isi pilihan/137_20261028_114412_0011.png'
import card138 from '../../assets/13. day 2 A/aset/isi pilihan/138_20261028_114412_0012.png'
import card139 from '../../assets/13. day 2 A/aset/isi pilihan/139_20261028_114412_0013.png'
import card140 from '../../assets/13. day 2 A/aset/isi pilihan/140_20261028_114412_0014.png'
import card141 from '../../assets/13. day 2 A/aset/isi pilihan/141_20261028_114412_0015.png'
import card142 from '../../assets/13. day 2 A/aset/isi pilihan/142_20261028_114412_0016.png'
import card143 from '../../assets/13. day 2 A/aset/isi pilihan/143_20261028_114412_0017.png'
import card144 from '../../assets/13. day 2 A/aset/isi pilihan/144_20261028_114412_0018.png'

// PROFIL AVATAR
import bgProfilPria from '../../assets/6/game home - profil pria_crop.png'
import bgProfilWanita from '../../assets/6/game home - profil wanita_crop.png'

// KOORDINAT PENATAAN 13 KARTU DI ATAS PIRING (SEIMBANG, TIDAK PADAT DI TENGAH & HANYA DI DALAM PIRING)
const CARD_LAYOUT = {
  // Baris 1 (Atas: y = -28% s/d -24%)
  '140': { x: -20, y: -26, z: 2 },  // Lemah
  '132': { x: 3, y: -28, z: 2 },    // Lelah
  '136': { x: 23, y: -24, z: 2 },   // Penurunan kemampuan aktivitas fisik

  // Baris 2 (Tengah-Atas: y = -14% s/d -10%)
  '141': { x: -16, y: -12, z: 3 },  // Lunglai
  '138': { x: 5, y: -14, z: 3 },    // Lesu
  '139': { x: 22, y: -10, z: 3 },   // Letih

  // Baris 3 (Tengah: y = 1% s/d 2%)
  '142': { x: -22, y: 1, z: 4 },    // Hb : < 12 g/dl
  '137': { x: 14, y: 2, z: 4 },     // Berisiko hamil prematur

  // Baris 4 (Tengah-Bawah: y = 15% s/d 16%)
  '133': { x: -21, y: 15, z: 5 },   // Penurunan Imunitas Tubuh
  '135': { x: 18, y: 16, z: 5 },    // Konjungtiva mata pucat

  // Baris 5 (Bawah: y = 26% s/d 28% - 100% AMAN DI DALAM PIRING)
  '143': { x: -20, y: 28, z: 6 },   // Penurunan Konsentrasi
  '134': { x: -1, y: 26, z: 6 },    // Pica (suka menyemil es batu)
  '144': { x: 20, y: 28, z: 6 },    // Penurunan Prestasi Belajar
}

// DAFTAR DATA LENGKAP KARTU
const ALL_CARDS = [
  { id: '132', image: card132, text: 'Lelah', category: 'gejala', label: 'Tanda & Gejala' },
  { id: '133', image: card133, text: 'Penurunan Imunitas Tubuh', category: 'dampak', label: 'Dampak' },
  { id: '134', image: card134, text: 'Pica (suka menyemil es batu)', category: 'gejala', label: 'Tanda & Gejala' },
  { id: '135', image: card135, text: 'Konjungtiva mata pucat', category: 'gejala', label: 'Tanda & Gejala' },
  { id: '136', image: card136, text: 'Penurunan kemampuan aktivitas fisik', category: 'dampak', label: 'Dampak' },
  { id: '137', image: card137, text: 'Berisiko menjadi ibu hamil melahirkan prematur', category: 'dampak', label: 'Dampak' },
  { id: '138', image: card138, text: 'Lesu', category: 'gejala', label: 'Tanda & Gejala' },
  { id: '139', image: card139, text: 'Letih', category: 'gejala', label: 'Tanda & Gejala' },
  { id: '140', image: card140, text: 'Lemah', category: 'gejala', label: 'Tanda & Gejala' },
  { id: '141', image: card141, text: 'Lunglai', category: 'gejala', label: 'Tanda & Gejala' },
  { id: '142', image: card142, text: 'Hb : < 12 g/dl', category: 'gejala', label: 'Tanda & Gejala' },
  { id: '143', image: card143, text: 'Penurunan Konsenterasi', category: 'dampak', label: 'Dampak' },
  { id: '144', image: card144, text: 'Penurunan Prestasi Belajar', category: 'dampak', label: 'Dampak' },
]

export default function Day2LevelA({ misiId = 'misi_h2_a', onBack, onComplete }) {
  // TAHAP ALUR GAME:
  // 1: Buka buku catatan dengan kaca pembesar
  // 2: Membaca materi buku
  // 3: Pisahkan kondisi ke dalam keranjang (Tampilan Canva Latar Merah & Piring Tengah)
  // 4: Selesai & Leaderboard
  const [phase, setPhase] = useState(1)

  // USER & SCORE STATE
  const [username, setUsername] = useState('Siswa')
  const [gender, setGender] = useState('female')
  const [totalUserScore, setTotalUserScore] = useState(0)
  const [currentScore, setCurrentScore] = useState(100)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)
  const [existingScore, setExistingScore] = useState(0)
  const [toastMsg, setToastMsg] = useState('')
  const [showMateriModal, setShowMateriModal] = useState(false)

  // TAHAP 1: KACA PEMBESAR INTERAKSI
  const [glassPos, setGlassPos] = useState({ x: 0, y: 0 })
  const [isDraggingGlass, setIsDraggingGlass] = useState(false)
  const [isBookHovered, setIsBookHovered] = useState(false)
  const [glassTriggered, setGlassTriggered] = useState(false)
  const bookRef = useRef(null)
  const glassRef = useRef(null)
  const dragStartGlass = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 })

  // TAHAP 3: 13 KARTU KONDISI DI ATAS PIRING
  const [cards, setCards] = useState(() =>
    ALL_CARDS.map(c => ({
      ...c,
      layout: CARD_LAYOUT[c.id] || { x: 0, y: 0, z: 5 },
      isSorted: false,
      sortedBasket: null
    }))
  )
  const [activeCardId, setActiveCardId] = useState(null)
  const [selectedCardId, setSelectedCardId] = useState(null)
  const [errorCardId, setErrorCardId] = useState(null)
  const [dragDelta, setDragDelta] = useState({ x: 0, y: 0 })
  const [hoverTarget, setHoverTarget] = useState(null) // 'gejala' | 'dampak' | null
  const [gejalaCount, setGejalaCount] = useState(0)
  const [dampakCount, setDampakCount] = useState(0)
  const [streak, setStreak] = useState(0)

  const basketGejalaRef = useRef(null)
  const basketDampakRef = useRef(null)
  const dragStartPointer = useRef({ x: 0, y: 0 })
  const startTimeRef = useRef(Date.now())

  // INISIALISASI USER & DATA
  useEffect(() => {
    const storedUsername = localStorage.getItem('anemia_username') || 'Siswa'
    setUsername(storedUsername)
    loadUserData(storedUsername)
  }, [])

  const loadUserData = async (uName) => {
    try {
      const { data: userData } = await supabase
        .from('game_users')
        .select('username, gender')
        .ilike('username', uName)
        .maybeSingle()
      
      const canonicalUser = userData?.username || uName
      setUsername(canonicalUser)
      if (userData?.username) {
        localStorage.setItem('anemia_username', userData.username)
      }
      if (userData?.gender) {
        setGender(userData.gender.toLowerCase())
      }

      const { data: scoreData } = await supabase
        .from('game_scores')
        .select('kategori_game, skor')
        .ilike('username', canonicalUser)

      if (scoreData && scoreData.length > 0) {
        const sum = scoreData.reduce((acc, curr) => acc + (curr.skor || 0), 0)
        setTotalUserScore(sum)

        // Cek proteksi 1x percobaan dari database
        const existing = scoreData.find(item => item.kategori_game === misiId)
        if (existing) {
          setAlreadyCompleted(true)
          setExistingScore(existing.skor || 0)
        }
      }
    } catch (err) {
      console.error('Error load user:', err)
    }
  }

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2400)
  }

  // =========================================================================
  // TAHAP 1: KACA PEMBESAR DRAG & DROP LOGIC
  // =========================================================================
  const handleGlassPointerDown = (e) => {
    if (glassTriggered) return
    e.preventDefault()
    setIsDraggingGlass(true)
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0
    dragStartGlass.current = {
      mouseX: clientX,
      mouseY: clientY,
      posX: glassPos.x,
      posY: glassPos.y
    }
    playSound('click')
  }

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDraggingGlass || glassTriggered) return
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0
      const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0

      const deltaX = clientX - dragStartGlass.current.mouseX
      const deltaY = clientY - dragStartGlass.current.mouseY
      setGlassPos({
        x: dragStartGlass.current.posX + deltaX,
        y: dragStartGlass.current.posY + deltaY
      })

      if (bookRef.current && glassRef.current) {
        const bookRect = bookRef.current.getBoundingClientRect()
        const glassRect = glassRef.current.getBoundingClientRect()

        const glassCenterX = glassRect.left + glassRect.width * 0.4
        const glassCenterY = glassRect.top + glassRect.height * 0.4

        const isInside = (
          glassCenterX >= bookRect.left &&
          glassCenterX <= bookRect.right &&
          glassCenterY >= bookRect.top &&
          glassCenterY <= bookRect.bottom
        )
        setIsBookHovered(isInside)
      }
    }

    const handlePointerUp = () => {
      if (!isDraggingGlass || glassTriggered) return
      setIsDraggingGlass(false)

      if (isBookHovered) {
        triggerOpenBook()
      } else {
        setGlassPos({ x: 0, y: 0 })
      }
    }

    if (isDraggingGlass) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      window.addEventListener('touchmove', handlePointerMove, { passive: false })
      window.addEventListener('touchend', handlePointerUp)
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('touchend', handlePointerUp)
    }
  }, [isDraggingGlass, isBookHovered, glassTriggered])

  const triggerOpenBook = () => {
    setGlassTriggered(true)
    setIsBookHovered(true)
    playSound('found')
    setTimeout(() => {
      playSound('match')
      setPhase(2)
    }, 500)
  }

  // =========================================================================
  // TAHAP 3: DRAG & DROP MULTI-KARTU DI ATAS PIRING KE KERANJANG
  // =========================================================================
  const handleStartDrag = (cardId, e) => {
    if (errorCardId) return
    e.preventDefault()
    e.stopPropagation()
    setActiveCardId(cardId)
    setSelectedCardId(cardId)

    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0
    dragStartPointer.current = { x: clientX, y: clientY }
    setDragDelta({ x: 0, y: 0 })
    playSound('click')
  }

  const handleCardClick = (cardId, e) => {
    e.stopPropagation()
    if (activeCardId) return
    if (selectedCardId === cardId) {
      setSelectedCardId(null)
    } else {
      setSelectedCardId(cardId)
      playSound('click')
    }
  }

  useEffect(() => {
    if (!activeCardId) return

    const handlePointerMove = (e) => {
      const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0
      const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0

      const deltaX = clientX - dragStartPointer.current.x
      const deltaY = clientY - dragStartPointer.current.y
      setDragDelta({ x: deltaX, y: deltaY })

      // Deteksi tabrakan dengan keranjang kiri & kanan
      let target = null
      if (basketGejalaRef.current) {
        const rect = basketGejalaRef.current.getBoundingClientRect()
        if (
          clientX >= rect.left && clientX <= rect.right &&
          clientY >= rect.top && clientY <= rect.bottom
        ) {
          target = 'gejala'
        }
      }
      if (basketDampakRef.current) {
        const rect = basketDampakRef.current.getBoundingClientRect()
        if (
          clientX >= rect.left && clientX <= rect.right &&
          clientY >= rect.top && clientY <= rect.bottom
        ) {
          target = 'dampak'
        }
      }
      setHoverTarget(target)
    }

    const handlePointerUp = () => {
      if (hoverTarget) {
        evaluateSort(activeCardId, hoverTarget)
      }
      setActiveCardId(null)
      setDragDelta({ x: 0, y: 0 })
      setHoverTarget(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('touchmove', handlePointerMove, { passive: false })
    window.addEventListener('touchend', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('touchend', handlePointerUp)
    }
  }, [activeCardId, hoverTarget, errorCardId, cards])

  // Evaluasi kebenaran pemilahan (Tanda Gejala vs Dampak)
  const evaluateSort = (cardId, targetBasket) => {
    const card = cards.find(c => c.id === cardId)
    if (!card || card.isSorted) return

    if (card.category === targetBasket) {
      playSound('correct')
      setStreak(prev => prev + 1)

      if (targetBasket === 'gejala') {
        setGejalaCount(prev => prev + 1)
      } else {
        setDampakCount(prev => prev + 1)
      }

      setCards(prev =>
        prev.map(c =>
          c.id === cardId
            ? { ...c, isSorted: true, sortedBasket: targetBasket }
            : c
        )
      )
      setSelectedCardId(null)
      showToast(`✨ Pilihan tepat!`)

      // Cek apakah semua 13 kartu sudah terpilah
      const remainingCount = cards.filter(c => !c.isSorted && c.id !== cardId).length
      if (remainingCount === 0) {
        setTimeout(() => {
          finishGame()
        }, 600)
      }
    } else {
      playSound('wrong')
      setErrorCardId(cardId)
      setStreak(0)
      setCurrentScore(prev => Math.max(60, prev - 5))
      showToast(`❌ Kurang tepat!`)

      setTimeout(() => {
        setErrorCardId(null)
      }, 550)
    }
  }

  // Klik langsung pada keranjang saat sebuah kartu dipilih
  const handleBasketClick = (basketType) => {
    if (selectedCardId) {
      evaluateSort(selectedCardId, basketType)
    } else {
      showToast(
        basketType === 'gejala'
          ? '💡 Ketuk salah satu kartu di piring lalu ketuk keranjang Tanda & Gejala!'
          : '💡 Ketuk salah satu kartu di piring lalu ketuk keranjang Dampak!'
      )
    }
  }

  // Menyimpan skor dan menyelesaikan permainan
  const finishGame = async () => {
    playSound('celebration')
    setPhase(4)

    try {
      setIsSaving(true)
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))

      // Simpan ke localStorage
      localStorage.setItem('misi_h2_a_completed', 'true')
      localStorage.setItem('misi_h2_a_score', currentScore.toString())

      // Pastikan username valid sesuai database (case-matched ke game_users)
      let targetUser = username
      const stored = localStorage.getItem('anemia_username') || username
      const { data: dbUser } = await supabase
        .from('game_users')
        .select('username')
        .ilike('username', stored)
        .maybeSingle()

      if (dbUser?.username) {
        targetUser = dbUser.username
        setUsername(targetUser)
        localStorage.setItem('anemia_username', targetUser)
      }

      const { error: insertError } = await supabase.from('game_scores').insert([
        {
          username: targetUser,
          kategori_game: misiId,
          skor: currentScore,
          durasi_detik: durationSeconds
        }
      ])

      if (insertError) {
        console.error('Error simpan skor Day 2 Level A:', insertError)
      } else {
        console.log('Berhasil menyimpan skor Day 2 Level A ke Supabase!')
        setIsSaved(true)
        setTotalUserScore(prev => prev + currentScore)
        setAlreadyCompleted(true)
        setExistingScore(currentScore)
      }
    } catch (err) {
      console.error('Error simpan skor Day 2 Level A:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // =========================================================================
  // RENDER INTERFACE UTAMA
  // =========================================================================
  return (
    <div className="relative w-full h-screen h-dvh bg-slate-950 text-white font-sans overflow-hidden flex flex-col select-none touch-none">
      
      {/* COMPACT TOP BAR / HEADER NAVIGASI */}
      <header className="w-full bg-[#3D060B]/95 border-b border-rose-950/60 px-3 py-1 sm:px-4 sm:py-1 flex items-center justify-between z-30 flex-shrink-0 shadow-md">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              playSound('click')
              onBack && onBack()
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-[10px] sm:text-xs border border-white/20 transition-all cursor-pointer shadow-sm"
          >
            <span>← Keluar</span>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-black text-rose-200">
              HARI 2 - MISI A
            </span>
            <span className="hidden sm:inline-block text-[11px] text-rose-300/80 border-l border-rose-800/80 pl-2">
              {phase === 1 && 'Tahap 1: Buka Buku Catatan'}
              {phase === 2 && 'Tahap 2: Baca Materi'}
              {phase === 3 && 'Tahap 3: Pemilahan Kondisi'}
              {phase === 4 && 'Tahap 4: Selesai'}
            </span>
          </div>
        </div>

        {/* TOMBOL MATERI */}
        <div className="flex items-center gap-2">
          {phase === 3 && (
            <button
              onClick={() => {
                playSound('click')
                setShowMateriModal(true)
              }}
              className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300 border border-amber-300 text-[10px] sm:text-xs font-black transition flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
            >
              📖 Catatan Materi
            </button>
          )}
        </div>
      </header>

      {/* TOAST NOTIFIKASI REALTIME */}
      {toastMsg && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-amber-300 border-2 border-amber-400/60 px-4 py-1.5 rounded-full shadow-2xl text-xs font-bold animate-bounce backdrop-blur-md flex items-center gap-1.5">
          {toastMsg}
        </div>
      )}

      {/* =====================================================================
          TAHAP 1: BUKA BUKU DENGAN MENGARAHKAN KACA PEMBESAR
         ===================================================================== */}
      {phase === 1 && (
        <main className="flex-1 relative flex flex-col items-center justify-between p-2 sm:p-3 bg-gradient-to-b from-[#4A0A10] via-[#5C0D15] to-[#700C16] overflow-hidden min-h-0">
          
          <div className="z-10 flex-shrink-0 mt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-[11px] sm:text-xs font-bold border border-amber-500/40 shadow-sm backdrop-blur-sm">
              <span>🔎</span>
              <span>Arahkan atau ketuk <strong>kaca pembesar</strong> ke <strong>buku catatan</strong> untuk membukanya!</span>
            </div>
          </div>

          <div className="flex-1 w-full max-w-3xl flex items-center justify-center relative min-h-0 my-1">
            <div
              ref={bookRef}
              onClick={triggerOpenBook}
              className={`relative z-10 flex flex-col items-center cursor-pointer transition-all duration-300 ${
                isBookHovered ? 'scale-105 filter drop-shadow-[0_0_40px_rgba(251,191,36,0.8)]' : 'hover:scale-[1.02]'
              }`}
            >
              <img
                src={bukuTertutupImg}
                alt="Buku Tertutup"
                className="w-64 sm:w-80 md:w-96 max-h-[50vh] object-contain pointer-events-none drop-shadow-2xl"
              />
              <span className="mt-1.5 text-xs sm:text-sm text-rose-100 font-bold bg-black/50 px-4 py-1 rounded-full border border-rose-800/60 shadow-md">
                Buku Catatan Anemia Buddy
              </span>
            </div>

            <div
              ref={glassRef}
              onPointerDown={handleGlassPointerDown}
              style={{
                transform: `translate(${glassPos.x}px, ${glassPos.y}px)`,
                touchAction: 'none'
              }}
              className={`absolute right-2 sm:right-8 top-4 sm:top-8 z-20 cursor-grab active:cursor-grabbing select-none transition-transform duration-75 ${
                isDraggingGlass ? 'scale-110 drop-shadow-[0_15px_30px_rgba(251,191,36,0.8)]' : 'hover:scale-105'
              }`}
            >
              <img
                src={kacaPembesarImg}
                alt="Kaca Pembesar"
                className="w-28 sm:w-36 md:w-40 max-h-[32vh] object-contain pointer-events-none filter drop-shadow-lg"
              />
              <div className="text-center mt-1">
                <span className="bg-sky-500 text-slate-950 text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-md">
                  👆 Seret / Ketuk
                </span>
              </div>
            </div>
          </div>

          <div className="z-10 flex-shrink-0 mb-1">
            <button
              onClick={triggerOpenBook}
              className="text-[11px] text-amber-300 hover:text-amber-200 underline bg-black/40 px-3 py-1 rounded-full border border-rose-900/60 active:scale-95 transition cursor-pointer"
            >
              Atau klik di sini untuk langsung membuka buku ➔
            </button>
          </div>
        </main>
      )}

      {/* =====================================================================
          TAHAP 2: BUKU ISI MATERI (MEMBACA MATERI TERLEBIH DAHULU)
         ===================================================================== */}
      {phase === 2 && (
        <main className="flex-1 relative flex flex-col items-center justify-between p-0.5 sm:p-1 bg-gradient-to-b from-[#4A0A10] via-[#5C0D15] to-[#700C16] overflow-hidden min-h-0">
          
          <div className="z-10 flex-shrink-0 mt-0.5 mb-0.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-[10px] sm:text-xs font-bold border border-amber-500/40 shadow-xs backdrop-blur-sm">
              <span>📖</span>
              <span>Pelajari perbedaan <strong>Tanda & Gejala</strong> vs <strong>Dampak Anemia</strong> berikut sebelum memilah:</span>
            </div>
          </div>

          <div className="flex-1 w-full max-w-7xl flex items-center justify-center min-h-0 my-auto p-0 overflow-hidden">
            <img
              src={bukuMateriImg}
              alt="Buku Catatan Materi Tanda, Gejala & Dampak"
              className="h-full max-h-[86vh] w-auto max-w-[98vw] object-contain rounded-xl drop-shadow-2xl scale-105 sm:scale-112 md:scale-120 transition-transform"
            />
          </div>

          <div className="z-10 flex-shrink-0 mt-0.5 mb-1">
            <button
              onClick={() => {
                playSound('click')
                setPhase(3)
              }}
              className="px-5 sm:px-6 py-1 sm:py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-md active:scale-95 transition flex items-center gap-1.5 border border-amber-300 animate-pulse cursor-pointer"
            >
              <span>Saya Sudah Paham, Mulai Memilah Kondisi!</span>
              <span>➔</span>
            </button>
          </div>
        </main>
      )}

      {/* =====================================================================
          TAHAP 3: DRAG & DROP KONDISI DARI PIRING KE DUA KERANJANG
          (DESAIN RESMI CANVA: LATAR MERAH MAROON, PIRING TENGAH & KERANJANG SISI)
         ===================================================================== */}
      {phase === 3 && (
        <main className="flex-1 relative flex flex-col bg-[#700C16] overflow-hidden justify-between min-h-0 select-none">
          
          {/* JUDUL RESMI SESUAI CANVA: "PISAHKAN KONDISI TERSEBUT KE DALAM KELOMPOK YANG TEPAT!" (DIPERKECIL SESUAI PERMINTAAN) */}
          <div className="w-full text-center pt-1.5 pb-0.5 sm:pt-2 sm:pb-1 px-3 z-20 flex-shrink-0">
            <h1 className="text-white font-extrabold text-[11px] sm:text-xs md:text-sm tracking-wide uppercase drop-shadow-sm">
              PISAHKAN KONDISI TERSEBUT KE DALAM KELOMPOK YANG TEPAT!
            </h1>
            {selectedCardId && (
              <div className="mt-0.5 animate-pulse">
                <span className="bg-amber-400 text-slate-950 font-black text-[9px] sm:text-[11px] px-2.5 py-0.5 rounded-full shadow-md">
                  👉 Seret atau ketuk salah satu keranjang untuk memasukkan kartu terpilih!
                </span>
              </div>
            )}
          </div>

          {/* AREA UTAMA: 3 BAGIAN (KERANJANG KIRI - PIRING TENGAH - KERANJANG KANAN) */}
          <div className="flex-1 w-full max-w-7xl mx-auto flex items-center justify-between px-2 sm:px-6 md:px-12 relative min-h-0 overflow-hidden my-auto">
            
            {/* 1. KERANJANG KIRI: TANDA & GEJALA (UKURAN DIPERKECIL LEBIH PROPORSIONAL) */}
            <div
              ref={basketGejalaRef}
              onClick={() => handleBasketClick('gejala')}
              className={`relative flex flex-col items-center justify-center transition-all duration-200 select-none cursor-pointer flex-shrink-0 p-1 rounded-2xl ${
                hoverTarget === 'gejala'
                  ? 'scale-105 filter drop-shadow-[0_0_30px_rgba(52,211,153,0.95)]'
                  : selectedCardId
                    ? 'hover:scale-105 filter drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]'
                    : 'hover:scale-[1.02]'
              }`}
            >
              <img
                src={keranjangTandaGejalaImg}
                alt="Keranjang Tanda & Gejala"
                className="h-[36vh] sm:h-[45vh] md:h-[50vh] max-h-[360px] w-auto object-contain pointer-events-none drop-shadow-2xl"
              />
              <div className="absolute bottom-2 bg-slate-950/85 text-emerald-300 border border-emerald-400/60 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-black shadow-lg">
                ✓ Terkumpul: {gejalaCount} / 8
              </div>
            </div>

            {/* 2. AREA TENGAH: PIRING CHECKERED BESAR DENGAN 13 KARTU (HANYA DI DALAM PIRING) */}
            <div className="relative flex items-center justify-center flex-1 max-w-[min(68vh,560px)] aspect-square mx-auto">
              {/* Wadah Piring Checkered */}
              <img
                src={piringImg}
                alt="Piring Wadah"
                className="w-full h-full object-contain pointer-events-none drop-shadow-2xl select-none"
              />

              {/* 13 KARTU KONDISI DI ATAS PIRING (UKURAN RATA, PROPORSIONAL & 100% DI DALAM PIRING) */}
              {cards.map((card) => {
                if (card.isSorted) return null

                const isDragging = activeCardId === card.id
                const isSelected = selectedCardId === card.id
                const isError = errorCardId === card.id

                const isShortWord = ['132', '138', '139', '140', '141', '142'].includes(card.id)
                const isLongCard = ['136', '137'].includes(card.id)

                return (
                  <div
                    key={card.id}
                    onPointerDown={(e) => handleStartDrag(card.id, e)}
                    onClick={(e) => handleCardClick(card.id, e)}
                    style={{
                      position: 'absolute',
                      left: `calc(50% + ${card.layout.x}%)`,
                      top: `calc(50% + ${card.layout.y}%)`,
                      transform: isDragging
                        ? `translate(calc(-50% + ${dragDelta.x}px), calc(-50% + ${dragDelta.y}px)) scale(1.12)`
                        : isSelected
                          ? 'translate(-50%, -50%) scale(1.08)'
                          : 'translate(-50%, -50%)',
                      zIndex: isDragging ? 100 : isSelected ? 50 : card.layout.z,
                      touchAction: 'none'
                    }}
                    className={`cursor-grab active:cursor-grabbing select-none transition-transform duration-75 ${
                      isSelected ? 'ring-3 sm:ring-4 ring-amber-400 rounded-xl sm:rounded-2xl shadow-[0_0_20px_rgba(251,191,36,0.95)]' : ''
                    } ${isError ? 'animate-shake ring-4 ring-rose-500 rounded-xl sm:rounded-2xl' : ''}`}
                    title={card.text}
                  >
                    <div
                      className={`bg-white text-slate-900 border border-slate-300 rounded-xl sm:rounded-2xl shadow-[0_2px_6px_rgba(0,0,0,0.18)] hover:shadow-md transition-all text-center flex items-center justify-center pointer-events-none px-2 py-0.5 sm:px-2.5 sm:py-1 ${
                        isShortWord
                          ? 'min-w-[58px] sm:min-w-[66px] whitespace-nowrap'
                          : isLongCard
                            ? 'max-w-[130px] sm:max-w-[152px] md:max-w-[168px]'
                            : 'max-w-[110px] sm:max-w-[130px] md:max-w-[145px]'
                      }`}
                    >
                      <span
                        className={`font-black text-slate-950 leading-tight ${
                          isShortWord
                            ? 'text-[10px] sm:text-[11px] md:text-xs'
                            : isLongCard
                              ? 'text-[8.5px] sm:text-[9.5px] md:text-[10.5px]'
                              : 'text-[9px] sm:text-[10px] md:text-[11px]'
                        }`}
                      >
                        {card.text}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 3. KERANJANG KANAN: DAMPAK (UKURAN DIPERKECIL LEBIH PROPORSIONAL) */}
            <div
              ref={basketDampakRef}
              onClick={() => handleBasketClick('dampak')}
              className={`relative flex flex-col items-center justify-center transition-all duration-200 select-none cursor-pointer flex-shrink-0 p-1 rounded-2xl ${
                hoverTarget === 'dampak'
                  ? 'scale-105 filter drop-shadow-[0_0_35px_rgba(52,211,153,0.95)]'
                  : selectedCardId
                    ? 'hover:scale-105 filter drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]'
                    : 'hover:scale-[1.02]'
              }`}
            >
              <img
                src={keranjangDampakImg}
                alt="Keranjang Dampak"
                className="h-[36vh] sm:h-[45vh] md:h-[50vh] max-h-[360px] w-auto object-contain pointer-events-none drop-shadow-2xl"
              />
              <div className="absolute bottom-2 bg-slate-950/85 text-rose-300 border border-rose-400/60 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-black shadow-lg">
                ✓ Terkumpul: {dampakCount} / 5
              </div>
            </div>

          </div>

          {/* BAR BAWAH: STATUS DAN INDIKATOR SISA KARTU */}
          <div className="w-full bg-[#520910]/90 border-t border-rose-950/40 py-1.5 px-4 z-20 flex items-center justify-between text-xs text-rose-200 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold">Sisa di Piring:</span>
              <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full text-[11px]">
                {cards.filter(c => !c.isSorted).length} kondisi
              </span>
            </div>
            {streak > 1 && (
              <div className="font-black text-amber-300 animate-pulse text-[11px]">
                🔥 {streak}x Kombo Tepat!
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMateriModal(true)}
                className="text-amber-300 hover:text-amber-200 underline font-bold text-[11px] cursor-pointer"
              >
                📖 Buka Buku Catatan
              </button>
            </div>
          </div>

        </main>
      )}

      {/* =====================================================================
          TAHAP 4: POPUP SKOR AKHIR & EVALUASI (UKURAN PROPORSIONAL & RINGKAS)
         ===================================================================== */}
      {phase === 4 && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 overflow-y-auto overscroll-contain py-4 animate-fade-in">
          <div className="relative bg-slate-900/95 border-2 border-amber-400/80 rounded-2xl sm:rounded-3xl max-w-xs sm:max-w-sm w-full p-4 sm:p-5 text-center shadow-2xl animate-scaleUp my-auto max-h-[92dvh] overflow-y-auto custom-scrollbar">
            
            {/* TOMBOL TUTUP / KEMBALI */}
            <button
              onClick={() => {
                playSound('click')
                onBack && onBack()
              }}
              className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center cursor-pointer transition-all active:scale-90 border border-slate-700"
              title="Kembali ke Menu"
            >
              ✕
            </button>
            
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-amber-500/20 border-2 border-amber-400 rounded-full flex items-center justify-center text-2xl mx-auto mb-1.5 shadow-inner">
              🏆
            </div>

            <div className="inline-block px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider mb-1">
              HARI 2 - MISI A SELESAI
            </div>

            <h2 className="text-sm sm:text-base font-black text-white">
              Pakar Pemilahan Gejala & Dampak!
            </h2>

            <p className="text-[10.5px] sm:text-xs text-slate-300 mt-0.5 mb-2.5 leading-snug">
              Luar biasa! Kamu berhasil memilah seluruh 13 kondisi tanda, gejala, dan dampak anemia dengan sangat cermat!
            </p>

            <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 mb-3 flex items-center justify-around">
              <div>
                <div className="text-[9.5px] text-slate-400 font-bold uppercase">Skor Misi A</div>
                <div className="text-lg sm:text-xl font-black text-amber-400">
                  +{currentScore} <span className="text-[10px] text-slate-400">PTS</span>
                </div>
              </div>
              <div className="h-7 w-[1px] bg-slate-800" />
              <div>
                <div className="text-[9.5px] text-slate-400 font-bold uppercase">Status</div>
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                  {isSaving ? 'Menyimpan...' : 'Tersimpan ✓'}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  playSound('click')
                  onComplete && onComplete({
                    score: currentScore,
                    missionId: misiId,
                    nextMission: 'b'
                  })
                }}
                className="w-full py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer border border-amber-300"
              >
                <span>Lanjut ke Game Selanjutnya: Misi B</span>
                <span>➔</span>
              </button>

              <button
                onClick={() => {
                  playSound('click')
                  onBack && onBack()
                }}
                className="w-full py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition cursor-pointer active:scale-95"
              >
                Kembali ke Menu Misi
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL BUKU MATERI (DAPAT DIBUKA SEWAKTU-WAKTU DI TAHAP 3)
         ===================================================================== */}
      {showMateriModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-amber-500/60 rounded-2xl max-w-2xl w-full p-3 sm:p-4 flex flex-col items-center shadow-2xl relative">
            <button
              onClick={() => {
                playSound('click')
                setShowMateriModal(false)
              }}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-600 text-white font-bold flex items-center justify-center transition cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-amber-400 font-black text-sm sm:text-base mb-2">
              📖 Catatan Materi Tanda, Gejala & Dampak Anemia
            </h3>

            <div className="max-h-[75vh] overflow-y-auto w-full flex justify-center p-1">
              <img
                src={bukuMateriImg}
                alt="Materi Buku Catatan"
                className="max-h-[68vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>

            <button
              onClick={() => {
                playSound('click')
                setShowMateriModal(false)
              }}
              className="mt-3 px-6 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition cursor-pointer"
            >
              Tutup & Lanjut Memilah
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          PROTEKSI 1X PERCOBAAN: JIKA MISI A HARI 2 SUDAH PERNAH DISELESAIKAN
         ===================================================================== */}
      {alreadyCompleted && phase !== 4 && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1014] border-2 border-emerald-500/80 rounded-2xl max-w-sm w-full p-5 text-center shadow-2xl flex flex-col items-center animate-zoom-in">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center text-2xl mb-3 shadow-inner">
              ✓
            </div>
            <h2 className="text-white font-black text-base sm:text-lg mb-1">
              Misi A Hari 2 Selesai!
            </h2>
            <p className="text-slate-300 text-xs mb-4 leading-relaxed">
              Kamu sudah menyelesaikan misi ini dengan perolehan skor <strong className="text-amber-400">{existingScore} PTS</strong>. Setiap misi hanya dapat dikerjakan 1 kali.
            </p>
            <div className="w-full flex flex-col gap-2">
              <button
                onClick={() => {
                  playSound('click')
                  onComplete && onComplete({
                    score: existingScore,
                    missionId: misiId,
                    nextMission: 'b'
                  })
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                Lanjut ke Game Misi B ➔
              </button>
              <button
                onClick={() => {
                  playSound('click')
                  onBack && onBack()
                }}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition active:scale-95 cursor-pointer"
              >
                Kembali ke Menu Misi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
