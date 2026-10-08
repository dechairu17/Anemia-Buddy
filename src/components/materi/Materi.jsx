import React, { useState } from 'react'

// IMPORT ASET GAMBAR MATERI
import imgPengertian from '../../assets/3/3. materi - pengertian.png' 
import imgPenyebab from '../../assets/3/3. materi - penyebab.png'   
import imgGejala from '../../assets/3/3. materi - gejala.png'     
import imgDampak from '../../assets/3/3. materi - dampak.png'     
import imgPencegahan from '../../assets/3/3. materi - sumber makanan.png' 

function Materi({ onBack, onSelectMateri }) {
  // State animasi keluar halaman
  const [isExiting, setIsExiting] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  // DAFTAR MATERI
  const daftarMateri = [
    { id: 'pengertian', judul: 'Pengertian Anemia Defisiensi Besi', img: imgPengertian },
    { id: 'dampak', judul: 'Dampak Anemia', img: imgDampak },
    { id: 'penyebab', judul: 'Penyebab Anemia', img: imgPenyebab },
    { id: 'pencegahan', judul: 'Cara Pencegahan Anemia', img: imgPencegahan },
    { id: 'gejala', judul: 'Gejala Anemia', img: imgGejala },
  ]

  // Handler klik menu dengan transisi
  const handleSelect = (id) => {
    setSelectedId(id)
    setIsExiting(true)
    setTimeout(() => {
      if (onSelectMateri) {
        onSelectMateri(id)
      }
    }, 300) // Durasi transisi 300ms
  }

  return (
    <div className={`h-dvh w-dvw bg-[#780000] flex flex-col items-center justify-center p-3 sm:p-5 font-sans relative overflow-hidden select-none touch-none transition-opacity duration-300 ${isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      
      {/* TOMBOL KEMBALI */}
      <button 
        onClick={onBack}
        className="absolute top-3 left-4 sm:top-4 sm:left-5 z-30 text-white/80 hover:text-white transition-opacity cursor-pointer p-1"
        title="Kembali ke Menu Utama"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
      </button>

      {/* CONTAINER UTAMA */}
      <div className="w-full max-w-4xl flex flex-col items-center z-10 my-auto">
        
        {/* HEADER */}
        <div className="text-center mb-3 sm:mb-4">
          <h1 className="text-lg sm:text-2xl font-black text-white tracking-widest uppercase drop-shadow-md">
            MATERI PEMBELAJARAN
          </h1>
          <p className="text-red-100 font-medium text-[10px] sm:text-xs mt-0.5">
            Pilih salah satu topik di bawah untuk membaca materi lengkap
          </p>
        </div>

        {/* GRID LIST MATERI */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 max-h-[70vh] items-center justify-center">
          {daftarMateri.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`group bg-[#5c0000] hover:bg-[#4a0000] border border-red-300/30 hover:border-yellow-400 rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 shadow-md transition-all duration-300 active:scale-95 cursor-pointer ${
                selectedId === item.id ? 'ring-2 ring-yellow-400 scale-105' : ''
              }`}
            >
              {/* THUMBNAIL BOX */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex-shrink-0 flex items-center justify-center p-1 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                <img 
                  src={item.img} 
                  alt={item.judul} 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* JUDUL */}
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-bold text-[10px] sm:text-xs leading-tight line-clamp-2 group-hover:text-yellow-300 transition-colors">
                  {item.judul}
                </h2>
              </div>

              {/* PANAH */}
              <div className="text-red-300 group-hover:text-yellow-300 transition-colors flex-shrink-0">
                <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  )
}

export default Materi