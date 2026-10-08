import React, { useState } from 'react'

// IMPORT ASET GAMBAR MATERI
import imgPengertian from '../../assets/3/3. materi - pengertian.png' 
import imgPenyebab from '../../assets/3/3. materi - penyebab.png'   
import imgGejala from '../../assets/3/3. materi - gejala.png'     
import imgDampak from '../../assets/3/3. materi - dampak.png'     
import imgPencegahan from '../../assets/3/3. materi - sumber makanan.png' 

function MateriSection({ onBack }) {
  // State materi aktif (null jika belum ada yang dipilih)
  const [selectedMateriId, setSelectedMateriId] = useState(null)

  // DAFTAR MATERI
  const daftarMateri = [
    { id: 'pengertian', judul: 'Pengertian Anemia Defisiensi Besi', img: imgPengertian },
    { id: 'dampak', judul: 'Dampak Anemia', img: imgDampak },
    { id: 'penyebab', judul: 'Penyebab Anemia', img: imgPenyebab },
    { id: 'pencegahan', judul: 'Cara Pencegahan Anemia', img: imgPencegahan },
    { id: 'gejala', judul: 'Gejala Anemia', img: imgGejala },
  ]

  // DATABASE KONTEN MATERI
  const dataMateri = {
    pengertian: {
      judul: 'Pengertian Anemia Defisiensi Zat Besi',
      tipe: 'teks',
      isi: 'Anemia defisiensi zat besi adalah kondisi ketika tubuh kekurangan zat besi yang dibutuhkan untuk menghasilkan hemoglobin. Hemoglobin adalah protein dalam sel darah merah yang bertugas membawa oksigen ke seluruh jaringan tubuh. Akibatnya, tubuh terasa cepat lelah, lemas, dan kurang bertenaga.'
    },
    dampak: {
      judul: 'Dampak Anemia',
      tipe: 'teks',
      isi: 'Dampak anemia pada remaja meliputi penurunan konsentrasi belajar, daya tahan tubuh menurun sehingga mudah sakit, penurunan prestasi akademis, serta cepat merasa lelah dan lesu saat beraktivitas sehari-hari.'
    },
    penyebab: {
      judul: 'Penyebab Anemia',
      tipe: 'teks',
      isi: 'Penyebab utama anemia antara lain kurangnya asupan makanan kaya zat besi, perdarahan saat menstruasi pada remaja putri, adanya gangguan penyerapan zat besi di saluran pencernaan, atau pola makan yang kurang gizi seimbang.'
    },
    pencegahan: {
      judul: '4 Jurus Bebas Anemia',
      tipe: 'jurus_pencegahan',
      jurusList: [
        {
          nomor: 1,
          judulJurus: 'Konsumsi Makanan "Superfood Anti Anemia" yang Kaya Zat Besi',
          deskripsi: 'Zat besi sering kali terdapat pada makanan sumber protein. Zat besi itu ibarat "bahan bakar" untuk membuat sel darah merah.',
          poin: [
            { label: 'Sumber protein hewani', detail: 'Daging sapi, daging ayam, ikan, telur ayam, udang, cumi-cumi.' },
            { label: 'Sumber zat besi lainnya', detail: 'Bayam, daun kelor, tempe, tahu, dan kacang-kacangan.' }
          ]
        },
        {
          nomor: 2,
          judulJurus: 'Duetkan Makanan dengan Vitamin C',
          deskripsi: 'Vitamin C sangat membantu meningkatkan penyerapan zat besi di dalam tubuh.',
          poin: [
            { label: 'Sumber Vitamin C', detail: 'Jeruk, pepaya, mangga, jambu biji.' },
            { 
              label: 'Contoh Penerapan', 
              detail: [
                'Makan nasi + soto daging sapi + minum es jeruk',
                'Makan nasi + ayam goreng + sayur bening bayam + buah pepaya'
              ] 
            }
          ]
        },
        {
          nomor: 3,
          judulJurus: 'Hati-hati dengan "Pencuri Zat Besi"',
          deskripsi: 'Ada zat yang bisa menghambat penyerapan zat besi, contohnya tanin. Tanin biasanya ada di dalam teh dan kopi.',
          tips: 'Hindari minum teh dan kopi tepat saat/setelah makan makanan utama. Beri jeda minimal 1–2 jam.'
        },
        {
          nomor: 4,
          judulJurus: 'Rutin Minum Tablet Tambah Darah (TTD)',
          deskripsi: 'Diminum secara teratur menggunakan air putih.'
        }
      ]
    },
    gejala: {
      judul: 'Gejala Anemia',
      tipe: 'teks',
      isi: 'Gejala anemia yang sering dikenal dengan istilah 5L yaitu: Lesu, Letih, Lemah, Lelah, dan Keliyengan. Gejala lainnya termasuk wajah pucat, pusing, mata berkunang-kunang, dan kuku atau bibir tampak pucat.'
    }
  }

  const materiAktif = dataMateri[selectedMateriId]

  return (
    <div className="h-dvh w-dvw bg-[#780000] flex items-center justify-center p-3 sm:p-5 font-sans relative overflow-hidden select-none touch-none">
      
      {/* TOMBOL KEMBALI UTAMA */}
      <button 
        onClick={() => {
          if (selectedMateriId) {
            setSelectedMateriId(null) // Jika sedang buka isi materi, kembali ke menu penuh
          } else {
            onBack() // Jika di menu penuh, kembali ke halaman awal
          }
        }}
        className="absolute top-3 left-4 sm:top-4 sm:left-5 z-30 text-white/80 hover:text-white transition-opacity cursor-pointer p-1"
        title="Kembali"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {/* CONTAINER LAYOUT BERJALAN DENGAN TRANSISI EFEK SLIDE & ZOOM */}
      <div className="w-full max-w-6xl flex items-center justify-center gap-4 sm:gap-6 z-10 my-auto h-[85vh]">
        
        {/* 
          ========================================================================
          PANEL 1: MENU LIST MATERI
          - Bergeser ke kiri dan menyusut sedikit ukurannya saat materi dipilih
          ========================================================================
        */}
        <div 
          className={`flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
            selectedMateriId 
              ? 'w-1/3 sm:w-2/5 scale-90 sm:scale-95 border-r border-red-500/20 pr-2 sm:pr-4' 
              : 'w-full max-w-4xl scale-100'
          }`}
        >
          {/* HEADER MENU */}
          <div className="text-center mb-3 sm:mb-4">
            <h1 className={`font-black text-white tracking-widest uppercase drop-shadow-md transition-all duration-300 ${
              selectedMateriId ? 'text-sm sm:text-base' : 'text-lg sm:text-2xl'
            }`}>
              MATERI PEMBELAJARAN
            </h1>
            {!selectedMateriId && (
              <p className="text-red-100 font-medium text-[10px] sm:text-xs mt-0.5">
                Pilih salah satu topik di bawah untuk membaca materi lengkap
              </p>
            )}
          </div>

          {/* GRID MENU LIST */}
          <div className={`w-full grid gap-2.5 sm:gap-3.5 items-center justify-center transition-all duration-500 ${
            selectedMateriId ? 'grid-cols-1 max-h-[65vh] overflow-y-auto pr-1' : 'grid-cols-2 sm:grid-cols-3 max-h-[70vh]'
          }`}>
            {daftarMateri.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMateriId(item.id)}
                className={`group bg-[#5c0000] hover:bg-[#4a0000] border rounded-xl p-2 sm:p-3 flex items-center gap-2 sm:gap-2.5 shadow-md transition-all duration-300 active:scale-95 cursor-pointer ${
                  selectedMateriId === item.id 
                    ? 'border-yellow-400 bg-[#4a0000] ring-2 ring-yellow-400/50 scale-102' 
                    : 'border-red-300/30 hover:border-yellow-400'
                }`}
              >
                {/* THUMBNAIL */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex-shrink-0 flex items-center justify-center p-1 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                  <img src={item.img} alt={item.judul} className="w-full h-full object-contain" />
                </div>

                {/* JUDUL */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-bold text-[10px] sm:text-xs leading-tight line-clamp-2 group-hover:text-yellow-300 transition-colors">
                    {item.judul}
                  </h2>
                </div>

                {/* PANAH */}
                <div className="text-red-300 group-hover:text-yellow-300 transition-colors flex-shrink-0">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 
          ========================================================================
          PANEL 2: FRAME KERTAS BINDER (ISI MATERI)
          - Efek Zoom-In Membesar (scale-0 -> scale-100)
          ========================================================================
        */}
        {selectedMateriId && materiAktif && (
          <div className="flex-1 h-full animate-zoom-in transition-all duration-500 transform origin-center">
            <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden flex border border-slate-200 relative z-10">
              
              {/* LUBANG BINDER KIRI */}
              <div className="w-7 sm:w-10 bg-slate-100 border-r border-slate-200 flex flex-col justify-around items-center py-4 flex-shrink-0">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-[#780000] rounded-full shadow-inner" />
                ))}
              </div>

              {/* KERTAS ISI (BISA DI-SCROLL) */}
              <div className="flex-1 p-3 sm:p-5 overflow-y-auto touch-auto text-slate-800">
                
                {/* JUDUL MATERI AKTIF */}
                <h1 className="text-xs sm:text-base font-black text-[#003049] text-center mb-3 tracking-wide border-b-2 border-[#003049]/10 pb-2 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                  {materiAktif.judul}
                </h1>

                {/* RENDERING KONTEN */}
                {materiAktif.tipe === 'jurus_pencegahan' ? (
                  <div className="space-y-3 text-[11px] sm:text-xs">
                    {materiAktif.jurusList.map((jurus) => (
                      <div key={jurus.nomor} className="bg-slate-50 border-l-4 border-[#003049] p-2.5 rounded-r-xl shadow-sm">
                        <h2 className="font-extrabold text-[#780000] text-xs sm:text-xs mb-1">
                          Jurus {jurus.nomor}: {jurus.judulJurus}
                        </h2>
                        <p className="text-slate-600 font-medium mb-1.5 leading-relaxed">
                          {jurus.deskripsi}
                        </p>

                        {jurus.poin && (
                          <ul className="space-y-1 pl-1.5">
                            {jurus.poin.map((p, idx) => (
                              <li key={idx} className="flex flex-col sm:flex-row gap-0.5 text-slate-700">
                                <span className="font-bold text-[#003049] flex-shrink-0">• {p.label}:</span>
                                {Array.isArray(p.detail) ? (
                                  <ul className="pl-3 space-y-0.5 list-disc text-slate-600">
                                    {p.detail.map((d, i) => (
                                      <li key={i}>{d}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span className="text-slate-600">{p.detail}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}

                        {jurus.tips && (
                          <div className="mt-1.5 bg-amber-50 border border-amber-200 text-amber-900 p-1.5 rounded-lg text-[10px] sm:text-[11px]">
                            <span className="font-bold">💡 Tips: </span>
                            {jurus.tips}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed text-justify space-y-2">
                    <p>{materiAktif.isi}</p>
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  )
}

export default MateriSection