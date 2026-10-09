import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

// Import file gambar logo
import logoAnemia from '../../assets/00/00. logo anemia buddy.png'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Fitur Batas Percobaan & Cooldown Bertahap
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [cooldownTime, setCooldownTime] = useState(0)

  // TIMER HITUNG MUNDUR (JALAN BERSAMAMU DENGAN MULUS)
  useEffect(() => {
    if (cooldownTime <= 0) return

    const timer = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setErrorMessage('') // Bersihkan error setelah waktu habis
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldownTime])

  const handleFailedLogin = () => {
    setFailedAttempts((prev) => {
      const nextAttempt = prev + 1
      const nextCooldown = Math.min(30, 5 * nextAttempt)

      setCooldownTime(nextCooldown)
      setErrorMessage(
        nextAttempt >= 3
          ? `Terlalu banyak percobaan gagal! Coba lagi dalam ${nextCooldown} detik.`
          : 'Username atau kata sandi salah.'
      )

      return nextAttempt
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    if (cooldownTime > 0) return

    const cleanUsername = username.trim()
    const cleanPassword = password.trim()

    if (!cleanUsername || !cleanPassword) {
      setErrorMessage('Nama pengguna dan kata sandi tidak boleh kosong!')
      return
    }

    setLoading(true)
    setErrorMessage('')

    try {
      // 1. Cari user yang cocok di database
      const { data: existingUser, error: fetchError } = await supabase
        .from('game_users')
        .select('*')
        .eq('username', cleanUsername)
        .maybeSingle()

      if (fetchError) throw fetchError

      // 2. Jika username tidak ada atau password salah, catat gagal login
      if (!existingUser || existingUser.password !== cleanPassword) {
        handleFailedLogin()
        return
      }

      // 3. Login Berhasil
      console.log('Login berhasil untuk user:', cleanUsername)
      setFailedAttempts(0)
      setCooldownTime(0)
      localStorage.setItem('anemia_username', cleanUsername)

      if (onLogin) {
        onLogin({
          username: cleanUsername,
          role: existingUser.role || 'siswa'
        })
      }
    } catch (error) {
      console.error('Error saat login:', error.message)
      setErrorMessage('Gagal terhubung ke database. Periksa koneksi internet Anda.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-dvh w-dvw bg-[#FDF6E2] flex items-center justify-center p-4 sm:p-6 font-sans overflow-hidden select-none touch-none">
      
      {/* Container Utama */}
      <div className="w-full max-w-5xl h-full max-h-[88vh] flex flex-row items-center justify-center gap-8 sm:gap-14">
        
        {/* KOLOM KIRI: Logo Anemia Buddy */}
        <div className="w-1/2 flex justify-center items-center h-full max-h-[280px] sm:max-h-[350px]">
          <img 
            src={logoAnemia} 
            alt="Anemia Buddy Logo" 
            className="w-full h-full object-contain drop-shadow-sm pointer-events-none"
          />
        </div>

        {/* KOLOM KANAN: Card Form Login */}
        <div className="w-1/2 max-w-[400px] sm:max-w-[440px] bg-white rounded-[2.5rem] p-7 sm:p-9 shadow-2xl border border-slate-100/60 flex flex-col justify-center items-center">
          
          {/* Header LOGIN & Ikon Profile */}
          <div className="flex items-center justify-center gap-2.5 mb-5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-black">
              LOGIN
            </h1>
            <svg 
              className="w-6 h-6 sm:w-7 sm:h-7 text-black stroke-[2.5]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
          </div>

          {/* Pesan Error */}
          {errorMessage && (
            <div className="w-full bg-red-100 border border-red-400 text-red-700 px-3.5 py-2 rounded-xl text-xs font-semibold mb-4 text-center">
              {cooldownTime > 0 
                ? `Terlalu banyak percobaan gagal! Coba lagi dalam ${cooldownTime} detik.` 
                : errorMessage}
            </div>
          )}

          {/* Form Input */}
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <div>
              <input
                type="text"
                placeholder="Nama Pengguna"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={cooldownTime > 0}
                className="w-full bg-[#D9D9D9] text-slate-800 placeholder-slate-500 px-5 py-3 sm:py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#003049] text-sm sm:text-base font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Kata Sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={cooldownTime > 0}
                className="w-full bg-[#D9D9D9] text-slate-800 placeholder-slate-500 px-5 py-3 sm:py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#003049] text-sm sm:text-base font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            {/* Tombol Mulai */}
            <div className="flex justify-center mt-3">
              <button
                type="submit"
                disabled={loading || cooldownTime > 0}
                className="bg-[#003049] hover:bg-[#780000] text-white font-extrabold px-10 py-3 rounded-full shadow-lg transition-all active:scale-95 text-sm sm:text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
              >
                {cooldownTime > 0 
                  ? `Tunggu (${cooldownTime}s)` 
                  : loading 
                    ? 'Memproses...' 
                    : 'Mulai'}
              </button>
            </div>

            {/* Tombol Unduh File APK Android Langsung */}
            <div className="flex justify-center mt-1">
              <a
                href="/anemia-buddy.apk"
                download="Anemia-Buddy.apk"
                className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-1.5 rounded-full border border-slate-300 transition-all active:scale-95 shadow-xs"
                title="Unduh File APK Android"
              >
                <span>📥</span>
                <span>Download Aplikasi Android (.APK)</span>
              </a>
            </div>
          </form>

        </div>

      </div>
    </div>
  )
}

export default Login