import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

import imgTitleKuis from '../../assets/5/5. kuis - logo kuis.png'

export default function QuizRunner({ category = 'h1_pretest_pengetahuan', onBack }) {
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  
  // State Perhitungan Nilai
  const [totalScore, setTotalScore] = useState(0)
  const [userAnswersHistory, setUserAnswersHistory] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [isFinished, setIsFinished] = useState(false)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)

  const username = localStorage.getItem('anemia_username') || 'Siswa'
  const isSikapQuiz = category.includes('sikap')

  useEffect(() => {
    checkAndFetchData()
  }, [category])

  const checkAndFetchData = async () => {
    setLoading(true)
    setCurrentIndex(0)
    setSelectedOption(null)
    setTotalScore(0)
    setUserAnswersHistory([])
    setIsFinished(false)

    try {
      const { data: existingResult, error: checkError } = await supabase
        .from('quiz_results')
        .select('id')
        .eq('username', username)
        .eq('category', category)
        .maybeSingle()

      if (checkError) throw checkError

      if (existingResult) {
        setAlreadyCompleted(true)
        setLoading(false)
        return
      }

      const { data: qData, error: qError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('category', category)
        .order('id', { ascending: true })

      if (qError) throw qError

      if (qData && qData.length > 0) {
        setQuestions(qData)
      } else {
        setQuestions([])
      }
    } catch (err) {
      console.error('Gagal memuat soal:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectOption = (option, optionIndex) => {
    if (selectedOption !== null) return

    setSelectedOption(option)
    const currentQ = questions[currentIndex]
    let earnedPoint = 0

    if (isSikapQuiz) {
      const isFavorable = currentQ.correct_answer === 'favorable'
      earnedPoint = isFavorable ? (5 - optionIndex) : (optionIndex + 1)
    } else {
      earnedPoint = option === currentQ.correct_answer ? 10 : 0
    }

    const newScore = totalScore + earnedPoint
    setTotalScore(newScore)

    const answerDetail = {
      question_id: currentQ.id,
      question: currentQ.question,
      user_answer: option,
      earned_point: earnedPoint
    }
    
    const updatedHistory = [...userAnswersHistory, answerDetail]
    setUserAnswersHistory(updatedHistory)

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1)
        setSelectedOption(null)
      } else {
        let finalCalculatedScore = newScore
        if (isSikapQuiz) {
          const maxPossibleScore = questions.length * 5
          finalCalculatedScore = Math.round((newScore / maxPossibleScore) * 100)
        }
        finishQuiz(finalCalculatedScore, updatedHistory)
      }
    }, 1200)
  }

  const finishQuiz = async (finalScore, finalHistory) => {
    try {
      await supabase.from('quiz_results').insert([
        {
          username: username,
          category: category,
          score: finalScore,
          total_questions: questions.length,
          answers: finalHistory
        }
      ])
    } catch (err) {
      console.error('Gagal menyimpan hasil:', err.message)
    } finally {
      setIsFinished(true)
    }
  }

  if (loading) {
    return (
      <div className="h-dvh w-dvw bg-[#FCF7ED] flex items-center justify-center text-[#003049] font-bold text-xs">
        Memuat Soal Kuis...
      </div>
    )
  }

  if (alreadyCompleted) {
    return (
      <div className="h-dvh w-dvw bg-[#FCF7ED] flex flex-col items-center justify-center font-sans p-4 select-none touch-none">
        <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-xl border border-slate-100 flex flex-col items-center">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-base font-black text-[#003049] mb-1 uppercase">
            Akses Dibatasi
          </h2>
          <p className="text-xs text-slate-600 mb-5 leading-relaxed">
            Kamu sudah pernah menyelesaikan tes <span className="font-bold uppercase">{category.replace(/_/g, ' ')}</span>.
          </p>
          <button
            onClick={onBack}
            className="w-full bg-[#003049] text-white font-extrabold py-2.5 rounded-full shadow-md text-xs cursor-pointer"
          >
            KEMBALI KE MENU KUIS
          </button>
        </div>
      </div>
    )
  }

  if (isFinished) {
    let calculatedFinalScore = totalScore
    if (isSikapQuiz) {
      calculatedFinalScore = Math.round((totalScore / (questions.length * 5)) * 100)
    }

    return (
      <div className="h-dvh w-dvw bg-[#FCF7ED] flex flex-col items-center justify-center font-sans relative overflow-hidden select-none touch-none p-4">
        <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-xs w-full text-center shadow-xl border border-slate-100 flex flex-col items-center">
          <h2 className="text-lg sm:text-xl font-black text-[#003049] mb-4 uppercase tracking-wide">
            Kuis Selesai!
          </h2>

          <div className="bg-[#FCF7ED] border-2 border-[#609AB8] rounded-2xl p-4 w-full mb-5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">
              {isSikapQuiz ? 'Skor Indeks Sikap Kamu' : 'Nilai Akhir Kamu'}
            </span>
            <span className="text-3xl sm:text-4xl font-black text-[#780000]">
              {calculatedFinalScore}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1 font-semibold">
              {isSikapQuiz ? 'Skala Indeks 100' : `Total Soal Dijawab: ${questions.length}`}
            </span>
          </div>

          <button
            onClick={onBack}
            className="w-full bg-[#003049] text-white font-extrabold py-2.5 rounded-full shadow-md text-xs cursor-pointer"
          >
            KEMBALI KE MENU KUIS
          </button>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentIndex]
  const labelsPengetahuan = ['A', 'B', 'C', 'D']
  const progressPercent = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0

  return (
    <div className="h-dvh w-dvw bg-[#FCF7ED] flex flex-col items-center justify-center font-sans relative overflow-hidden select-none touch-none">
      
      {/* TOMBOL KEMBALI */}
      <button 
        onClick={onBack}
        className="absolute top-2 left-3 sm:top-3 sm:left-4 z-30 text-slate-700 hover:text-black transition-opacity cursor-pointer p-1"
      >
        <svg className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {/* CONTAINER UTAMA SOAL & JAWABAN */}
      <div className="w-full max-w-lg sm:max-w-xl flex flex-col items-center px-3 z-10 my-auto">
        
        {/* HEADER LOGO + PROGRESS BAR */}
        <div className="flex flex-col items-center mb-2 flex-shrink-0 w-full">
          <img 
            src={imgTitleKuis} 
            alt="KuiS Title" 
            className="w-16 sm:w-20 object-contain pointer-events-none mb-1"
          />
          
          <div className="bg-[#609AB8] text-white text-[9px] sm:text-[10px] font-black px-3.5 py-0.5 rounded-full uppercase tracking-widest shadow-sm mb-1.5">
            {category.replace(/_/g, ' ')} ({currentIndex + 1}/{questions.length})
          </div>

          <div className="w-full max-w-xs bg-slate-200 h-2 rounded-full overflow-hidden shadow-inner">
            <div 
              className="bg-[#007A5E] h-full transition-all duration-300 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* KOTAK PERTANYAAN */}
        <div className="w-full bg-[#003049] text-white rounded-2xl px-4 py-3 text-center shadow-md mb-3 flex items-center justify-center min-h-[70px]">
          <h2 className="text-[11px] sm:text-xs font-bold leading-relaxed">
            {currentQ?.question}
          </h2>
        </div>

        {/* PILIHAN JAWABAN DENGAN PEMISAHAN STYLE PENGETAHUAN vs SIKAP */}
        <div className="w-full flex flex-col gap-2 max-h-[48vh] overflow-y-auto touch-auto pr-1">
          {currentQ?.options?.map((option, idx) => {
            const isAnswered = selectedOption !== null
            const isUserChoice = selectedOption === option
            const isCorrectOption = option === currentQ.correct_answer

            let buttonStyle = 'bg-[#B00020] hover:bg-[#8B001A] border-transparent text-white'

            if (isAnswered) {
              if (isSikapQuiz) {
                // Tampilan Khusus Kuis Sikap (Bukan Benar/Salah, tapi Penanda Opsi Terpilih)
                if (isUserChoice) {
                  buttonStyle = 'bg-[#003049] border-sky-300 text-white ring-2 ring-sky-400'
                } else {
                  buttonStyle = 'bg-[#B00020]/30 border-transparent text-white/40'
                }
              } else {
                // Tampilan Kuis Pengetahuan (Evaluasi Benar / Salah)
                if (isCorrectOption) {
                  // Opsi Benar $\rightarrow$ Hijau
                  buttonStyle = 'bg-emerald-600 border-emerald-300 text-white scale-[0.99] ring-2 ring-emerald-400'
                } else if (isUserChoice && !isCorrectOption) {
                  // Opsi Salah yang dipilih siswa $\rightarrow$ Merah
                  buttonStyle = 'bg-rose-700 border-rose-300 text-white scale-[0.99] ring-2 ring-rose-400'
                } else {
                  buttonStyle = 'bg-[#B00020]/30 border-transparent text-white/40'
                }
              }
            }

            return (
              <button
                key={`${currentIndex}-${idx}`}
                onClick={() => handleSelectOption(option, idx)}
                disabled={isAnswered}
                className={`w-full text-left px-4 py-2.5 rounded-2xl shadow-sm transition-all active:scale-[0.98] text-[10px] sm:text-[11px] font-bold flex items-center gap-2 border-2 flex-shrink-0 ${buttonStyle}`}
              >
                {!isSikapQuiz && (
                  <span className="flex-shrink-0 text-yellow-300 font-extrabold">
                    {labelsPengetahuan[idx]}.
                  </span>
                )}
                
                <span className="leading-snug flex-1">
                  {option}
                </span>

                {/* INDIKATOR IKON */}
                {isAnswered && (
                  <span className="flex-shrink-0 ml-1">
                    {isSikapQuiz ? (
                      isUserChoice && (
                        <span className="bg-white text-[#003049] rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black">
                          ●
                        </span>
                      )
                    ) : (
                      <>
                        {isCorrectOption && (
                          <span className="bg-white text-emerald-600 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black">
                            ✓
                          </span>
                        )}
                        {isUserChoice && !isCorrectOption && (
                          <span className="bg-white text-rose-600 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black">
                            ✕
                          </span>
                        )}
                      </>
                    )}
                  </span>
                )}
              </button>
            )
          })}
        </div>

      </div>
    </div>
  )
}