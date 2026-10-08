import React from 'react'

// IMPORT ASET GAMBAR
import bgHomeSvg from '../../assets/2/2. home - background.svg'
import imgHomeCard from '../../assets/2/2. home - anemia buddy menu.png' 
import imgBukuTandaTanya from '../../assets/2/2. home - buku.png'

function Home({ onNavigate, onLogout }) {
  
  // Fungsi Keluar / Logout
  const handleExit = () => {
    localStorage.removeItem('anemia_username')
    if (onLogout) {
      onLogout()
    } else {
      window.location.reload()
    }
  }

  return (
    /* 
      CONTAINER UTAMA:
      - h-dvh & w-dvw: Mengunci 100% layar tanpa scrollbar.
      - select-none & touch-none: Mencegah scroll dan seleksi elemen.
    */
    <div 
      className="h-dvh w-dvw bg-cover bg-center bg-no-repeat flex items-center justify-center font-sans relative overflow-hidden select-none touch-none"
      style={{ backgroundImage: `url("${bgHomeSvg}")` }}
    >
      
      {/* =========================================================================
          TOMBOL KELUAR (Ikon Panah Tipis Pojok Kiri Atas Sesuai Gambar 2)
         ========================================================================= */}
      <button 
        onClick={handleExit}
        className="absolute top-3 left-4 sm:top-5 sm:left-6 z-30 text-white/80 hover:text-white transition-opacity cursor-pointer p-1"
        title="Kembali ke Halaman Login"
      >
        <svg 
          className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          ></path>
        </svg>
      </button>

      {/* =========================================================================
          TOMBOL LOGOUT (Pojok Kanan Atas - Jelas & Mudah Diakses)
         ========================================================================= */}
      <button 
        onClick={handleExit}
        className="absolute top-3 right-4 sm:top-5 sm:right-6 z-30 flex items-center gap-1.5 bg-rose-600/90 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm px-3.5 sm:px-4 py-1.5 rounded-full shadow-lg border border-white/30 transition-all cursor-pointer"
        title="Logout dari Akun"
      >
        <svg 
          className="w-4 h-4 stroke-[2.5]" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
          />
        </svg>
        <span>Logout</span>
      </button>

      {/* =========================================================================
          CONTAINER UTAMA FRAME CARD PUTIH
          - h-[88vh]: Meninggikan kartu putih secara vertikal (persis Gambar 2).
          - aspect-[1/1.35]: Mengunci rasio memanjang ke atas agar tombol pas di dalam.
         ========================================================================= */}
        <div className="relative w-[480px] sm:w-[520px] aspect-[1/1.35] flex justify-center items-center">        
        {/* 1. GAMBAR BODY CARD UTUH (Background Putih + Logo Anemia Buddy) */}
        <img 
          src={imgHomeCard} 
          alt="Home Frame" 
          className="w-full h-full object-contain drop-shadow-md pointer-events-none"
        />

        {/* 2. OVERLAY TOMBOL-TOMBOL MENU
            - w-[52%]: Memperkecil lebar tombol agar pas di dalam kartu putih tanpa meluap.
            - top-[44%]: Menempatkan tombol tepat di tengah kartu.
        */}
        <div className="absolute top-[47%] left-1/2 -translate-x-1/2 w-[30%] flex flex-col gap-2.5 sm:gap-3 z-10">
          
          {/* Tombol MATERI */}
          <button 
            onClick={() => onNavigate && onNavigate('materi')}
            className="w-full bg-[#D9D9D9] hover:bg-[#003049] hover:text-white text-[#003049] font-extrabold py-1.5 sm:py-2 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 text-[10px] sm:text-xs md:text-sm cursor-pointer tracking-wider"
          >
            MATERI
          </button>

          {/* Tombol KUIS */}
          <button 
            onClick={() => onNavigate && onNavigate('kuis')}
            className="w-full bg-[#D9D9D9] hover:bg-[#003049] hover:text-white text-[#003049] font-extrabold py-1.5 sm:py-2 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 text-[10px] sm:text-xs md:text-sm cursor-pointer tracking-wider"
          >
            KUIS
          </button>

          {/* Tombol GAME */}
          <button 
            onClick={() => onNavigate && onNavigate('game')}
            className="w-full bg-[#D9D9D9] hover:bg-[#003049] hover:text-white text-[#003049] font-extrabold py-1.5 sm:py-2 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 text-[10px] sm:text-xs md:text-sm cursor-pointer tracking-wider"
          >
            GAME
          </button>

        </div>

        {/* 3. IKON BUKU BANTUAN TANDA TANYA
            - left-[-12%] bottom-[6%]: Menggeser buku sedikit ke kiri bawah kartu putih persis Gambar 2.
        */}
        <div className="absolute left-[18%] bottom-[20%] z-20">
          <img 
            src={imgBukuTandaTanya} 
            alt="Buku Bantuan" 
            className="w-30 sm:w-38 md:w-42 object-contain hover:scale-105 transition-transform cursor-pointer drop-shadow-md"
          />
        </div>

      </div>

    </div>
  )
}

export default Home