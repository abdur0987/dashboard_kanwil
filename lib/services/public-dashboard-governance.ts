import type {
  ChartPoint,
  DataCatalog,
  DashboardData,
  DatasetDetail,
  Indicator,
} from "@/lib/types";

const PUBLIC_REVIEW_DATE = "21 Juli 2026";

const BAB3_TABLES_REQUIRING_REVIEW = new Set([
  "4.108",
  "4.116",
  "4.119",
  "4.120",
  "4.123",
  "4.124",
]);

const EMPTY_VALUE_TOKENS = new Set([
  "n/a",
  "na",
  "#n/a",
  "null",
  "undefined",
  "tidak ada data",
  "data tidak tersedia",
]);

const PLACEHOLDER_TEXT = [
  "indikator baru",
  "data baru",
  "sumber data",
  "deskripsi singkat indikator",
];

export function preparePublicDashboardData(data: DashboardData): DashboardData {
  const indicators = data.indicators
    .filter(isPublicIndicator)
    .map(enrichPublicIndicator);
  const publicCategories = new Set(indicators.map((indicator) => indicator.category));

  const rows = data.rows.filter((row) => {
    if (!publicCategories.has(row.category)) return false;
    if (!Number.isFinite(row.value)) return false;

    return !containsPlaceholder(`${row.indicator} ${row.source}`);
  });

  return {
    ...data,
    indicators,
    rows,
    chartSeries: sanitizeChartSeries(data.chartSeries, publicCategories),
    datasets: data.datasets.map(enrichDatasetCatalog),
    datasetDetails: data.datasetDetails.map(enrichDatasetDetail),
    filters: {
      ...data.filters,
      categories: data.filters.categories.filter((category) =>
        publicCategories.has(category),
      ),
    },
  };
}

function isPublicIndicator(indicator: Indicator) {
  if (indicator.status !== "aktif") return false;
  if (!Number.isFinite(indicator.value)) return false;
  if (containsPlaceholder(`${indicator.name} ${indicator.description} ${indicator.source}`)) {
    return false;
  }

  return true;
}

function enrichPublicIndicator(indicator: Indicator): Indicator {
  const interpretation =
    indicator.category === "IPS"
      ? "Pada IPS, nilai 0 berarti Tidak Mengikuti dan bukan otomatis menunjukkan kinerja buruk."
      : "Nilai 0 hanya dibaca sebagai nol apabila telah dikonfirmasi oleh produsen data; N/A atau data kosong tidak dihitung sebagai 0.";

  return {
    ...indicator,
    description: appendNote(
      indicator.description,
      `Status publikasi: aktif. Periode: ${indicator.year}. Sumber: ${indicator.source}. ${interpretation}`,
    ),
  };
}

function sanitizeChartSeries(
  chartSeries: ChartPoint[],
  publicCategories: Set<string>,
): ChartPoint[] {
  return chartSeries.map((point) => {
    const next: Record<string, number> = { year: point.year };

    for (const [category, value] of Object.entries(point)) {
      if (category === "year") continue;
      if (!publicCategories.has(category)) continue;
      if (!Number.isFinite(value)) continue;

      // Nilai nol tetap tersedia pada tabel sumber, tetapi tidak dipaksakan menjadi
      // titik grafik kinerja sebelum konteks dan validasinya jelas.
      if (value === 0) continue;

      next[category] = value;
    }

    return next as ChartPoint;
  });
}

function enrichDatasetCatalog(dataset: DataCatalog): DataCatalog {
  const interpretation = getDatasetInterpretation(dataset);
  const governanceMetadata = [
    "Status publikasi: Publik dengan catatan interpretasi",
    "Nilai N/A atau data kosong tidak diperlakukan sebagai angka 0",
    "Nilai 0 harus dibaca bersama definisi indikator dan cakupan wilayah",
    `Pemeriksaan tata kelola terakhir: ${PUBLIC_REVIEW_DATE}`,
    "Versi publikasi: 1.1",
  ].join("; ");

  return {
    ...dataset,
    description: appendNote(dataset.description, interpretation),
    standardData: appendNote(
      dataset.standardData,
      "Aturan publikasi: nilai kosong/N/A tidak masuk perhitungan kinerja; angka 0 hanya digunakan sebagai nilai kinerja apabila maknanya telah dikonfirmasi oleh produsen data.",
    ),
    metadata: appendNote(dataset.metadata, governanceMetadata),
  };
}

function enrichDatasetDetail(detail: DatasetDetail): DatasetDetail {
  const tableNumber = normalizeTableNumber(detail.tableNumber);
  const needsReview =
    detail.datasetId === 3 && BAB3_TABLES_REQUIRING_REVIEW.has(tableNumber);
  const interpretation = getDatasetDetailInterpretation(detail, needsReview);

  return {
    ...detail,
    description: appendNote(detail.description, interpretation),
    rows: detail.rows.map((row) => row.map(normalizePublicCell)),
    chartData: needsReview
      ? []
      : detail.chartData.filter(
          (item) => Number.isFinite(item.value) && item.value > 0,
        ),
    metadata: appendNote(
      detail.metadata,
      [
        needsReview
          ? "Status kualitas: Perlu verifikasi internal dan tidak digunakan sebagai grafik/card kinerja"
          : "Status kualitas: Dapat ditampilkan dengan catatan interpretasi",
        "N/A atau nilai tidak tersedia tidak dihitung sebagai nol",
        `Pemeriksaan tata kelola: ${PUBLIC_REVIEW_DATE}`,
      ].join("; "),
    ),
  };
}

function getDatasetInterpretation(dataset: DataCatalog) {
  if (dataset.id === 1) {
    return "Catatan publik Bab 1: angka 0 atau N/A pada data tata kelola perlu dibaca sebagai nilai yang memerlukan konfirmasi, kecuali dokumen sumber menyatakan nol terverifikasi.";
  }

  if (dataset.id === 2) {
    return "Catatan publik Bab 2: ringkasan layanan keagamaan hanya memakai indikator dengan definisi, pembilang, penyebut, periode, dan sumber yang jelas. Nilai kosong/N/A tidak dimasukkan ke rata-rata.";
  }

  if (dataset.id === 3) {
    return "Catatan publik Bab 3: data utama menggunakan referensi Tahun Ajaran 2024/2025. Jumlah MDT dan TPQ dibaca sebagai lembaga terdata, bukan otomatis aktif atau terverifikasi. Tabel yang memiliki ketidaksesuaian total tidak digunakan untuk grafik/card sampai diperbaiki.";
  }

  if (dataset.id === 5 || /ips|indeks pembangunan statistik/i.test(dataset.category)) {
    return "Catatan publik IPS: nilai 0 berarti Tidak Mengikuti sesuai kategori IPS, bukan otomatis menunjukkan kinerja buruk. Perbandingan harus memakai periode dan cakupan yang sama.";
  }

  return "Catatan publik: nilai 0, N/A, dan sel kosong harus dibaca bersama definisi, periode, cakupan, serta sumber data.";
}

function getDatasetDetailInterpretation(
  detail: DatasetDetail,
  needsReview: boolean,
) {
  if (needsReview) {
    return `Catatan kualitas: Tabel ${normalizeTableNumber(detail.tableNumber)} memiliki ketidaksesuaian total pada pemeriksaan sebelumnya. Data tetap tersedia sebagai sumber, tetapi tidak digunakan untuk grafik atau card kinerja sebelum diverifikasi.`;
  }

  if (detail.datasetId === 5 || /ips|indeks pembangunan statistik/i.test(detail.module)) {
    return "Catatan interpretasi: nilai IPS 0 dikategorikan Tidak Mengikuti. Nilai tersebut tidak disamakan dengan kategori Kurang.";
  }

  return "Catatan interpretasi: N/A atau data kosong berarti tidak tersedia/tidak berlaku dan tidak dihitung sebagai nol. Angka 0 harus dibaca bersama definisi indikator serta cakupan tabel.";
}

function normalizePublicCell(value: string | number) {
  if (typeof value === "number") return value;

  const trimmed = value.trim();
  if (!trimmed) return value;

  return EMPTY_VALUE_TOKENS.has(trimmed.toLowerCase())
    ? "Tidak tersedia"
    : value;
}

function normalizeTableNumber(value: string) {
  return String(value ?? "")
    .replace(/^tabel\s*/i, "")
    .trim();
}

function appendNote(base: string, note: string) {
  const normalizedBase = base.trim();
  const normalizedNote = note.trim();

  if (!normalizedBase) return normalizedNote;
  if (normalizedBase.includes(normalizedNote)) return normalizedBase;

  return `${normalizedBase}\n\n${normalizedNote}`;
}

function containsPlaceholder(value: string) {
  const normalized = value.toLowerCase();
  return PLACEHOLDER_TEXT.some((placeholder) => normalized.includes(placeholder));
}
