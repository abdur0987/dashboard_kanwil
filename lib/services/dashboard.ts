import { asc, eq } from "drizzle-orm";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";

import { db } from "@/lib/db/client";
import { ensureDatabaseReady } from "@/lib/db/migrate";
import {
  formatIpsWorkUnit,
  getIpsScoreCategory,
} from "@/lib/ips";
import {
  activities as activitiesTable,
  awardCollections as awardCollectionsTable,
  awardItems as awardItemsTable,
  chartSeries as chartSeriesTable,
  contactInfo as contactInfoTable,
  datasets as datasetsTable,
  dashboardRows as dashboardRowsTable,
  executiveSchedules as executiveSchedulesTable,
  filters as filtersTable,
  indicators as indicatorsTable,
  officeLocations as officeLocationsTable,
  publications as publicationsTable,
  releaseSchedules as releaseSchedulesTable,
  videos as videosTable,
} from "@/lib/db/schema";
import type {
  ChartPoint,
  DataCatalog,
  DashboardData,
  DashboardRow,
  DatasetDetail,
  ExecutiveSchedule,
  Indicator,
  NewsItem,
  OfficeLocation,
  ReleaseSchedule,
} from "@/lib/types";

const simandaAgendaUrl =
  "https://datalampung.kemenag.go.id/simanda/home/agenda/show-all?sifat_agenda=publik";
const lampungHomeApiUrl = "https://lampung.kemenag.go.id/api/home";
const lampungNewsBaseUrl = "https://lampung.kemenag.go.id/berita";
const lampungNewsImageBaseUrl = "https://lampung.kemenag.go.id/storage/berita";
const agendaTimeZone = "Asia/Jakarta";
const simandaAgendaCacheTtlMs = 5 * 60 * 1000;
const lampungNewsCacheTtlMs = 10 * 60 * 1000;

let simandaAgendaCache:
  | {
      checkedAt: number;
      signature: string;
      schedules: ExecutiveSchedule[];
    }
  | null = null;

let lampungNewsCache:
  | {
      checkedAt: number;
      news: NewsItem[];
    }
  | null = null;

let datasetDetailsCache:
  | {
      signature: string;
      details: DatasetDetail[];
    }
  | null = null;

export function clearDashboardDataCache() {
  simandaAgendaCache = null;
  lampungNewsCache = null;
  datasetDetailsCache = null;
}

type SimandaAgenda = {
  id: number;
  nama_agenda?: string | null;
  tanggal_agenda?: string | null;
  jam_mulai?: string | null;
  jam_selesai?: string | null;
  tempat_agenda?: string | null;
  kehadiran_text?: string | null;
  is_done?: number | boolean | null;
  jabatans?: { nama_jabatan?: string | null }[] | null;
};

type LampungNewsResponse = {
  headlines?: LampungNewsItem[] | null;
};

type LampungNewsItem = {
  id?: number | null;
  title?: string | null;
  image?: string | null;
  slug?: string | null;
  posted_at?: string | null;
  name?: string | null;
};

const lampungKabupatenKota = [
  "Lampung Barat",
  "Tanggamus",
  "Lampung Selatan",
  "Lampung Timur",
  "Lampung Tengah",
  "Lampung Utara",
  "Way Kanan",
  "Tulang Bawang",
  "Pesawaran",
  "Pringsewu",
  "Mesuji",
  "Tulang Bawang Barat",
  "Pesisir Barat",
  "Bandar Lampung",
  "Metro",
];

const ipsRows: DashboardRow[] = [
  { id: 101, indicator: "Nilai Indeks Pembangunan Statistik", category: "IPS", region: "Lampung Barat", period: "Tahunan", year: 2025, value: 3.57, unit: "indeks", source: "Rekap IPS Kanwil Kemenag Lampung" },
  { id: 102, indicator: "Nilai Indeks Pembangunan Statistik", category: "IPS", region: "Tanggamus", period: "Tahunan", year: 2025, value: 2.9, unit: "indeks", source: "Rekap IPS Kanwil Kemenag Lampung" },
  { id: 103, indicator: "Nilai Indeks Pembangunan Statistik", category: "IPS", region: "Lampung Selatan", period: "Tahunan", year: 2025, value: 2.8, unit: "indeks", source: "Rekap IPS Kanwil Kemenag Lampung" },
  { id: 104, indicator: "Nilai Indeks Pembangunan Statistik", category: "IPS", region: "Lampung Timur", period: "Tahunan", year: 2025, value: 2.878, unit: "indeks", source: "Rekap IPS Kanwil Kemenag Lampung" },
  { id: 105, indicator: "Nilai Indeks Pembangunan Statistik", category: "IPS", region: "Lampung Tengah", period: "Tahunan", year: 2025, value: 2.825, unit: "indeks", source: "Rekap IPS Kanwil Kemenag Lampung" },
  { id: 106, indicator: "Nilai Indeks Pembangunan Statistik", category: "IPS", region: "Lampung Utara", period: "Tahunan", year: 2025, value: 3, unit: "indeks", source: "Rekap IPS Kanwil Kemenag Lampung" },
  { id: 107, indicator: "Nilai Indeks Pembangunan Statistik", category: "IPS", region: "Way Kanan", period: "Tahunan", year: 2025, value: 4.34, unit: "indeks", source: "Rekap IPS Kanwil Kemenag Lampung" },
  { id: 108, indicator: "Nilai Indeks Pembangunan Statistik", category: "IPS", region: "Tulang Bawang", period: "Tahunan", year: 2025, value: 2.95, unit: "indeks", source: "Rekap IPS Kanwil Kemenag Lampung" },
  { id: 109, indicator: "Nilai Indeks Pembangunan Statistik", category: "IPS", region: "Pesawaran", period: "Tahunan", year: 2025, value: 2.825, unit: "indeks", source: "Rekap IPS Kanwil Kemenag Lampung" },
  { id: 110, indicator: "Nilai Indeks Pembangunan Statistik", category: "IPS", region: "Pringsewu", period: "Tahunan", year: 2025, value: 2.963, unit: "indeks", source: "Rekap IPS Kanwil Kemenag Lampung" },
  { id: 111, indicator: "Nilai Indeks Pembangunan Statistik", category: "IPS", region: "Mesuji", period: "Tahunan", year: 2025, value: 2.825, unit: "indeks", source: "Rekap IPS Kanwil Kemenag Lampung" },
  { id: 112, indicator: "Nilai Indeks Pembangunan Statistik", category: "IPS", region: "Tulang Bawang Barat", period: "Tahunan", year: 2025, value: 3.97, unit: "indeks", source: "Rekap IPS Kanwil Kemenag Lampung" },
  { id: 113, indicator: "Nilai Indeks Pembangunan Statistik", category: "IPS", region: "Pesisir Barat", period: "Tahunan", year: 2025, value: 2.825, unit: "indeks", source: "Rekap IPS Kanwil Kemenag Lampung" },
  { id: 114, indicator: "Nilai Indeks Pembangunan Statistik", category: "IPS", region: "Bandar Lampung", period: "Tahunan", year: 2025, value: 3, unit: "indeks", source: "Rekap IPS Kanwil Kemenag Lampung" },
  { id: 115, indicator: "Nilai Indeks Pembangunan Statistik", category: "IPS", region: "Metro", period: "Tahunan", year: 2025, value: 2.825, unit: "indeks", source: "Rekap IPS Kanwil Kemenag Lampung" },
];

const educationMadrasahCategory = "Pendidikan Madrasah";

const rows: DashboardRow[] = [
  { id: 1, indicator: "Layanan PTSP selesai tepat waktu", category: "Layanan Publik", region: "Bandar Lampung", period: "Triwulan", year: 2026, value: 96.4, unit: "persen", source: "PTSP Kanwil Kemenag Lampung" },
  { id: 3, indicator: "KUA dengan layanan digital aktif", category: "Bimas Islam", region: "Lampung Selatan", period: "Semester", year: 2026, value: 91.5, unit: "persen", source: "Bidang Bimas Islam" },
  { id: 4, indicator: "Dokumen Laporan SPAK", category: "SPAK", region: "Kanwil Lampung", period: "Tahunan", year: 2026, value: 94.8, unit: "persen", source: "Bidang Ortala" },
  { id: 5, indicator: "Layanan pengaduan ditindaklanjuti", category: "Layanan Publik", region: "Pringsewu", period: "Triwulan", year: 2025, value: 92.1, unit: "persen", source: "Subbag Umum dan Humas" },
  { id: 7, indicator: "Bimbingan keluarga sakinah terlaksana", category: "Bimas Islam", region: "Tulang Bawang Barat", period: "Tahunan", year: 2025, value: 78.9, unit: "persen", source: "Bidang Bimas Islam" },
  { id: 8, indicator: "Dokumen Laporan SPAK", category: "SPAK", region: "Kanwil Lampung", period: "Tahunan", year: 2025, value: 86.5, unit: "persen", source: "Bidang Ortala" },
  { id: 9, indicator: "Kunjungan portal informasi Kanwil", category: "Layanan Publik", region: "Semua Wilayah", period: "Bulanan", year: 2024, value: 132.4, unit: "ribu", source: "Analytics Website Kanwil" },
  { id: 11, indicator: "KUA revitalisasi layanan", category: "Bimas Islam", region: "Bandar Lampung", period: "Tahunan", year: 2024, value: 75.6, unit: "persen", source: "Bidang Bimas Islam" },
  { id: 12, indicator: "Dokumen Laporan SPAK", category: "SPAK", region: "Kanwil Lampung", period: "Tahunan", year: 2024, value: 82.3, unit: "persen", source: "Bidang Ortala" },
  { id: 13, indicator: "Layanan PTSP selesai tepat waktu", category: "Layanan Publik", region: "Semua Wilayah", period: "Tahunan", year: 2023, value: 87.4, unit: "persen", source: "PTSP Kanwil Kemenag Lampung" },
  { id: 15, indicator: "KUA dengan layanan digital aktif", category: "Bimas Islam", region: "Pesawaran", period: "Tahunan", year: 2023, value: 72.8, unit: "persen", source: "Bidang Bimas Islam" },
  { id: 16, indicator: "Dokumen Laporan SPAK", category: "SPAK", region: "Kanwil Lampung", period: "Tahunan", year: 2023, value: 80.1, unit: "persen", source: "Bidang Ortala" },
  ...ipsRows,
];

const datasetCatalogs: DataCatalog[] = [
  {
    id: 1,
    title: "Tata Kelola dan Manajemen Kanwil Kemenag Lampung 2026",
    description:
      "Dataset ringkasan tata kelola, manajemen organisasi, layanan administrasi, dan indikator pendukung Kanwil Kemenag Provinsi Lampung.",
    category: "Tata Kelola dan Manajemen",
    year: 2026,
    producer: "Kanwil Kemenag Provinsi Lampung",
    frequency: "Tahunan",
    format: "XLSX",
    sourceUrl: "https://datalampung.kemenag.go.id/index.php",
    excelUrl: "/uploads/datasets/tata-kelola-manajemen-2026.xlsx",
    pdfUrl: "",
    standardData:
      "Kolom wilayah berisi satuan kerja atau kabupaten/kota. Kolom indikator berisi nama ukuran statistik sektoral. Kolom nilai berisi angka mutlak atau indeks sesuai satuan data.",
    metadata:
      "Sumber: Kanwil Kemenag Provinsi Lampung; Cakupan: Provinsi Lampung; Referensi waktu: 2026; Klasifikasi isian: wajib; Dapat diakses publik: ya.",
  },
  {
    id: 2,
    title: "Pelayanan Keagamaan Provinsi Lampung 2026",
    description:
      "Dataset pelayanan keagamaan yang mencakup layanan KUA, bimbingan masyarakat, dan layanan keagamaan lintas kabupaten/kota.",
    category: "Pelayanan Keagamaan",
    year: 2026,
    producer: "Bidang Bimas Islam Kanwil Kemenag Lampung",
    frequency: "Tahunan",
    format: "XLSX",
    sourceUrl: "https://datalampung.kemenag.go.id/index.php",
    excelUrl: "/uploads/datasets/pelayanan-keagamaan-2026.xlsx",
    pdfUrl: "",
    standardData:
      "Data disajikan menurut wilayah, layanan, periode, dan nilai layanan. Isian numerik memakai angka mutlak atau persentase sesuai indikator.",
    metadata:
      "Sumber: Bidang Bimas Islam; Cakupan: 15 kabupaten/kota dan Kanwil; Frekuensi penerbitan: tahunan; Tipe data: numerik dan teks.",
  },
  {
    id: 3,
    title: "Pendidikan Agama Islam Provinsi Lampung 2026",
    description:
      "Dataset pendidikan agama Islam dan madrasah yang disiapkan untuk ringkasan statistik serta kebutuhan monitoring pimpinan.",
    category: "Pendidikan Agama Islam",
    year: 2026,
    producer: "Bidang Pendidikan Madrasah Kanwil Kemenag Lampung",
    frequency: "Tahunan",
    format: "XLSX",
    sourceUrl: "https://datalampung.kemenag.go.id/index.php",
    excelUrl: "/uploads/datasets/pendidikan-agama-islam-2026.xlsx",
    pdfUrl: "",
    standardData:
      "Kolom satuan pendidikan, status, wilayah, jenis layanan, tahun, dan nilai mengikuti format statistik sektoral Kementerian Agama.",
    metadata:
      "Sumber: Bidang Pendidikan Madrasah; Produsen data: Kanwil Kemenag Lampung; Cakupan: Provinsi Lampung; Referensi waktu: 2026.",
  },
  {
    id: 4,
    title:
      "Jumlah Mahasiswa Penerima Kartu Indonesia Pintar (KIP) Kuliah pada PTKB menurut Status Lembaga dan Jenis Kelamin 2025",
    description:
      "Contoh dataset Satu Data berisi jumlah mahasiswa penerima KIP Kuliah pada Perguruan Tinggi Keagamaan Buddha menurut status lembaga dan jenis kelamin.",
    category: "Dataset Referensi",
    year: 2025,
    producer: "Direktorat Jenderal Bimbingan Masyarakat Buddha",
    frequency: "Tahunan",
    format: "XLSX, PDF",
    sourceUrl: "https://satudata.kemenag.go.id",
    excelUrl: "/uploads/datasets/kip-kuliah-ptkb-2025.xlsx",
    pdfUrl: "/uploads/datasets/kip-kuliah-ptkb-2025.pdf",
    standardData:
      "Kolom provinsi berisi nama provinsi di Indonesia. Kolom status lembaga membedakan Negeri dan Swasta. Kolom jenis kelamin membedakan laki-laki dan perempuan. Kolom tahun berisi tahun data diterbitkan.",
    metadata:
      "Sumber: Direktorat Jenderal Bimbingan Masyarakat Buddha; Pembaruan: tahunan; Tipe data: integer; Aturan validasi: nilai lebih besar atau sama dengan 0.",
  },
  {
    id: 5,
    title: "Indeks Pembangunan Statistik (IPS) Kabupaten/Kota Provinsi Lampung 2025",
    description:
      "Rekap nilai IPS 15 kabupaten/kota untuk memantau kematangan statistik sektoral di lingkungan Kanwil Kemenag Provinsi Lampung.",
    category: "IPS",
    year: 2025,
    producer: "Tim Data Kanwil Kemenag Lampung",
    frequency: "Tahunan",
    format: "XLSX",
    sourceUrl: "https://datalampung.kemenag.go.id/index.php",
    excelUrl: "/uploads/datasets/ips-2025.xlsx",
    pdfUrl: "",
    standardData:
      "Kolom wilayah berisi 15 kabupaten/kota di Provinsi Lampung. Kolom nilai IPS memakai satuan indeks. Nilai dibaca sebagai tingkat kematangan pembangunan statistik.",
    metadata:
      "Sumber: Rekap IPS Kanwil Kemenag Lampung; Cakupan: 15 kabupaten/kota; Referensi waktu: 2025; Klasifikasi isian: wajib.",
  },
];

const releaseScheduleSeed: ReleaseSchedule[] = [
  {
    id: 1,
    title: "Buku Statistik Kemenag Provinsi Lampung 2026",
    period: "2026",
    language: "Indonesia",
    scheduledDate: "01-06-2026",
    realizedDate: "05-06-2026",
    status: "rilis",
    documentUrl: "https://online.fliphtml5.com/wxfax/uhop/",
    format: "Flipbook",
  },
  {
    id: 2,
    title: "Kementerian Agama Dalam Angka - Data Lampung",
    period: "2026",
    language: "Indonesia",
    scheduledDate: "01-06-2026",
    realizedDate: "05-06-2026",
    status: "rilis",
    documentUrl: "https://datalampung.kemenag.go.id/index.php",
    format: "Web",
  },
  {
    id: 3,
    title: "Rekap Indeks Pembangunan Statistik Kabupaten/Kota",
    period: "2026",
    language: "Indonesia",
    scheduledDate: "05-06-2026",
    realizedDate: "05-06-2026",
    status: "rilis",
    documentUrl: "",
    format: "Dashboard",
  },
];

const officeLocationSeed: OfficeLocation[] = [
  {
    id: 1,
    name: "Kanwil Kementerian Agama Provinsi Lampung",
    type: "kanwil",
    address: "Jl. Cut Mutia No. 27, Teluk Betung Utara, Bandar Lampung",
    phone: "0721-481533",
    latitude: -5.4385,
    longitude: 105.2667,
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kanwil%20Kementerian%20Agama%20Provinsi%20Lampung",
  },
  ...lampungKabupatenKota.map((region, index) => ({
    id: index + 2,
    name: `Kantor Kementerian Agama ${region}`,
    type: "kabupaten-kota" as const,
    address: `${region}, Provinsi Lampung`,
    phone: "-",
    latitude:
      [
        -5.0358, -5.4947, -5.5623, -5.1132, -4.8008, -4.8362, -4.5536, -4.4458,
        -5.3669, -5.3582, -4.0045, -4.5215, -5.1937, -5.3971, -5.1131,
      ][index] ?? -5.3971,
    longitude:
      [
        104.0557, 104.6236, 105.5474, 105.7056, 105.3131, 104.8896, 104.5275,
        105.2506, 105.0991, 104.9744, 105.2219, 105.0886, 103.9398, 105.2668,
        105.3067,
      ][index] ?? 105.2668,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `Kantor Kementerian Agama ${region} Lampung`,
    )}`,
  })),
];

export const seedDashboardData: DashboardData = {
    indicators: [
      {
        id: 1,
        name: "Indeks Layanan PTSP",
        description: "Kinerja layanan terpadu Kanwil untuk kebutuhan informasi dan administrasi keagamaan.",
        category: "Layanan Publik",
        unit: "persen",
        source: "PTSP Kanwil Kemenag Lampung",
        year: 2025,
        value: 96.4,
        trend: 4.3,
        status: "aktif",
      },
      {
        id: 3,
        name: "Layanan Bimas Islam",
        description: "Pemantauan layanan KUA, bimbingan keluarga, dan program keagamaan masyarakat.",
        category: "Bimas Islam",
        unit: "persen",
        source: "Bidang Bimas Islam",
        year: 2026,
        value: 91.5,
        trend: 5.9,
        status: "aktif",
      },
      {
        id: 4,
        name: "Survei Persepsi Anti Korupsi",
        description: "Indeks penilaian layananan anti korupsi Kanwil Kemenag Provinsi Lampung.",
        category: "SPAK",
        unit: "persen",
        source: "Bidang Ortala",
        year: 2026,
        value: 94.8,
        trend: 2.7,
        status: "perlu-validasi",
      },
      {
        id: 5,
        name: "Indeks Pembangunan Statistik",
        description:
          "Rekap nilai IPS untuk 15 kabupaten/kota sebagai gambaran tingkat kematangan statistik sektoral.",
        category: "IPS",
        unit: "indeks",
        source: "Rekap IPS Kanwil Kemenag Lampung",
        year: 2025,
        value: 3.1,
        trend: 0,
        status: "aktif",
      },
    ],
    rows,
    chartSeries: [
      { year: 2023, "Bimas Islam": 72.8, "SPAK": 80.1, "Layanan Publik": 87.4, IPS: 0 },
      { year: 2024, "Bimas Islam": 75.6, "SPAK": 82.3, "Layanan Publik": 92.4, IPS: 0 },
      { year: 2025, "Bimas Islam": 78.9, "SPAK": 86.5, "Layanan Publik": 92.1, IPS: 3.1 },
      { year: 2026, "Bimas Islam": 91.5, "SPAK": 94.8, "Layanan Publik": 96.4 },
    ],
    executiveSchedules: [
      {
        id: 1,
        date: "Senin, 18 Mei 2026",
        time: "08.00 WIB",
        title: "Apel dan arahan layanan publik Kanwil",
        unit: "Kakanwil, Bagian Tata Usaha, PTSP",
        location: "Kanwil Kemenag Provinsi Lampung",
        priority: "utama",
        status: "berjalan",
      },
      {
        id: 2,
        date: "Senin, 18 Mei 2026",
        time: "10.00 WIB",
        title: "Rapat koordinasi validasi statistik keagamaan",
        unit: "Perencana, data sektoral, bidang teknis",
        location: "Aula Kanwil Kemenag Lampung",
        priority: "-",
        status: "terjadwal",
      },
      {
        id: 3,
        date: "Selasa, 19 Mei 2026",
        time: "09.30 WIB",
        title: "Monitoring layanan Kankemenag Kota Bandar Lampung",
        unit: "Tim Kanwil dan Kankemenag Kota Bandar Lampung",
        location: "Jalan P. Emir Moh. Noer No.81, Telukbetung Selatan",
        priority: "-",
        status: "selesai",
      },
      {
        id: 4,
        date: "Rabu, 20 Mei 2026",
        time: "13.30 WIB",
        title: "Monitoring layanan Kankemenag Kota Metro",
        unit: "Tim Kanwil dan Kankemenag Kota Metro",
        location: "Jalan Ki. Arsyad No. 6 Kota Metro",
        priority: "utama",
        status: "terjadwal",
      },
    ],
    awardCollections: [
      {
        id: "capaian-kanwil",
        title: "Koleksi Penghargaan Capaian Kanwil",
        description:
          "Dokumentasi capaian kinerja Kanwil Kementerian Agama Provinsi Lampung sebagai apresiasi atas layanan dan tata kelola.",
        items: [
          {
            id: 1,
            title: "Kinerja Realisasi Anggaran",
            description: "Piagam penghargaan capaian Kanwil untuk kinerja realisasi anggaran.",
            year: 2026,
            imageUrl: "/awards/capaian-kanwil.webp",
            alt: "Piagam penghargaan capaian Kanwil Kementerian Agama Provinsi Lampung",
          },
        ],
      },
      {
        id: "ppid",
        title: "Koleksi Penghargaan PPID",
        description:
          "PPID adalah Pejabat Pengelola Informasi dan Dokumentasi, kanal pengelolaan informasi publik dan dokumentasi resmi.",
        items: [
          {
            id: 1,
            title: "Kualifikasi Informatif",
            description: "Sertifikat penghargaan PPID Kanwil Kemenag Provinsi Lampung.",
            year: 2025,
            imageUrl: "/awards/ppid-2025-1.jpeg",
            alt: "Sertifikat penghargaan PPID Kanwil Kemenag Provinsi Lampung",
          },
          {
            id: 2,
            title: "PPID Unit Berkinerja Terbaik",
            description: "Piagam penghargaan PPID Unit Kanwil berkinerja terbaik.",
            year: 2025,
            imageUrl: "/awards/ppid-2025-2.jpeg",
            alt: "Piagam penghargaan PPID Unit Kanwil Kemenag Lampung berkinerja terbaik",
          },
          {
            id: 3,
            title: "Apresiasi Keterbukaan Informasi",
            description: "Dokumentasi penghargaan keterbukaan informasi Kanwil Lampung.",
            year: 2025,
            imageUrl: "/awards/ppid-2025-3.jpeg",
            alt: "Dokumentasi penghargaan keterbukaan informasi PPID Kanwil Lampung",
          },
        ],
      },
    ],
    publications: [
      {
        id: 1,
        title: "Buku Statistik Kemenag Provinsi Lampung 2026",
        description: "Rujukan data kelembagaan, alamat satuan kerja, dan indikator layanan keagamaan wilayah Lampung.",
        date: "2026",
        category: "Statistik",
        fileLabel: "Flipbook",
      },
      {
        id: 2,
        title: "Laporan Kinerja Kanwil Kemenag Lampung",
        description: "Ringkasan capaian program, tindak lanjut layanan publik, dan akuntabilitas kinerja satuan kerja.",
        date: "Mei 2026",
        category: "Laporan",
        fileLabel: "PDF",
      },
      {
        id: 3,
        title: "Informasi PPID dan Layanan Publik",
        description: "Materi informasi terbuka untuk masyarakat, mitra lembaga, dan pemangku kepentingan wilayah Lampung.",
        date: "Mei 2026",
        category: "PPID",
        fileLabel: "Web",
      },
    ],
    datasets: datasetCatalogs,
    datasetDetails: [],
    releaseSchedules: releaseScheduleSeed,
    officeLocations: officeLocationSeed,
    activities: [
      {
        id: 1,
        title: "Apel dan pembinaan ASN Kanwil",
        caption: "Agenda pimpinan untuk menjaga disiplin layanan dan kualitas informasi publik Kemenag Lampung.",
        imageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: 2,
        title: "Koordinasi data statistik keagamaan",
        caption: "Sinkronisasi data madrasah, KUA, dan layanan publik untuk dashboard Kanwil.",
        imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
      },
      {
        id: 3,
        title: "Pelayanan terpadu masyarakat",
        caption: "Dokumentasi layanan konsultasi dan administrasi keagamaan melalui kanal resmi Kanwil.",
        imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    videos: [
      {
        id: 1,
        title: "Kanal Informasi Kanwil Kemenag Lampung",
        description: "Ruang video untuk profil layanan, pengumuman resmi, dan dokumentasi kegiatan Kanwil.",
        embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      },
    ],
    latestNews: [],
    contact: {
      institution: "Kanwil Kementerian Agama Provinsi Lampung",
      address: "Jl. Cut Mutia No. 27, Teluk Betung Utara, Bandar Lampung",
      phone: "0721-481533",
      whatsapp: "6282164502474",
      email: "kanwillampung@kemenag.go.id",
      instagram: "@kemenag_lampung",
      youtube: "Kanwil Kemenag Provinsi Lampung",
      website: "lampung.kemenag.go.id",
      mapEmbedUrl: "https://www.google.com/maps?q=Kanwil%20Kementerian%20Agama%20Provinsi%20Lampung&output=embed",
    },
    filters: {
      years: ["Semua Tahun", "2026", "2025", "2024", "2023"],
      categories: ["Semua Kategori", "Pendidikan Madrasah", "Bimas Islam", "SPAK", "Layanan Publik", "IPS"],
      regions: ["Semua Wilayah", "Kanwil Lampung", ...lampungKabupatenKota],
    },
};

let seedPromise: Promise<void> | null = null;
let manualEducationCleanupPromise: Promise<void> | null = null;

export async function getDashboardData(): Promise<DashboardData> {
  await ensureDashboardSeeded();
  await ensureManualEducationDataRemoved();
  const [
    indicators,
    rows,
    rawChartSeries,
    executiveSchedules,
    rawAwardCollections,
    rawAwardItems,
    publications,
    datasets,
    releaseSchedules,
    officeLocations,
    activities,
    videos,
    contactRows,
    filterRows,
  ] = await Promise.all([
    db.select().from(indicatorsTable).orderBy(asc(indicatorsTable.id)),
    db.select().from(dashboardRowsTable).orderBy(asc(dashboardRowsTable.id)),
    db
      .select()
      .from(chartSeriesTable)
      .orderBy(asc(chartSeriesTable.year), asc(chartSeriesTable.category)),
    db
      .select()
      .from(executiveSchedulesTable)
      .orderBy(asc(executiveSchedulesTable.id)),
    db
      .select()
      .from(awardCollectionsTable)
      .orderBy(asc(awardCollectionsTable.sortOrder)),
    db
      .select()
      .from(awardItemsTable)
      .orderBy(asc(awardItemsTable.collectionId), asc(awardItemsTable.sortOrder)),
    db.select().from(publicationsTable).orderBy(asc(publicationsTable.id)),
    db.select().from(datasetsTable).orderBy(asc(datasetsTable.id)),
    db.select().from(releaseSchedulesTable).orderBy(asc(releaseSchedulesTable.id)),
    db.select().from(officeLocationsTable).orderBy(asc(officeLocationsTable.id)),
    db.select().from(activitiesTable).orderBy(asc(activitiesTable.id)),
    db.select().from(videosTable).orderBy(asc(videosTable.id)),
    db.select().from(contactInfoTable).limit(1),
    db.select().from(filtersTable).orderBy(asc(filtersTable.sortOrder)),
  ]);

  const normalizedRows = normalizeDashboardRows(rows);
  const chartSeries = mergeIpsChartSeries(
    removeManualEducationChartSeries(toChartPoints(rawChartSeries)),
    normalizedRows,
  );
  const normalizedVideos = videos.map((video) => ({
    ...video,
    embedUrl: normalizeYouTubeEmbedUrl(video.embedUrl),
  }));
  const awardCollections = rawAwardCollections.map((collection) => ({
    id: collection.id,
    title: collection.title,
    description: collection.description,
    items: rawAwardItems
      .filter((item) => item.collectionId === collection.id)
      .map((item) => ({
        id: item.itemId,
        title: item.title,
        description: item.description,
        year: item.year,
        imageUrl: item.imageUrl,
        alt: item.alt,
      })),
  }));

  const filters = {
    years: filterRows
      .filter((filter) => filter.kind === "year")
      .map((filter) => filter.value),
    categories: filterRows
      .filter((filter) => filter.kind === "category")
      .map((filter) => filter.value),
    regions: filterRows
      .filter((filter) => filter.kind === "region")
      .map((filter) => filter.value),
  };

  const contact = contactRows[0]
    ? {
        institution: contactRows[0].institution,
        address: contactRows[0].address,
        phone: contactRows[0].phone,
        whatsapp: contactRows[0].whatsapp,
        email: contactRows[0].email,
        instagram: contactRows[0].instagram,
        youtube: contactRows[0].youtube,
        website: contactRows[0].website,
        mapEmbedUrl: contactRows[0].mapEmbedUrl,
      }
    : seedDashboardData.contact;
  const liveExecutiveSchedules = await getSimandaExecutiveSchedules(executiveSchedules);
  const latestNews = await getLampungLatestNews();
  const portalDatasets = getPortalDatasets(datasets);
  const datasetDetails = syncIpsDatasetDetails(
    getDatasetDetails(portalDatasets),
    normalizedRows,
  );
  const normalizedIndicators = applyEducationMadrasahIndicators(
    applyDerivedIpsIndicator(indicators, normalizedRows),
    datasetDetails,
  );

  return {
    indicators: normalizedIndicators,
    rows: normalizedRows,
    chartSeries,
    executiveSchedules: liveExecutiveSchedules,
    awardCollections,
    publications,
    datasets: portalDatasets,
    datasetDetails,
    releaseSchedules,
    officeLocations,
    activities,
    videos: normalizedVideos,
    latestNews,
    contact,
    filters: {
      years: filters.years.length ? filters.years : seedDashboardData.filters.years,
      categories: filters.categories.length
        ? filters.categories
        : seedDashboardData.filters.categories,
      regions: filters.regions.length ? filters.regions : seedDashboardData.filters.regions,
    },
  };
}

const portalDatasetFallbacks = [
  {
    match: /tata\s*kelola|manajemen/i,
    module: "Tata Kelola dan Manajemen",
    excelUrl: "/uploads/datasets/tata-kelola-manajemen-2026.xlsx",
    defaultYear: 2025,
  },
  {
    match: /pelayanan|bimas|agama dan keagamaan/i,
    module: "Pelayanan Keagamaan",
    excelUrl: "/uploads/datasets/pelayanan-keagamaan-2026.xlsx",
    defaultYear: 2025,
  },
  {
    match: /pendidikan|madrasah/i,
    module: "Pendidikan Agama Islam",
    excelUrl: "/uploads/datasets/pendidikan-agama-islam-2026.xlsx",
    defaultYear: 2025,
  },
  {
    match: /ips|indeks pembangunan statistik/i,
    module: "Indeks Pembangunan Statistik (IPS)",
    excelUrl: "/uploads/datasets/ips-2025.xlsx",
    defaultYear: 2025,
  },
];

function getPortalDatasets(datasets: DataCatalog[]) {
  const normalized = datasets
    .map((dataset) => normalizePortalDataset(dataset))
    .filter((dataset): dataset is DataCatalog => Boolean(dataset));
  const existingModules = new Set(normalized.map((dataset) => datasetModule(dataset)));
  const missingFallbacks = datasetCatalogs
    .map((dataset) => normalizePortalDataset(dataset, true))
    .filter((dataset): dataset is DataCatalog => Boolean(dataset))
    .filter((dataset) => !existingModules.has(datasetModule(dataset)));

  return [...normalized, ...missingFallbacks];
}

function normalizePortalDataset(dataset: DataCatalog, useFallbackYear = false) {
  const haystack = `${dataset.title} ${dataset.category} ${dataset.producer}`;
  if (/referensi|kip|buddha/i.test(haystack)) return null;

  const fallback = portalDatasetFallbacks.find((item) => item.match.test(haystack));
  if (!fallback) return null;

  const excelUrl = hasPublicFile(dataset.excelUrl) ? dataset.excelUrl : fallback.excelUrl;
  if (!hasPublicFile(excelUrl)) return null;
  const dataYear = useFallbackYear
    ? fallback.defaultYear
    : normalizeDatasetYear(dataset.year, fallback.defaultYear);

  return {
    ...dataset,
    title: normalizeDatasetTitleYear(dataset.title, dataYear),
    category: fallback.module,
    year: dataYear,
    excelUrl,
    metadata: (dataset.metadata || `Sumber: ${dataset.producer}. Referensi waktu: ${dataYear}.`).replace(
      /Referensi waktu:\s*20\d{2}/i,
      `Referensi waktu: ${dataYear}`,
    ),
  } satisfies DataCatalog;
}

function normalizeDatasetYear(year: number, fallbackYear: number) {
  return Number.isFinite(year) && year >= 1900 && year <= 2200
    ? Math.trunc(year)
    : fallbackYear;
}

function normalizeDatasetTitleYear(title: string, year: number) {
  return title.replace(/\b20\d{2}\b/g, String(year));
}

function hasPublicFile(publicPath: string) {
  if (!publicPath) return false;
  return existsSync(path.join(process.cwd(), "public", publicPath.replace(/^\//, "")));
}

function getDatasetDetails(datasets: DataCatalog[]): DatasetDetail[] {
  const signature = datasets
    .map((dataset) => {
      const filePath = path.join(process.cwd(), "public", dataset.excelUrl.replace(/^\//, ""));
      const fileStat = existsSync(filePath) ? statSync(filePath) : null;
      const fileSignature = fileStat ? `${fileStat.mtimeMs}:${fileStat.size}` : "missing";

      return `${dataset.id}:${dataset.title}:${dataset.category}:${dataset.year}:${dataset.excelUrl}:${fileSignature}`;
    })
    .join("|");

  if (datasetDetailsCache?.signature === signature) {
    return datasetDetailsCache.details;
  }

  const details = datasets.flatMap((dataset) => parseDatasetWorkbook(dataset));

  datasetDetailsCache = {
    signature,
    details,
  };

  return details;
}

function parseDatasetWorkbook(dataset: DataCatalog): DatasetDetail[] {
  if (!dataset.excelUrl) return [];

  const filePath = path.join(process.cwd(), "public", dataset.excelUrl.replace(/^\//, ""));

  if (!existsSync(filePath)) return [];

  try {
    const workbook = XLSX.read(readFileSync(filePath), {
      cellDates: false,
      type: "buffer",
    });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<(string | number)[]>(worksheet, {
      header: 1,
      defval: "",
      raw: true,
    });
    const titleIndexes = rows
      .map((row, index) => ({
        index,
        title: String(firstFilledCell(row)).trim(),
      }))
      .filter((row) => /^Table\s+\d+/i.test(row.title));

    return titleIndexes
      .map((entry, entryIndex) => {
        const endIndex = titleIndexes[entryIndex + 1]?.index ?? rows.length;
        const tableRows = rows.slice(entry.index + 1, endIndex);
        const headerOffset = tableRows.findIndex((row) => countFilledCells(row) > 1);

        if (headerOffset < 0) return null;

        const headers = trimTrailingEmptyCells(tableRows[headerOffset]).map((cell) =>
          String(cell).trim(),
        );
        const bodyRows = tableRows
          .slice(headerOffset + 1)
          .map((row) => trimTrailingEmptyCells(row).slice(0, headers.length))
          .filter((row) => countFilledCells(row) > 1);
        const tableNumber = entry.title.match(/^Table\s+([^\s]+)/i)?.[1] ?? `${dataset.id}.${entryIndex + 1}`;
        const cleanTitle = entry.title.replace(/^Table\s+[^\s]+\s*/i, "").trim();

        return {
          id: `${dataset.id}-${tableNumber.replaceAll(".", "-")}`,
          datasetId: dataset.id,
          tableNumber,
          title: cleanTitle || entry.title,
          module: datasetModule(dataset),
          category: dataset.category,
          year: detectYear(entry.title, dataset.year),
          producer: dataset.producer,
          description: `Data ${cleanTitle.toLowerCase()} disusun dari ${dataset.title}.`,
          headers,
          rows: bodyRows,
          chartData: buildDatasetChartData(headers, bodyRows),
          standardData: buildStandardDataDescription(headers, dataset),
          metadata: buildDatasetMetadata(dataset, cleanTitle),
        } satisfies DatasetDetail;
      })
      .filter((item): item is DatasetDetail => Boolean(item));
  } catch (error) {
    console.warn(`Failed to parse dataset workbook: ${dataset.excelUrl}`, error);

    return [];
  }
}

function datasetModule(dataset: DataCatalog) {
  if (/ips|indeks pembangunan statistik/i.test(`${dataset.category} ${dataset.title}`)) {
    return "Indeks Pembangunan Statistik (IPS)";
  }
  if (/tata kelola/i.test(dataset.category)) return "Tata Kelola";
  if (/pelayanan/i.test(dataset.category)) return "Agama dan Keagamaan";
  if (/pendidikan/i.test(dataset.category)) return "Pendidikan";
  return dataset.category;
}

function buildDatasetChartData(headers: string[], rows: (string | number)[][]) {
  const labelIndex = findHeaderIndex(headers, ["satuan kerja", "wilayah", "provinsi", "nama"]) ?? 1;
  const totalIndex =
    findHeaderIndex(headers, ["jumlah", "total"]) ??
    headers
      .map((_, index) => index)
      .reverse()
      .find((index) => rows.some((row) => toNumber(row[index]) !== null));

  if (totalIndex === undefined) return [];

  return rows
    .map((row) => {
      const label = String(row[labelIndex] ?? "").trim();
      const value = toNumber(row[totalIndex]);

      return {
        label: shortRegionLabel(label || "Data"),
        value: value ?? 0,
      };
    })
    .filter((row) => row.label && row.value > 0)
    .slice(0, 16);
}

function buildStandardDataDescription(headers: string[], dataset: DataCatalog) {
  const columns = headers.filter(Boolean).slice(0, 8).join(", ");

  return [
    `Kolom utama dataset: ${columns}.`,
    `Data mengikuti format ${dataset.format} dengan referensi waktu ${dataset.year}.`,
    "Setiap baris memuat satuan kerja atau wilayah, indikator, dan nilai sesuai tabel sumber.",
  ].join(";");
}

function buildDatasetMetadata(dataset: DataCatalog, title: string) {
  return [
    `Sumber: ${dataset.producer}.`,
    `Judul tabel: ${title || dataset.title}.`,
    `Cakupan: Provinsi Lampung dan satuan kerja kabupaten/kota.`,
    `Frekuensi penerbitan: ${dataset.frequency}.`,
    `Dapat diakses publik: Ya.`,
  ].join(";");
}

function detectYear(_title: string, fallback: number) {
  return fallback;
}

function findHeaderIndex(headers: string[], needles: string[]) {
  const index = headers.findIndex((header) =>
    needles.some((needle) => header.toLowerCase().includes(needle)),
  );

  return index >= 0 ? index : undefined;
}

function shortRegionLabel(label: string) {
  return label
    .replace(/^Kantor\s+Kemenag\s+(Kabupaten|Kota)\s+/i, "")
    .replace(/^Kanwil\s+Kemenag\s+Provinsi\s+/i, "Kanwil ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstFilledCell(row: (string | number)[]) {
  return row.find((cell) => String(cell).trim()) ?? "";
}

function countFilledCells(row: (string | number)[]) {
  return row.filter((cell) => String(cell).trim() !== "").length;
}

function trimTrailingEmptyCells(row: (string | number)[]) {
  const next = [...row];

  while (next.length && String(next[next.length - 1]).trim() === "") {
    next.pop();
  }

  return next;
}

function toNumber(value: string | number | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const normalized = String(value ?? "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

async function getSimandaExecutiveSchedules(
  fallbackSchedules: ExecutiveSchedule[],
): Promise<ExecutiveSchedule[]> {
  const now = Date.now();

  if (simandaAgendaCache && now - simandaAgendaCache.checkedAt < simandaAgendaCacheTtlMs) {
    return simandaAgendaCache.schedules;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(simandaAgendaUrl, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`SIMANDA agenda request failed: ${response.status}`);
    }

    const payload = (await response.json()) as unknown;
    const simandaAgendas = Array.isArray(payload) ? (payload as SimandaAgenda[]) : [];
    const signature = getSimandaAgendaSignature(simandaAgendas);

    if (simandaAgendaCache?.signature === signature) {
      simandaAgendaCache = {
        ...simandaAgendaCache,
        checkedAt: now,
      };

      return simandaAgendaCache.schedules;
    }

    const schedules = mapSimandaSchedules(simandaAgendas);

    if (!schedules.length) {
      return fallbackSchedules;
    }

    simandaAgendaCache = {
      checkedAt: now,
      signature,
      schedules,
    };

    return schedules;
  } catch {
    return simandaAgendaCache?.schedules ?? fallbackSchedules;
  }
}

async function getLampungLatestNews(): Promise<NewsItem[]> {
  const now = Date.now();

  if (lampungNewsCache && now - lampungNewsCache.checkedAt < lampungNewsCacheTtlMs) {
    return lampungNewsCache.news;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(lampungHomeApiUrl, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Lampung news API responded with ${response.status}`);
    }

    const payload = (await response.json()) as LampungNewsResponse;
    const news = mapLampungNews(payload.headlines ?? []);

    if (!news.length) {
      throw new Error("Lampung news API returned no headlines");
    }

    lampungNewsCache = {
      checkedAt: now,
      news,
    };

    return news;
  } catch (error) {
    console.warn("Failed to fetch Lampung latest news, keeping fallback data.", error);

    return lampungNewsCache?.news ?? [];
  }
}

function mapLampungNews(items: LampungNewsItem[]): NewsItem[] {
  return items
    .filter((item) => item.id && item.title && item.slug && item.image)
    .sort((a, b) => getNewsTimestamp(b.posted_at) - getNewsTimestamp(a.posted_at))
    .slice(0, 5)
    .map((item) => ({
      id: Number(item.id),
      title: normalizeText(item.title) || "Berita Kanwil Kemenag Lampung",
      category: normalizeText(item.name) || "Berita",
      date: formatNewsDate(item.posted_at),
      imageUrl: buildLampungNewsImageUrl(item.image),
      url: `${lampungNewsBaseUrl}/${item.slug}`,
    }));
}

function buildLampungNewsImageUrl(image?: string | null) {
  const normalizedImage = normalizeText(image);

  if (!normalizedImage) return `${lampungNewsImageBaseUrl}/2026_06_03_060220_Berita.jpeg`;
  if (normalizedImage.startsWith("http://") || normalizedImage.startsWith("https://")) {
    return normalizedImage;
  }

  return `${lampungNewsImageBaseUrl}/${encodeURI(normalizedImage)}`;
}

function getNewsTimestamp(date?: string | null) {
  if (!date) return 0;

  const timestamp = new Date(date.replace(" ", "T")).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function formatNewsDate(date?: string | null) {
  const timestamp = getNewsTimestamp(date);

  if (!timestamp) return "Tanggal belum tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: agendaTimeZone,
  }).format(new Date(timestamp));
}

function getSimandaAgendaSignature(agendas: SimandaAgenda[]) {
  return JSON.stringify(
    agendas.map((agenda) => ({
      id: agenda.id,
      nama_agenda: agenda.nama_agenda,
      tanggal_agenda: agenda.tanggal_agenda,
      jam_mulai: agenda.jam_mulai,
      jam_selesai: agenda.jam_selesai,
      tempat_agenda: agenda.tempat_agenda,
      kehadiran_text: agenda.kehadiran_text,
      is_done: agenda.is_done,
      jabatans: agenda.jabatans?.map((jabatan) => jabatan.nama_jabatan) ?? [],
    })),
  );
}

function mapSimandaSchedules(agendas: SimandaAgenda[]): ExecutiveSchedule[] {
  const validAgendas = agendas
    .filter((agenda) => agenda.id && agenda.nama_agenda && agenda.tanggal_agenda)
    .map((agenda) => ({
      agenda,
      startsAt: getAgendaTimestamp(agenda.tanggal_agenda, agenda.jam_mulai),
      isDone: agenda.is_done === 1 || agenda.is_done === true,
    }));
  const now = new Date();
  const upcoming = validAgendas
    .filter((item) => !item.isDone && item.startsAt >= now.getTime())
    .sort((a, b) => a.startsAt - b.startsAt);
  const historical = validAgendas
    .filter((item) => item.isDone || item.startsAt < now.getTime())
    .sort((a, b) => b.startsAt - a.startsAt);
  const selected = [...upcoming, ...historical].slice(0, 4);
  const primaryAgendaId = upcoming[0]?.agenda.id ?? selected[0]?.agenda.id;

  return selected.map(({ agenda }) => ({
    id: agenda.id,
    date: formatAgendaDate(agenda.tanggal_agenda),
    time: formatAgendaTime(agenda.jam_mulai, agenda.jam_selesai),
    title: normalizeText(agenda.nama_agenda) || "Agenda Pimpinan",
    unit: formatAttendance(agenda),
    location: normalizeText(agenda.tempat_agenda) || "Tempat belum ditentukan",
    priority: agenda.id === primaryAgendaId ? "utama" : "-",
    status: inferAgendaStatus(agenda),
  }));
}

function inferAgendaStatus(agenda: SimandaAgenda): ExecutiveSchedule["status"] {
  if (agenda.is_done === 1 || agenda.is_done === true) return "selesai";

  const startsAt = getAgendaTimestamp(agenda.tanggal_agenda, agenda.jam_mulai);
  const endsAt = getAgendaTimestamp(agenda.tanggal_agenda, agenda.jam_selesai);
  const now = new Date().getTime();
  const fallbackEndsAt = startsAt + 2 * 60 * 60 * 1000;

  if (startsAt <= now && now <= (endsAt || fallbackEndsAt)) return "berjalan";

  return "belum";
}

function formatAttendance(agenda: SimandaAgenda) {
  const attendanceText = normalizeText(agenda.kehadiran_text);

  if (attendanceText) return attendanceText;

  const positions =
    agenda.jabatans
      ?.map((position) => normalizeText(position.nama_jabatan))
      .filter(Boolean)
      .join(", ") ?? "";

  return positions ? `Hadir ${positions}` : "Kehadiran belum ditentukan";
}

function formatAgendaDate(date: SimandaAgenda["tanggal_agenda"]) {
  const parsedDate = parseAgendaDate(date);

  if (!parsedDate) return "Tanggal belum ditentukan";

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: agendaTimeZone,
  }).format(parsedDate);
}

function formatAgendaTime(
  start: SimandaAgenda["jam_mulai"],
  end: SimandaAgenda["jam_selesai"],
) {
  const formattedStart = formatClock(start);
  const formattedEnd = formatClock(end);

  if (formattedStart && formattedEnd) return `${formattedStart} - ${formattedEnd} WIB`;
  if (formattedStart) return `${formattedStart} WIB`;

  return "Jam belum ditentukan";
}

function getAgendaTimestamp(
  date: SimandaAgenda["tanggal_agenda"],
  time: SimandaAgenda["jam_mulai"],
) {
  const parsedDate = parseAgendaDate(date, time);

  return parsedDate?.getTime() ?? 0;
}

function parseAgendaDate(
  date: SimandaAgenda["tanggal_agenda"],
  time: SimandaAgenda["jam_mulai"] = "00:00:00",
) {
  if (!date) return null;

  const normalizedTime = time || "00:00:00";
  const parsedDate = new Date(`${date}T${normalizedTime}+07:00`);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function formatClock(time: SimandaAgenda["jam_mulai"]) {
  if (!time) return "";

  const [hours, minutes] = time.split(":");

  if (!hours || !minutes) return "";

  return `${hours.padStart(2, "0")}.${minutes.padStart(2, "0")}`;
}

function normalizeText(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function normalizeYouTubeEmbedUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");
    let videoId = "";

    if (hostname === "youtu.be") {
      videoId = parsedUrl.pathname.split("/").filter(Boolean)[0] ?? "";
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      const [firstPath, secondPath] = parsedUrl.pathname.split("/").filter(Boolean);

      if (firstPath === "watch") {
        videoId = parsedUrl.searchParams.get("v") ?? "";
      } else if (firstPath === "embed" || firstPath === "shorts" || firstPath === "live") {
        videoId = secondPath ?? "";
      }
    }

    if (!videoId) return url;

    const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
    const start = parsedUrl.searchParams.get("start") ?? parsedUrl.searchParams.get("t");

    if (start) {
      embedUrl.searchParams.set("start", start.replace(/s$/, ""));
    }

    return embedUrl.toString();
  } catch {
    return url;
  }
}

export async function replaceDashboardData(data: DashboardData) {
  await ensureDatabaseReady();
  await clearDashboardTables();
  await insertDashboardData(data);
}

async function ensureDashboardSeeded() {
  await ensureDatabaseReady();

  if (!seedPromise) {
    seedPromise = (async () => {
      const existing = await db.select().from(indicatorsTable).limit(1);

      if (!existing.length) {
        await insertDashboardData(seedDashboardData);
      } else {
        await ensureIpsDataPresent();
        await ensureDataPortalPresent();
      }
    })();
  }

  return seedPromise;
}

async function ensureDataPortalPresent() {
  const [existingDatasets, existingReleaseSchedules, existingOfficeLocations] =
    await Promise.all([
      db.select().from(datasetsTable),
      db.select().from(releaseSchedulesTable),
      db.select().from(officeLocationsTable),
    ]);

  if (!existingDatasets.length) {
    await db.insert(datasetsTable).values(seedDashboardData.datasets);
  }

  if (!existingReleaseSchedules.length) {
    await db.insert(releaseSchedulesTable).values(seedDashboardData.releaseSchedules);
  }

  if (!existingOfficeLocations.length) {
    await db.insert(officeLocationsTable).values(seedDashboardData.officeLocations);
  }
}

async function ensureIpsDataPresent() {
  const existingRows = await db.select().from(dashboardRowsTable);
  const hasIpsRows = existingRows.some((row) => row.category === "IPS");

  if (!hasIpsRows) {
    const maxRowId = existingRows.reduce((max, row) => Math.max(max, row.id), 0);
    await db.insert(dashboardRowsTable).values(
      ipsRows.map((row, index) => ({
        ...normalizeDashboardRow(row),
        id: maxRowId + index + 1,
      })),
    );
  } else {
    const rowsMissingCategory = existingRows.filter(
      (row) => row.category === "IPS" && !row.scoreCategory,
    );

    await Promise.all(
      rowsMissingCategory.map((row) =>
        db
          .update(dashboardRowsTable)
          .set({ scoreCategory: getIpsScoreCategory(row.value) })
          .where(eq(dashboardRowsTable.id, row.id)),
      ),
    );
  }

  const existingIndicators = await db.select().from(indicatorsTable);
  const hasIpsIndicator = existingIndicators.some(
    (indicator) => indicator.category === "IPS",
  );
  const latestIpsRows = getLatestIpsRows(
    (hasIpsRows ? existingRows : ipsRows).map(normalizeDashboardRow),
  );
  const ipsAverage = latestIpsRows.length
    ? Number(
        (
          latestIpsRows.reduce((total, row) => total + row.value, 0) /
          latestIpsRows.length
        ).toFixed(2),
      )
    : 3.1;
  const ipsYear = latestIpsRows[0]?.year ?? 2025;

  if (!hasIpsIndicator) {
    const maxIndicatorId = existingIndicators.reduce(
      (max, indicator) => Math.max(max, indicator.id),
      0,
    );

    await db.insert(indicatorsTable).values({
      id: maxIndicatorId + 1,
      name: "Indeks Pembangunan Statistik",
      description:
        "Rekap nilai IPS untuk 15 kabupaten/kota sebagai gambaran tingkat kematangan statistik sektoral.",
      category: "IPS",
      unit: "indeks",
      source: "Rekap IPS Kanwil Kemenag Lampung",
      year: ipsYear,
      value: ipsAverage,
      trend: 0,
      status: "aktif",
    });
  }

  const existingChartSeries = await db.select().from(chartSeriesTable);
  const hasIpsChart = existingChartSeries.some((item) => item.category === "IPS");

  if (!hasIpsChart) {
    await db.insert(chartSeriesTable).values({ year: 2025, category: "IPS", value: 3.1 });
  }

  const existingFilters = await db.select().from(filtersTable);
  const hasIpsFilter = existingFilters.some(
    (filter) => filter.kind === "category" && filter.value === "IPS",
  );

  if (!hasIpsFilter) {
    const maxCategorySortOrder = existingFilters
      .filter((filter) => filter.kind === "category")
      .reduce((max, filter) => Math.max(max, filter.sortOrder), 100);
    await db.insert(filtersTable).values({
      kind: "category",
      value: "IPS",
      sortOrder: maxCategorySortOrder + 1,
    });
  }

  const existingRegions = new Set(
    existingFilters
      .filter((filter) => filter.kind === "region")
      .map((filter) => filter.value),
  );
  const missingRegions = lampungKabupatenKota.filter(
    (region) => !existingRegions.has(region),
  );

  if (missingRegions.length) {
    const maxRegionSortOrder = existingFilters
      .filter((filter) => filter.kind === "region")
      .reduce((max, filter) => Math.max(max, filter.sortOrder), 200);
    await db.insert(filtersTable).values(
      missingRegions.map((value, index) => ({
        kind: "region" as const,
        value,
        sortOrder: maxRegionSortOrder + index + 1,
      })),
    );
  }
}

async function clearDashboardTables() {
  await db.delete(awardItemsTable);
  await db.delete(awardCollectionsTable);
  await db.delete(filtersTable);
  await db.delete(contactInfoTable);
  await db.delete(videosTable);
  await db.delete(activitiesTable);
  await db.delete(officeLocationsTable);
  await db.delete(releaseSchedulesTable);
  await db.delete(datasetsTable);
  await db.delete(publicationsTable);
  await db.delete(executiveSchedulesTable);
  await db.delete(chartSeriesTable);
  await db.delete(dashboardRowsTable);
  await db.delete(indicatorsTable);
}

async function insertDashboardData(data: DashboardData) {
  const indicators = (data.indicators ?? []).filter(
    (indicator) => !isEducationMadrasahCategory(indicator.category),
  );
  const rows = (data.rows ?? [])
    .map(normalizeDashboardRow)
    .filter((row) => !isEducationMadrasahCategory(row.category));
  const chartSeries = removeManualEducationChartSeries(data.chartSeries ?? []);
  const executiveSchedules = data.executiveSchedules ?? [];
  const awardCollections = data.awardCollections ?? [];
  const publications = data.publications ?? [];
  const datasets = data.datasets ?? [];
  const releaseSchedules = data.releaseSchedules ?? [];
  const officeLocations = data.officeLocations ?? [];
  const activities = data.activities ?? [];
  const videos = data.videos ?? [];
  const contact = data.contact ?? seedDashboardData.contact;
  const filters = data.filters ?? seedDashboardData.filters;

  if (indicators.length) {
    await db.insert(indicatorsTable).values(indicators);
  }

  if (rows.length) {
    await db.insert(dashboardRowsTable).values(rows);
  }

  const chartValues = chartSeries.flatMap((point) =>
    Object.entries(point)
      .filter(([category]) => category !== "year")
      .map(([category, value]) => ({
      year: point.year,
      category,
      value: Number(value) || 0,
    })),
  );

  if (chartValues.length) {
    await db.insert(chartSeriesTable).values(chartValues);
  }

  if (executiveSchedules.length) {
    await db.insert(executiveSchedulesTable).values(executiveSchedules);
  }

  if (awardCollections.length) {
    await db.insert(awardCollectionsTable).values(
      awardCollections.map((collection, index) => ({
        id: collection.id,
        title: collection.title,
        description: collection.description,
        sortOrder: index,
      })),
    );

    const awardValues = awardCollections.flatMap((collection, collectionIndex) =>
      collection.items.map((item, itemIndex) => ({
        collectionId: collection.id,
        itemId: item.id,
        title: item.title,
        description: item.description,
        year: item.year,
        imageUrl: item.imageUrl,
        alt: item.alt,
        sortOrder: collectionIndex * 100 + itemIndex,
      })),
    );

    if (awardValues.length) {
      await db.insert(awardItemsTable).values(awardValues);
    }
  }

  if (publications.length) {
    await db.insert(publicationsTable).values(publications);
  }

  if (datasets.length) {
    await db.insert(datasetsTable).values(datasets);
  }

  if (releaseSchedules.length) {
    await db.insert(releaseSchedulesTable).values(releaseSchedules);
  }

  if (officeLocations.length) {
    await db.insert(officeLocationsTable).values(officeLocations);
  }

  if (activities.length) {
    await db.insert(activitiesTable).values(activities);
  }

  if (videos.length) {
    await db.insert(videosTable).values(videos);
  }

  await db.insert(contactInfoTable).values({ id: 1, ...contact });

  const filterValues = [
    ...filters.years.map((value, index) => ({
      kind: "year" as const,
      value,
      sortOrder: index,
    })),
    ...filters.categories.map((value, index) => ({
      kind: "category" as const,
      value,
      sortOrder: 100 + index,
    })),
    ...filters.regions.map((value, index) => ({
      kind: "region" as const,
      value,
      sortOrder: 200 + index,
    })),
  ];

  if (filterValues.length) {
    await db.insert(filtersTable).values(filterValues);
  }
}

async function ensureManualEducationDataRemoved() {
  if (!manualEducationCleanupPromise) {
    manualEducationCleanupPromise = (async () => {
      await db
        .delete(dashboardRowsTable)
        .where(eq(dashboardRowsTable.category, educationMadrasahCategory));
      await db
        .delete(indicatorsTable)
        .where(eq(indicatorsTable.category, educationMadrasahCategory));
      await db
        .delete(chartSeriesTable)
        .where(eq(chartSeriesTable.category, educationMadrasahCategory));
    })();
  }

  return manualEducationCleanupPromise;
}

function toChartPoints(
  rawChartSeries: {
    year: number;
    category: string;
    value: number;
  }[],
): ChartPoint[] {
  const grouped = new Map<number, ChartPoint>();

  for (const item of rawChartSeries) {
    const point = grouped.get(item.year) ?? ({ year: item.year } as ChartPoint);
    point[item.category] = item.value;
    grouped.set(item.year, point);
  }

  return Array.from(grouped.values()).sort((a, b) => a.year - b.year);
}

function normalizeDashboardRows(sourceRows: DashboardRow[]) {
  const normalizedRows = sourceRows.map(normalizeDashboardRow);
  const sourceIpsRows = normalizedRows.filter((row) => row.category === "IPS");
  const manualRows = normalizedRows.filter(
    (row) => row.category !== "IPS" && !isEducationMadrasahCategory(row.category),
  );

  return [
    ...manualRows,
    ...(sourceIpsRows.length ? sourceIpsRows : ipsRows.map(normalizeDashboardRow)),
  ];
}

function normalizeDashboardRow(row: DashboardRow): DashboardRow {
  const scoreCategory =
    row.scoreCategory?.trim() ||
    (row.category === "IPS" ? getIpsScoreCategory(row.value) : "");

  return {
    ...row,
    scoreCategory,
  };
}

function applyDerivedIpsIndicator(indicators: Indicator[], sourceRows: DashboardRow[]) {
  const ipsRowsForLatestYear = getLatestIpsRows(sourceRows);

  if (!ipsRowsForLatestYear.length) return indicators;

  const existingIndicator = indicators.find((indicator) => indicator.category === "IPS");
  const average =
    ipsRowsForLatestYear.reduce((total, row) => total + row.value, 0) /
    ipsRowsForLatestYear.length;
  const year = ipsRowsForLatestYear[0]?.year ?? existingIndicator?.year ?? 2025;
  const nextIndicator: Indicator = {
    id:
      existingIndicator?.id ??
      Math.max(0, ...indicators.map((indicator) => indicator.id)) + 1,
    name: existingIndicator?.name ?? "Indeks Pembangunan Statistik",
    description:
      existingIndicator?.description ??
      "Rekap nilai IPS kabupaten/kota sebagai gambaran tingkat kematangan statistik sektoral.",
    category: "IPS",
    unit: existingIndicator?.unit ?? ipsRowsForLatestYear[0]?.unit ?? "indeks",
    source:
      ipsRowsForLatestYear[0]?.source ??
      existingIndicator?.source ??
      "Rekap IPS Kanwil Kemenag Lampung",
    year,
    value: Number(average.toFixed(2)),
    trend: existingIndicator?.trend ?? 0,
    status: existingIndicator?.status ?? "aktif",
  };

  return [
    ...indicators.filter((indicator) => indicator.category !== "IPS"),
    nextIndicator,
  ].sort((a, b) => a.id - b.id);
}

function applyEducationMadrasahIndicators(
  indicators: Indicator[],
  details: DatasetDetail[],
) {
  const manualIndicators = indicators.filter(
    (indicator) => !isEducationMadrasahCategory(indicator.category),
  );
  const nextId = Math.max(0, ...manualIndicators.map((indicator) => indicator.id)) + 1;
  const metrics = deriveEducationMadrasahMetrics(details, nextId);

  if (!metrics) return manualIndicators;

  const insertAfterIndex = manualIndicators.findIndex(
    (indicator) => indicator.category === "Layanan Publik",
  );
  const nextIndicators = [...manualIndicators];
  const insertAt = insertAfterIndex >= 0 ? insertAfterIndex + 1 : nextIndicators.length;

  nextIndicators.splice(insertAt, 0, ...metrics);

  return nextIndicators;
}

function deriveEducationMadrasahMetrics(
  details: DatasetDetail[],
  firstIndicatorId: number,
): Indicator[] | null {
  const educationDetails = details.filter((detail) =>
    /pendidikan agama islam|pendidikan madrasah/i.test(
      `${detail.category} ${detail.producer}`,
    ),
  );

  if (!educationDetails.length) return null;

  const accreditationTables = findDetailsByTableNumbers(educationDetails, [
    "4.8",
    "4.9",
    "4.10",
    "4.11",
  ]);
  const qualificationTables = findDetailsByTableNumbers(educationDetails, [
    "4.14",
    "4.17",
    "4.20",
    "4.23",
  ]);
  const certificationTables = findDetailsByTableNumbers(educationDetails, [
    "4.15",
    "4.18",
    "4.21",
    "4.24",
  ]);
  const studentTables = findDetailsByTableNumbers(educationDetails, [
    "4.25",
    "4.26",
    "4.33",
    "4.40",
  ]);

  const accredited = sumTotalColumns(accreditationTables, ["A", "B", "C"]);
  const totalMadrasah = sumTotalColumns(accreditationTables, ["Jumlah"]);
  const certifiedTeachers = sumTotalColumns(certificationTables, ["Sudah"]);
  const teacherTotal = sumTotalColumns(qualificationTables, ["Jumlah"]);
  const qualifiedTeachers = sumTotalColumns(qualificationTables, ["S1", "S2"]);
  const studentTotal = sumTotalColumns(studentTables, ["Jumlah"]);

  if (!totalMadrasah || !teacherTotal || !studentTotal) return null;

  const year = getLatestDatasetYear(educationDetails);
  const source = getEducationMadrasahSource(educationDetails);

  return [
    {
      id: firstIndicatorId,
      name: "Akreditasi madrasah",
      description:
        "Persentase madrasah terakreditasi A, B, dan C dari total madrasah RA/MI/MTs/MA.",
      category: educationMadrasahCategory,
      unit: "persen",
      source,
      year,
      value: percentage(accredited, totalMadrasah),
      trend: 0,
      status: "aktif",
    },
    {
      id: firstIndicatorId + 1,
      name: "Guru bersertifikat",
      description:
        "Persentase guru madrasah yang sudah memiliki sertifikasi pendidik.",
      category: educationMadrasahCategory,
      unit: "persen",
      source,
      year,
      value: percentage(certifiedTeachers, teacherTotal),
      trend: 0,
      status: "aktif",
    },
    {
      id: firstIndicatorId + 2,
      name: "Kualifikasi guru",
      description:
        "Persentase guru madrasah berkualifikasi S1 dan S2 dari total guru.",
      category: educationMadrasahCategory,
      unit: "persen",
      source,
      year,
      value: percentage(qualifiedTeachers, teacherTotal),
      trend: 0,
      status: "aktif",
    },
    {
      id: firstIndicatorId + 3,
      name: "Rasio guru-siswa",
      description:
        "Rasio rata-rata jumlah siswa yang dilayani oleh satu guru madrasah.",
      category: educationMadrasahCategory,
      unit: "rasio",
      source,
      year,
      value: Number((studentTotal / teacherTotal).toFixed(2)),
      trend: 0,
      status: "aktif",
    },
  ];
}

function findDetailsByTableNumbers(details: DatasetDetail[], tableNumbers: string[]) {
  const selected = details.filter((detail) => tableNumbers.includes(detail.tableNumber));

  if (selected.length) return selected;

  return details.filter((detail) =>
    tableNumbers.some((tableNumber) => detail.id.endsWith(tableNumber.replaceAll(".", "-"))),
  );
}

function sumTotalColumns(details: DatasetDetail[], headerNames: string[]) {
  return details.reduce((total, detail) => {
    const totalRow = findTotalRow(detail.rows);

    if (!totalRow) return total;

    return (
      total +
      headerNames.reduce((columnTotal, headerName) => {
        const columnIndex = findExactHeaderIndex(detail.headers, headerName);
        const value =
          columnIndex === undefined ? null : toNumber(totalRow[columnIndex]);

        return columnTotal + (value ?? 0);
      }, 0)
    );
  }, 0);
}

function findTotalRow(rows: (string | number)[][]) {
  return (
    rows.find((row) =>
      row.some((cell) => ["jumlah", "total"].includes(String(cell).trim().toLowerCase())),
    ) ?? rows.at(-1)
  );
}

function findExactHeaderIndex(headers: string[], headerName: string) {
  const normalizedName = normalizeHeaderName(headerName);
  const index = headers.findIndex(
    (header) => normalizeHeaderName(header) === normalizedName,
  );

  return index >= 0 ? index : undefined;
}

function normalizeHeaderName(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function percentage(numerator: number, denominator: number) {
  return denominator ? Number(((numerator / denominator) * 100).toFixed(2)) : 0;
}

function getLatestDatasetYear(details: DatasetDetail[]) {
  const years = details
    .map((detail) => detail.year)
    .filter((year) => Number.isFinite(year));

  return years.length ? Math.max(...years) : 2026;
}

function getEducationMadrasahSource(details: DatasetDetail[]) {
  const producer = details.find((detail) => detail.producer)?.producer;

  return producer || "Dataset Pendidikan Agama Islam Kanwil Kemenag Lampung";
}

function isEducationMadrasahCategory(category: string) {
  return category === educationMadrasahCategory;
}

function removeManualEducationChartSeries(chartSeries: ChartPoint[]) {
  return chartSeries.map((chartPoint) => {
    const point = { ...chartPoint };

    delete point[educationMadrasahCategory];

    return point;
  });
}

function getLatestIpsRows(sourceRows: DashboardRow[]) {
  const rows = sourceRows.filter(
    (row) => row.category === "IPS" && Number.isFinite(row.value),
  );

  if (!rows.length) return [];

  const latestYear = Math.max(...rows.map((row) => row.year));
  return rows.filter((row) => row.year === latestYear);
}

function syncIpsDatasetDetails(details: DatasetDetail[], sourceRows: DashboardRow[]) {
  const latestIpsRows = getLatestIpsRows(sourceRows).map(normalizeDashboardRow);

  if (!latestIpsRows.length) return details;

  const latestYear = latestIpsRows[0]?.year ?? 2025;
  const ipsTableRows = latestIpsRows.map((row, index) => [
    index + 1,
    formatIpsWorkUnit(row.region),
    row.value,
    row.scoreCategory || getIpsScoreCategory(row.value) || "-",
    row.year,
  ]);

  return details.map((detail) => {
    if (!isIpsDatasetDetail(detail)) return detail;

    return {
      ...detail,
      year: latestYear,
      headers: ["No", "Satuan Kerja", "Nilai", "Kategori", "Tahun"],
      rows: ipsTableRows,
      chartData: latestIpsRows.map((row) => ({
        label: row.region,
        value: row.value,
      })),
    };
  });
}

function isIpsDatasetDetail(detail: DatasetDetail) {
  return /ips|indeks pembangunan statistik/i.test(
    `${detail.module} ${detail.category} ${detail.title}`,
  );
}

function mergeIpsChartSeries(chartSeries: ChartPoint[], sourceRows: DashboardRow[]) {
  const withoutStaleIps = chartSeries.map((point) => {
    const cleanPoint = { ...point } as ChartPoint;
    delete cleanPoint.IPS;
    return cleanPoint;
  });
  const latestIpsRows = getLatestIpsRows(sourceRows);
  const ipsValues = latestIpsRows.map((row) => row.value);

  if (!ipsValues.length) return withoutStaleIps;

  const ipsAverage =
    ipsValues.reduce((total, value) => total + value, 0) / ipsValues.length;
  const chartByYear = new Map<number, ChartPoint>(
    withoutStaleIps.map((point) => [point.year, point]),
  );
  const latestYear = latestIpsRows[0]?.year ?? 2025;
  const ipsPoint = chartByYear.get(latestYear) ?? ({ year: latestYear } as ChartPoint);
  ipsPoint.IPS = Number(ipsAverage.toFixed(2));
  chartByYear.set(latestYear, ipsPoint);

  return Array.from(chartByYear.values()).sort((a, b) => a.year - b.year);
}
