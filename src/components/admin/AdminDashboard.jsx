import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('locks') // 'locks' | 'rekap_kuis' | 'rekap_game'
  const [locks, setLocks] = useState({
    h1_pretest_enabled: true,
    h1_posttest_enabled: false,
    h2_pretest_enabled: false,
    h2_posttest_enabled: false,
    h2_game_enabled: false // Sakelar Game Level 2
  })
  
  const [quizResults, setQuizResults] = useState([])
  const [gameScores, setGameScores] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter Kuis
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // 1. Fetch Status Lock
      const { data: config } = await supabase.from('app_settings').select('*')
      if (config) {
        const lockState = {}
        config.forEach(item => {
          if (item.key.endsWith('_enabled')) {
            lockState[item.key] = item.value === true || item.value === 'true'
          }
        })
        setLocks(prev => ({ ...prev, ...lockState }))
      }

      // 2. Fetch Hasil Kuis (quiz_results)
      const { data: quizData } = await supabase
        .from('quiz_results')
        .select('*')
        .order('created_at', { ascending: false })
      if (quizData) setQuizResults(quizData)

      // 3. Fetch Skor Game (game_scores)
      const { data: gameData } = await supabase
        .from('game_scores')
        .select('*')
        .order('created_at', { ascending: false })
      if (gameData) setGameScores(gameData)

    } catch (err) {
      console.error('Error fetching admin data:', err.message)
    } finally {
      setLoading(false)
    }
  }

  // TOGGLE SAKELAR (KUIS & GAME)
  const toggleLock = async (key) => {
    const newValue = !locks[key]
    setLocks(prev => ({ ...prev, [key]: newValue }))

    try {
      await supabase
        .from('app_settings')
        .upsert({ key: key, value: JSON.stringify(newValue) })
    } catch (err) {
      console.error(`Gagal mengubah status ${key}:`, err.message)
    }
  }

  // EXPORT CSV KUIS
  const exportQuizCSV = () => {
    if (quizResults.length === 0) return alert('Data kuis kosong')
    const headers = ['Nama Siswa', 'Kategori Kuis', 'Skor', 'Waktu Pengerjaan']
    const rows = quizResults.map(r => [
      `"${r.username}"`,
      `"${r.category.toUpperCase()}"`,
      r.score,
      `"${new Date(r.created_at).toLocaleString('id-ID')}"`
    ])
    downloadCSV('rekap_hasil_kuis.csv', [headers.join(','), ...rows.map(e => e.join(','))].join('\n'))
  }

  // EXPORT CSV GAME
  const exportGameCSV = () => {
    if (gameScores.length === 0) return alert('Data game kosong')
    const headers = ['Nama Siswa', 'Kategori / Level Game', 'Skor Game', 'Durasi (Detik)', 'Waktu Pengerjaan']
    const rows = gameScores.map(g => [
      `"${g.username}"`,
      `"${g.kategori_game.toUpperCase()}"`,
      g.skor,
      g.durasi_detik || 0,
      `"${new Date(g.created_at).toLocaleString('id-ID')}"`
    ])
    downloadCSV('rekap_skor_game.csv', [headers.join(','), ...rows.map(e => e.join(','))].join('\n'))
  }

  const downloadCSV = (filename, csvContent) => {
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
  }

  const filteredQuiz = selectedCategory === 'all' 
    ? quizResults 
    : quizResults.filter(r => r.category.includes(selectedCategory))

  return (
    <div className="min-h-dvh w-dvw bg-slate-900 text-white p-4 sm:p-6 font-sans overflow-y-auto">
      
      {/* HEADER UTAMA */}
      <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-6 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-amber-400">PANEL CONTROL ADMIN</h1>
          <p className="text-xs text-slate-400">Pengaturan Akses Kuis/Game & Rekap Data Penelitian</p>
        </div>
        <button
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
        >
          LOGOUT
        </button>
      </div>

      {/* NAVIGASI TAB ADMIN */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 print:hidden">
        <button 
          onClick={() => setActiveTab('locks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
            activeTab === 'locks' ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          🔒 AKSES KUIS & GAME
        </button>
        <button 
          onClick={() => setActiveTab('rekap_kuis')}
          className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
            activeTab === 'rekap_kuis' ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          📊 REKAP HASIL KUIS
        </button>
        <button 
          onClick={() => setActiveTab('rekap_game')}
          className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
            activeTab === 'rekap_game' ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          🎮 REKAP SKOR GAME
        </button>
      </div>

      {/* ================= TAB 1: SAKELAR LOCK / UNLOCK ================= */}
      {activeTab === 'locks' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* SAKELAR HARI 1 */}
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl">
            <h2 className="font-extrabold text-base text-sky-400 mb-4 pb-2 border-b border-slate-700">
              KUIS HARI 1 (H1)
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold">Pre-Test Hari 1</h3>
                  <p className="text-[10px] text-slate-400">
                    Status: <span className={locks.h1_pretest_enabled ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {locks.h1_pretest_enabled ? 'DIBUKA' : 'TERKUNCI'}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => toggleLock('h1_pretest_enabled')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
                    locks.h1_pretest_enabled ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {locks.h1_pretest_enabled ? 'KUNCI' : 'BUKA'}
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold">Post-Test Hari 1</h3>
                  <p className="text-[10px] text-slate-400">
                    Status: <span className={locks.h1_posttest_enabled ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {locks.h1_posttest_enabled ? 'DIBUKA' : 'TERKUNCI'}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => toggleLock('h1_posttest_enabled')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
                    locks.h1_posttest_enabled ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {locks.h1_posttest_enabled ? 'KUNCI' : 'BUKA'}
                </button>
              </div>
            </div>
          </div>

          {/* SAKELAR HARI 2 */}
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl">
            <h2 className="font-extrabold text-base text-emerald-400 mb-4 pb-2 border-b border-slate-700">
              KUIS HARI 2 (H2)
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold">Pre-Test Hari 2</h3>
                  <p className="text-[10px] text-slate-400">
                    Status: <span className={locks.h2_pretest_enabled ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {locks.h2_pretest_enabled ? 'DIBUKA' : 'TERKUNCI'}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => toggleLock('h2_pretest_enabled')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
                    locks.h2_pretest_enabled ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {locks.h2_pretest_enabled ? 'KUNCI' : 'BUKA'}
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold">Post-Test Hari 2</h3>
                  <p className="text-[10px] text-slate-400">
                    Status: <span className={locks.h2_posttest_enabled ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {locks.h2_posttest_enabled ? 'DIBUKA' : 'TERKUNCI'}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => toggleLock('h2_posttest_enabled')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
                    locks.h2_posttest_enabled ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {locks.h2_posttest_enabled ? 'KUNCI' : 'BUKA'}
                </button>
              </div>
            </div>
          </div>

          {/* SAKELAR GAME LEVEL 2 */}
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl">
            <h2 className="font-extrabold text-base text-amber-400 mb-4 pb-2 border-b border-slate-700">
              GAME LEVEL
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold">Game Level 2 (H2)</h3>
                  <p className="text-[10px] text-slate-400">
                    Status: <span className={locks.h2_game_enabled ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {locks.h2_game_enabled ? 'DIBUKA' : 'TERKUNCI'}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => toggleLock('h2_game_enabled')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
                    locks.h2_game_enabled ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {locks.h2_game_enabled ? 'KUNCI' : 'BUKA'}
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB 2: REKAP KUIS ================= */}
      {activeTab === 'rekap_kuis' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-300">Filter:</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-700 text-xs px-3 py-1.5 rounded-lg border border-slate-600 font-semibold"
              >
                <option value="all">Semua Kuis</option>
                <option value="h1_pretest">H1 Pre-Test</option>
                <option value="h1_posttest">H1 Post-Test</option>
                <option value="h2_pretest">H2 Pre-Test</option>
                <option value="h2_posttest">H2 Post-Test</option>
              </select>
            </div>

            <button
              onClick={exportQuizCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-lg shadow-md cursor-pointer"
            >
              📥 Export Excel/CSV Kuis
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-700 uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">No</th>
                  <th className="p-2.5">Nama Siswa</th>
                  <th className="p-2.5">Kategori Sub-Kuis</th>
                  <th className="p-2.5">Nilai</th>
                  <th className="p-2.5">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredQuiz.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="p-2.5">{idx + 1}</td>
                    <td className="p-2.5 font-bold text-white">{item.username}</td>
                    <td className="p-2.5 uppercase font-semibold text-amber-400">{item.category}</td>
                    <td className="p-2.5 font-black text-emerald-400">{item.score}</td>
                    <td className="p-2.5 text-slate-400">{new Date(item.created_at).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: REKAP SKOR GAME ================= */}
      {activeTab === 'rekap_game' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-extrabold text-sm text-amber-400">
              Rekap Data Skor Game ({gameScores.length} Record)
            </h2>
            <button
              onClick={exportGameCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-lg shadow-md cursor-pointer"
            >
              📥 Export Excel/CSV Game
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-700 uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">No</th>
                  <th className="p-2.5">Nama Siswa</th>
                  <th className="p-2.5">Kategori / Level Game</th>
                  <th className="p-2.5">Skor</th>
                  <th className="p-2.5">Durasi (Detik)</th>
                  <th className="p-2.5">Waktu Pengerjaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {gameScores.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-slate-400">Belum ada data skor game.</td>
                  </tr>
                ) : (
                  gameScores.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="p-2.5">{idx + 1}</td>
                      <td className="p-2.5 font-bold text-white">{item.username}</td>
                      <td className="p-2.5 uppercase font-semibold text-sky-400">{item.kategori_game}</td>
                      <td className="p-2.5 font-black text-amber-400">{item.skor}</td>
                      <td className="p-2.5 text-slate-300">{item.durasi_detik || 0}s</td>
                      <td className="p-2.5 text-slate-400">{new Date(item.created_at).toLocaleString('id-ID')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}

export default AdminDashboard