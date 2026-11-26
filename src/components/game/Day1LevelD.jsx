import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

// IMPORT ASET RESMI PROYEK
import mascotSiswi from '../../assets/9. day 1 level B/karakter.png'
import bgProfilPria from '../../assets/6/game home - profil pria_crop.png'
import bgProfilWanita from '../../assets/6/game home - profil wanita_crop.png'
import imgDarahO2 from '../../assets/5/5. kuis - darah & o2.png'
import imgSumberMakanan from '../../assets/3/3. materi - sumber makanan.png'
import imgPenyebab from '../../assets/3/3. materi - penyebab.png'

// AUDIO SYNTHESIZER UNTUK SOUND EFFECT REAL-TIME
import { playSound } from '../../utils/audio'

// IMPORT ASET TONG SAMPAH FAKTA & MITOS
import tongFaktaImg from '../../assets/8. day 1 level C/tong fakta.png'
import tongMitosImg from '../../assets/8. day 1 level C/tong mitos.png'

// DATA KARTU LEVEL 1: EVALUASI FAKTA VS MITOS TANDA GEJALA
const CARDS_LEVEL_1 = [
  {
    id: 1,
    text: 'Cepat Lelah dan Lemah saat Beraktivitas',
    type: 'fakta',
    category: 'Tanda Gejala',
    explanation: 'FAKTA! Sel tubuh kekurangan oksigen karena hemoglobin darah yang rendah sehingga energi cepat habis.'
  },
  {
    id: 2,
    text: 'Minum jamu pahit pasti langsung sembuh dari anemia',
    type: 'mitos',
    category: 'Pengobatan',
    explanation: 'MITOS! Jamu pahit bukan penambah darah. Tubuh butuh zat besi dari makanan bergizi dan Tablet Tambah Darah (TTD).'
  },
  {
    id: 3,
    text: 'Wajah, Bibir, dan Kelopak Mata Tampak Pucat',
    type: 'fakta',
    category: 'Tanda Gejala',
    explanation: 'FAKTA! Hemoglobin yang memberi warna merah pada darah berkurang sehingga warna kulit tampak pucat.'
  },
  {
    id: 4,
    text: 'Makan es batu bisa menyembuhkan anemia',
    type: 'mitos',
    category: 'Kebiasaan',
    explanation: 'MITOS! Keinginan mengunyah es batu (pica) justru tanda kamu kekurangan zat besi, bukan obatnya!'
  },
  {
    id: 5,
    text: 'Sering Pusing dan Pandangan Berkunang-kunang',
    type: 'fakta',
    category: 'Tanda Gejala',
    explanation: 'FAKTA! Suplai oksigen ke otak berkurang ketika kadar hemoglobin dalam darah rendah.'
  },
  {
    id: 6,
    text: 'Anemia hanya menyerang orang lanjut usia',
    type: 'mitos',
    category: 'Penderita',
    explanation: 'MITOS! Remaja putri dan usia sekolah sangat rentan anemia karena percepatan pertumbuhan dan menstruasi.'
  },
  {
    id: 7,
    text: 'Sulit Konsentrasi dan Mudah Mengantuk di Kelas',
    type: 'fakta',
    category: 'Tanda Gejala',
    explanation: 'FAKTA! Kekurangan pasokan oksigen di sel saraf otak membuat konsentrasi dan daya tangkap menurun.'
  },
  {
    id: 8,
    text: 'Sesak Napas saat Melakukan Olahraga Ringan',
    type: 'fakta',
    category: 'Tanda Gejala',
    explanation: 'FAKTA! Jantung dan paru-paru bekerja lebih keras untuk memompa oksigen yang terbatas ke seluruh tubuh.'
  }
]

// DATA PUZZLE LEVEL 2: MEMBANGUN ALUR ANEMIA (PENYEBAB -> TERJADINYA ANEMIA)
const PUZZLE_PIECES = [
  {
    id: 'step1',
    order: 1,
    title: 'Asupan protein dan zat besi harian kurang',
    desc: 'Tubuh tidak mendapat asupan zat besi yg cukup untuk produksi Hb.',
    iconType: 'food'
  },
  {
    id: 'step2',
    order: 2,
    title: 'Kadar hemoglobin (Hb) dalam darah turun di bawah batas normal',
    desc: 'Sumsum tulang kekurangan bahan baku pembuat sel darah merah (Hb)',
    iconType: 'body'
  },
  {
    id: 'step3',
    order: 3,
    title: 'Suplai oksigen ke seluruh jaringan tubuh berkurang',
    desc: 'Hb tidak dapat mengedarkan oksigen ke seluruh tubuh',
    iconType: 'blood'
  },
  {
    id: 'step4',
    order: 4,
    title: 'Muncul keluhan 5L (lemah, lelah, letih, lesu, lunglai) dan konjungtiva mata pucat',
    desc: 'Oksigen tidak teredarkan secara merata, memicu gejala 5L',
    iconType: 'tired'
  }
]

export default function Day1LevelD({ onBack, onComplete, misiId = 'misi_h1_d' }) {
  // FASE GAMEPLAY: 'intro' | 'level1' | 'level1_complete' | 'level2' | 'completed'
  const [phase, setPhase] = useState('intro')

  // DATA PROFIL & USER
  const [gender, setGender] = useState('male')
  const [totalScore, setTotalScore] = useState(0)
  const [earnedScore, setEarnedScore] = useState(100)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)
  const [existingScore, setExistingScore] = useState(0)

  // --------------------------------------------------------------------------
  // STATE LEVEL 1 (TONG SAMPAH FAKTA VS MITOS)
  // --------------------------------------------------------------------------
  const [deck, setDeck] = useState(() => [...CARDS_LEVEL_1].sort(() => Math.random() - 0.5))
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [faktaCount, setFaktaCount] = useState(0)
  const [mitosCount, setMitosCount] = useState(0)
  const [streakCount, setStreakCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(15)
  const [activeStamp, setActiveStamp] = useState(null)
  const [feedbackModal, setFeedbackModal] = useState(null)
  const [dragOverZone, setDragOverZone] = useState(null)
  const [isShaking, setIsShaking] = useState(false)
  const [level1Mistakes, setLevel1Mistakes] = useState(0)

  // --------------------------------------------------------------------------
  // STATE DRAG & DROP POINTER / TOUCH
  // --------------------------------------------------------------------------
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const dragStartRef = useRef({ x: 0, y: 0 })
  const tongFaktaRef = useRef(null)
  const tongMitosRef = useRef(null)
  const cardRef = useRef(null)

  // --------------------------------------------------------------------------
  // STATE LEVEL 2 (PUZZLE ALUR ANEMIA) & DRAG DROP
  // --------------------------------------------------------------------------
  const [availablePieces, setAvailablePieces] = useState([])
  const [slots, setSlots] = useState([null, null, null, null])
  const [selectedPieceId, setSelectedPieceId] = useState(null)
  const [level2Validation, setLevel2Validation] = useState(null)
  const [level2Mistakes, setLevel2Mistakes] = useState(0)
  const [showLevel2WrongModal, setShowLevel2WrongModal] = useState(false)

  // State Drag & Drop Tahap 2 (Desktop & Touch Mobile)
  const [draggedItem, setDraggedItem] = useState(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const [dragOverSlotIndex, setDragOverSlotIndex] = useState(null)
  const [isOverAvailable, setIsOverAvailable] = useState(false)

  const slotRefs = useRef([])
  const availableContainerRef = useRef(null)
  const pointerStartRef = useRef({ x: 0, y: 0 })
  const activeDragItemRef = useRef(null)
  const hasMovedRef = useRef(false)


  const username = localStorage.getItem('anemia_username') || 'Siswa'
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    loadUserData()
  }, [])

  // TIMER HITUNG MUNDUR PER KARTU (LEVEL 1)
  useEffect(() => {
    if (phase !== 'level1' || feedbackModal || activeStamp || currentCardIndex >= deck.length) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeoutCard()
          return 15
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [phase, currentCardIndex, feedbackModal, activeStamp])

  const loadUserData = async () => {
    try {
      const { data: userData } = await supabase
        .from('game_users')
        .select('gender')
        .eq('username', username)
        .maybeSingle()

      if (userData?.gender) {
        setGender(userData.gender.toLowerCase())
      }

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
      console.error('Error load profil Level D:', err.message)
    }
  }

  const handleTimeoutCard = () => {
    playSound('wrong')
    setStreakCount(0)
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 400)
    setLevel1Mistakes(prev => prev + 1)
    setEarnedScore(prev => Math.max(50, prev - 5))

    // PENELITIAN: Tidak menampilkan modal peringatan/penjelasan di tengah tes.
    // Waktu habis langsung melanjutkan ke kartu berikutnya.
    setTimeLeft(15)
    if (currentCardIndex + 1 >= deck.length) {
      playSound('cring')
      setPhase('level1_complete')
    } else {
      setCurrentCardIndex(prev => prev + 1)
    }
  }

  const resetLevel1Deck = () => {
    setDeck([...CARDS_LEVEL_1].sort(() => Math.random() - 0.5))
    setCurrentCardIndex(0)
    setFaktaCount(0)
    setMitosCount(0)
    setStreakCount(0)
    setTimeLeft(15)
  }

  const initLevel2Pieces = () => {
    const shuffled = [...PUZZLE_PIECES].sort(() => Math.random() - 0.5)
    setAvailablePieces(shuffled)
    setSlots([null, null, null, null])
    setSelectedPieceId(null)
    setLevel2Validation(null)
    setShowLevel2WrongModal(false)
  }

  const saveScoreToDatabase = async (finalScore) => {
    try {
      localStorage.setItem('misi_h1_d_completed', 'true')
      localStorage.setItem('misi_h1_d_score', finalScore.toString())
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
      console.error('Gagal menyimpan skor ke Supabase:', err.message)
    }
  }

  // --------------------------------------------------------------------------
  // LOGIKA SORTING KARTU (FAKTA VS MITOS)
  // --------------------------------------------------------------------------
  const handleSortCard = (chosenType) => {
    if (currentCardIndex >= deck.length || activeStamp) return
    const card = deck[currentCardIndex]
    const isCorrect = card.type === chosenType

    if (isCorrect) {
      const nextStreak = streakCount + 1
      setStreakCount(nextStreak)

      if (nextStreak >= 2) {
        playSound('combo', { streak: nextStreak })
      } else {
        playSound('correct')
      }

      setActiveStamp({
        text: chosenType === 'fakta' ? 'FAKTA MEDIS!' : 'MITOS TERBONGKAR!',
        type: chosenType
      })
      playSound('stamp')

      if (chosenType === 'fakta') setFaktaCount(prev => prev + 1)
      else setMitosCount(prev => prev + 1)

      setTimeLeft(15)

      setTimeout(() => {
        setActiveStamp(null)
        if (currentCardIndex + 1 >= deck.length) {
          playSound('cring')
          setPhase('level1_complete')
        } else {
          setCurrentCardIndex(prev => prev + 1)
        }
      }, 450)
    } else {
      playSound('wrong')
      setStreakCount(0)
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 400)
      setLevel1Mistakes(prev => prev + 1)
      setEarnedScore(prev => Math.max(50, prev - 5))

      // PENELITIAN: Tidak menampilkan peringatan atau penjelasan kartu salah di tengah tes.
      // Langsung melanjutkan ke kartu berikutnya untuk menguji pengetahuan responden secara objektif.
      setActiveStamp({
        text: chosenType === 'fakta' ? 'FAKTA' : 'MITOS',
        type: chosenType
      })
      playSound('stamp')

      if (chosenType === 'fakta') setFaktaCount(prev => prev + 1)
      else setMitosCount(prev => prev + 1)

      setTimeLeft(15)

      setTimeout(() => {
        setActiveStamp(null)
        if (currentCardIndex + 1 >= deck.length) {
          playSound('cring')
          setPhase('level1_complete')
        } else {
          setCurrentCardIndex(prev => prev + 1)
        }
      }, 450)
    }
  }

  const dismissFeedbackModal = () => {
    const isTimeout = feedbackModal?.chosenType === 'timeout'
    setFeedbackModal(null)
    setTimeLeft(15)
    if (isTimeout) {
      if (currentCardIndex + 1 >= deck.length) {
        playSound('cring')
        setPhase('level1_complete')
      } else {
        setCurrentCardIndex(prev => prev + 1)
      }
    }
  }

  // --------------------------------------------------------------------------
  // DRAG & DROP ENGINE (POINTER & TOUCH COMPLIANT)
  // --------------------------------------------------------------------------
  const handlePointerDown = (e) => {
    if (currentCardIndex >= deck.length || activeStamp || feedbackModal) return
    if (e.button !== undefined && e.button !== 0) return // Hanya tombol utama / sentuhan

    e.preventDefault()
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch (_) {}

    dragStartRef.current = { x: e.clientX, y: e.clientY }
    setIsDragging(true)
    setDragOffset({ x: 0, y: 0 })
    setDragOverZone(null)
  }

  const handlePointerMove = (e) => {
    if (!isDragging) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    setDragOffset({ x: dx, y: dy })

    // Hit-testing / deteksi zona Tong Fakta (Kiri) dan Tong Mitos (Kanan)
    const cardEl = cardRef.current
    if (!cardEl) return
    const cardRect = cardEl.getBoundingClientRect()
    const cardCenter = {
      x: cardRect.left + cardRect.width / 2,
      y: cardRect.top + cardRect.height / 2
    }

    const faktaRect = tongFaktaRef.current?.getBoundingClientRect()
    const mitosRect = tongMitosRef.current?.getBoundingClientRect()

    let zone = null
    if (faktaRect) {
      const inFakta =
        (cardCenter.x >= faktaRect.left - 40 && cardCenter.x <= faktaRect.right + 40 &&
         cardCenter.y >= faktaRect.top - 40 && cardCenter.y <= faktaRect.bottom + 40) ||
        dx < -90
      if (inFakta) zone = 'fakta'
    }

    if (mitosRect && !zone) {
      const inMitos =
        (cardCenter.x >= mitosRect.left - 40 && cardCenter.x <= mitosRect.right + 40 &&
         cardCenter.y >= mitosRect.top - 40 && cardCenter.y <= mitosRect.bottom + 40) ||
        dx > 90
      if (inMitos) zone = 'mitos'
    }

    setDragOverZone(zone)
  }

  const handlePointerUp = (e) => {
    if (!isDragging) return
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch (_) {}

    const targetZone = dragOverZone
    setIsDragging(false)
    setDragOffset({ x: 0, y: 0 })
    setDragOverZone(null)

    if (targetZone === 'fakta') {
      handleSortCard('fakta')
    } else if (targetZone === 'mitos') {
      handleSortCard('mitos')
    }
  }

  const handlePointerCancel = (e) => {
    if (!isDragging) return
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch (_) {}
    setIsDragging(false)
    setDragOffset({ x: 0, y: 0 })
    setDragOverZone(null)
  }

  // --------------------------------------------------------------------------
  // LOGIKA LEVEL 2: MEMBANGUN ALUR ANEMIA (PUZZLE)
  // --------------------------------------------------------------------------
  const handleSelectPiece = (pieceId) => {
    playSound('click')
    if (selectedPieceId === pieceId) {
      setSelectedPieceId(null)
      return
    }

    const firstEmptyIndex = slots.findIndex(s => s === null)
    if (firstEmptyIndex !== -1) {
      const piece = availablePieces.find(p => p.id === pieceId)
      if (piece) {
        playSound('place')
        setSlots(prev => {
          const next = [...prev]
          next[firstEmptyIndex] = piece
          return next
        })
        setAvailablePieces(prev => prev.filter(p => p.id !== pieceId))
        setSelectedPieceId(null)
        setLevel2Validation(null)
        return
      }
    }
    setSelectedPieceId(pieceId)
  }

  const handleSlotClick = (slotIndex) => {
    playSound('click')
    const currentInSlot = slots[slotIndex]

    if (selectedPieceId) {
      const pieceToPlace = availablePieces.find(p => p.id === selectedPieceId)
      if (pieceToPlace) {
        playSound('place')
        setSlots(prev => {
          const next = [...prev]
          next[slotIndex] = pieceToPlace
          return next
        })
        setAvailablePieces(prev => {
          const filtered = prev.filter(p => p.id !== selectedPieceId)
          if (currentInSlot) return [...filtered, currentInSlot]
          return filtered
        })
        setSelectedPieceId(null)
        setLevel2Validation(null)
        return
      }
    }

    if (currentInSlot) {
      playSound('remove')
      setSlots(prev => {
        const next = [...prev]
        next[slotIndex] = null
        return next
      })
      setAvailablePieces(prev => [...prev, currentInSlot])
      setLevel2Validation(null)
    }
  }

  // --------------------------------------------------------------------------
  // LOGIKA DRAG & DROP TAHAP 2 (DESKTOP & TOUCH MOBILE)
  // --------------------------------------------------------------------------
  const executeDropOnSlot = (targetSlotIndex, sourceInfo) => {
    if (!sourceInfo || !sourceInfo.piece) return
    const { piece, source, fromSlotIndex } = sourceInfo
    const currentInSlot = slots[targetSlotIndex]

    if (source === 'slot') {
      if (fromSlotIndex === targetSlotIndex) return

      playSound('place')
      setSlots(prev => {
        const next = [...prev]
        next[targetSlotIndex] = piece
        next[fromSlotIndex] = currentInSlot
        return next
      })
      setLevel2Validation(null)
      setSelectedPieceId(null)
      return
    }

    if (source === 'available') {
      playSound('place')
      setSlots(prev => {
        const next = [...prev]
        next[targetSlotIndex] = piece
        return next
      })
      setAvailablePieces(prev => {
        const filtered = prev.filter(p => p.id !== piece.id)
        if (currentInSlot) {
          return [...filtered, currentInSlot]
        }
        return filtered
      })
      setLevel2Validation(null)
      setSelectedPieceId(null)
    }
  }

  const executeDropOnAvailable = (sourceInfo) => {
    if (!sourceInfo || sourceInfo.source !== 'slot') return
    const { piece, fromSlotIndex } = sourceInfo
    playSound('remove')
    setSlots(prev => {
      const next = [...prev]
      next[fromSlotIndex] = null
      return next
    })
    setAvailablePieces(prev => {
      if (prev.some(p => p.id === piece.id)) return prev
      return [...prev, piece]
    })
    setLevel2Validation(null)
    setSelectedPieceId(null)
  }

  const handleHtml5DropOnSlot = (e, targetSlotIndex) => {
    e.preventDefault()
    setDragOverSlotIndex(null)
    try {
      const raw = e.dataTransfer.getData('text/plain')
      if (!raw) return
      const data = JSON.parse(raw)
      executeDropOnSlot(targetSlotIndex, data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleHtml5DropOnAvailable = (e) => {
    e.preventDefault()
    setIsOverAvailable(false)
    try {
      const raw = e.dataTransfer.getData('text/plain')
      if (!raw) return
      const data = JSON.parse(raw)
      executeDropOnAvailable(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handlePointerDownPiece = (e, item) => {
    if (e.button !== undefined && e.button !== 0) return
    pointerStartRef.current = { x: e.clientX, y: e.clientY }
    activeDragItemRef.current = item
    hasMovedRef.current = false

    const handleWindowPointerMove = (moveEvent) => {
      const dx = moveEvent.clientX - pointerStartRef.current.x
      const dy = moveEvent.clientY - pointerStartRef.current.y
      if (!hasMovedRef.current) {
        if (Math.hypot(dx, dy) > 6) {
          hasMovedRef.current = true
          setDraggedItem(activeDragItemRef.current)
        }
      }
      if (hasMovedRef.current) {
        setDragPos({ x: moveEvent.clientX, y: moveEvent.clientY })

        // Hit-test slots
        let foundSlotIndex = null
        slotRefs.current.forEach((el, idx) => {
          if (!el) return
          const r = el.getBoundingClientRect()
          if (
            moveEvent.clientX >= r.left &&
            moveEvent.clientX <= r.right &&
            moveEvent.clientY >= r.top &&
            moveEvent.clientY <= r.bottom
          ) {
            foundSlotIndex = idx
          }
        })
        setDragOverSlotIndex(foundSlotIndex)

        // Hit-test available container
        if (availableContainerRef.current) {
          const ar = availableContainerRef.current.getBoundingClientRect()
          if (
            moveEvent.clientX >= ar.left &&
            moveEvent.clientX <= ar.right &&
            moveEvent.clientY >= ar.top &&
            moveEvent.clientY <= ar.bottom
          ) {
            setIsOverAvailable(true)
          } else {
            setIsOverAvailable(false)
          }
        }
      }
    }

    const handleWindowPointerUp = (upEvent) => {
      window.removeEventListener('pointermove', handleWindowPointerMove)
      window.removeEventListener('pointerup', handleWindowPointerUp)

      if (hasMovedRef.current && activeDragItemRef.current) {
        let targetSlot = null
        slotRefs.current.forEach((el, idx) => {
          if (!el) return
          const r = el.getBoundingClientRect()
          if (
            upEvent.clientX >= r.left &&
            upEvent.clientX <= r.right &&
            upEvent.clientY >= r.top &&
            upEvent.clientY <= r.bottom
          ) {
            targetSlot = idx
          }
        })

        if (targetSlot !== null) {
          executeDropOnSlot(targetSlot, activeDragItemRef.current)
        } else if (availableContainerRef.current) {
          const ar = availableContainerRef.current.getBoundingClientRect()
          if (
            upEvent.clientX >= ar.left &&
            upEvent.clientX <= ar.right &&
            upEvent.clientY >= ar.top &&
            upEvent.clientY <= ar.bottom
          ) {
            executeDropOnAvailable(activeDragItemRef.current)
          }
        }
      } else {
        // Klik/Tap biasa
        if (activeDragItemRef.current) {
          if (activeDragItemRef.current.source === 'available') {
            handleSelectPiece(activeDragItemRef.current.piece.id)
          } else if (activeDragItemRef.current.source === 'slot') {
            handleSlotClick(activeDragItemRef.current.fromSlotIndex)
          }
        }
      }

      setDraggedItem(null)
      setDragOverSlotIndex(null)
      setIsOverAvailable(false)
      activeDragItemRef.current = null
      hasMovedRef.current = false
    }

    window.addEventListener('pointermove', handleWindowPointerMove)
    window.addEventListener('pointerup', handleWindowPointerUp)
  }

  const handleCheckLevel2Alur = () => {
    const isAllFilled = slots.every(s => s !== null)
    if (!isAllFilled) {
      playSound('wrong')
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 400)
      setLevel2Validation('incomplete')
      return
    }

    const isOrderCorrect =
      slots[0]?.order === 1 &&
      slots[1]?.order === 2 &&
      slots[2]?.order === 3 &&
      slots[3]?.order === 4

    if (isOrderCorrect) {
      playSound('cring')
      setLevel2Validation('correct')
      setActiveStamp({
        text: 'ALUR PATOFISIOLOGI TEPAT!',
        type: 'fakta'
      })
      playSound('stamp')
      setTimeout(() => {
        setActiveStamp(null)
        saveScoreToDatabase(earnedScore)
        setPhase('completed')
      }, 1500)
    } else {
      playSound('wrong')
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 400)
      setLevel2Validation('wrong')
      setLevel2Mistakes(prev => prev + 1)
      setEarnedScore(prev => Math.max(50, prev - 10))
      setShowLevel2WrongModal(true)
    }
  }

  const handleResetSlots = () => {
    playSound('click')
    initLevel2Pieces()
  }

  return (
    <div className="relative w-dvw h-dvh bg-gradient-to-b from-[#0F2027] via-[#203A43] to-[#2C5364] overflow-hidden font-sans select-none flex flex-col justify-between">
      
      {/* GLOW BACKGROUND EFFECT */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent pointer-events-none" />

      {/* =========================================================================
          TOP BAR NAVIGASI & PROFIL SISWA
         ========================================================================= */}
      <div className="relative z-30 flex items-center justify-between w-full px-3 py-1 sm:px-4 sm:py-1.5 bg-[#001E30]/90 backdrop-blur-md border-b-2 border-teal-500/30 shadow-md flex-shrink-0">
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

        <div className="text-left">
          <h1 className="text-white font-black text-xs sm:text-sm md:text-base leading-tight tracking-wide drop-shadow-md flex items-center gap-1.5">
            <span>🗑️</span> GAME 4: TONG SAMPAH FAKTA VS MITOS (LEVEL D)
          </h1>
          <p className="text-teal-200 text-[9px] sm:text-[10px] font-semibold">
            Seret Kartu ke Tong Fakta (Hijau) atau Tong Mitos (Merah)
          </p>
        </div>

        <div className="relative h-9 sm:h-11 flex items-center">
          <img
            src={gender === 'female' ? bgProfilWanita : bgProfilPria}
            alt="Profile Frame"
            className="h-full w-auto object-contain pointer-events-none drop-shadow-md"
          />
          <div className="absolute left-[28%] right-[4%] inset-y-0 flex items-center justify-center gap-1.5 px-2 pointer-events-none">
            <span className="text-[#8B0000] font-black text-[11px] sm:text-xs truncate max-w-[80px] sm:max-w-[110px] uppercase">
              {username}
            </span>
            <span className="text-[#003049] font-black text-xs opacity-40">|</span>
            <span className="text-[#003049] font-extrabold text-[11px] sm:text-xs whitespace-nowrap">
              {totalScore} PTS
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          KONTEN UTAMA GAME
         ========================================================================= */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-1.5 sm:p-2 min-h-0 w-full max-w-5xl mx-auto overflow-hidden">
        
        {/* -----------------------------------------------------------------------
            FASE 0: INTRO MISSION BRIEF
           ----------------------------------------------------------------------- */}
        {phase === 'intro' && (
          <div className="w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl border-3 border-teal-500 flex flex-col items-center text-center animate-scaleUp max-h-[85vh] overflow-y-auto custom-scrollbar my-auto justify-between">
            <div className="w-10 h-10 rounded-full bg-teal-100 border-2 border-teal-400 flex items-center justify-center text-xl shadow-sm flex-shrink-0">
              🗑️
            </div>
            <span className="text-[9.5px] font-black uppercase tracking-wider text-teal-700 px-2.5 py-0.5 rounded-full bg-teal-100 flex-shrink-0 mt-1">
              MISI D: PEMILAHAN FAKTA VS MITOS
            </span>
            <h2 className="text-[#003049] font-black text-sm sm:text-base mt-0.5 flex-shrink-0">
              Uji Fakta Medis &amp; Tangkal Mitos Anemia!
            </h2>
            <p className="text-slate-600 text-[11px] sm:text-xs my-1 sm:my-1.5 leading-relaxed">
              Kamu akan memilah 8 kartu informasi. <b>Seret dan jatuhkan</b> kartu ke <b>Tong Fakta (Hijau)</b> jika informasinya benar, atau ke <b>Tong Mitos (Merah)</b> jika keliru!
            </p>

            <div className="w-full bg-teal-50 rounded-xl p-2 border border-teal-200 flex items-center justify-around my-1 text-[11px] sm:text-xs font-bold text-teal-950 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base">👆</span>
                <span>Bisa di-Drag &amp; Drop</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base">🎯</span>
                <span>Raih Combo Streak</span>
              </div>
            </div>

            <button
              onClick={() => {
                playSound('click')
                resetLevel1Deck()
                setPhase('level1')
              }}
              className="mt-1.5 w-full py-2.5 px-5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-500 hover:to-emerald-600 text-white font-black text-xs sm:text-sm shadow-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 border border-teal-400 flex-shrink-0"
            >
              <span>Mulai Memilah Kartu!</span>
              <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            FASE 1: LEVEL 1 (PEMILAHAN FAKTA VS MITOS DENGAN DRAG & DROP)
           ----------------------------------------------------------------------- */}
        {phase === 'level1' && (
          <div className={`w-full max-w-4xl h-full flex flex-col justify-between max-h-[calc(100dvh-52px)] overflow-hidden ${isShaking ? 'animate-shake' : ''}`}>
            
            {/* SUBHEADER: PROGRESS BAR, TIMER, STREAK */}
            <div className="w-full bg-white/95 backdrop-blur-md rounded-lg py-0.5 px-2.5 shadow-xs border border-teal-600/30 flex items-center justify-between gap-1.5 mb-0.5 flex-shrink-0">
              {/* TIMER */}
              <div className="flex items-center gap-1">
                <span className="text-xs">⏱️</span>
                <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-full ${
                  timeLeft <= 5 ? 'bg-rose-100 text-rose-700 animate-pulse font-extrabold' : 'bg-slate-100 text-slate-800'
                }`}>
                  {timeLeft}s
                </span>
              </div>

              {/* PROGRESS */}
              <div className="flex-1 max-w-[160px] sm:max-w-xs flex items-center gap-1.5">
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-300 rounded-full"
                    style={{ width: `${(currentCardIndex / deck.length) * 100}%` }}
                  />
                </div>
                <span className="text-[9.5px] font-black text-slate-700 whitespace-nowrap">
                  {currentCardIndex}/{deck.length}
                </span>
              </div>

              {/* STREAK */}
              {streakCount >= 2 && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] animate-bounce">
                  🔥 {streakCount}X!
                </div>
              )}

              {/* SKOR SEMENTARA */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-black text-[10px] sm:text-xs">
                <span>⭐</span>
                <span>{earnedScore} PTS</span>
              </div>
            </div>

            {/* PETUNJUK DRAG & DROP */}
            <div className="w-full bg-teal-50/90 border border-teal-300 rounded-md py-0.5 px-2 text-center text-[9px] sm:text-[10px] font-bold text-teal-950 mb-0.5 flex items-center justify-center gap-1 shadow-2xs flex-shrink-0">
              <span className="animate-pulse">👆</span>
              <span>
                <b>SERET KARTU</b> ke <b>Tong Fakta (Kiri)</b> / <b>Mitos (Kanan)</b>, atau klik tombol di bawah!
              </span>
            </div>

            {/* AREA PEMILAHAN: TONG FAKTA (KIRI) | KARTU DRAGGABLE (TENGAH) | TONG MITOS (KANAN) */}
            <div className="w-full grid grid-cols-3 gap-1.5 sm:gap-2.5 items-stretch flex-1 min-h-0 py-0.5">
              
              {/* DROP ZONE FAKTA (KIRI) */}
              <div
                ref={tongFaktaRef}
                className={`rounded-xl sm:rounded-2xl p-1.5 sm:p-2.5 flex flex-col justify-between items-center border-2 sm:border-3 transition-all duration-200 shadow-md ${
                  dragOverZone === 'fakta'
                    ? 'border-emerald-300 bg-emerald-500/40 scale-102 ring-3 ring-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.7)]'
                    : 'border-emerald-500/80 bg-gradient-to-b from-[#1E523C] to-[#123627]'
                }`}
              >
                <div className="w-full flex items-center justify-between pb-0.5 border-b border-emerald-400/40 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white text-emerald-700 font-black text-[10px] sm:text-xs flex items-center justify-center shadow">
                      ✓
                    </span>
                    <h3 className="text-white font-black text-xs sm:text-sm tracking-wider">
                      FAKTA
                    </h3>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-300/30 text-emerald-100 text-[8.5px] font-bold">
                    {faktaCount} Disaring
                  </span>
                </div>

                <div className="my-auto py-0.5 text-center flex-1 flex flex-col items-center justify-center pointer-events-none">
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 flex items-center justify-center mb-0.5 transition-transform">
                    <img
                      src={tongFaktaImg}
                      alt="Tong Fakta"
                      className="w-full h-full object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                  <p className="text-emerald-100 text-[8.5px] sm:text-[9.5px] font-semibold px-0.5 leading-tight">
                    {dragOverZone === 'fakta' ? 'Lepaskan Kartu di Sini!' : 'Tarik kartu ke sini jika FAKTA'}
                  </p>
                </div>

                {/* TOMBOL ALTERNATIF KLIK LANGSUNG */}
                <button
                  onClick={() => handleSortCard('fakta')}
                  className="w-full py-1 sm:py-1.5 px-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-black text-[10px] sm:text-xs shadow-md transition-all cursor-pointer border border-emerald-300 flex items-center justify-center gap-1 flex-shrink-0"
                >
                  <span>✓ Masukkan ke FAKTA</span>
                </button>
              </div>

              {/* KARTU DI TENGAH: DRAGGABLE (TOUCH & MOUSE) */}
              <div className="flex flex-col items-center justify-center p-0.5 relative touch-none select-none">
                {currentCardIndex < deck.length ? (
                  <div
                    ref={cardRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerCancel}
                    style={{
                      transform: isDragging
                        ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${dragOffset.x * 0.05}deg) scale(1.06)`
                        : 'translate3d(0, 0, 0)',
                      transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      touchAction: 'none'
                    }}
                    className={`relative w-full max-w-[240px] bg-white rounded-xl sm:rounded-2xl p-2 sm:p-2.5 shadow-xl border-2 sm:border-3 transition-shadow cursor-grab active:cursor-grabbing flex flex-col items-center text-center justify-between h-full max-h-[160px] sm:max-h-[185px] ${
                      isDragging
                        ? 'z-40 shadow-[0_20px_40px_rgba(0,0,0,0.6)] ring-4 ring-amber-400 border-amber-400'
                        : streakCount >= 3
                        ? 'border-amber-400 ring-2 ring-amber-300'
                        : 'border-slate-300 hover:border-teal-500'
                    }`}
                  >
                    {/* STEMPEL VISUAL */}
                    {activeStamp && (
                      <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/20 rounded-xl sm:rounded-2xl backdrop-blur-[0.5px]">
                        <div className={`px-3 py-1.5 rounded-lg border-2 font-black text-xs sm:text-sm tracking-wider uppercase shadow-2xl animate-stamp ${
                          activeStamp.type === 'fakta'
                            ? 'border-emerald-600 bg-emerald-500 text-white'
                            : 'border-rose-600 bg-rose-500 text-white'
                        }`}>
                          {activeStamp.text}
                        </div>
                      </div>
                    )}

                    {/* HEADER KARTU */}
                    <div className="w-full flex items-center justify-between flex-shrink-0 pointer-events-none">
                      <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                        {deck[currentCardIndex].category}
                      </span>
                      <span className="text-[9px] text-slate-500 font-extrabold">
                        #{currentCardIndex + 1}/{deck.length}
                      </span>
                    </div>

                    {/* TEKS PERNYATAAN KARTU */}
                    <div className="my-auto py-0.5 flex-1 flex flex-col items-center justify-center pointer-events-none">
                      <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center text-xs mb-0.5 shadow-inner">
                        📄
                      </div>
                      <p className="text-slate-900 font-black text-[11px] sm:text-xs leading-snug line-clamp-3">
                        "{deck[currentCardIndex].text}"
                      </p>
                    </div>

                    {/* FOOTER HINT PADA KARTU */}
                    <div className="w-full text-[8.5px] text-teal-700 font-extrabold border-t border-slate-200 pt-0.5 flex items-center justify-center gap-1 flex-shrink-0 pointer-events-none">
                      <span>👆 Geser ke Kiri (Fakta) atau Kanan (Mitos)</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white/95 rounded-xl shadow-xl text-center border-2 border-emerald-400">
                    <p className="font-extrabold text-emerald-800 text-xs sm:text-sm">Semua kartu berhasil disaring!</p>
                  </div>
                )}
              </div>

              {/* DROP ZONE MITOS (KANAN) */}
              <div
                ref={tongMitosRef}
                className={`rounded-xl sm:rounded-2xl p-1.5 sm:p-2.5 flex flex-col justify-between items-center border-2 sm:border-3 transition-all duration-200 shadow-md ${
                  dragOverZone === 'mitos'
                    ? 'border-rose-300 bg-rose-500/40 scale-102 ring-3 ring-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.7)]'
                    : 'border-rose-500/80 bg-gradient-to-b from-[#5C1D24] to-[#380E13]'
                }`}
              >
                <div className="w-full flex items-center justify-between pb-0.5 border-b border-rose-400/40 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white text-rose-700 font-black text-[10px] sm:text-xs flex items-center justify-center shadow">
                      ✕
                    </span>
                    <h3 className="text-white font-black text-xs sm:text-sm tracking-wider">
                      MITOS
                    </h3>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-300/30 text-rose-100 text-[8.5px] font-bold">
                    {mitosCount} Dibuang
                  </span>
                </div>

                <div className="my-auto py-0.5 text-center flex-1 flex flex-col items-center justify-center pointer-events-none">
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 flex items-center justify-center mb-0.5 transition-transform">
                    <img
                      src={tongMitosImg}
                      alt="Tong Mitos"
                      className="w-full h-full object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                  <p className="text-rose-100 text-[8.5px] sm:text-[9.5px] font-semibold px-0.5 leading-tight">
                    {dragOverZone === 'mitos' ? 'Lepaskan Kartu di Sini!' : 'Tarik kartu ke sini jika MITOS'}
                  </p>
                </div>

                {/* TOMBOL ALTERNATIF KLIK LANGSUNG */}
                <button
                  onClick={() => handleSortCard('mitos')}
                  className="w-full py-1 sm:py-1.5 px-1 rounded-lg bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-[10px] sm:text-xs shadow-md transition-all cursor-pointer border border-rose-300 flex items-center justify-center gap-1 flex-shrink-0"
                >
                  <span>✕ Masukkan ke MITOS</span>
                </button>
              </div>

            </div>

          </div>
        )}



        {/* -----------------------------------------------------------------------
            TRANSISI LEVEL 1 SELESAI -> KE LEVEL 2 (PUZZLE ALUR ANEMIA)
           ----------------------------------------------------------------------- */}
        {phase === 'level1_complete' && (
          <div className="w-full max-w-md sm:max-w-lg bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl border-3 border-emerald-500 flex flex-col items-center text-center animate-scaleUp max-h-[82vh] justify-between">
            <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-2xl mb-1 shadow-sm flex-shrink-0">
              ✨
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 px-3 py-0.5 rounded-full bg-emerald-100 flex-shrink-0">
              TAHAP 1 BERHASIL!
            </span>
            <h2 className="text-slate-900 font-black text-base sm:text-lg mt-0.5 flex-shrink-0">
              Seluruh Mitos Berhasil Disingkirkan!
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm my-2 leading-relaxed">
              Hebat! Sekarang saatnya melangkah ke <b>Tahap 2</b>: Susunlah kepingan alur terjadinya anemia dari awal hingga timbulnya gejala.
            </p>

            <div className="w-full bg-emerald-50 rounded-xl p-2 border border-emerald-200 flex items-center justify-around my-1 text-xs font-bold text-emerald-900 flex-shrink-0">
              <div>✅ Fakta Tepat: {faktaCount}</div>
              <div>🚫 Mitos Dibuang: {mitosCount}</div>
            </div>

            <button
              onClick={() => {
                playSound('click')
                initLevel2Pieces()
                setPhase('level2')
              }}
              className="mt-2 w-full py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 border border-emerald-400 flex-shrink-0"
            >
              <span>Lanjut ke Tahap 2: Ciptakan Alur</span>
              <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            FASE 2: LEVEL 2 (MEMBANGUN ALUR ANEMIA)
           ----------------------------------------------------------------------- */}
        {phase === 'level2' && (
          <div className={`w-full max-w-4xl h-full flex flex-col items-center justify-between overflow-hidden relative p-0.5 sm:p-1.5 ${isShaking ? 'animate-shake' : ''}`}>
            {activeStamp && (
              <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/20 rounded-2xl backdrop-blur-[1px]">
                <div className="px-5 py-2.5 rounded-2xl border-4 border-emerald-500 bg-emerald-600 text-white font-black text-sm tracking-wider uppercase shadow-2xl animate-stamp">
                  {activeStamp.text}
                </div>
              </div>
            )}

            {/* HEADER TAHAP 2 */}
            <div className="w-full bg-white/90 backdrop-blur-md rounded-xl py-0.5 px-2.5 shadow-xs border border-teal-600/30 flex items-center justify-between gap-1.5 mb-1 shrink-0">
              <span className="px-2 py-0.5 rounded-full bg-teal-700 text-white font-extrabold text-[9px] sm:text-[10px]">
                TAHAP 2: SUSUN ALUR
              </span>
              <p className="text-slate-800 text-[9.5px] sm:text-xs font-bold truncate">
                🖐️ Seret kepingan atau klik untuk susun ke urutan 1 s/d 4 yang benar!
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleResetSlots}
                  className="px-2 py-0.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-[9px] sm:text-[10px] font-bold cursor-pointer"
                >
                  ↺ Reset
                </button>
                <div className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-black text-[9px] sm:text-[10px]">
                  ⭐ {earnedScore} PTS
                </div>
              </div>
            </div>

            {/* 4 SLOT SUSUNAN ALUR */}
            <div className="w-full grid grid-cols-4 gap-1.5 sm:gap-2 my-0.5 flex-1 min-h-[90px] max-h-[155px]">
              {slots.map((piece, idx) => {
                const isDragOver = dragOverSlotIndex === idx
                return (
                  <div
                    key={idx}
                    ref={el => slotRefs.current[idx] = el}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = 'move'
                      setDragOverSlotIndex(idx)
                    }}
                    onDragLeave={() => setDragOverSlotIndex(null)}
                    onDrop={(e) => handleHtml5DropOnSlot(e, idx)}
                    onClick={() => handleSlotClick(idx)}
                    className={`rounded-xl p-1 sm:p-1.5 flex flex-col justify-between items-center text-center border transition-all relative overflow-hidden select-none ${
                      isDragOver
                        ? 'bg-amber-100/90 border-amber-500 ring-3 ring-amber-300/80 scale-[1.02] shadow-xl'
                        : piece
                        ? 'bg-white border-teal-500 shadow-sm hover:border-amber-400'
                        : selectedPieceId
                        ? 'bg-teal-50/80 border-dashed border-teal-400 animate-pulse'
                        : 'bg-white/40 border-dashed border-white/60 hover:border-white/90'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between text-[8px] sm:text-[8.5px] font-black text-teal-800 pb-0.5 border-b border-slate-100 shrink-0">
                      <span>Langkah #{idx + 1}</span>
                      {piece && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            executeDropOnAvailable({ piece, source: 'slot', fromSlotIndex: idx })
                          }}
                          className="text-rose-500 font-bold hover:underline cursor-pointer text-[8px]"
                        >
                          Hapus
                        </button>
                      )}
                    </div>

                    {piece ? (
                      <div
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', JSON.stringify({ piece, source: 'slot', fromSlotIndex: idx }))
                          e.dataTransfer.effectAllowed = 'move'
                        }}
                        onPointerDown={(e) => handlePointerDownPiece(e, { piece, source: 'slot', fromSlotIndex: idx })}
                        className="my-auto py-0.5 flex-1 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing w-full touch-none overflow-hidden"
                      >
                        <span className="text-xs sm:text-sm mb-0.5 shrink-0">
                          {piece.iconType === 'food' ? '🥗' : piece.iconType === 'body' ? '🫁' : piece.iconType === 'blood' ? '🩸' : '🥱'}
                        </span>
                        <h4 className="text-[7.5px] sm:text-[8.5px] font-black text-slate-900 leading-tight line-clamp-2 px-0.5">
                          {piece.title}
                        </h4>
                        <p className="text-[6.5px] sm:text-[7.5px] text-slate-500 mt-0.5 line-clamp-2 leading-tight px-0.5">
                          {piece.desc}
                        </p>
                      </div>
                    ) : (
                      <div className="my-auto py-1 text-center text-slate-300">
                        <span className="text-sm sm:text-base block mb-0.5">➕</span>
                        <span className="text-[8px] sm:text-[8.5px] font-bold">Seret / Klik</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* KEPINGAN ALUR YANG TERSEDIA DI BAWAH */}
            <div
              ref={availableContainerRef}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
                setIsOverAvailable(true)
              }}
              onDragLeave={() => setIsOverAvailable(false)}
              onDrop={handleHtml5DropOnAvailable}
              className={`w-full backdrop-blur-md rounded-xl p-1.5 sm:p-2 border transition-all my-0.5 shrink-0 ${
                isOverAvailable
                  ? 'border-amber-400 bg-[#002b45] ring-2 ring-amber-400/50'
                  : 'bg-[#001E30]/80 border-teal-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-teal-200 text-[8.5px] sm:text-[9px] font-extrabold uppercase">
                  Pilihan Kepingan ({availablePieces.length} tersisa):
                </span>
                <span className="text-slate-400 text-[8px] sm:text-[8.5px] italic">
                  Tarik kepingan ke slot langkah di atas
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {availablePieces.map((piece) => {
                  const isSelected = selectedPieceId === piece.id
                  return (
                    <div
                      key={piece.id}
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', JSON.stringify({ piece, source: 'available' }))
                        e.dataTransfer.effectAllowed = 'move'
                      }}
                      onPointerDown={(e) => handlePointerDownPiece(e, { piece, source: 'available' })}
                      className={`p-1 sm:p-1.5 rounded-lg sm:rounded-xl border transition-all cursor-grab active:cursor-grabbing flex items-start gap-1.5 touch-none select-none ${
                        isSelected
                          ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-300 scale-102 shadow-md'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-sm sm:text-base shrink-0 self-start mt-0.5">
                        {piece.iconType === 'food' ? '🥗' : piece.iconType === 'body' ? '🫁' : piece.iconType === 'blood' ? '🩸' : '🥱'}
                      </span>
                      <div className="text-left min-w-0 flex-1">
                        <span className="text-[8px] sm:text-[9px] font-black text-slate-900 leading-tight block line-clamp-2">
                          {piece.title}
                        </span>
                        <span className="text-[6.5px] sm:text-[7.5px] text-slate-500 leading-tight block line-clamp-2 mt-0.5">
                          {piece.desc}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* TOMBOL PERIKSA HASIL ALUR */}
            <div className="w-full max-w-xs flex justify-center mb-0.5 shrink-0">
              <button
                onClick={handleCheckLevel2Alur}
                className="w-full py-1.5 sm:py-2 px-4 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-400 text-white font-black text-[11px] sm:text-xs shadow-md active:scale-95 transition-all cursor-pointer border border-teal-300 flex items-center justify-center gap-1.5"
              >
                <span>🔍 Validasi Susunan Alur Anemia</span>
              </button>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            MODAL JIKA SUSUNAN ALUR SALAH
           ----------------------------------------------------------------------- */}
        {showLevel2WrongModal && (
          <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-xs flex items-center justify-center p-3">
            <div className="bg-white rounded-2xl p-4 sm:p-5 max-w-sm w-full shadow-2xl border-4 border-rose-500 text-center animate-scaleUp my-auto">
              <div className="w-12 h-12 rounded-full bg-rose-100 border-2 border-rose-400 flex items-center justify-center text-2xl mx-auto mb-2 text-rose-600 font-bold">
                ✕
              </div>
              <h3 className="text-rose-700 font-black text-sm sm:text-base mb-1">
                Alur Belum Tepat! (-10 PTS)
              </h3>
              <p className="text-slate-600 text-xs my-2 leading-relaxed">
                Susunan langkah alur patofisiologi anemia belum tepat. Silakan periksa dan atur kembali urutan kepingan langkahmu!
              </p>
              <button
                onClick={() => setShowLevel2WrongModal(false)}
                className="w-full py-2.5 bg-[#003049] hover:bg-[#002233] text-white font-black text-xs rounded-xl shadow cursor-pointer active:scale-95 transition-all mt-2"
              >
                Coba Susun Lagi
              </button>
            </div>
          </div>
        )}

      </div>

      {/* FLOATING DRAG PREVIEW SAAT DI-DRAG (TOUCH / POINTER) */}
      {draggedItem && (
        <div
          className="fixed pointer-events-none z-[120] transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-2 shadow-2xl border-2 border-amber-400 ring-4 ring-amber-300/40 w-44 select-none opacity-95"
          style={{ left: `${dragPos.x}px`, top: `${dragPos.y}px` }}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-lg">
              {draggedItem.piece.iconType === 'food' ? '🥗' : draggedItem.piece.iconType === 'body' ? '🫁' : draggedItem.piece.iconType === 'blood' ? '🩸' : '🥱'}
            </span>
            <div className="text-left min-w-0 flex-1">
              <h4 className="text-[9.5px] font-black text-slate-900 leading-tight truncate">
                {draggedItem.piece.title}
              </h4>
              <span className="text-[8px] text-slate-500 block truncate">
                {draggedItem.piece.desc}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          FASE 3: KEMENANGAN AKHIR (SELESAI MISI D) - MODAL OVERLAY TERPUSAT Z-[100]
         ========================================================================= */}
      {phase === 'completed' && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain py-3 sm:py-6">
          <div className="relative bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4.5 max-w-[320px] sm:max-w-xs md:max-w-sm w-full shadow-2xl border-3 sm:border-4 border-amber-400 flex flex-col items-center text-center animate-scaleUp my-auto max-h-[92dvh] overflow-y-auto custom-scrollbar">
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

            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-xl sm:text-2xl mb-1 shadow-inner flex-shrink-0">
              🏆
            </div>
            <span className="text-[9.5px] font-black uppercase tracking-wider text-amber-800 px-2.5 py-0.5 rounded-full bg-amber-100 mb-1 flex-shrink-0">
              MISI D SELESAI
            </span>
            <h2 className="text-[#003049] font-black text-sm sm:text-base mb-0.5 flex-shrink-0">
              Pakar Pemilahan Fakta Anemia!
            </h2>
            <p className="text-slate-600 text-[10.5px] sm:text-xs mb-2 leading-snug px-1">
              Kamu berhasil menyingkirkan mitos keliru dan merumuskan alur biologis terjadinya anemia dengan tepat.
            </p>

            <div className="w-full bg-amber-50 rounded-xl p-2 border border-amber-200 mb-2.5 flex items-center justify-around flex-shrink-0">
              <div>
                <span className="text-[9.5px] text-slate-500 font-bold block">Skor Akhir:</span>
                <span className="text-base sm:text-lg font-black text-amber-600">{earnedScore} PTS</span>
              </div>
              <div className="h-6 w-px bg-slate-300" />
              <div>
                <span className="text-[9.5px] text-slate-500 font-bold block">Status:</span>
                <span className="text-[11px] font-black text-emerald-700">Tersimpan ✔</span>
              </div>
            </div>

            <div className="w-full flex flex-col gap-1.5 flex-shrink-0">
              <button
                onClick={() => {
                  playSound('click')
                  onComplete && onComplete({ score: earnedScore, missionId: misiId, nextMission: 'e' })
                }}
                className="w-full py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-amber-300"
              >
                <span>Lanjut ke Game Selanjutnya: Misi E (Dokter Sel Darah)</span>
                <span className="text-xs font-black">➔</span>
              </button>

              <button
                onClick={() => {
                  playSound('click')
                  onComplete && onComplete({ score: earnedScore, missionId: misiId })
                  onBack && onBack()
                }}
                className="w-full py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-slate-300"
              >
                <span>🏠 Kembali ke Menu Misi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PROTEKSI 1X PERCOBAAN: JIKA SUDAH SELESAI SEBELUMNYA
         ========================================================================= */}
      {alreadyCompleted && phase === 'intro' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto overscroll-contain py-3 sm:py-6">
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border-4 border-amber-400 flex flex-col items-center max-h-[92dvh] overflow-y-auto custom-scrollbar my-auto">
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

            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-3 text-2xl shadow-inner text-emerald-600 font-bold">
              ✔
            </div>
            <h2 className="text-[#003049] font-black text-lg mb-1">MISI LEVEL D SELESAI</h2>
            <p className="text-slate-600 text-xs mb-3">
              Kamu sudah menyelesaikan Misi Pemilahan Fakta vs Mitos dengan skor:
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
    </div>
  )
}
