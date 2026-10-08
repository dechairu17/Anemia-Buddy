import React from 'react'

function IsiMateri({ materiId, onBack }) {

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
    
    // ==========================================
    // MATERI PENCEGAHAN (LENGKAP DENGAN 4 JURUS)
    // ==========================================
    pencegahan: {
      judul: '4 Jurus Bebas Anemia',
      tipe: 'jurus_pencegahan', // Tipe khusus untuk format terstruktur
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

  // Mengambil data berdasarkan ID
  const materiAktif = dataMateri[materiId] || dataMateri['pencegahan']

  return (
    /* 
      1. CONTAINER UTAMA:
      - h-dvh & w-dvw: Mengunci 100% layar.
      - overflow-hidden & touch-none: Menghilangkan scrollbar utama layar HP.
    */
    <div className="h-dvh w-dvw bg-[#780000] flex items-center justify-center p-3 sm:p-5 font-sans relative overflow-hidden select-none touch-none">
      
      {/* TOMBOL KEMBALI */}
      <button 
        onClick={onBack}
        className="absolute top-3 left-4 sm:top-4 sm:left-5 z-30 text-white/80 hover:text-white transition-opacity cursor-pointer p-1"
        title="Kembali ke Daftar Materi"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {/* =========================================================================
          FRAME KERTAS BINDER 
          - h-[85vh]: Mengunci tinggi binder agar pas di layar lanskap HP
         ========================================================================= */}
      <div className="w-full max-w-xl sm:max-w-2xl h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex border border-slate-200 relative z-10">
        
        {/* LUBANG BINDER KIRI */}
        <div className="w-8 sm:w-12 bg-slate-100 border-r border-slate-200 flex flex-col justify-around items-center py-4 flex-shrink-0">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#780000] rounded-full shadow-inner" />
          ))}
        </div>

        {/* 
          ========================================================================
          KERTAS ISI (KHUSUS AREA INI BISA DI-SCROLL)
          - overflow-y-auto: Mengaktifkan scrollbar vertikal internal
          - touch-auto: Mengaktifkan usapan/gestur jari di HP untuk scroll
          ========================================================================
        */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto touch-auto text-slate-800">
          
          {/* JUDUL UTAMA */}
          <h1 className="text-sm sm:text-lg font-black text-[#003049] text-center mb-4 tracking-wide border-b-2 border-[#003049]/10 pb-2 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
            {materiAktif.judul}
          </h1>

          {/* RENDERING KONTEN BERDASARKAN TIPE MATERI */}
          {materiAktif.tipe === 'jurus_pencegahan' ? (
            
            /* TAMPILAN MATERI 4 JURUS PENCEGAHAN */
            <div className="space-y-4 text-xs sm:text-sm">
              {materiAktif.jurusList.map((jurus) => (
                <div key={jurus.nomor} className="bg-slate-50 border-l-4 border-[#003049] p-3 rounded-r-xl shadow-sm">
                  
                  {/* JUDUL JURUS */}
                  <h2 className="font-extrabold text-[#780000] text-xs sm:text-sm mb-1">
                    Jurus {jurus.nomor}: {jurus.judulJurus}
                  </h2>

                  {/* DESKRIPSI */}
                  <p className="text-slate-600 font-medium mb-2 leading-relaxed">
                    {jurus.deskripsi}
                  </p>

                  {/* POIN-POIN MAKANAN / DETAIL */}
                  {jurus.poin && (
                    <ul className="space-y-1.5 pl-2">
                      {jurus.poin.map((p, idx) => (
                        <li key={idx} className="flex flex-col sm:flex-row gap-0.5 sm:gap-1 text-slate-700">
                          <span className="font-bold text-[#003049] flex-shrink-0">• {p.label}:</span>
                          {Array.isArray(p.detail) ? (
                            <ul className="pl-4 space-y-0.5 list-disc text-slate-600">
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

                  {/* TIPS HATI-HATI */}
                  {jurus.tips && (
                    <div className="mt-2 bg-amber-50 border border-amber-200 text-amber-900 p-2 rounded-lg text-[11px] sm:text-xs">
                      <span className="font-bold">💡 Tips: </span>
                      {jurus.tips}
                    </div>
                  )}

                </div>
              ))}
            </div>

          ) : (

            /* TAMPILAN KONTEN TEKS STANDAR (Pengertian, Dampak, Gejala, dll) */
            <div className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed text-justify space-y-3">
              <p>{materiAktif.isi}</p>
            </div>

          )}

        </div>

      </div>

    </div>
  )
}

export default IsiMateri