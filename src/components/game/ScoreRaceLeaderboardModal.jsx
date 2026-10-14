import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { playSound } from '../../utils/audio'

// ASSET PROFIL SISWA
import bgProfilPria from '../../assets/6/game home - profil pria_crop.png'
import bgProfilWanita from '../../assets/6/game home - profil wanita_crop.png'

export default function ScoreRaceLeaderboardModal({
  isOpen,
  currentMissionId = 'misi_h1_a',
  currentMissionTitle = 'Misi Game',
  currentScore = 100,
  nextMissionKey = null,
  nextMissionTitle = null,
  onNext,
  onBackToMenu
}) {
  const [tab, setTab] = useState('mission') // 'mission' | 'total'
  const [loading, setLoading] = useState(true)
  const [leaderboardData, setLeaderboardData] = useState([])
  const [userGenderMap, setUserGenderMap] = useState({})
  
  const currentUsername = localStorage.getItem('anemia_username') || 'Siswa'

  useEffect(() => {
    if (isOpen) {
      playSound('cring')
      fetchLeaderboard()
    }
  }, [isOpen, tab, currentMissionId])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      // 1. Ambil data users untuk gender/avatar
      const { data: usersData } = await supabase
        .from('game_users')
        .select('username, gender')

      const gMap = {}
      if (usersData) {
        usersData.forEach(u => {
          if (u.username) gMap[u.username.toLowerCase()] = u.gender
        })
        setUserGenderMap(gMap)
      }

      // 2. Ambil data skor
      const { data: scoreData, error } = await supabase
        .from('game_scores')
        .select('*')

      if (error) {
        console.error('Error fetching game_scores:', error.message)
      }

      const allScores = scoreData || []

      if (tab === 'mission') {
        // PERINGKAT MISI INI: ambil skor tertinggi per user untuk kategori_game saat ini
        const userBestScore = {}
        allScores
          .filter(item => item.kategori_game === currentMissionId)
          .forEach(item => {
            const uname = item.username || 'Anonim'
            if (!userBestScore[uname] || item.skor > userBestScore[uname].skor) {
              userBestScore[uname] = {
                username: uname,
                skor: item.skor || 0,
                durasi_detik: item.durasi_detik || 0,
                created_at: item.created_at
              }
            }
          })

        // Jika user sekarang belum ada di data db (misal proses async insert), sertakan dengan skor sekarang
        if (!userBestScore[currentUsername]) {
          userBestScore[currentUsername] = {
            username: currentUsername,
            skor: currentScore,
            durasi_detik: 30,
            created_at: new Date().toISOString()
          }
        }

        const sorted = Object.values(userBestScore).sort((a, b) => {
          if (b.skor !== a.skor) return b.skor - a.skor
          return (a.durasi_detik || 999) - (b.durasi_detik || 999)
        })

        setLeaderboardData(sorted)
      } else {
        // PERINGKAT TOTAL HARI INI: akumulasi semua skor per user
        const userTotalScore = {}
        allScores.forEach(item => {
          const uname = item.username || 'Anonim'
          if (!userTotalScore[uname]) {
            userTotalScore[uname] = {
              username: uname,
              skor: 0,
              totalMisi: 0,
              durasi_detik: 0
            }
          }
          userTotalScore[uname].skor += item.skor || 0
          userTotalScore[uname].totalMisi += 1
          userTotalScore[uname].durasi_detik += item.durasi_detik || 0
        })

        // Pastikan current user minimal ada
        if (!userTotalScore[currentUsername]) {
          userTotalScore[currentUsername] = {
            username: currentUsername,
            skor: currentScore,
            totalMisi: 1,
            durasi_detik: 30
          }
        }

        const sorted = Object.values(userTotalScore).sort((a, b) => {
          if (b.skor !== a.skor) return b.skor - a.skor
          return (a.durasi_detik || 999) - (b.durasi_detik || 999)
        })

        setLeaderboardData(sorted)
      }
    } catch (err) {
      console.error('Leaderboard error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  // Cari posisi user
  const currentUserIndex = leaderboardData.findIndex(
    item => item.username?.toLowerCase() === currentUsername.toLowerCase()
  )
  const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : '-'

  const top1 = leaderboardData[0]
  const top2 = leaderboardData[1]
  const top3 = leaderboardData[2]

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0A0F1D] text-white rounded-3xl border-3 border-amber-400/80 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col p-3 sm:p-5 max-h-[95dvh] overflow-hidden my-auto animate-zoomIn">
        
        {/* AMBIENT GLOW */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* =====================================================================
            HEADER BALAPAN SKOR & PENGATUR TAB
           ===================================================================== */}
        <div className="flex flex-col items-center text-center mb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl animate-bounce">🏁</span>
            <h2 className="text-base sm:text-lg md:text-xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow">
              BALAPAN SKOR - PAPAN PERINGKAT
            </h2>
            <span className="text-xl sm:text-2xl animate-bounce">🏆</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium">
            Persaingan seru hasil skor kamu &amp; teman-teman sekelas!
          </p>

          {/* TAB SWITCHER */}
          <div className="mt-2 flex items-center bg-slate-900/90 p-1 rounded-full border border-slate-700 shadow-inner">
            <button
              onClick={() => {
                playSound('click')
                setTab('mission')
              }}
              className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                tab === 'mission'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md scale-102'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>🎯</span>
              <span>Peringkat Misi Ini ({currentMissionTitle})</span>
            </button>

            <button
              onClick={() => {
                playSound('click')
                setTab('total')
              }}
              className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                tab === 'total'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md scale-102'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>👑</span>
              <span>Total Skor Keseluruhan</span>
            </button>
          </div>
        </div>

        {/* =====================================================================
            PODIUM TOP 3 BALAPAN (JUARA 1, 2, 3)
           ===================================================================== */}
        <div className="w-full grid grid-cols-3 gap-1.5 sm:gap-2.5 items-end my-1 px-1 flex-shrink-0">
          
          {/* JUARA 2 (SILVER) */}
          <div className="flex flex-col items-center">
            {top2 ? (
              <div className="flex flex-col items-center w-full">
                <div className="relative mb-1">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center border-2 border-slate-100 shadow-md">
                    {userGenderMap[top2.username?.toLowerCase()] === 'female' ? '👧' : '👦'}
                  </div>
                  <span className="absolute -top-1 -right-1 text-xs">🥈</span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-black truncate max-w-[80px] sm:max-w-[100px] text-slate-200">
                  {top2.username}
                </span>
                <span className="text-[9.5px] sm:text-[10.5px] font-extrabold text-amber-300">
                  {top2.skor} PTS
                </span>
                {top2.durasi_detik && (
                  <span className="text-[8px] sm:text-[8.5px] text-slate-400">
                    ⏱️ {top2.durasi_detik}s
                  </span>
                )}
                {/* PODIUM BLOCK 2 */}
                <div className="w-full h-11 sm:h-13 bg-gradient-to-t from-slate-700 to-slate-500 rounded-t-xl flex items-center justify-center border-t-2 border-slate-300 shadow">
                  <span className="text-sm sm:text-base font-black text-slate-200 drop-shadow">#2</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-11 sm:h-13 bg-slate-800/40 rounded-t-xl flex items-center justify-center border border-dashed border-slate-700">
                <span className="text-[9px] text-slate-500">Belum Ada</span>
              </div>
            )}
          </div>

          {/* JUARA 1 (GOLD / CHAMPION) */}
          <div className="flex flex-col items-center -translate-y-1">
            {top1 ? (
              <div className="flex flex-col items-center w-full">
                <div className="relative mb-1">
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-base animate-bounce">👑</span>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 font-black text-sm flex items-center justify-center border-2 border-white shadow-lg ring-2 ring-amber-400">
                    {userGenderMap[top1.username?.toLowerCase()] === 'female' ? '👧' : '👦'}
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-xs sm:text-sm">🥇</span>
                </div>
                <span className="text-[10.5px] sm:text-xs font-black truncate max-w-[90px] sm:max-w-[120px] text-yellow-300">
                  {top1.username}
                </span>
                <span className="text-[10.5px] sm:text-xs font-black text-amber-400">
                  {top1.skor} PTS
                </span>
                {top1.durasi_detik && (
                  <span className="text-[8px] sm:text-[9px] text-amber-200/80">
                    ⏱️ {top1.durasi_detik}s
                  </span>
                )}
                {/* PODIUM BLOCK 1 */}
                <div className="w-full h-16 sm:h-19 bg-gradient-to-t from-amber-600 via-yellow-500 to-amber-300 rounded-t-xl flex flex-col items-center justify-center border-t-2 border-yellow-100 shadow-xl">
                  <span className="text-base sm:text-xl font-black text-amber-950 drop-shadow">#1</span>
                  <span className="text-[7.5px] sm:text-[8.5px] font-extrabold uppercase text-amber-900 tracking-wider">CHAMPION</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-16 sm:h-19 bg-slate-800/40 rounded-t-xl flex items-center justify-center border border-dashed border-slate-700">
                <span className="text-[9px] text-slate-500">Belum Ada</span>
              </div>
            )}
          </div>

          {/* JUARA 3 (BRONZE) */}
          <div className="flex flex-col items-center">
            {top3 ? (
              <div className="flex flex-col items-center w-full">
                <div className="relative mb-1">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-amber-800 text-amber-100 font-black text-xs flex items-center justify-center border-2 border-amber-600 shadow-md">
                    {userGenderMap[top3.username?.toLowerCase()] === 'female' ? '👧' : '👦'}
                  </div>
                  <span className="absolute -top-1 -right-1 text-xs">🥉</span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-black truncate max-w-[80px] sm:max-w-[100px] text-slate-200">
                  {top3.username}
                </span>
                <span className="text-[9.5px] sm:text-[10.5px] font-extrabold text-amber-300">
                  {top3.skor} PTS
                </span>
                {top3.durasi_detik && (
                  <span className="text-[8px] sm:text-[8.5px] text-slate-400">
                    ⏱️ {top3.durasi_detik}s
                  </span>
                )}
                {/* PODIUM BLOCK 3 */}
                <div className="w-full h-9 sm:h-11 bg-gradient-to-t from-amber-900 to-amber-700 rounded-t-xl flex items-center justify-center border-t-2 border-amber-500 shadow">
                  <span className="text-sm sm:text-base font-black text-amber-200 drop-shadow">#3</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-9 sm:h-11 bg-slate-800/40 rounded-t-xl flex items-center justify-center border border-dashed border-slate-700">
                <span className="text-[9px] text-slate-500">Belum Ada</span>
              </div>
            )}
          </div>

        </div>

        {/* =====================================================================
            BANNER POSISI KAMU SAAT INI
           ===================================================================== */}
        <div className="w-full bg-gradient-to-r from-emerald-900/60 via-teal-800/60 to-emerald-900/60 border border-emerald-400/50 rounded-xl p-2 px-3 my-1 flex items-center justify-between shadow-md flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow">
              #{currentUserRank}
            </div>
            <div className="text-left">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-emerald-300 block leading-tight">
                Posisi Balapan Kamu:
              </span>
              <span className="text-xs sm:text-sm font-black text-white">
                {currentUsername} {currentUserRank === 1 ? '👑 Memimpin Klasemen!' : `(Peringkat #${currentUserRank})`}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-emerald-300 text-[10px] sm:text-xs font-bold block">
              Skor Terverifikasi:
            </span>
            <span className="text-amber-300 font-black text-sm sm:text-base">
              {tab === 'mission' ? `${currentScore} PTS` : `${leaderboardData[currentUserIndex]?.skor || currentScore} PTS`}
            </span>
          </div>
        </div>

        {/* =====================================================================
            DAFTAR PERINGKAT SEMUA SISWA (SCROLLABLE TABLE)
           ===================================================================== */}
        <div className="flex-1 min-h-0 bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden flex flex-col my-1">
          <div className="bg-slate-800/90 px-3 py-1 text-[9px] sm:text-[10px] font-bold text-slate-400 flex items-center justify-between border-b border-slate-700">
            <span className="w-10">RANK</span>
            <span className="flex-1 text-left px-2">NAMA SISWA</span>
            <span className="w-20 text-center">WAKTU</span>
            <span className="w-20 text-right">SKOR</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-800/60">
            {loading ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                Memuat data balapan skor...
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                Belum ada data skor siswa untuk misi ini.
              </div>
            ) : (
              leaderboardData.map((item, index) => {
                const isMe = item.username?.toLowerCase() === currentUsername.toLowerCase()
                const rankNum = index + 1
                return (
                  <div
                    key={index}
                    className={`px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                      isMe
                        ? 'bg-amber-500/20 text-amber-200 font-bold border-l-4 border-amber-400'
                        : 'text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="w-10 font-black flex items-center gap-1">
                      {rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : rankNum === 3 ? '🥉' : `#${rankNum}`}
                    </span>
                    <span className="flex-1 text-left px-2 truncate font-semibold flex items-center gap-1.5">
                      <span>{userGenderMap[item.username?.toLowerCase()] === 'female' ? '👧' : '👦'}</span>
                      <span className="truncate">{item.username}</span>
                      {isMe && (
                        <span className="text-[8px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase">
                          Kamu
                        </span>
                      )}
                    </span>
                    <span className="w-20 text-center text-[10px] text-slate-400">
                      {item.durasi_detik ? `${item.durasi_detik}s` : '-'}
                    </span>
                    <span className="w-20 text-right font-black text-amber-300">
                      {item.skor} PTS
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* =====================================================================
            FOOTER TOMBOL NAVIGASI: KEMBALI KE MENU / LANJUT KE GAME BERIKUTNYA
           ===================================================================== */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800 flex-shrink-0">
          <button
            onClick={() => {
              playSound('click')
              onBackToMenu && onBackToMenu()
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white font-extrabold text-[11px] sm:text-xs transition-all cursor-pointer flex items-center gap-1.5 border border-slate-700"
          >
            <span>🏠</span>
            <span>Menu Misi</span>
          </button>

          <button
            onClick={() => {
              playSound('click')
              onNext && onNext()
            }}
            className="flex-1 py-2 sm:py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-300 animate-pulse"
          >
            {nextMissionKey ? (
              <>
                <span>🚀 Lanjut ke Game Selanjutnya: {nextMissionTitle || `Misi ${nextMissionKey}`}</span>
                <span className="text-base font-black">➔</span>
              </>
            ) : (
              <>
                <span>🎉 Selesai Semua Misi Hari 1 &amp; Cek Prestasi!</span>
                <span className="text-base font-black">➔</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
