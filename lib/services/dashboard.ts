import { asc } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { ensureDatabaseReady } from "@/lib/db/migrate";
import {
  activities as activitiesTable,
  awardCollections as awardCollectionsTable,
  awardItems as awardItemsTable,
  chartSeries as chartSeriesTable,
  contactInfo as contactInfoTable,
  dashboardRows as dashboardRowsTable,
  executiveSchedules as executiveSchedulesTable,
  filters as filtersTable,
  indicators as indicatorsTable,
  publications as publicationsTable,
  videos as videosTable,
} from "@/lib/db/schema";
import type { ChartPoint, DashboardData, DashboardRow } from "@/lib/types";

const rows: DashboardRow[] = [
  { id: 1, indicator: "Layanan PTSP selesai tepat waktu", category: "Layanan Publik", region: "Bandar Lampung", period: "Triwulan", year: 2026, value: 96.4, unit: "persen", source: "PTSP Kanwil Kemenag Lampung" },
  { id: 2, indicator: "Madrasah terakreditasi A/B", category: "Pendidikan Madrasah", region: "Lampung Tengah", period: "Tahunan", year: 2026, value: 88.2, unit: "persen", source: "Bidang Pendidikan Madrasah" },
  { id: 3, indicator: "KUA dengan layanan digital aktif", category: "Bimas Islam", region: "Lampung Selatan", period: "Semester", year: 2026, value: 91.5, unit: "persen", source: "Bidang Bimas Islam" },
  { id: 4, indicator: "Dokumen Laporan SPAK", category: "SPAK", region: "Kanwil Lampung", period: "Tahunan", year: 2026, value: 94.8, unit: "persen", source: "Bidang Ortala" },
  { id: 5, indicator: "Layanan pengaduan ditindaklanjuti", category: "Layanan Publik", region: "Pringsewu", period: "Triwulan", year: 2025, value: 92.1, unit: "persen", source: "Subbag Umum dan Humas" },
  { id: 6, indicator: "Guru madrasah mengikuti pembinaan", category: "Pendidikan Madrasah", region: "Pesawaran", period: "Semester", year: 2025, value: 84.7, unit: "persen", source: "Bidang Pendidikan Madrasah" },
  { id: 7, indicator: "Bimbingan keluarga sakinah terlaksana", category: "Bimas Islam", region: "Tulang Bawang Barat", period: "Tahunan", year: 2025, value: 78.9, unit: "persen", source: "Bidang Bimas Islam" },
  { id: 8, indicator: "Dokumen Laporan SPAK", category: "SPAK", region: "Kanwil Lampung", period: "Tahunan", year: 2025, value: 86.5, unit: "persen", source: "Bidang Ortala" },
  { id: 9, indicator: "Kunjungan portal informasi Kanwil", category: "Layanan Publik", region: "Semua Wilayah", period: "Bulanan", year: 2024, value: 132.4, unit: "ribu", source: "Analytics Website Kanwil" },
  { id: 10, indicator: "Madrasah memakai pelaporan digital", category: "Pendidikan Madrasah", region: "Mesuji", period: "Tahunan", year: 2024, value: 81.2, unit: "persen", source: "Bidang Pendidikan Madrasah" },
  { id: 11, indicator: "KUA revitalisasi layanan", category: "Bimas Islam", region: "Bandar Lampung", period: "Tahunan", year: 2024, value: 75.6, unit: "persen", source: "Bidang Bimas Islam" },
  { id: 12, indicator: "Dokumen Laporan SPAK", category: "SPAK", region: "Kanwil Lampung", period: "Tahunan", year: 2024, value: 82.3, unit: "persen", source: "Bidang Ortala" },
  { id: 13, indicator: "Layanan PTSP selesai tepat waktu", category: "Layanan Publik", region: "Semua Wilayah", period: "Tahunan", year: 2023, value: 87.4, unit: "persen", source: "PTSP Kanwil Kemenag Lampung" },
  { id: 14, indicator: "Madrasah terakreditasi A/B", category: "Pendidikan Madrasah", region: "Metro", period: "Tahunan", year: 2023, value: 79.9, unit: "persen", source: "Bidang Pendidikan Madrasah" },
  { id: 15, indicator: "KUA dengan layanan digital aktif", category: "Bimas Islam", region: "Pesawaran", period: "Tahunan", year: 2023, value: 72.8, unit: "persen", source: "Bidang Bimas Islam" },
  { id: 16, indicator: "Dokumen Laporan SPAK", category: "SPAK", region: "Kanwil Lampung", period: "Tahunan", year: 2023, value: 80.1, unit: "persen", source: "Bidang Ortala" },
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
        year: 2026,
        value: 96.4,
        trend: 4.3,
        status: "aktif",
      },
      {
        id: 2,
        name: "Kinerja Pendidikan Madrasah",
        description: "Capaian akreditasi, pembinaan, dan pelaporan digital madrasah di Provinsi Lampung.",
        category: "Pendidikan Madrasah",
        unit: "persen",
        source: "Bidang Pendidikan Madrasah",
        year: 2026,
        value: 88.2,
        trend: 3.5,
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
    ],
    rows,
    chartSeries: [
      { year: 2023, "Pendidikan Madrasah": 79.9, "Bimas Islam": 72.8, "SPAK": 80.1, "Layanan Publik": 87.4 },
      { year: 2024, "Pendidikan Madrasah": 81.2, "Bimas Islam": 75.6, "SPAK": 82.3, "Layanan Publik": 92.4 },
      { year: 2025, "Pendidikan Madrasah": 84.7, "Bimas Islam": 78.9, "SPAK": 86.5, "Layanan Publik": 92.1 },
      { year: 2026, "Pendidikan Madrasah": 88.2, "Bimas Islam": 91.5, "SPAK": 94.8, "Layanan Publik": 96.4 },
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
        priority: "koordinasi",
        status: "terjadwal",
      },
      {
        id: 3,
        date: "Selasa, 19 Mei 2026",
        time: "09.30 WIB",
        title: "Monitoring layanan Kankemenag Kota Bandar Lampung",
        unit: "Tim Kanwil dan Kankemenag Kota Bandar Lampung",
        location: "Jalan P. Emir Moh. Noer No.81, Telukbetung Selatan",
        priority: "monitoring",
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
          {
            id: 2,
            title: "Capaian Kanwil Lampung",
            description: "Arsip visual penghargaan capaian kinerja Kanwil Lampung.",
            year: 2026,
            imageUrl: "/awards/capaian-kanwil.webp",
            alt: "Dokumentasi penghargaan capaian Kanwil Lampung",
          },
          {
            id: 3,
            title: "Apresiasi Kinerja Kanwil",
            description: "Koleksi sementara untuk tampilan frontend galeri penghargaan.",
            year: 2026,
            imageUrl: "/awards/capaian-kanwil.webp",
            alt: "Koleksi penghargaan capaian Kanwil",
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
            title: "Penghargaan PPID Kanwil",
            description: "Dokumentasi penerimaan penghargaan PPID Kanwil Kemenag Lampung.",
            year: 2026,
            imageUrl: "/awards/ppid.webp",
            alt: "Penghargaan PPID Kanwil Kementerian Agama Provinsi Lampung",
          },
          {
            id: 2,
            title: "Apresiasi Keterbukaan Informasi",
            description: "Koleksi penghargaan Pejabat Pengelola Informasi dan Dokumentasi.",
            year: 2026,
            imageUrl: "/awards/ppid.webp",
            alt: "Apresiasi keterbukaan informasi PPID Kanwil Lampung",
          },
          {
            id: 3,
            title: "Dokumentasi PPID",
            description: "Koleksi sementara untuk tampilan frontend galeri PPID.",
            year: 2026,
            imageUrl: "/awards/ppid.webp",
            alt: "Dokumentasi penghargaan PPID",
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
      categories: ["Semua Kategori", "Pendidikan Madrasah", "Bimas Islam", "SPAK", "Layanan Publik"],
      regions: ["Semua Wilayah", "Kanwil Lampung", "Bandar Lampung", "Metro", "Pringsewu", "Pesawaran", "Mesuji", "Tulang Bawang Barat", "Pesisir Barat", "Lampung Selatan", "Lampung Tengah"],
    },
};

const chartCategories: (keyof Omit<ChartPoint, "year">)[] = [
  "Pendidikan Madrasah",
  "Bimas Islam",
  "SPAK",
  "Layanan Publik",
];

let seedPromise: Promise<void> | null = null;

export async function getDashboardData(): Promise<DashboardData> {
  await ensureDashboardSeeded();
  const [
    indicators,
    rows,
    rawChartSeries,
    executiveSchedules,
    rawAwardCollections,
    rawAwardItems,
    publications,
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
    db.select().from(activitiesTable).orderBy(asc(activitiesTable.id)),
    db.select().from(videosTable).orderBy(asc(videosTable.id)),
    db.select().from(contactInfoTable).limit(1),
    db.select().from(filtersTable).orderBy(asc(filtersTable.sortOrder)),
  ]);

  const chartSeries = toChartPoints(rawChartSeries);
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

  return {
    indicators,
    rows,
    chartSeries,
    executiveSchedules,
    awardCollections,
    publications,
    activities,
    videos,
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

export async function replaceDashboardData(data: DashboardData) {
  await ensureDatabaseReady();
  await clearDashboardTables();
  await insertDashboardData(data);
}

async function ensureDashboardSeeded() {
  ensureDatabaseReady();

  if (!seedPromise) {
    seedPromise = (async () => {
      const existing = await db.select({ id: indicatorsTable.id }).from(indicatorsTable).limit(1);

      if (!existing.length) {
        await insertDashboardData(seedDashboardData);
      }
    })();
  }

  return seedPromise;
}

async function clearDashboardTables() {
  await db.delete(awardItemsTable);
  await db.delete(awardCollectionsTable);
  await db.delete(filtersTable);
  await db.delete(contactInfoTable);
  await db.delete(videosTable);
  await db.delete(activitiesTable);
  await db.delete(publicationsTable);
  await db.delete(executiveSchedulesTable);
  await db.delete(chartSeriesTable);
  await db.delete(dashboardRowsTable);
  await db.delete(indicatorsTable);
}

async function insertDashboardData(data: DashboardData) {
  if (data.indicators.length) {
    await db.insert(indicatorsTable).values(data.indicators);
  }

  if (data.rows.length) {
    await db.insert(dashboardRowsTable).values(data.rows);
  }

  const chartValues = data.chartSeries.flatMap((point) =>
    chartCategories.map((category) => ({
      year: point.year,
      category,
      value: point[category],
    })),
  );

  if (chartValues.length) {
    await db.insert(chartSeriesTable).values(chartValues);
  }

  if (data.executiveSchedules.length) {
    await db.insert(executiveSchedulesTable).values(data.executiveSchedules);
  }

  if (data.awardCollections.length) {
    await db.insert(awardCollectionsTable).values(
      data.awardCollections.map((collection, index) => ({
        id: collection.id,
        title: collection.title,
        description: collection.description,
        sortOrder: index,
      })),
    );

    const awardValues = data.awardCollections.flatMap((collection, collectionIndex) =>
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

  if (data.publications.length) {
    await db.insert(publicationsTable).values(data.publications);
  }

  if (data.activities.length) {
    await db.insert(activitiesTable).values(data.activities);
  }

  if (data.videos.length) {
    await db.insert(videosTable).values(data.videos);
  }

  await db.insert(contactInfoTable).values({ id: 1, ...data.contact });

  const filterValues = [
    ...data.filters.years.map((value, index) => ({
      kind: "year" as const,
      value,
      sortOrder: index,
    })),
    ...data.filters.categories.map((value, index) => ({
      kind: "category" as const,
      value,
      sortOrder: 100 + index,
    })),
    ...data.filters.regions.map((value, index) => ({
      kind: "region" as const,
      value,
      sortOrder: 200 + index,
    })),
  ];

  if (filterValues.length) {
    await db.insert(filtersTable).values(filterValues);
  }
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
    const point =
      grouped.get(item.year) ??
      ({
        year: item.year,
        "Pendidikan Madrasah": 0,
        "Bimas Islam": 0,
        SPAK: 0,
        "Layanan Publik": 0,
      } satisfies ChartPoint);

    if (chartCategories.includes(item.category as keyof Omit<ChartPoint, "year">)) {
      point[item.category as keyof Omit<ChartPoint, "year">] = item.value;
    }

    grouped.set(item.year, point);
  }

  return Array.from(grouped.values()).sort((a, b) => a.year - b.year);
}
