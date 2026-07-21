# Kebijakan Publikasi Data Bab 1–3 dan IPS

Dokumen ini menjadi pedoman teknis sementara untuk penyajian data pada Dashboard Digital Kanwil Kementerian Agama Provinsi Lampung.

## Tujuan

1. Mencegah angka 0, N/A, sel kosong, dan data belum lengkap disalahartikan sebagai kegagalan kinerja.
2. Memisahkan data kerja internal dari informasi yang layak ditampilkan kepada masyarakat.
3. Menjaga agar card, grafik, tabel, hasil ekspor, dan asisten data memakai aturan interpretasi yang sama.
4. Menyediakan jejak keputusan sebelum persetujuan final dari produsen data, walidata, PPID, dan pimpinan.

## Aturan Umum

| Kondisi sumber | Tampilan publik | Penggunaan pada card/grafik |
|---|---|---|
| Nilai positif dan sumber jelas | Tampilkan sesuai nilai | Dapat digunakan |
| Nilai 0 terverifikasi | Tampilkan 0 beserta catatan | Dapat digunakan setelah konfirmasi produsen data |
| Nilai 0 tanpa penjelasan | Tetap tersedia pada tabel sumber | Tidak dipaksakan menjadi titik grafik kinerja |
| N/A, NA, #N/A | Tampilkan sebagai `Tidak tersedia` | Tidak dihitung sebagai 0 |
| Sel kosong | Tetap kosong | Tidak dihitung sebagai 0 |
| Indikator `perlu-validasi` | Tidak ditampilkan pada card publik | Tetap tersedia pada panel admin/internal |
| Tabel dengan ketidaksesuaian total | Tampilkan dengan catatan kualitas | Tidak digunakan pada card/grafik sampai diperbaiki |

## Bab 1 — Tata Kelola dan Manajemen

- Angka 0 atau N/A harus dikonfirmasi oleh produsen data.
- Data kosong tidak boleh otomatis diubah menjadi nol.
- Card publik hanya memakai indikator aktif, agregat, memiliki periode, cakupan, dan sumber yang jelas.

## Bab 2 — Pelayanan Keagamaan

Indikator Bimas Islam yang pernah dihitung dari file sumber:

| Indikator | Nilai |
|---|---:|
| KUA memiliki Balai Nikah | 92,00% |
| Penyuluh Agama Islam berpendidikan S1 ke atas | 99,62% |
| Tanah KUA bersertifikat | 77,78% |
| Kondisi bangunan KUA baik | 62,22% |
| Penghulu mendapat pembinaan | 47,90% |
| Tanah wakaf bersertifikat | 60,10% |
| Tanah wakaf produktif | 1,10% |

Nilai rendah tetap boleh ditampilkan apabila perhitungan, pembilang, penyebut, periode, dan sumbernya jelas. Narasi tidak boleh menyimpulkan kegagalan tanpa menjelaskan kondisi dan ruang perbaikannya.

## Bab 3 — Pendidikan Agama Islam

### Aturan penyajian

- Referensi utama menggunakan Tahun Ajaran 2024/2025.
- `Jumlah MDT terdata` dan `Jumlah TPQ terdata` tidak boleh ditulis sebagai aktif, tervalidasi, atau memiliki NSPQ karena variabel tersebut tidak tersedia pada file sumber.
- Data pertumbuhan tidak dihitung karena file hanya memiliki satu periode utama.
- Nilai kosong/N/A tidak digunakan sebagai nol.

### Tabel yang memerlukan verifikasi internal

Tabel berikut pernah teridentifikasi memiliki ketidaksesuaian total dan tidak digunakan untuk card/grafik sampai diperbaiki:

- Tabel 4.108
- Tabel 4.116
- Tabel 4.119
- Tabel 4.120
- Tabel 4.123
- Tabel 4.124

### Contoh indikator publik yang memiliki dasar data

- Guru PAI minimal S1: 96,83%.
- Guru PAI bersertifikat: 49,62%.
- Wilayah memiliki Pengawas PAI: 13 dari 15 wilayah.
- MDT terdata: 920 lembaga.
- TPQ terdata: 3.561 lembaga.
- Rasio santri terhadap ustadz: sekitar 1:9,50.

## Indeks Pembangunan Statistik

Kategori yang digunakan dashboard:

| Nilai IPS | Kategori |
|---:|---|
| 0 | Tidak Mengikuti |
| 1 sampai kurang dari 1,8 | Kurang |
| 1,8 sampai kurang dari 2,6 | Cukup |
| 2,6 sampai kurang dari 3,5 | Baik |
| 3,5 sampai kurang dari 4,2 | Sangat Baik |
| 4,2 sampai 5,0 | Memuaskan |

Nilai 0 pada IPS harus selalu ditulis `Tidak Mengikuti`, bukan `Buruk`, `Gagal`, atau `Nilai terendah`.

## Alur Persetujuan

1. Operator mengunggah atau memperbarui data.
2. Sistem menjalankan pemeriksaan struktur, nilai kosong, N/A, nol, duplikasi, dan ketidaksesuaian total.
3. Produsen data memeriksa substansi dan definisi indikator.
4. Walidata memeriksa standar data, metadata, kode referensi, dan konsistensi agregat.
5. PPID menetapkan klasifikasi informasi publik.
6. Pejabat yang berwenang menyetujui publikasi.
7. Sistem menyimpan versi, tanggal publikasi, validator, dan riwayat perubahan.

## Implementasi pada Kode

Lapisan publik berada pada `lib/services/public-dashboard-governance.ts` dan diterapkan pada:

- Halaman publik `app/page.tsx`.
- Respons publik `GET /api/dashboard`.

Panel admin dan proses `PUT /api/dashboard` tetap memakai data mentah agar data internal dan indikator yang perlu validasi tidak terhapus.

Pemeriksaan tata kelola terakhir: 21 Juli 2026.
