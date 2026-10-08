import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

import bgKuisSvg from '../../assets/5/5. kuis - background.png'
import imgTitleKuis from '../../assets/5/5. kuis - logo kuis.png'

function Kuis({ onBack, onStartQuiz }) {
  // Navigation State: 'main' | 'h1' | 'h2' | 'h1_pre' | 'h1_post' | 'h2_pre' | 'h2_post'
  const [menuStep, setMenuStep] = useState('main')
  
  // App Lock Status dari Admin Database
  const [locks, setLocks] = useState({
    h1_pretest: true,
    h1_posttest: false,
    h2_pretest: false,
    h2_posttest: false
  })

  // User Completion History dari Supabase
  const [completedQuizzes, setCompletedQuizzes] = useState([])
  const [alertMessage, setAlertMessage] = useState('')

  const username = localStorage.getItem('anemia_username') || 'Siswa'

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      // 1. Ambil Sakelar Penguncian dari app_settings
      const { data: config } = await supabase.from('app_settings').select('key, value')
      if (config) {
        const lockObj = {}
        config.forEach(item => {
          if (item.key.endsWith('_enabled')) {
            const cleanKey = item.key.replace('_enabled', '')
            lockObj[cleanKey] = item.value === true || item.value === 'true'
          }
        })
        setLocks(prev => ({ ...prev, ...lockObj }))
      }

      // 2. Ambil Riwayat Kuis Siswa dari quiz_results
      const { data: userResults } = await supabase
        .from('quiz_results')
        .select('category')
        .eq('username', username)

      if (userResults) {
        setCompletedQuizzes(userResults.map(r => r.category))
      }
    } catch (err) {
      console.error('Error fetching quiz status:', err.message)
    }
  }

  const isCompleted = (categoryKey) => completedQuizzes.includes(categoryKey)

  // KONVERSI MAPPING DARI NAVIGASI MENU KE CATEGORY DATABASE SUPABASE
  const handleSelectSubCategory = (subType) => {
    // Membentuk string kategori yang cocok persis dengan database (misal: h1_pretest_pengetahuan)
    const categoryMapping = {
      'h1_pre_pengetahuan': 'h1_pretest_pengetahuan',
      'h1_pre_sikap': 'h1_pretest_sikap',
      'h1_post_pengetahuan': 'h1_posttest_pengetahuan',
      'h1_post_sikap': 'h1_posttest_sikap',
      'h2_pre_pengetahuan': 'h2_pretest_pengetahuan',
      'h2_pre_sikap': 'h2_pretest_sikap',
      'h2_post_pengetahuan': 'h2_posttest_pengetahuan',
      'h2_post_sikap': 'h2_posttest_sikap',
    }

    const currentKey = `${menuStep}_${subType}`
    const dbCategory = categoryMapping[currentKey] || currentKey

    if (isCompleted(dbCategory)) {
      setAlertMessage('Kamu sudah pernah menyelesaikan kuis bagian ini!')
      return
    }

    onStartQuiz && onStartQuiz(dbCategory)
  }

  // Helper untuk mengecek status selesai pada tombol UI
  const checkSubCompleted = (subType) => {
    const currentKey = `${menuStep}_${subType}`
    const dbCategory = currentKey
      .replace('h1_pre_', 'h1_pretest_')
      .replace('h1_post_', 'h1_posttest_')
      .replace('h2_pre_', 'h2_pretest_')
      .replace('h2_post_', 'h2_posttest_')
    return isCompleted(dbCategory)
  }

  return (
    <div 
      className="h-dvh w-dvw bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center font-sans relative overflow-hidden select-none touch-none"
      style={{ backgroundImage: `url("${bgKuisSvg}")` }}
    >
      {/* TOMBOL KEMBALI */}
      <button 
        onClick={() => {
          setAlertMessage('')
          if (menuStep === 'main') onBack()
          else if (['h1', 'h2'].includes(menuStep)) setMenuStep('main')
          else if (menuStep.startsWith('h1_')) setMenuStep('h1')
          else if (menuStep.startsWith('h2_')) setMenuStep('h2')
        }}
        className="absolute top-3 left-4 sm:top-5 sm:left-6 z-30 text-slate-700 hover:text-black p-1 cursor-pointer"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      <div className="flex flex-col items-center justify-center z-10 w-full max-w-[280px] sm:max-w-[340px] px-4">
        {/* LOGO TITLE KUIS */}
        <div className="mb-4 sm:mb-5 flex justify-center items-center w-full">
          <img src={imgTitleKuis} alt="KuiS Title" className="w-44 sm:w-52 pointer-events-none" />
        </div>

        {alertMessage && (
          <div className="w-full bg-amber-100 border border-amber-400 text-amber-800 text-[11px] p-2 rounded-xl mb-3 text-center font-bold">
            {alertMessage}
          </div>
        )}

        {/* ---------------- LEVEL 1: PILIH HARI (H1 / H2) ---------------- */}
        {menuStep === 'main' && (
          <div className="w-full flex flex-col gap-3 sm:gap-3.5">
            <button 
              onClick={() => { setAlertMessage(''); setMenuStep('h1') }}
              className="w-full font-extrabold py-2.5 sm:py-3 px-4 rounded-2xl bg-[#609AB8] hover:bg-[#4d83a0] text-white text-xs sm:text-sm tracking-widest cursor-pointer border border-white/20 shadow-md transition-all active:scale-95"
            >
              KUIS HARI 1
            </button>
            <button 
              onClick={() => {
                if (!locks.h2_pretest && !locks.h2_posttest) {
                  setAlertMessage('Kuis Hari 2 belum dibuka oleh Admin.')
                  return
                }
                setAlertMessage('')
                setMenuStep('h2')
              }}
              className={`w-full font-extrabold py-2.5 sm:py-3 px-4 rounded-2xl text-xs sm:text-sm tracking-widest cursor-pointer border shadow-md flex items-center justify-between transition-all active:scale-95 ${
                !locks.h2_pretest && !locks.h2_posttest
                  ? 'bg-slate-400 text-slate-100 border-slate-300'
                  : 'bg-[#609AB8] hover:bg-[#4d83a0] text-white border-white/20'
              }`}
            >
              <span className="flex-1 text-center pl-6">KUIS HARI 2</span>
              {(!locks.h2_pretest && !locks.h2_posttest) && (
                <span className="text-[10px] bg-amber-600 text-white px-2.5 py-0.5 rounded-full font-bold flex-shrink-0">Terkunci</span>
              )}
            </button>
          </div>
        )}

        {/* ---------------- LEVEL 2: PILIH PRE / POST (HARI 1) ---------------- */}
        {menuStep === 'h1' && (
          <div className="w-full flex flex-col gap-3 items-center">
            <div className="bg-[#003049]/10 border border-[#003049]/20 px-3.5 py-1 rounded-full mb-1">
              <h2 className="text-[#003049] text-[11px] sm:text-xs font-black uppercase tracking-widest text-center">
                PILIH SESI HARI 1
              </h2>
            </div>

            <button 
              onClick={() => {
                if (!locks.h1_pretest) { setAlertMessage('Pre-Test H1 belum dibuka oleh Admin'); return }
                setAlertMessage(''); setMenuStep('h1_pre')
              }}
              className={`w-full font-extrabold py-2.5 sm:py-3 px-4 rounded-2xl text-xs sm:text-sm tracking-widest cursor-pointer border shadow-md flex justify-between items-center transition-all active:scale-95 ${
                !locks.h1_pretest ? 'bg-slate-400 text-slate-100 border-slate-300' : 'bg-[#609AB8] hover:bg-[#4d83a0] text-white border-white/20'
              }`}
            >
              <span>PRE-UJI</span>
              {!locks.h1_pretest && <span className="text-[10px] bg-amber-600 text-white px-2.5 py-0.5 rounded-full font-bold">Terkunci</span>}
            </button>

            <button 
              onClick={() => {
                if (!locks.h1_posttest) { setAlertMessage('Post-Test H1 belum dibuka oleh Admin'); return }
                setAlertMessage(''); setMenuStep('h1_post')
              }}
              className={`w-full font-extrabold py-2.5 sm:py-3 px-4 rounded-2xl text-xs sm:text-sm tracking-widest cursor-pointer border shadow-md flex justify-between items-center transition-all active:scale-95 ${
                !locks.h1_posttest ? 'bg-slate-400 text-slate-100 border-slate-300' : 'bg-[#609AB8] hover:bg-[#4d83a0] text-white border-white/20'
              }`}
            >
              <span>POST-TEST</span>
              {!locks.h1_posttest && <span className="text-[10px] bg-amber-600 text-white px-2.5 py-0.5 rounded-full font-bold">Terkunci</span>}
            </button>
          </div>
        )}

        {/* ---------------- LEVEL 2: PILIH PRE / POST (HARI 2) ---------------- */}
        {menuStep === 'h2' && (
          <div className="w-full flex flex-col gap-3 items-center">
            <div className="bg-[#003049]/10 border border-[#003049]/20 px-3.5 py-1 rounded-full mb-1">
              <h2 className="text-[#003049] text-[11px] sm:text-xs font-black uppercase tracking-widest text-center">
                PILIH SESI HARI 2
              </h2>
            </div>

            <button 
              onClick={() => {
                if (!locks.h2_pretest) { setAlertMessage('Pre-Test H2 belum dibuka oleh Admin'); return }
                setAlertMessage(''); setMenuStep('h2_pre')
              }}
              className={`w-full font-extrabold py-2.5 sm:py-3 px-4 rounded-2xl text-xs sm:text-sm tracking-widest cursor-pointer border shadow-md flex justify-between items-center transition-all active:scale-95 ${
                !locks.h2_pretest ? 'bg-slate-400 text-slate-100 border-slate-300' : 'bg-[#609AB8] hover:bg-[#4d83a0] text-white border-white/20'
              }`}
            >
              <span>PRE-UJI</span>
              {!locks.h2_pretest && <span className="text-[10px] bg-amber-600 text-white px-2.5 py-0.5 rounded-full font-bold">Terkunci</span>}
            </button>

            <button 
              onClick={() => {
                if (!locks.h2_posttest) { setAlertMessage('Post-Test H2 belum dibuka oleh Admin'); return }
                setAlertMessage(''); setMenuStep('h2_post')
              }}
              className={`w-full font-extrabold py-2.5 sm:py-3 px-4 rounded-2xl text-xs sm:text-sm tracking-widest cursor-pointer border shadow-md flex justify-between items-center transition-all active:scale-95 ${
                !locks.h2_posttest ? 'bg-slate-400 text-slate-100 border-slate-300' : 'bg-[#609AB8] hover:bg-[#4d83a0] text-white border-white/20'
              }`}
            >
              <span>POST-TEST</span>
              {!locks.h2_posttest && <span className="text-[10px] bg-amber-600 text-white px-2.5 py-0.5 rounded-full font-bold">Terkunci</span>}
            </button>
          </div>
        )}

        {/* ---------------- LEVEL 3: PILIH PENGETAHUAN / SIKAP ---------------- */}
        {['h1_pre', 'h1_post', 'h2_pre', 'h2_post'].includes(menuStep) && (
          <div className="w-full flex flex-col gap-3 items-center">
            <div className="bg-[#003049]/10 border border-[#003049]/20 px-3.5 py-1 rounded-full mb-1">
              <h2 className="text-[#003049] text-[11px] sm:text-xs font-black uppercase tracking-widest text-center">
                {menuStep.replace('_', ' ').toUpperCase()} - SUB KUIS
              </h2>
            </div>
            
            {/* OPSI PENGETAHUAN */}
            <button 
              onClick={() => handleSelectSubCategory('pengetahuan')}
              className={`w-full font-extrabold py-2.5 sm:py-3 px-4 rounded-2xl text-xs sm:text-sm tracking-widest cursor-pointer border shadow-md flex justify-between items-center transition-all active:scale-95 ${
                checkSubCompleted('pengetahuan')
                  ? 'bg-slate-400 text-slate-100 border-slate-300' 
                  : 'bg-[#007A5E] hover:bg-[#00634c] text-white border-white/20'
              }`}
            >
              <span>PENGETAHUAN</span>
              {checkSubCompleted('pengetahuan') && (
                <span className="text-[10px] bg-slate-600 text-white px-2.5 py-0.5 rounded-full font-bold">Selesai</span>
              )}
            </button>

            {/* OPSI SIKAP */}
            <button 
              onClick={() => handleSelectSubCategory('sikap')}
              className={`w-full font-extrabold py-2.5 sm:py-3 px-4 rounded-2xl text-xs sm:text-sm tracking-widest cursor-pointer border shadow-md flex justify-between items-center transition-all active:scale-95 ${
                checkSubCompleted('sikap')
                  ? 'bg-slate-400 text-slate-100 border-slate-300' 
                  : 'bg-[#C04A00] hover:bg-[#a33e00] text-white border-white/20'
              }`}
            >
              <span>SIKAP</span>
              {checkSubCompleted('sikap') && (
                <span className="text-[10px] bg-slate-600 text-white px-2.5 py-0.5 rounded-full font-bold">Selesai</span>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default Kuis