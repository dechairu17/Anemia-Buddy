import { useState } from 'react'
import Login from './components/auth/Login'
import Home from './components/home/Home'
import MateriSection from './components/materi/MateriSection'
import Kuis from './components/kuis/Kuis'
import PreTest from './components/kuis/PreTest'
import PostTest from './components/kuis/PostTest'
import AdminDashboard from './components/admin/AdminDashboard'

// 1. IMPORT KOMPONEN GAME
import GameHome from './components/game/GameHome'
import MisiHarian from './components/game/MisiHarian'
import Day1LevelA from './components/game/Day1LevelA' // Komponen Game Day 1 Level A
import Day1LevelB from './components/game/Day1LevelB' // Komponen Game Day 1 Level B
import Day1LevelC from './components/game/Day1LevelC' // Komponen Game Day 1 Level C / Game 3
import Day1LevelD from './components/game/Day1LevelD' // Komponen Game Day 1 Level D / Game 4 (Evaluasi Sikap)
import Day1LevelE from './components/game/Day1LevelE' // Komponen Game Day 1 Level E (Misi E Mandiri)

function App() {
  const [currentPage, setCurrentPage] = useState('login')
  const [userRole, setUserRole] = useState('siswa')
  const [selectedQuizCategory, setSelectedQuizCategory] = useState('')
  
  // State untuk menyimpan level game & misi terpilih
  const [selectedGameLevel, setSelectedGameLevel] = useState(null)
  const [selectedMisiData, setSelectedMisiData] = useState(null)

  return (
    <div className="w-dvw h-dvh overflow-hidden">
      {currentPage === 'login' && (
        <Login 
          onLogin={(userData) => {
            setUserRole(userData.role)
            if (userData.role === 'admin') {
              setCurrentPage('adminDashboard')
            } else {
              setCurrentPage('home')
            }
          }} 
        />
      )}

      {/* DASHBOARD KHUSUS ADMIN */}
      {currentPage === 'adminDashboard' && (
        <AdminDashboard onLogout={() => setCurrentPage('login')} />
      )}

      {/* TAMPILAN SISWA UTAMA */}
      {currentPage === 'home' && (
        <Home 
          onNavigate={(page) => setCurrentPage(page)} 
          onLogout={() => setCurrentPage('login')} 
        />
      )}

      {/* MODUL MATERI */}
      {currentPage === 'materi' && (
        <MateriSection 
          onBack={() => setCurrentPage('home')}
        />
      )}

      {/* MODUL KUIS (PILIH HARI & SESI) */}
      {currentPage === 'kuis' && (
        <Kuis 
          onBack={() => setCurrentPage('home')}
          onStartQuiz={(categoryKey) => {
            setSelectedQuizCategory(categoryKey)
            if (categoryKey.includes('posttest')) {
              setCurrentPage('posttest')
            } else {
              setCurrentPage('pretest')
            }
          }}
        />
      )}

      {/* MODUL PRE-TEST */}
      {currentPage === 'pretest' && (
        <PreTest 
          category={selectedQuizCategory}
          onBack={() => setCurrentPage('kuis')} 
        />
      )}

      {/* MODUL POST-TEST */}
      {currentPage === 'posttest' && (
        <PostTest 
          category={selectedQuizCategory}
          onBack={() => setCurrentPage('kuis')} 
        />
      )}

      {/* =========================================================================
          2. MODUL GAME HOME
         ========================================================================= */}
      {currentPage === 'game' && (
        <GameHome 
          onBack={() => setCurrentPage('home')}
          onSelectLevel={(levelNum) => {
            setSelectedGameLevel(levelNum)
            setCurrentPage(`game_level_${levelNum}`)
          }}
        />
      )}

      {/* =========================================================================
          3. MODUL MISI HARIAN LEVEL 1 (HARI 1)
         ========================================================================= */}
      {currentPage === 'game_level_1' && (
        <MisiHarian 
          level={1}
          onBack={() => setCurrentPage('game')}
          onSelectMisi={(misiData) => {
            setSelectedMisiData(misiData)
            console.log('Misi terpilih Level 1:', misiData)
            if (misiData.misiKey === 'A') {
              setCurrentPage('day1_level_a')
            } else if (misiData.misiKey === 'B') {
              setCurrentPage('day1_level_b')
            } else if (misiData.misiKey === 'C') {
              // Level C adalah GAME 3 (Misi Sehat: Melawan Anemia)
              setCurrentPage('day1_level_c')
            } else if (misiData.misiKey === 'D') {
              // Level D adalah GAME 4 (Misi D)
              setCurrentPage('day1_level_d')
            } else if (misiData.misiKey === 'E') {
              // Level E adalah GAME 4 (Misi E: Dokter Sel Darah)
              setCurrentPage('day1_level_e')
            }
          }}
        />
      )}

      {/* MODUL GAMEPLAY DAY 1 LEVEL A */}
      {currentPage === 'day1_level_a' && (
        <Day1LevelA 
          onBack={() => setCurrentPage('game_level_1')}
          onComplete={(result) => {
            console.log('Day 1 Level A Selesai:', result)
            if (result?.nextMission) {
              setCurrentPage(`day1_level_${result.nextMission.toLowerCase()}`)
            } else {
              setCurrentPage('game_level_1')
            }
          }}
        />
      )}

      {/* MODUL GAMEPLAY DAY 1 LEVEL B (EVALUASI SIKAP) */}
      {currentPage === 'day1_level_b' && (
        <Day1LevelB 
          misiId="misi_h1_b"
          onBack={() => setCurrentPage('game_level_1')}
          onComplete={(result) => {
            console.log('Day 1 Level B Selesai:', result)
            if (result?.nextMission) {
              setCurrentPage(`day1_level_${result.nextMission.toLowerCase()}`)
            } else {
              setCurrentPage('game_level_1')
            }
          }}
        />
      )}

      {/* MODUL GAMEPLAY DAY 1 LEVEL C / GAME 3 (MISI SEHAT: MELAWAN ANEMIA) */}
      {(currentPage === 'day1_level_c' || currentPage === 'game_3') && (
        <Day1LevelC 
          onBack={() => setCurrentPage('game_level_1')}
          onComplete={(result) => {
            console.log('Game 3 (Day 1 Level C) Selesai:', result)
            if (result?.nextMission) {
              setCurrentPage(`day1_level_${result.nextMission.toLowerCase()}`)
            } else {
              setCurrentPage('game_level_1')
            }
          }}
        />
      )}

      {/* MODUL GAMEPLAY DAY 1 LEVEL D / GAME 4 (DETEKTIF GEJALA ANEMIA) */}
      {(currentPage === 'day1_level_d' || currentPage === 'game_4') && (
        <Day1LevelD 
          misiId="misi_h1_d"
          onBack={() => setCurrentPage('game_level_1')}
          onComplete={(result) => {
            console.log('Game 4 (Day 1 Level D) Selesai:', result)
            if (result?.nextMission) {
              setCurrentPage(`day1_level_${result.nextMission.toLowerCase()}`)
            } else {
              setCurrentPage('game_level_1')
            }
          }}
        />
      )}

      {/* MODUL GAMEPLAY DAY 1 LEVEL E / GAME 5 (MISI LEVEL E MANDIRI) */}
      {currentPage === 'day1_level_e' && (
        <Day1LevelE 
          misiId="misi_h1_e"
          onBack={() => setCurrentPage('game_level_1')}
          onComplete={(result) => {
            console.log('Game 5 (Day 1 Level E) Selesai:', result)
            if (result?.nextMission) {
              setCurrentPage(`day1_level_${result.nextMission.toLowerCase()}`)
            } else {
              setCurrentPage('game_level_1')
            }
          }}
        />
      )}

      {/* =========================================================================
          4. MODUL MISI HARIAN LEVEL 2 (HARI 2)
         ========================================================================= */}
      {currentPage === 'game_level_2' && (
        <MisiHarian 
          level={2}
          onBack={() => setCurrentPage('game')}
          onSelectMisi={(misiData) => {
            setSelectedMisiData(misiData)
            console.log('Misi terpilih Level 2:', misiData)
            // Lanjut ke gameplay spesifik Misi A/B/C/D/E jika komponen gameplay sudah siap:
            // setCurrentPage(`play_misi_${misiData.misiKey.toLowerCase()}`)
          }}
        />
      )}

    </div>
  )
}

export default App