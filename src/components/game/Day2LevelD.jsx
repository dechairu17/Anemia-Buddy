import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { playSound } from '../../utils/audio'

// ASET BACKGROUND
import bgImg from '../../assets/16 day 2 D/background.png'

// ASET MONSTER DALAM BUBBLE (FASE 1: PECAHKAN MONSTER)
import monster1Img from '../../assets/16 day 2 D/aset monster dan benteng/monster merah w_ bub.png'
import monster2Img from '../../assets/16 day 2 D/aset monster dan benteng/monster biru w_bub .png'
import monster3Img from '../../assets/16 day 2 D/aset monster dan benteng/monster merah ompong w_bub.png'
import monster4Img from '../../assets/16 day 2 D/aset monster dan benteng/monster kuning w_ bub.png'

// ASET BENTENG PERTAHANAN (FASE 2: BELI BENTENG)
import bentengMerahImg from '../../assets/16 day 2 D/aset monster dan benteng/benteng merah .png'
import bentengKuningImg from '../../assets/16 day 2 D/aset monster dan benteng/benteng kuning.png'
import bentengBiruImg from '../../assets/16 day 2 D/aset monster dan benteng/benteng biru.png'
import bentengUnguImg from '../../assets/16 day 2 D/aset monster dan benteng/benteng ungu.png'

// ASET POPUP INFORMASI & AKHIR
import popup263Img from '../../assets/16 day 2 D/pop up informasi/263.png'
import popup264Img from '../../assets/16 day 2 D/pop up informasi/264.png'
import popup265Img from '../../assets/16 day 2 D/pop up informasi/265.png'
import popup266Img from '../../assets/16 day 2 D/pop up informasi/266.png'
import popupKoinKurangImg from '../../assets/16 day 2 D/pop up informasi/koin tidak cukup.png'
import popupTuntasImg from '../../assets/16 day 2 D/pop up informasi/tuntas.png'

// KONFIGURASI 4 TITIK PEMBULUH DARAH (MONSTER & BENTENG)
const TRACK_SPOTS = [
  {
    id: 1,
    left: '13%',
    top: '34%',
    monsterImg: monster1Img,
    bentengImg: bentengMerahImg,
    bentengKey: 'zat_besi',
    bentengName: 'Benteng Konsumsi Makanan Kaya Zat Besi',
    bentengColor: 'from-rose-600 to-red-700',
    bentengBorder: 'border-red-400',
    popupImg: popup263Img,
    infoTitle: 'Produksi Sel Darah Merah & Kekebalan Tubuh'
  },
  {
    id: 2,
    left: '37.5%',
    top: '43.5%',
    monsterImg: monster2Img,
    bentengImg: bentengKuningImg,
    bentengKey: 'vitamin_c',
    bentengName: 'Benteng Konsumsi Vitamin C Pendukung Zat Besi',
    bentengColor: 'from-amber-500 to-yellow-600',
    bentengBorder: 'border-amber-300',
    popupImg: popup264Img,
    infoTitle: 'Konsentrasi & Suplai Oksigen Otak'
  },
  {
    id: 3,
    left: '64%',
    top: '46%',
    monsterImg: monster3Img,
    bentengImg: bentengBiruImg,
    bentengKey: 'ttd',
    bentengName: 'Benteng Konsumsi Tablet Tambah Darah (TTD)',
    bentengColor: 'from-cyan-600 to-blue-700',
    bentengBorder: 'border-cyan-300',
    popupImg: popup265Img,
    infoTitle: 'Baterai Tubuh & Pencegahan 5L'
  },
  {
    id: 4,
    left: '88%',
    top: '48%',
    monsterImg: monster4Img,
    bentengImg: bentengUnguImg,
    bentengKey: 'hindari_tanin',
    bentengName: 'Benteng Menghindari Zat Tanin Setelah Makan',
    bentengColor: 'from-purple-600 to-indigo-700',
    bentengBorder: 'border-purple-300',
    popupImg: popup266Img,
    infoTitle: 'Pencegahan Stunting Sejak Remaja Putri'
  }
]

export default function Day2LevelD({ misiId = 'misi_h2_d', onBack, onComplete }) {
  // STATE PERMAINAN:
  // fase: 'hunt' (Pecahkan Monster) | 'build' (Beli Benteng)
  const [fase, setFase] = useState('hunt')
  
  // KOIN PEMAIN (Mulai dari 0, setiap terima info +25, tolak -10)
  const [coins, setCoins] = useState(0)

  // STATUS MONSTER YANG SUDAH DIKLIK / DIPERIKSA (array of id: [1, 2, 3, 4])
  const [defeatedMonsters, setDefeatedMonsters] = useState([])

  // MODAL INFORMASI YANG SEDANG AKTIF (null atau objek spot: TRACK_SPOTS[i])
  const [activeInfoModal, setActiveInfoModal] = useState(null)

  // BENTENG YANG TELAH DIBELI (array of bentengKey)
  const [purchasedBenteng, setPurchasedBenteng] = useState([])

  // MODAL AKHIR PERMAINAN: null | 'tuntas' | 'koin_kurang'
  const [endGameModal, setEndGameModal] = useState(null)

  // TOAST NOTIFIKASI
  const [toastMsg, setToastMsg] = useState('')

  // USER & SCORE STATE
  const [currentUser, setCurrentUser] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const startTimeRef = useRef(Date.now())

  // TOAST HANDLER
  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  // LOAD USER PROFILE
  useEffect(() => {
    const uName = localStorage.getItem('anemia_username') || 'ais'
    const fetchUser = async () => {
      try {
        const { data: userData } = await supabase
          .from('game_users')
          .select('username, gender')
          .ilike('username', uName)
          .maybeSingle()

        if (userData) {
          setCurrentUser(userData)
        } else {
          setCurrentUser({ username: uName, gender: 'female' })
        }
      } catch (err) {
        console.error('Error load user Day 2 Level D:', err)
        setCurrentUser({ username: uName, gender: 'female' })
      }
    }
    fetchUser()
  }, [])

  // HANDLER KLIK MONSTER
  const handleMonsterClick = (spot) => {
    if (defeatedMonsters.includes(spot.id)) return
    playSound('click')
    setActiveInfoModal(spot)
  }

  // HANDLER TERIMA INFORMASI (+25 COIN)
  const handleAcceptInfo = () => {
    if (!activeInfoModal) return
    playSound('celebration')
    const spotId = activeInfoModal.id

    setCoins((prev) => prev + 25)
    setDefeatedMonsters((prev) => {
      const updated = [...prev, spotId]
      checkAllMonstersDefeated(updated)
      return updated
    })

    showToast('✨ +25 Coin! Kamu membuka wawasan baru pencegahan anemia.')
    setActiveInfoModal(null)
  }

  // HANDLER TOLAK INFORMASI (-10 COIN)
  const handleRejectInfo = () => {
    if (!activeInfoModal) return
    playSound('wrong')
    const spotId = activeInfoModal.id

    setCoins((prev) => Math.max(0, prev - 10))
    setDefeatedMonsters((prev) => {
      const updated = [...prev, spotId]
      checkAllMonstersDefeated(updated)
      return updated
    })

    showToast('⚠️ -10 Coin! Kamu melewatkan informasi penting.')
    setActiveInfoModal(null)
  }

  // CEK APAKAH KE-4 MONSTER TELAH DIKLIK & DIJAWAB
  const checkAllMonstersDefeated = (updatedList) => {
    if (updatedList.length >= TRACK_SPOTS.length) {
      setTimeout(() => {
        playSound('celebration')
        setFase('build')
        showToast('🛡️ Semua monster teratasi! Sekarang saatnya pasang benteng pertahanan!')
      }, 700)
    }
  }

  // HANDLER PEMBELIAN BENTENG (BIAYA 25 COIN)
  const handleBuyBenteng = (spot) => {
    if (purchasedBenteng.includes(spot.bentengKey)) return

    if (coins < 25) {
      playSound('wrong')
      showToast('❌ Coin tidak cukup untuk membeli benteng ini (Perlu 25 Coin)!')
      return
    }

    playSound('celebration')
    const newCoins = coins - 25
    const newPurchased = [...purchasedBenteng, spot.bentengKey]
    setCoins(newCoins)
    setPurchasedBenteng(newPurchased)
    showToast(`🏰 Berhasil memasang ${spot.bentengName}!`)

    // Cek apakah seluruh 4 benteng sudah tuntas terpasang
    if (newPurchased.length === TRACK_SPOTS.length) {
      setTimeout(() => {
        handleGameCompletion(100, 'tuntas')
      }, 800)
    } else if (newCoins < 25) {
      // Jika koin sisa tidak cukup lagi untuk benteng yang tersisa
      setTimeout(() => {
        const finalScore = Math.min(100, Math.round(newPurchased.length * 25))
        handleGameCompletion(finalScore, 'koin_kurang')
      }, 1000)
    }
  }

  // SIMPAN HASIL AKHIR KE SUPABASE & LOCALSTORAGE
  const handleGameCompletion = async (finalScore, modalType) => {
    playSound(modalType === 'tuntas' ? 'celebration' : 'wrong')
    setEndGameModal(modalType)
    setIsSaving(true)

    try {
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
      localStorage.setItem('misi_h2_d_completed', 'true')
      localStorage.setItem('misi_h2_d_score', finalScore.toString())

      let targetUser = currentUser?.username || localStorage.getItem('anemia_username') || 'ais'
      const { data: dbUser } = await supabase
        .from('game_users')
        .select('username')
        .ilike('username', targetUser)
        .maybeSingle()

      if (dbUser?.username) {
        targetUser = dbUser.username
      }

      await supabase.from('game_scores').insert([
        {
          username: targetUser,
          kategori_game: misiId,
          skor: finalScore,
          durasi_detik: durationSeconds
        }
      ])
      console.log('Berhasil menyimpan skor Day 2 Level D:', finalScore)
    } catch (err) {
      console.error('Error simpan skor Day 2 Level D:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // KEMBALI KE HOME SETELAH SELESAI
  const handleExitToHome = () => {
    playSound('click')
    if (onComplete) {
      const calculatedScore = Math.min(100, Math.round(purchasedBenteng.length * 25))
      onComplete({
        misiId,
        score: calculatedScore,
        nextMission: 'E'
      })
    } else if (onBack) {
      onBack()
    }
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col justify-between select-none font-sans bg-[#F9D2D2]">
      
      {/* LATAR BELAKANG JALUR PEMBULUH DARAH (PERSIS BACKGROUND.PNG) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url("${bgImg}")`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* HEADER NAVIGASI & STATISTIK */}
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
              HARI 2 - MISI D
            </span>
            <span className="text-slate-400 text-xs hidden md:inline">|</span>
            <span className="text-slate-200 text-xs font-semibold hidden md:inline">
              {fase === 'hunt' ? 'Basmi Monster Anemia' : 'Benteng Pertahanan Anemia'}
            </span>
          </div>
        </div>

        {/* INDIKATOR STATUS KOIN & BENTENG */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 bg-black/50 border border-amber-400/50 px-3 py-1 rounded-full shadow-md">
            <span className="text-base sm:text-lg">🪙</span>
            <span className="text-amber-300 font-black text-xs sm:text-sm tracking-wide">
              {coins} Coin
            </span>
          </div>

          {fase === 'build' && (
            <div className="flex items-center gap-1.5 bg-black/50 border border-emerald-400/50 px-3 py-1 rounded-full shadow-md text-emerald-300 text-xs font-bold">
              <span>🏰</span>
              <span>{purchasedBenteng.length}/4 Terpasang</span>
            </div>
          )}
        </div>
      </header>

      {/* TOAST NOTIFIKASI */}
      {toastMsg && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-[#1A0A0E] text-amber-300 font-extrabold text-xs sm:text-sm px-5 py-2 rounded-full shadow-2xl border border-amber-500/70 animate-bounce max-w-[90%] text-center">
          {toastMsg}
        </div>
      )}

      {/* =====================================================================
          ARENA UTAMA GAMEPLAY (JALUR PEMBULUH DARAH)
          ===================================================================== */}
      <main className="relative z-10 flex-1 w-full h-full flex flex-col items-center justify-between overflow-hidden">
        
        {/* INSTRUKSI TEKS DI ATAS */}
        <div className="w-full text-center mt-2 sm:mt-3 px-4 z-20 pointer-events-none">
          {fase === 'hunt' ? (
            <div className="inline-block bg-black/40 backdrop-blur-xs border border-white/20 rounded-full px-4 sm:px-6 py-1 drop-shadow-md">
              <h2 className="text-amber-300 font-black text-sm sm:text-base md:text-lg drop-shadow-sm">
                Klik Monster!
              </h2>
              <p className="text-[11px] sm:text-xs text-white font-medium">
                Tubuhmu sedang diserang oleh monster anemia. Pecahkan monster untuk menyelamatkan tubuhmu!
              </p>
            </div>
          ) : (
            <div className="inline-block bg-black/50 backdrop-blur-xs border border-amber-400/30 rounded-full px-4 sm:px-6 py-1 drop-shadow-md">
              <h2 className="text-amber-300 font-black text-sm sm:text-base md:text-lg drop-shadow-sm">
                Beli Benteng-Benteng Pencegahan Anemia
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-200 font-medium">
                Pasang benteng pertahanan di pembuluh darahmu menggunakan koin yang telah terkumpul!
              </p>
            </div>
          )}
        </div>

        {/* CONTAINER POSISI TITIK DI JALUR PEMBULUH DARAH (RASIO TERKUNCI 16:9) */}
        <div className="relative w-full flex-1 max-w-7xl max-h-[75vh] mx-auto">
          {TRACK_SPOTS.map((spot) => {
            const isDefeated = defeatedMonsters.includes(spot.id)
            const isBuilt = purchasedBenteng.includes(spot.bentengKey)

            return (
              <div
                key={spot.id}
                style={{
                  position: 'absolute',
                  left: spot.left,
                  top: spot.top,
                  transform: 'translate(-50%, -50%)'
                }}
                className="z-20 flex flex-col items-center justify-center select-none"
              >
                {/* 1. TAMPILAN MONSTER (FASE HUNT) */}
                {fase === 'hunt' && (
                  <div className="relative group flex flex-col items-center">
                    {!isDefeated ? (
                      <button
                        onClick={() => handleMonsterClick(spot)}
                        className="relative cursor-pointer transition-transform duration-200 hover:scale-115 active:scale-95 animate-pulse focus:outline-none"
                        title={`Pecahkan monster titik ${spot.id}`}
                      >
                        <img
                          src={spot.monsterImg}
                          alt={`Monster ${spot.id}`}
                          className="w-18 h-18 sm:w-24 sm:h-24 md:w-30 md:h-30 lg:w-36 lg:h-36 object-contain drop-shadow-xl"
                          draggable={false}
                        />
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow-md animate-bounce whitespace-nowrap">
                          Pecahkan!
                        </span>
                      </button>
                    ) : (
                      // Monster sudah terpecahkan
                      <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center opacity-40">
                        <span className="text-3xl sm:text-4xl">✨</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. TAMPILAN BENTENG (FASE BUILD) */}
                {fase === 'build' && (
                  <div className="relative flex flex-col items-center">
                    {isBuilt ? (
                      <div className="relative flex flex-col items-center animate-scale-up">
                        <img
                          src={spot.bentengImg}
                          alt={spot.bentengName}
                          className="w-18 h-18 sm:w-24 sm:h-24 md:w-30 md:h-30 lg:w-36 lg:h-36 object-contain drop-shadow-2xl"
                          draggable={false}
                        />
                        <span className="text-[9px] sm:text-[10px] font-black text-amber-300 bg-black/70 px-2 py-0.5 rounded-full shadow mt-1 whitespace-nowrap border border-amber-400/40">
                          🛡️ Benteng Aktif
                        </span>
                      </div>
                    ) : (
                      // Titik benteng yang belum dibangun
                      <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 rounded-full border-2 border-dashed border-amber-400/60 bg-black/30 flex items-center justify-center text-amber-300 animate-pulse">
                        <span className="text-xs sm:text-sm font-black">Spot {spot.id}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* =====================================================================
            PANEL KONTROL BAWAH (HANYA AKTIF PADA FASE BUILD)
            ===================================================================== */}
        {fase === 'build' && (
          <div className="relative z-30 w-full max-w-4xl px-3 sm:px-6 pb-2 sm:pb-3 animate-fade-in">
            <div className="bg-[#1C0A0E]/95 border-2 border-amber-500/70 rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-amber-500/30">
                <span className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
                  <span>🏰</span>
                  <span>Toko Benteng Pencegahan Anemia (25 Coin / Benteng)</span>
                </span>
                <span className="text-xs font-bold text-amber-200">
                  Sisa: <strong className="text-amber-400 font-black">{coins}</strong> Coin
                </span>
              </div>

              {/* GRID 4 TOMBOL PEMBELIAN BENTENG */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2.5">
                {TRACK_SPOTS.map((spot) => {
                  const isBuilt = purchasedBenteng.includes(spot.bentengKey)
                  const canAfford = coins >= 25

                  return (
                    <button
                      key={spot.bentengKey}
                      onClick={() => handleBuyBenteng(spot)}
                      disabled={isBuilt || !canAfford}
                      className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-200 ${
                        isBuilt
                          ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200 cursor-default opacity-90'
                          : canAfford
                          ? 'bg-white/10 hover:bg-white/20 active:scale-98 border-amber-400/60 text-white cursor-pointer shadow-md'
                          : 'bg-black/30 border-white/10 text-slate-400 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={spot.bentengImg}
                          alt=""
                          className="w-7 h-7 sm:w-9 sm:h-9 object-contain flex-shrink-0"
                        />
                        <div>
                          <div className="text-[11px] sm:text-xs font-bold leading-tight line-clamp-1">
                            {spot.bentengName}
                          </div>
                          <div className="text-[9px] sm:text-[10px] text-amber-300 font-semibold mt-0.5">
                            {isBuilt ? 'Terpasang di Titik ' + spot.id + ' ✓' : 'Biaya: 25 Coin'}
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0 ml-2">
                        {isBuilt ? (
                          <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                            Aktif ✓
                          </span>
                        ) : (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              canAfford
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            {canAfford ? 'Beli' : 'Koin Kurang'}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* =====================================================================
          MODAL POPUP INFORMASI (263, 264, 265, 266)
          ===================================================================== */}
      {activeInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in">
          <div className="relative max-w-2xl sm:max-w-3xl md:max-w-4xl w-full flex flex-col items-center">
            {/* GAMBAR MODAL INFORMASI TRANSPARAN ASLI */}
            <img
              src={activeInfoModal.popupImg}
              alt="Informasi Anemia"
              className="w-full h-auto max-h-[86vh] object-contain drop-shadow-2xl"
            />

            {/* TOMBOL OVERLAY INTERAKTIF: TERIMA INFORMASI (+25 COIN) */}
            <button
              onClick={handleAcceptInfo}
              style={{
                left: '17%',
                top: '76%',
                width: '32%',
                height: '11%'
              }}
              className="absolute rounded-xl cursor-pointer hover:bg-white/15 active:scale-95 transition-all focus:outline-none"
              title="Terima Informasi (+25 coin)"
            />

            {/* TOMBOL OVERLAY INTERAKTIF: TOLAK INFORMASI (-10 COIN) */}
            <button
              onClick={handleRejectInfo}
              style={{
                left: '51%',
                top: '76%',
                width: '32%',
                height: '11%'
              }}
              className="absolute rounded-xl cursor-pointer hover:bg-white/15 active:scale-95 transition-all focus:outline-none"
              title="Tolak Informasi (-10 coin)"
            />
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL POPUP AKHIR: TUNTAS SEMUA (100 COIN TERPASANG SEMUA)
          ===================================================================== */}
      {endGameModal === 'tuntas' && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in">
          <div className="relative max-w-xl sm:max-w-2xl md:max-w-3xl w-full flex flex-col items-center">
            <img
              src={popupTuntasImg}
              alt="Selamat Telah Memasang Benteng Pertahanan Anemia"
              className="w-full h-auto max-h-[85vh] object-contain drop-shadow-2xl"
            />

            {/* TOMBOL OVERLAY INTERAKTIF: KEMBALI KE HOME A */}
            <button
              onClick={handleExitToHome}
              style={{
                left: '36%',
                top: '52%',
                width: '28%',
                height: '11%'
              }}
              className="absolute rounded-xl cursor-pointer hover:bg-white/15 active:scale-95 transition-all focus:outline-none"
              title="Kembali Ke Home"
            />
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL POPUP AKHIR: KOIN TIDAK CUKUP
          ===================================================================== */}
      {endGameModal === 'koin_kurang' && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in">
          <div className="relative max-w-xl sm:max-w-2xl md:max-w-3xl w-full flex flex-col items-center">
            <img
              src={popupKoinKurangImg}
              alt="Coinmu Tidak Cukup Untuk Membeli Benteng Pertahanan Anemia"
              className="w-full h-auto max-h-[85vh] object-contain drop-shadow-2xl"
            />

            {/* TOMBOL OVERLAY INTERAKTIF: KEMBALI KE HOME A */}
            <button
              onClick={handleExitToHome}
              style={{
                left: '36%',
                top: '52%',
                width: '28%',
                height: '11%'
              }}
              className="absolute rounded-xl cursor-pointer hover:bg-white/15 active:scale-95 transition-all focus:outline-none"
              title="Kembali Ke Home"
            />
          </div>
        </div>
      )}

    </div>
  )
}
