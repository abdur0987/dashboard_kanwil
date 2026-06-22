"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ElementType,
} from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Award,
  BarChart3,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Database,
  Download,
  FileText,
  Globe2,
  GraduationCap,
  Handshake,
  Landmark,
  Mail,
  MapPinned,
  MapPin,
  Menu,
  Newspaper,
  Pause,
  Phone,
  PlayCircle,
  Presentation,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Video,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AiAssistant } from "@/components/dashboard/ai-assistant";
import type { DashboardData, DatasetDetail } from "@/lib/types";
import { cn } from "@/lib/utils";

type DashboardExperienceProps = {
  data: DashboardData;
};

type AwardCollection = DashboardData["awardCollections"][number];
type AwardItem = AwardCollection["items"][number];
type DashboardTone = "emerald" | "blue" | "gold" | "cyan" | "violet" | "rose";

const chartColors = {
  "Pendidikan Madrasah": "#06b6d4",
  "Bimas Islam": "#22c55e",
  "SPAK": "#f59e0b",
  "Layanan Publik": "#3b82f6",
  IPS: "#a855f7",
};

const categoryTones: Record<string, DashboardTone> = {
  "Layanan Publik": "blue",
  "Pendidikan Madrasah": "cyan",
  "Bimas Islam": "emerald",
  SPAK: "gold",
  IPS: "violet",
};

const toneColors: Record<DashboardTone, string> = {
  emerald: "#6ee7b7",
  blue: "#93c5fd",
  gold: "#fde68a",
  cyan: "#67e8f9",
  violet: "#ddd6fe",
  rose: "#f9a8d4",
};
const dashboardRefreshIntervalMs = 5 * 60 * 1000;

function uniqueAwardItems(items: AwardItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = item.imageUrl.trim().toLowerCase();

    if (seen.has(key)) return false;
    seen.add(key);

    return true;
  });
}

const navItems = [
  { label: "Penghargaan", href: "#penghargaan" },
  { label: "Indikator", href: "#indikator" },
  { label: "Agenda", href: "#agenda" },
  { label: "Dataset", href: "#dashboard" },
  { label: "Statistik", href: "#dashboard" },
  { label: "Jadwal Rilis", href: "#dashboard" },
  { label: "Geotagging", href: "#dashboard" },
  { label: "Berita", href: "#berita" },
  { label: "Video", href: "#video" },
  { label: "Kontak", href: "#kontak" },
  { label: "Lokasi", href: "#lokasi" },
  { label: "SlideShow", href: "/slideshow" },
  { label: "Admin", href: "/admin" },
];

export function DashboardExperience({ data: initialData }: DashboardExperienceProps) {
  const [data, setData] = useState(initialData);
  const [dataPortalTab, setDataPortalTab] = useState<
    "dataset" | "statistik" | "rilis" | "geotagging"
  >("dataset");

  useEffect(() => {
    let mounted = true;

    async function refreshDashboardData() {
      try {
        const response = await fetch(`/api/dashboard?ts=${Date.now()}`, {
          cache: "no-store",
        });

        if (!response.ok) return;

        const nextData = (await response.json()) as DashboardData;

        if (mounted) {
          setData(nextData);
        }
      } catch {
        // The public dashboard keeps the latest visible data if a refresh fails.
      }
    }

    void refreshDashboardData();

    const timer = window.setInterval(refreshDashboardData, dashboardRefreshIntervalMs);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <main className="min-h-screen overflow-hidden text-slate-950">
      <TopBar contact={data.contact} />
      <SiteHeader />
      <Hero />
      <AwardsSection collections={data.awardCollections} />

      <section id="indikator" className="section-shell">
        <SectionHeading
          eyebrow="Indikator strategis Kanwil"
          title="Ringkasan layanan Kementerian Agama Provinsi Lampung"
          description="Kartu indikator menampilkan layanan PTSP, pendidikan madrasah, Bimas Islam, Survei Persepsi Anti Korupsi, dan IPS sebagai gambaran kinerja publik Kanwil."
        />
        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.indicators.map((indicator) => (
            <Card key={indicator.id} className="group overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-md border border-white/70 bg-white/40 p-2 text-primary shadow-sm backdrop-blur-2xl transition group-hover:bg-white/60">
                    <BarChart3 className="h-5 w-5" aria-hidden />
                  </div>
                  <Badge variant={indicator.status === "aktif" ? "success" : "warning"}>
                    {indicator.status === "aktif" ? "Aktif" : "Validasi"}
                  </Badge>
                </div>
                <CardTitle className="leading-snug">{indicator.name}</CardTitle>
                <CardDescription>{indicator.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-3xl font-bold text-slate-900">
                      {formatNumber(indicator.value)}
                      {indicator.unit === "persen" ? "%" : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tahun {indicator.year}
                    </p>
                  </div>
                  <div className="rounded-md border border-white/60 bg-teal-soft/70 px-2.5 py-1.5 text-sm font-semibold text-teal-ink shadow-sm backdrop-blur">
                    +{formatNumber(indicator.trend)}%
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Sumber: {indicator.source}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="agenda" className="section-shell pt-0">
        <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <Card className="liquid-panel-dark overflow-hidden">
            <CardHeader>
              <div className="w-fit rounded-md border border-white/20 bg-white/15 p-2 text-amber-200 shadow-sm backdrop-blur-2xl">
                <Landmark className="h-5 w-5" />
              </div>
              <CardTitle className="text-2xl leading-tight text-white">
                Agenda Pimpinan
              </CardTitle>
              <CardDescription className="text-white/75">
                Jadwal pimpinan dari SIMANDA Kanwil Kementerian Agama Provinsi
                Lampung untuk monitoring layanan minggu ini.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                <ScheduleMetric label="Agenda" value={data.executiveSchedules.length} />
                <ScheduleMetric
                  label="Prioritas"
                  value={
                    data.executiveSchedules.filter(
                      (schedule) => schedule.priority === "utama",
                    ).length
                  }
                />
                <ScheduleMetric
                  label="Berjalan"
                  value={
                    data.executiveSchedules.filter(
                      (schedule) => schedule.status === "berjalan",
                    ).length
                  }
                />
              </div>
              <p className="mt-4 text-xs leading-5 text-white/65">
                Data agenda tersinkron otomatis dari SIMANDA Kanwil Kemenag Lampung.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-3">
            {data.executiveSchedules.map((schedule) => (
              <Card key={schedule.id} className="shadow-none">
                <CardContent className="grid gap-4 p-4 md:grid-cols-[150px_1fr_auto] md:items-center">
                  <div>
                    {schedule.priority === "utama" ? (
                      <Badge variant="success" className="mb-2 w-fit">
                        Prioritas Utama
                      </Badge>
                    ) : null}
                    <p className="text-sm font-semibold text-slate-900">
                      {schedule.date}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {schedule.time}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold leading-snug text-slate-950">
                      {schedule.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {schedule.unit}
                    </p>
                    <p className="mt-2 inline-flex items-start gap-1.5 text-sm text-emerald-800">
                      <MapPinned className="mt-0.5 h-4 w-4 shrink-0" />
                      {schedule.location}
                    </p>
                  </div>
                  <span className={statusBadgeClass(schedule.status)}>
                    {statusLabel(schedule.status)}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="dashboard" className="liquid-band border-y border-white/60">
        <div className="section-shell">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Portal Satu Data Kanwil"
              title="Dataset, statistik, jadwal rilis, dan geotagging"
              description="Susunan data dibuat seperti portal Satu Data: katalog dataset, grafik statistik, rencana rilis dokumen, dan daftar alamat kantor Kemenag se-Provinsi Lampung."
            />
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary" className="glass-button-shine">
                <Link href="/slideshow">
                  <Presentation className="h-4 w-4" />
                  SlideShow
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-2 rounded-lg border border-white/60 bg-white/35 p-2 shadow-sm backdrop-blur-2xl">
            {[
              { id: "dataset", label: "Dataset", icon: Database },
              { id: "statistik", label: "Statistik", icon: BarChart3 },
              { id: "rilis", label: "Jadwal Rilis", icon: CalendarDays },
              { id: "geotagging", label: "Geotagging", icon: MapPinned },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = dataPortalTab === tab.id;

              return (
                <Button
                  key={tab.id}
                  type="button"
                  variant={isActive ? "default" : "ghost"}
                  className={isActive ? "shadow-sm" : "bg-white/20"}
                  onClick={() =>
                    setDataPortalTab(
                      tab.id as "dataset" | "statistik" | "rilis" | "geotagging",
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          {dataPortalTab === "dataset" ? (
            <DatasetPortal datasets={data.datasets} details={data.datasetDetails} />
          ) : null}

          {dataPortalTab === "rilis" ? (
            <ReleasePortal releases={data.releaseSchedules} />
          ) : null}

          {dataPortalTab === "geotagging" ? (
            <GeotaggingPortal offices={data.officeLocations} />
          ) : null}

          {dataPortalTab === "statistik" ? (
            <StatisticsPortal details={data.datasetDetails} />
          ) : null}
        </div>
      </section>

      <section id="video" className="section-shell">
        <Card className="overflow-hidden border-white/80 bg-white/55 shadow-glass backdrop-blur-2xl">
          <div className="grid gap-0 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-800 to-amber-500 p-6 text-white md:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.35),transparent_30%),radial-gradient(circle_at_82%_70%,rgba(251,191,36,0.35),transparent_28%)]" />
              <div className="relative z-10 flex h-full min-h-[340px] flex-col justify-between">
                <div>
                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-lg border border-white/30 bg-white/18 p-3 shadow-sm backdrop-blur-2xl">
                      <PlayCircle className="h-7 w-7" />
                    </div>
                    <Badge className="border-white/30 bg-white/20 text-white backdrop-blur-2xl">
                      Kanal Video Resmi
                    </Badge>
                  </div>
                  <h2 className="max-w-xl text-3xl font-bold leading-tight md:text-5xl">
                    {data.videos[0].title}
                  </h2>
                  <p className="mt-4 max-w-lg text-base leading-7 text-white/82">
                    {data.videos[0].description}
                  </p>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/20 bg-white/12 p-4 backdrop-blur-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/80">
                      Sumber
                    </p>
                    <p className="mt-2 text-lg font-bold">YouTube Kanwil</p>
                  </div>
                  <div className="rounded-lg border border-white/20 bg-white/12 p-4 backdrop-blur-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-100/80">
                      Status
                    </p>
                    <p className="mt-2 text-lg font-bold">Tayang Publik</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3 md:p-5">
              <div className="aspect-video overflow-hidden rounded-lg border border-white/80 bg-slate-950 shadow-2xl">
                <iframe
                  className="h-full w-full"
                  src={data.videos[0].embedUrl}
                  title={data.videos[0].title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </Card>
      </section>

      <NewsSection news={data.latestNews} />

      <section id="kontak" className="section-shell">
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <CardHeader>
              <CardTitle>Kontak Resmi</CardTitle>
              <CardDescription>
                Kanal layanan informasi dan identitas instansi.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <ContactRow icon={Building2} label="Instansi" value={data.contact.institution} />
              <ContactRow icon={MapPin} label="Alamat" value={data.contact.address} />
              <ContactRow icon={Phone} label="Telepon" value={data.contact.phone} />
              <ContactRow icon={Mail} label="Email" value={data.contact.email} />
              <ContactRow icon={Globe2} label="Website" value={data.contact.website} />
            </CardContent>
          </Card>

          <Card id="lokasi" className="overflow-hidden">
            <CardHeader>
              <CardTitle>Peta Lokasi</CardTitle>
              <CardDescription>Google Maps embed siap diganti dengan lokasi resmi instansi.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-[16/9] overflow-hidden rounded-lg border border-white/70 bg-white/40 shadow-inner backdrop-blur">
                <iframe
                  className="h-full w-full"
                  src={data.contact.mapEmbedUrl}
                  title="Peta lokasi instansi"
                  loading="lazy"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer contact={data.contact} />
      <AiAssistant />
    </main>
  );
}

function TopBar({ contact }: { contact: DashboardData["contact"] }) {
  return (
    <div className="border-b border-white/10 bg-slate-950/90 text-white backdrop-blur-xl">
      <div className="container flex flex-col gap-2 py-2 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" />
            {contact.phone}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            {contact.email}
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-white/80">
          <Globe2 className="h-3.5 w-3.5" />
          {contact.website}
        </span>
      </div>
    </div>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  const size = compact ? 40 : 64;

  return (
    <div
      className={`kanwil-brand-mark ${compact ? "h-10 w-10" : "h-16 w-16"}`}
      aria-hidden
    >
      <Image
        src="/brand/logo-kanwil-kemenag-lampung-icon.png"
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-contain"
      />
      <span />
    </div>
  );
}

function serviceIcon(category: string): ElementType {
  const icons: Record<string, ElementType> = {
    "Layanan Publik": Handshake,
    "Pendidikan Madrasah": GraduationCap,
    "Bimas Islam": Landmark,
    SPAK: ShieldCheck,
    IPS: Database,
  };

  return icons[category] ?? BarChart3;
}

function serviceTone(category: string): DashboardTone {
  return categoryTones[category] ?? "violet";
}

function toneStyle(tone: DashboardTone): CSSProperties {
  return {
    "--summary-tone": toneColors[tone],
    color: toneColors[tone],
  } as CSSProperties;
}

function getDetailYearOptions(detail?: DatasetDetail | null) {
  if (!detail) return ["Semua Tahun"];

  const years = new Set<string>([String(detail.year)]);
  const yearColumnIndex = getYearColumnIndex(detail.headers);

  if (yearColumnIndex >= 0) {
    detail.rows.forEach((row) => {
      const value = String(row[yearColumnIndex] ?? "").match(/\b(20\d{2})\b/)?.[1];
      if (value) years.add(value);
    });
  }

  return [
    "Semua Tahun",
    ...Array.from(years).sort((a, b) => Number(b) - Number(a)),
  ];
}

function getYearColumnIndex(headers: string[]) {
  return headers.findIndex((header) => {
    const normalized = String(header ?? "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

    return (
      normalized === "tahun" ||
      normalized === "year" ||
      normalized === "tahun data" ||
      normalized === "tahun ajaran" ||
      normalized.startsWith("tahun ")
    );
  });
}

function filterDetailRowsByYear(detail: DatasetDetail, selectedYear: string) {
  if (selectedYear === "Semua Tahun") return detail.rows;

  const yearColumnIndex = getYearColumnIndex(detail.headers);
  if (yearColumnIndex < 0) {
    return String(detail.year) === selectedYear ? detail.rows : [];
  }

  return detail.rows.filter((row) => {
    return String(row[yearColumnIndex] ?? "").includes(selectedYear);
  });
}

const dataPortalModuleOrder = [
  "Semua",
  "Tata Kelola",
  "Pendidikan",
  "Agama dan Keagamaan",
  "Indeks Pembangunan Statistik (IPS)",
];

function getDataPortalModules(details: DatasetDetail[]) {
  const available = new Set(details.map((detail) => detail.module).filter(Boolean));
  return [
    ...dataPortalModuleOrder.filter(
      (module) => module === "Semua" || available.has(module),
    ),
    ...Array.from(available).filter((module) => !dataPortalModuleOrder.includes(module)),
  ];
}

const lampungRegionAliases: Record<string, string> = {
  "lampung barat": "Lampung Barat",
  "lampung selatan": "Lampung Selatan",
  "lampung tengah": "Lampung Tengah",
  "lampung timur": "Lampung Timur",
  "lampung utara": "Lampung Utara",
  tanggamus: "Tanggamus",
  "tulang bawang barat": "Tubaba",
  "tulang bawang": "Tulang Bawang",
  "way kanan": "Way Kanan",
  pesawaran: "Pesawaran",
  pringsewu: "Pringsewu",
  mesuji: "Mesuji",
  "pesisir barat": "Pesisir Barat",
  "bandar lampung": "Bandar Lampung",
  metro: "Metro",
  "provinsi lampung": "Kanwil Lampung",
  lampung: "Lampung",
};

function shortenStatisticLabel(value: string) {
  const cleaned = value
    .replace(/Kantor\s+Kementerian\s+Agama\s+/gi, "")
    .replace(/Kantor\s+Kemenag\s+/gi, "")
    .replace(/Kementerian\s+Agama\s+/gi, "")
    .replace(/Kabupaten\s+/gi, "")
    .replace(/Kota\s+/gi, "")
    .replace(/Provinsi\s+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const normalized = cleaned.toLowerCase();
  const matchedKey = Object.keys(lampungRegionAliases)
    .sort((a, b) => b.length - a.length)
    .find((key) => normalized.includes(key));

  if (matchedKey) return lampungRegionAliases[matchedKey];
  if (cleaned.length <= 18) return cleaned;

  return cleaned
    .split(" ")
    .map((word, index) => (index === 0 ? word : word.slice(0, 3)))
    .join(" ")
    .slice(0, 22);
}

function buildChartDataFromRows(detail: DatasetDetail, rows: DatasetDetail["rows"]) {
  if (!rows.length) return detail.chartData;

  const yearColumnIndex = getYearColumnIndex(detail.headers);
  const labelColumnIndex = detail.headers.findIndex((header, index) => {
    if (index === yearColumnIndex) return false;
    return /kabupaten|kota|provinsi|wilayah|satuan|kantor|kecamatan|nama/i.test(
      String(header ?? ""),
    );
  });
  const numericIndexes = detail.headers
    .map((header, index) => ({ header, index }))
    .filter(({ index }) => index !== yearColumnIndex && index !== labelColumnIndex)
    .filter(({ index }) =>
      rows.some((row) => Number.isFinite(Number(String(row[index] ?? "").replace(",", ".")))),
    );
  const valueIndex = numericIndexes[numericIndexes.length - 1]?.index ?? -1;

  if (labelColumnIndex < 0 || valueIndex < 0) return detail.chartData;

  return rows
    .map((row, index) => {
      const rawLabel = String(row[labelColumnIndex] ?? `Data ${index + 1}`).trim();

      return {
        label: shortenStatisticLabel(rawLabel),
        fullLabel: rawLabel,
        value: Number(String(row[valueIndex] ?? 0).replace(",", ".")) || 0,
      };
    })
    .filter((item) => item.value > 0)
    .slice(0, 24);
}

function isNoColumn(header: string, index: number) {
  const normalized = header.toLowerCase().trim();
  return index === 0 && /^(no|nomor|#)$/i.test(normalized || "no");
}

function isNumericColumn(header: string, rows: DatasetDetail["rows"], index: number) {
  const normalized = header.toLowerCase();

  if (/tahun|year|satuan|unit|kode|nama|wilayah|provinsi|kabupaten|kota|kantor|satuan kerja/.test(normalized)) {
    return false;
  }

  return rows.some((row) =>
    Number.isFinite(Number(String(row[index] ?? "").replace(",", "."))),
  );
}

function datasetColumnClass(header: string, rows: DatasetDetail["rows"], index: number) {
  const normalized = header.toLowerCase();

  if (isNoColumn(header, index)) {
    return "w-14 min-w-14 max-w-16 px-3 text-center";
  }

  if (/tahun|year/.test(normalized)) {
    return "w-24 min-w-24 max-w-28 px-3 text-center";
  }

  if (isNumericColumn(header, rows, index)) {
    return "w-28 min-w-28 max-w-32 px-3 text-right";
  }

  if (/satuan kerja|nama|wilayah|provinsi|kabupaten|kota|kantor/.test(normalized)) {
    return "min-w-[220px] max-w-[360px] px-4";
  }

  return "min-w-[120px] max-w-[240px] px-4";
}

function DatasetPortal({
  datasets,
  details,
}: {
  datasets: DashboardData["datasets"];
  details: DashboardData["datasetDetails"];
}) {
  const [query, setQuery] = useState("");
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<"data" | "standard" | "metadata">(
    "data",
  );
  const [selectedYear, setSelectedYear] = useState("Semua Tahun");
  const [activeModule, setActiveModule] = useState("Semua");
  const modules = useMemo(() => getDataPortalModules(details), [details]);
  const filteredDetails = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const moduleDetails =
      activeModule === "Semua"
        ? details
        : details.filter((detail) => detail.module === activeModule);

    if (!needle) return moduleDetails;

    return moduleDetails.filter((detail) =>
      [detail.title, detail.description, detail.category, detail.module, detail.producer]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [activeModule, details, query]);
  const selectedDetail = selectedDetailId
    ? details.find((detail) => detail.id === selectedDetailId) ?? null
    : null;
  const selectedDataset = selectedDetail
    ? datasets.find((dataset) => dataset.id === selectedDetail.datasetId) ?? null
    : null;
  const selectedYearOptions = useMemo(
    () => getDetailYearOptions(selectedDetail),
    [selectedDetail],
  );
  const selectedRows = useMemo(
    () =>
      selectedDetail
        ? filterDetailRowsByYear(selectedDetail, selectedYear)
        : [],
    [selectedDetail, selectedYear],
  );
  const openDatasetDetail = useCallback(
    (detail: DatasetDetail, tab: "data" | "standard" | "metadata" = "data") => {
      setSelectedDetailId(detail.id);
      setSelectedYear("Semua Tahun");
      setDetailTab(tab);
    },
    [],
  );

  useEffect(() => {
    if (!selectedDetail) {
      setSelectedYear("Semua Tahun");
      return;
    }

    const years = getDetailYearOptions(selectedDetail);
    if (!years.includes(selectedYear)) {
      setSelectedYear("Semua Tahun");
    }
  }, [selectedDetail, selectedYear]);

  if (!details.length) {
    return (
      <Card className="mt-6">
        <CardContent className="p-8">
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  if (selectedDetail) {
    return (
      <div className="mt-7">
        <div className="mx-auto max-w-6xl text-center">
          <h3 className="text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
            {selectedDetail.title}
          </h3>
          <button
            type="button"
            onClick={() => {
              setSelectedDetailId(null);
              setDetailTab("data");
            }}
            className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 transition hover:text-emerald-800"
          >
            <span>Beranda</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Dataset</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="max-w-2xl truncate text-emerald-800">
              {selectedDetail.title}
            </span>
          </button>
        </div>

        <Card className="mx-auto mt-6 max-w-7xl overflow-hidden">
          <CardHeader className="border-b border-emerald-100 bg-white/55">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "data", label: "Daftar Data" },
                  { id: "standard", label: "Standar Data" },
                  { id: "metadata", label: "Metadata" },
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    type="button"
                    size="sm"
                    variant={detailTab === tab.id ? "default" : "outline"}
                    className="rounded-md px-4"
                    onClick={() => setDetailTab(tab.id as typeof detailTab)}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(event.target.value)}
                  className="h-10 min-w-36 rounded-md border border-emerald-100 bg-white/80 px-3 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-emerald-500"
                >
                  {selectedYearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {selectedDataset?.excelUrl ? (
                  <Button asChild variant="outline" size="sm" className="rounded-md">
                    <a href={selectedDataset.excelUrl} download>
                      <Download className="h-4 w-4" />
                      Excel
                    </a>
                  </Button>
                ) : null}
                {selectedDataset?.pdfUrl ? (
                  <Button asChild variant="outline" size="sm" className="rounded-md">
                    <a href={selectedDataset.pdfUrl} target="_blank" rel="noreferrer">
                      <FileText className="h-4 w-4" />
                      PDF
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {detailTab === "data" ? (
              <div className="p-4 md:p-6">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <Badge className="bg-emerald-700 text-white">
                      {selectedDetail.module}
                    </Badge>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {selectedDetail.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {selectedRows.length} dari {selectedDetail.rows.length} baris
                  </Badge>
                </div>
                <div className="overflow-hidden rounded-lg border border-emerald-100 bg-white/80">
                  <div className="max-h-[760px] overflow-auto">
                    <DatasetSourceTable detail={selectedDetail} rows={selectedRows} />
                  </div>
                </div>
              </div>
            ) : null}

            {detailTab === "standard" ? (
              <div className="p-4 md:p-6">
                <InfoPanel
                  title="Standar Data"
                  description={selectedDetail.standardData}
                  rows={[
                    ["Dataset Diunggah", formatDateLong(selectedDetail.year)],
                    ["Produsen Data", selectedDetail.producer],
                    ["Jadwal Pembaruan", selectedDataset?.frequency ?? "Tahunan"],
                    ["Format Dataset", selectedDataset?.format ?? "XLSX"],
                    ["Tabel", `Tabel ${selectedDetail.tableNumber}`],
                  ]}
                />
              </div>
            ) : null}

            {detailTab === "metadata" ? (
              <div className="p-4 md:p-6">
                <InfoPanel
                  title="Metadata"
                  description={selectedDetail.metadata}
                  rows={[
                    ["Sumber", selectedDetail.producer],
                    ["Versi", "1"],
                    ["Cakupan", "Provinsi Lampung"],
                    ["Referensi Waktu", String(selectedDetail.year)],
                    ["Tipe Data", "Tabular"],
                    ["Dapat Diakses Publik", "Ya"],
                  ]}
                />
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-7 max-w-5xl">
      <div className="text-center">
        <p className="eyebrow justify-center">Dataset</p>
        <h3 className="text-4xl font-bold tracking-tight text-slate-950">Dataset</h3>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {modules.map((module) => (
            <Button
              key={module}
              type="button"
              variant={activeModule === module ? "default" : "outline"}
              className={
                activeModule === module
                  ? "min-w-28 rounded-md bg-emerald-700 px-5 text-white shadow-sm hover:bg-emerald-800"
                  : "min-w-28 rounded-md border-white/70 bg-white/65 px-5 text-slate-800 shadow-sm backdrop-blur-xl hover:border-emerald-200 hover:bg-emerald-50/80 hover:text-emerald-900"
              }
              onClick={() => setActiveModule(module)}
            >
              {module}
            </Button>
          ))}
        </div>
        <div className="mx-auto mt-5 max-w-3xl">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Data apa yang Anda cari?"
            className="h-12 w-full rounded-full border border-emerald-200 bg-white/80 px-5 text-sm font-medium text-slate-900 outline-none shadow-sm placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      <Card className="mt-8 overflow-hidden">
        <CardHeader className="border-b border-emerald-100">
          <div className="flex items-center justify-between gap-4">
            <CardTitle>{filteredDetails.length} Dataset</CardTitle>
            <Badge variant="outline">
              {activeModule === "Semua" ? `${details.length} tabel tersedia` : activeModule}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid max-h-[920px] gap-4 overflow-auto p-5">
          {filteredDetails.length ? (
            filteredDetails.map((detail) => {
              const dataset = datasets.find((item) => item.id === detail.datasetId);

              return (
                <article
                  key={detail.id}
                  className="group rounded-lg border border-emerald-100 bg-white/65 p-5 shadow-sm transition hover:border-emerald-300 hover:bg-white/85 hover:shadow-glass"
                >
                  <div className="flex items-start justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => openDatasetDetail(detail)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <Badge variant="outline" className="bg-white/80 text-[10px]">
                        {detail.module}
                      </Badge>
                      <h3 className="mt-3 text-xl font-bold leading-snug text-emerald-950 transition group-hover:text-emerald-700">
                        {detail.title}
                      </h3>
                    </button>
                    <button
                      type="button"
                      onClick={() => openDatasetDetail(detail)}
                      className="mt-8 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-white/80 text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900"
                      aria-label={`Buka ${detail.title}`}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => openDatasetDetail(detail)}
                    className="mt-3 block w-full text-left"
                  >
                    <p className="line-clamp-2 text-sm leading-6 text-muted-foreground transition group-hover:text-slate-700">
                    {detail.description}
                    </p>
                  </button>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {dataset?.excelUrl ? (
                      <Button asChild size="sm" className="rounded-md bg-emerald-700 text-white hover:bg-emerald-800">
                        <a href={dataset.excelUrl} download>
                          <Download className="h-4 w-4" />
                          Unduh Dataset
                        </a>
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-md"
                      onClick={() => openDatasetDetail(detail, "metadata")}
                    >
                      Bagikan
                    </Button>
                    <span className="rounded-md border border-white/70 bg-white/60 px-2.5 py-2 text-xs font-semibold text-slate-600">
                      {detail.year}
                    </span>
                    <span className="rounded-md border border-white/70 bg-white/60 px-2.5 py-2 text-xs font-semibold text-slate-600">
                      {dataset?.format ?? "XLSX"}
                    </span>
                    <span className="rounded-md border border-white/70 bg-white/60 px-2.5 py-2 text-xs font-semibold text-slate-600">
                      {dataset?.frequency ?? "Tahunan"}
                    </span>
                    <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-2 text-xs font-semibold text-emerald-800">
                      Tabel {detail.tableNumber}
                    </span>
                  </div>
                </article>
              );
            })
          ) : (
            <EmptyState />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DatasetSourceTable({
  detail,
  rows,
}: {
  detail: DatasetDetail;
  rows?: DatasetDetail["rows"];
}) {
  const sourceRows = rows ?? detail.rows;
  if (!sourceRows.length) return <EmptyState />;
  const visibleRows = sourceRows.slice(0, 500);

  return (
    <Table className="w-full min-w-max table-auto text-sm">
      <TableHeader>
        <TableRow className="border-emerald-100 bg-gradient-to-r from-emerald-50/95 via-cyan-50/80 to-white/95">
          {detail.headers.map((header, index) => (
            <TableHead
              key={`${header}-${index}`}
              className={cn(
                "sticky top-0 z-10 bg-emerald-50/95 py-4 font-bold text-emerald-950",
                datasetColumnClass(String(header ?? ""), sourceRows, index),
              )}
            >
              {header || `Kolom ${index + 1}`}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {visibleRows.map((row, rowIndex) => (
          <TableRow
            key={`${detail.id}-${rowIndex}`}
            className="border-emerald-50 odd:bg-white/60 even:bg-cyan-50/20"
          >
            {detail.headers.map((header, cellIndex) => (
              <TableCell
                key={`${detail.id}-${rowIndex}-${cellIndex}`}
                className={cn(
                  "whitespace-normal py-3 align-top leading-6 text-slate-800",
                  datasetColumnClass(String(header ?? ""), sourceRows, cellIndex),
                )}
              >
                {String(row[cellIndex] ?? "-")}
              </TableCell>
            ))}
          </TableRow>
        ))}
        {sourceRows.length > visibleRows.length ? (
          <TableRow>
            <TableCell
              colSpan={detail.headers.length}
              className="bg-white/70 py-4 text-center text-sm text-muted-foreground"
            >
              Menampilkan 500 dari {sourceRows.length} baris. Gunakan unduhan Excel
              untuk membaca seluruh data.
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
    </Table>
  );
}

function StatisticsPortal({ details }: { details: DatasetDetail[] }) {
  const modules = useMemo(() => getDataPortalModules(details), [details]);
  const [activeModule, setActiveModule] = useState("Semua");
  const [selectedYear, setSelectedYear] = useState("Semua Tahun");
  const filteredDetails = useMemo(
    () =>
      activeModule === "Semua"
        ? details
        : details.filter((detail) => detail.module === activeModule),
    [activeModule, details],
  );
  const groupedDetails = useMemo(() => {
    const groups = new Map<
      string,
      {
        id: string;
        title: string;
        module: string;
        producer: string;
        count: number;
        rows: number;
        items: DatasetDetail[];
      }
    >();

    filteredDetails.forEach((detail) => {
      const id = `${detail.datasetId}-${detail.category}`;
      const current =
        groups.get(id) ??
        ({
          id,
          title: detail.category,
          module: detail.module,
          producer: detail.producer,
          count: 0,
          rows: 0,
          items: [],
        } satisfies {
          id: string;
          title: string;
          module: string;
          producer: string;
          count: number;
          rows: number;
          items: DatasetDetail[];
        });

      current.count += 1;
      current.rows += detail.rows.length;
      current.items.push(detail);
      groups.set(id, current);
    });

    return Array.from(groups.values());
  }, [filteredDetails]);
  const [openId, setOpenId] = useState(filteredDetails[0]?.id ?? "");
  const openDetail =
    filteredDetails.find((detail) => detail.id === openId) ?? filteredDetails[0];
  const openYearOptions = useMemo(() => getDetailYearOptions(openDetail), [openDetail]);
  const openRows = useMemo(
    () => (openDetail ? filterDetailRowsByYear(openDetail, selectedYear) : []),
    [openDetail, selectedYear],
  );
  const openChartData = useMemo(
    () => (openDetail ? buildChartDataFromRows(openDetail, openRows) : []),
    [openDetail, openRows],
  );

  useEffect(() => {
    if (!filteredDetails.length) {
      setOpenId("");
      return;
    }

    if (!filteredDetails.some((detail) => detail.id === openId)) {
      setOpenId(filteredDetails[0].id);
    }
  }, [filteredDetails, openId]);

  useEffect(() => {
    if (!openDetail) return;

    const years = getDetailYearOptions(openDetail);
    if (!years.includes(selectedYear)) {
      setSelectedYear("Semua Tahun");
    }
  }, [openDetail, selectedYear]);

  if (!details.length) {
    return (
      <Card className="mt-6">
        <CardContent className="p-8">
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-7">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
          Statistik
        </p>
        <h3 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
          Statistik
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Pilih modul di bawah, lalu buka daftar statistik dari Excel Bab 1 sampai
          Bab 3.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {modules.map((module) => (
          <Button
            key={module}
            type="button"
            variant={activeModule === module ? "default" : "outline"}
            className="rounded-lg px-6"
            onClick={() => setActiveModule(module)}
          >
            {module}
          </Button>
        ))}
      </div>

      <div className="mx-auto mt-6 grid max-w-7xl gap-4 xl:grid-cols-[0.78fr_1.22fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Daftar Statistik per Bab</CardTitle>
                <CardDescription>
                  {filteredDetails.length} tabel dari {groupedDetails.length} kelompok
                  data tersedia untuk modul {activeModule}.
                </CardDescription>
              </div>
              <Badge variant="outline">{activeModule}</Badge>
            </div>
          </CardHeader>
          <CardContent className="max-h-[760px] space-y-3 overflow-auto p-4">
            <div className="grid gap-2 sm:grid-cols-3">
              <MetricCard
                label="Kelompok"
                value={String(groupedDetails.length)}
                helper="bab data"
              />
              <MetricCard
                label="Tabel"
                value={String(filteredDetails.length)}
                helper="statistik"
              />
              <MetricCard
                label="Baris"
                value={String(
                  filteredDetails.reduce((total, detail) => total + detail.rows.length, 0),
                )}
                helper="sumber"
              />
            </div>

            <div className="space-y-4">
              {groupedDetails.map((group) => (
                <div
                  key={group.id}
                  className="overflow-hidden rounded-lg border border-white/70 bg-white/45 shadow-sm backdrop-blur-xl"
                >
                  <div className="border-b border-white/70 bg-gradient-to-r from-emerald-50/85 via-white/70 to-amber-50/70 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge className="bg-emerald-700 text-white">
                          {group.module}
                        </Badge>
                        <h4 className="mt-2 text-sm font-bold leading-snug text-slate-950">
                          {group.title}
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {group.count} tabel · {group.rows} baris · {group.producer}
                        </p>
                      </div>
                      <Database className="h-5 w-5 shrink-0 text-emerald-700" />
                    </div>
                  </div>

                  <div className="divide-y divide-emerald-950/10">
                    {group.items.map((detail) => {
                      const isOpen = openDetail?.id === detail.id;

                      return (
                        <button
                          key={detail.id}
                          type="button"
                          onClick={() => setOpenId(detail.id)}
                          className={`flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition ${
                            isOpen
                              ? "bg-emerald-100/75 text-emerald-950"
                              : "bg-white/35 text-slate-900 hover:bg-white/75"
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="line-clamp-2 text-sm font-semibold leading-snug">
                              {detail.title}
                            </span>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              Tabel {detail.tableNumber} · {detail.rows.length} baris
                            </span>
                          </span>
                          <ChevronRight
                            className={`h-5 w-5 shrink-0 transition ${
                              isOpen
                                ? "rotate-90 text-emerald-700"
                                : "text-slate-400"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {openDetail ? (
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-white/70">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Badge variant="outline" className="mb-3">
                    Tabel {openDetail.tableNumber}
                  </Badge>
                  <CardTitle className="leading-tight">{openDetail.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {openDetail.description}
                  </CardDescription>
                </div>
                <select
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(event.target.value)}
                  className="h-10 min-w-36 rounded-md border border-emerald-200 bg-white/75 px-3 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-emerald-500"
                >
                  {openYearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <MetricCard
                  label="Tahun"
                  value={selectedYear === "Semua Tahun" ? "Semua" : selectedYear}
                  helper="filter aktif"
                />
                <MetricCard
                  label="Baris"
                  value={String(openRows.length)}
                  helper="data grafik"
                />
                <MetricCard
                  label="Kolom"
                  value={String(openDetail.headers.length)}
                  helper="sumber Excel"
                />
              </div>
              <div className="h-[520px] rounded-lg border border-white/70 bg-white/65 p-5 shadow-inner">
                {openChartData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={openChartData}
                      margin={{ top: 10, right: 20, bottom: 74, left: 4 }}
                    >
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="4 8"
                        stroke="rgba(15, 81, 50, 0.18)"
                      />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        angle={-34}
                        textAnchor="end"
                        interval={0}
                        height={84}
                        tickMargin={12}
                        tick={{ fontSize: 10, fill: "#475569" }}
                      />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                      <Tooltip
                        labelFormatter={(_, payload) => {
                          const item = payload?.[0]?.payload as
                            | { fullLabel?: string; label?: string }
                            | undefined;

                          return item?.fullLabel ?? item?.label ?? "";
                        }}
                      />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#0ea5a1" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState />
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function ReleasePortal({ releases }: { releases: DashboardData["releaseSchedules"] }) {
  return (
    <Card className="mt-6 overflow-hidden">
      <CardHeader className="text-center">
        <Badge variant="outline" className="mx-auto mb-3 w-fit">
          Jadwal Rilis
        </Badge>
        <CardTitle className="text-3xl">Publikasi Data Kanwil</CardTitle>
        <CardDescription>
          Daftar jadwal dan realisasi rilis dokumen statistik, dashboard, dan portal
          data resmi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border border-white/70 bg-white/45 shadow-sm backdrop-blur-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Bahasa</TableHead>
                <TableHead>Jadwal Rilis</TableHead>
                <TableHead>Realisasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {releases.map((release, index) => (
                <TableRow key={release.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="max-w-[360px] font-semibold text-slate-900">
                    {release.title}
                  </TableCell>
                  <TableCell>{release.period}</TableCell>
                  <TableCell>{release.language}</TableCell>
                  <TableCell>{release.scheduledDate}</TableCell>
                  <TableCell>{release.realizedDate || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={release.status === "rilis" ? "success" : "warning"}
                    >
                      {release.status === "rilis" ? "Rilis" : "Rencana"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {release.documentUrl ? (
                      <Button asChild size="sm" variant="outline">
                        <a
                          href={release.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Buka
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function GeotaggingPortal({ offices }: { offices: DashboardData["officeLocations"] }) {
  const [selectedId, setSelectedId] = useState(offices[0]?.id ?? 0);
  const selected = offices.find((office) => office.id === selectedId) ?? offices[0];
  const mapSrc = selected
    ? `https://www.google.com/maps?q=${selected.latitude},${selected.longitude}&z=14&output=embed`
    : "";

  if (!offices.length) {
    return (
      <Card className="mt-6">
        <CardContent className="p-8">
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-6 grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
      <Card className="overflow-hidden">
        <CardHeader>
          <Badge variant="outline" className="mb-3 w-fit">
            {offices.length} Kantor
          </Badge>
          <CardTitle>Geotagging Kemenag Lampung</CardTitle>
          <CardDescription>
            Pilih Kanwil atau Kantor Kemenag kabupaten/kota untuk membuka peta dan
            rute Google Maps.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid max-h-[680px] gap-3 overflow-auto pr-3">
          {offices.map((office) => {
            const active = selected?.id === office.id;

            return (
              <button
                key={office.id}
                type="button"
                onClick={() => setSelectedId(office.id)}
                className={`rounded-lg border p-4 text-left transition ${
                  active
                    ? "border-emerald-300 bg-emerald-50/85 shadow-glass"
                    : "border-white/70 bg-white/45 hover:bg-white/70"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-md border border-white/70 bg-white/55 p-2 text-emerald-700">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-950">{office.name}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {office.address}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                      {office.type === "kanwil" ? "Kanwil" : "Kabupaten/Kota"}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {selected ? (
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle>{selected.name}</CardTitle>
                <CardDescription className="mt-2">
                  {selected.address}
                </CardDescription>
              </div>
              <Button asChild>
                <a href={selected.mapsUrl} target="_blank" rel="noreferrer">
                  Buka Rute
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <MetricCard label="Telepon" value={selected.phone || "-"} helper="kontak" />
              <MetricCard
                label="Latitude"
                value={selected.latitude.toFixed(4)}
                helper="koordinat"
              />
              <MetricCard
                label="Longitude"
                value={selected.longitude.toFixed(4)}
                helper="koordinat"
              />
            </div>
            <div className="mt-5 aspect-[16/9] overflow-hidden rounded-lg border border-white/70 bg-white/40 shadow-inner backdrop-blur">
              <iframe
                key={selected.id}
                className="h-full w-full"
                src={mapSrc}
                title={`Peta ${selected.name}`}
                loading="lazy"
              />
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function InfoPanel({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: [string, string][];
}) {
  return (
    <div className="mt-5 rounded-lg border border-white/70 bg-white/45 p-4 shadow-sm backdrop-blur-xl">
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      <div className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
        {description.split(";").map((item) => (
          <p key={item.trim()}>{item.trim()}</p>
        ))}
      </div>
      <div className="mt-5 overflow-hidden rounded-md border border-white/70 bg-white/55">
        <Table>
          <TableBody>
            {rows.map(([label, value]) => (
              <TableRow key={label}>
                <TableCell className="w-56 font-semibold text-slate-800">
                  {label}
                </TableCell>
                <TableCell>{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function formatDateLong(year: number) {
  return `05 Juni ${year}`;
}

function NewsSection({ news }: { news: DashboardData["latestNews"] }) {
  if (!news.length) return null;

  const [featuredNews, ...secondaryNews] = news;

  return (
    <section id="berita" className="liquid-band border-y border-white/60">
      <div className="section-shell">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Berita Kanwil"
            title="Top 5 berita terbaru Kanwil Kemenag Lampung"
            description="Berita diambil langsung dari portal resmi lampung.kemenag.go.id agar dashboard ikut membaca update informasi harian."
          />
          <Badge className="w-fit border-emerald-200/80 bg-white/45 px-4 py-2 text-sm text-emerald-900 shadow-sm backdrop-blur-2xl">
            <Newspaper className="mr-2 h-4 w-4" />
            {news.length} Berita Terbaru
          </Badge>
        </div>

        <div className="mt-7 grid items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_520px]">
          <Link
            href={featuredNews.url}
            target="_blank"
            rel="noreferrer"
            className="group block h-full min-h-[620px] overflow-hidden rounded-lg border border-white/70 bg-white/45 shadow-glass backdrop-blur-2xl"
          >
            <div className="relative h-full min-h-[620px] overflow-hidden">
              <Image
                src={featuredNews.imageUrl}
                alt={featuredNews.title}
                fill
                sizes="(min-width: 1280px) calc(100vw - 640px), 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/28 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(16,185,129,0.38),transparent_28%),radial-gradient(circle_at_78%_78%,rgba(245,158,11,0.28),transparent_32%)]" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Badge className="bg-emerald-500 text-white">{featuredNews.category}</Badge>
                  <span className="rounded-md border border-white/25 bg-white/20 px-2.5 py-1 text-xs font-semibold backdrop-blur-2xl">
                    {featuredNews.date}
                  </span>
                </div>
                <h3 className="max-w-3xl text-2xl font-bold leading-tight md:text-4xl">
                  {featuredNews.title}
                </h3>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/85">
                  Baca berita resmi
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            {secondaryNews.map((item, index) => (
              <Link
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="group grid overflow-hidden rounded-lg border border-white/70 bg-white/58 shadow-glass backdrop-blur-2xl md:grid-cols-[180px_1fr] xl:grid-cols-[190px_1fr]"
              >
                <div className="relative min-h-[150px] overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="190px"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <Badge className={index % 2 === 0 ? "bg-sky-500" : "bg-amber-500"}>
                      {item.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex min-h-[150px] flex-col justify-between p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                    {item.date}
                  </p>
                  <h3 className="mt-2 line-clamp-3 text-lg font-bold leading-snug text-slate-950">
                    {item.title}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    Baca selengkapnya
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/60 shadow-sm backdrop-blur-2xl">
      <div className="container flex min-h-16 items-center justify-between gap-4">
        <a href="#" className="flex items-center gap-3">
          <BrandMark compact />
          <div>
            <p className="font-bold leading-tight text-slate-900">Dashboard Digital Kanwil</p>
            <p className="text-xs text-muted-foreground">Kemenag Provinsi Lampung</p>
          </div>
        </a>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Button key={`${item.label}-${item.href}`} asChild variant="ghost" size="sm">
              {item.href.startsWith("#") ? (
                <a href={item.href}>{item.label}</a>
              ) : (
                <Link href={item.href}>{item.label}</Link>
              )}
            </Button>
          ))}
        </nav>
        <Button
          size="icon"
          variant="outline"
          className="md:hidden"
          aria-label="Buka menu"
          onClick={() => setOpen((value) => !value)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>
      {open ? (
        <nav className="container grid gap-2 border-t border-white/50 bg-white/70 py-3 backdrop-blur-2xl sm:grid-cols-2 md:hidden">
          {navItems.map((item) => (
            item.href.startsWith("#") ? (
              <a
                key={`${item.label}-${item.href}`}
                href={item.href}
                className="mobile-nav-link"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                className="mobile-nav-link"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            )
          ))}
        </nav>
      ) : null}
    </header>
  );
}

function Hero() {
  return (
    <section
      className="relative bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(100deg, rgba(2, 44, 34, 0.93), rgba(15, 118, 80, 0.56), rgba(202, 138, 4, 0.16)), url(https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80)",
      }}
    >
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      <div className="container relative flex min-h-[460px] flex-col justify-center py-12 text-white md:min-h-[560px]">
        <div className="max-w-4xl rounded-lg border border-white/25 bg-white/20 p-5 shadow-glass backdrop-blur-2xl md:p-7">
          <Badge className="mb-5 w-fit bg-white/20 text-white backdrop-blur-2xl">
            Portal data strategis Kanwil Kemenag Lampung
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
            Dashboard Digital Kanwil Kementerian Agama Provinsi Lampung
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 md:text-lg">
            Satu layar untuk memantau indikator layanan keagamaan, agenda pimpinan,
            publikasi statistik, video informasi, kontak, dan lokasi resmi Kanwil.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="#dashboard">
                Lihat Dashboard
                <TrendingUp className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#agenda">
                Agenda Pimpinan
                <CalendarDays className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href="#dashboard">
                Jadwal Rilis
                <FileText className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">
        {description}
      </p>
    </div>
  );
}

function AwardsSection({
  collections,
}: {
  collections: DashboardData["awardCollections"];
}) {
  return (
    <section id="penghargaan" className="section-shell pt-8 md:pt-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow="Penghargaan Kanwil"
          title="Koleksi capaian dan penghargaan PPID"
          description="Galeri penghargaan ditampilkan di bagian atas sebagai etalase prestasi Kanwil Kemenag Lampung. PPID adalah Pejabat Pengelola Informasi dan Dokumentasi."
        />
        <Badge variant="outline" className="w-fit">
          2 Koleksi
        </Badge>
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-2">
        {collections.map((collection) => (
          <AwardCarousel
            key={collection.id}
            collection={collection}
            delay={collection.id === "ppid" ? 5200 : 4600}
          />
        ))}
      </div>
    </section>
  );
}

function AwardCarousel({
  collection,
  delay,
}: {
  collection: AwardCollection;
  delay: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const items = useMemo(() => uniqueAwardItems(collection.items), [collection.items]);
  const activeAward = items[activeIndex] ?? items[0];
  const totalItems = items.length;
  const accentLabel = collection.id === "ppid" ? "PPID" : "Capaian Kanwil";

  useEffect(() => {
    if (totalItems <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % totalItems);
    }, delay);

    return () => window.clearInterval(timer);
  }, [delay, totalItems]);

  useEffect(() => {
    if (activeIndex >= totalItems) {
      setActiveIndex(0);
    }
  }, [activeIndex, totalItems]);

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + totalItems) % totalItems);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % totalItems);
  };

  if (!activeAward) return null;

  return (
    <article className="liquid-award-carousel">
      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md border border-white/70 bg-white/40 p-2 text-primary shadow-sm backdrop-blur-2xl">
                <Award className="h-5 w-5" />
              </span>
              <Badge variant={collection.id === "ppid" ? "success" : "outline"}>
                {totalItems} Foto
              </Badge>
            </div>
            <h3 className="text-xl font-bold leading-tight tracking-normal text-slate-950">
              {collection.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {collection.description}
            </p>
          </div>
          <div className="hidden whitespace-nowrap rounded-md border border-white/70 bg-white/40 px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-emerald-800 shadow-sm backdrop-blur-2xl sm:block">
            Slide {activeIndex + 1}/{totalItems}
          </div>
        </div>

        <div className="liquid-award-stage group">
          <Image
            key={`${collection.id}-${activeAward.id}`}
            src={activeAward.imageUrl}
            alt={activeAward.alt}
            fill
            sizes="(min-width: 1280px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-[1.02]"
            priority={collection.id === "capaian-kanwil"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/12 to-white/10" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <Badge variant={collection.id === "ppid" ? "success" : "secondary"}>
              {accentLabel}
            </Badge>
            <Badge variant="outline" className="bg-white/55">
              {activeAward.year}
            </Badge>
          </div>
          <div className="absolute inset-x-4 bottom-4 rounded-lg border border-white/35 bg-white/20 p-4 text-white shadow-sm backdrop-blur-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/75">
              Galeri otomatis
            </p>
            <h4 className="mt-1 text-lg font-bold leading-tight">
              {activeAward.title}
            </h4>
            <p className="mt-1 text-sm leading-6 text-white/80">
              {activeAward.description}
            </p>
          </div>
        </div>

        <div className="grid gap-4 rounded-lg border border-white/70 bg-white/30 p-3 shadow-sm backdrop-blur-2xl sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
              {accentLabel}
            </p>
            <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-slate-700">
              {activeAward.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full bg-white/35"
              onClick={showPrevious}
              aria-label={`Foto sebelumnya ${collection.title}`}
              disabled={totalItems <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1.5">
              {items.map((award, index) => (
                <button
                  key={`${collection.id}-dot-${award.id}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === activeIndex
                      ? "w-8 bg-emerald-700"
                      : "w-2.5 bg-emerald-900/20 hover:bg-emerald-800/40"
                  }`}
                  aria-label={`Tampilkan foto ${index + 1} ${collection.title}`}
                  aria-current={index === activeIndex}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full bg-white/35"
              onClick={showNext}
              aria-label={`Foto berikutnya ${collection.title}`}
              disabled={totalItems <= 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function SlideShowExperience({
  data: initialData,
  onClose,
}: {
  data: DashboardData;
  onClose?: () => void;
}) {
  const [data, setData] = useState(initialData);
  const [activeSlide, setActiveSlide] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalMs = 9000;
  const slides = [
    "Ringkasan",
    "Data Strategis",
    "Agenda",
    "Berita",
    "Statistik",
    "Penghargaan",
    "Kesimpulan",
  ];
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
      return;
    }

    window.location.href = "/";
  }, [onClose]);

  useEffect(() => {
    let mounted = true;

    async function refreshDashboardData() {
      try {
        const response = await fetch(`/api/dashboard?ts=${Date.now()}`, {
          cache: "no-store",
        });

        if (!response.ok) return;

        const nextData = (await response.json()) as DashboardData;

        if (mounted) {
          setData(nextData);
          setLastUpdated(new Date());
        }
      } catch {
        // Keep the latest visible dashboard data while the next poll retries.
      }
    }

    void refreshDashboardData();

    const timer = window.setInterval(refreshDashboardData, dashboardRefreshIntervalMs);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    document.body.classList.add("overflow-hidden");

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose]);

  useEffect(() => {
    if (!playing) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [playing, slides.length]);

  const chartSeries = data.chartSeries;
  const visibleCategories = data.filters.categories.filter(
    (item) => item !== "Semua Kategori",
  );

  const trendSnapshot = useMemo(() => {
    const latestPoint = chartSeries[chartSeries.length - 1];

    if (!latestPoint) {
      return {
        latestYear: "-",
        average: 0,
        strongestCategory: "-",
        strongestValue: 0,
      };
    }

    const values = visibleCategories.map((item) => ({
      category: item,
      value: Number((latestPoint as unknown as Record<string, number>)[item] ?? 0),
    }));
    const total = values.reduce((sum, item) => sum + item.value, 0);
    const strongest = values.reduce(
      (selected, item) => (item.value > selected.value ? item : selected),
      values[0] ?? { category: "-", value: 0 },
    );

    return {
      latestYear: latestPoint.year,
      average: values.length ? total / values.length : 0,
      strongestCategory: strongest.category,
      strongestValue: strongest.value,
    };
  }, [chartSeries, visibleCategories]);

  const latestDashboardRows = useMemo(() => {
    const latestYear = data.rows.reduce((year, row) => Math.max(year, row.year), 0);

    return data.rows.filter((row) => row.year === latestYear);
  }, [data.rows]);
  const latestRowAverage = useMemo(() => {
    if (!latestDashboardRows.length) return 0;

    return (
      latestDashboardRows.reduce((total, row) => total + row.value, 0) /
      latestDashboardRows.length
    );
  }, [latestDashboardRows]);
  const strongestLatestRow = useMemo(() => {
    return latestDashboardRows.reduce<DashboardData["rows"][number] | null>(
      (selected, row) => (!selected || row.value > selected.value ? row : selected),
      null,
    );
  }, [latestDashboardRows]);
  const weakestLatestRow = useMemo(() => {
    return latestDashboardRows.reduce<DashboardData["rows"][number] | null>(
      (selected, row) => (!selected || row.value < selected.value ? row : selected),
      null,
    );
  }, [latestDashboardRows]);
  const latestIndicators = data.indicators.slice(0, 4);
  const [featuredNews, ...secondaryNews] = data.latestNews;
  const agendaCount = data.executiveSchedules.length;
  const prioritySchedules = data.executiveSchedules.filter(
    (schedule) => schedule.priority === "utama",
  );
  const runningSchedules = data.executiveSchedules.filter(
    (schedule) => schedule.status === "berjalan",
  );
  const completedSchedules = data.executiveSchedules.filter(
    (schedule) => schedule.status === "selesai",
  );
  const focusSchedule = prioritySchedules[0] ?? data.executiveSchedules[0];
  const awardPhotoCount = data.awardCollections.reduce(
    (total, collection) => total + uniqueAwardItems(collection.items).length,
    0,
  );
  const summaryStats = [
    {
      label: "Indikator",
      value: data.indicators.length,
      helper: "layanan strategis",
      icon: BarChart3,
      tone: "emerald" as const,
    },
    {
      label: "Data",
      value: data.rows.length,
      helper: "baris dashboard",
      icon: TrendingUp,
      tone: "cyan" as const,
    },
    {
      label: "Agenda",
      value: data.executiveSchedules.length,
      helper: "jadwal pimpinan",
      icon: CalendarDays,
      tone: "gold" as const,
    },
    {
      label: "Penghargaan",
      value: awardPhotoCount,
      helper: "foto koleksi",
      icon: Award,
      tone: "rose" as const,
    },
    {
      label: "Dataset",
      value: data.datasets.length,
      helper: "katalog data",
      icon: Database,
      tone: "blue" as const,
    },
    {
      label: "Rilis",
      value: data.releaseSchedules.length,
      helper: "jadwal publikasi",
      icon: FileText,
      tone: "emerald" as const,
    },
    {
      label: "Geotagging",
      value: data.officeLocations.length,
      helper: "kantor wilayah",
      icon: MapPinned,
      tone: "gold" as const,
    },
    {
      label: "Berita",
      value: data.latestNews.length,
      helper: "top portal resmi",
      icon: Newspaper,
      tone: "cyan" as const,
    },
    {
      label: "Video",
      value: data.videos.length,
      helper: "kanal informasi",
      icon: Video,
      tone: "violet" as const,
    },
  ];
  const latestCategoryCards = useMemo(() => {
    const latestPoint = chartSeries[chartSeries.length - 1];

    return visibleCategories.map((category) => {
      const Icon = serviceIcon(category);
      const value = latestPoint
        ? Number((latestPoint as unknown as Record<string, number>)[category] ?? 0)
        : 0;

      return {
        category,
        value,
        icon: Icon,
        tone: serviceTone(category),
        color: chartColors[category as keyof typeof chartColors] ?? "#10b981",
        isStrongest: category === trendSnapshot.strongestCategory,
      };
    });
  }, [chartSeries, trendSnapshot.strongestCategory, visibleCategories]);
  const executiveDatasetSummaries = useMemo(() => {
    const modules = [
      {
        label: "Tata Kelola",
        title: "Tata kelola dan manajemen",
        matcher: (value: string) => value.includes("tata kelola"),
        tone: "emerald" as const,
      },
      {
        label: "Pendidikan",
        title: "Pendidikan Agama Islam",
        matcher: (value: string) => value.includes("pendidikan"),
        tone: "cyan" as const,
      },
      {
        label: "Agama dan Keagamaan",
        title: "Pelayanan agama dan keagamaan",
        matcher: (value: string) =>
          value.includes("agama") || value.includes("keagamaan") || value.includes("bimas"),
        tone: "gold" as const,
      },
      {
        label: "IPS",
        title: "Indeks Pembangunan Statistik",
        matcher: (value: string) => value.includes("ips") || value.includes("indeks pembangunan statistik"),
        tone: "violet" as const,
      },
    ];

    return modules.map((module) => {
      const details = data.datasetDetails.filter((detail) => {
        const haystack = normalizeDisplayText(`${detail.module} ${detail.category} ${detail.title}`);
        return module.matcher(haystack);
      });
      const rows = details.reduce((total, detail) => total + detail.rows.length, 0);
      const latest = details[0];

      return {
        ...module,
        count: details.length,
        rows,
        latestTitle: latest?.title ?? "Belum ada dataset",
        latestTable: latest?.tableNumber ?? "-",
        year: latest?.year ?? trendSnapshot.latestYear,
      };
    });
  }, [data.datasetDetails, trendSnapshot.latestYear]);
  const latestAward = useMemo(() => {
    const collections = data.awardCollections;
    const firstCollection = collections[0];
    const firstItem = firstCollection ? uniqueAwardItems(firstCollection.items)[0] : null;

    return firstCollection && firstItem
      ? {
          collection: firstCollection,
          item: firstItem,
        }
      : null;
  }, [data.awardCollections]);
  const executiveConclusions = useMemo(() => {
    const ipsCard = latestCategoryCards.find((item) => item.category === "IPS");
    const points = [
      `Rata-rata indikator terbaru berada di ${formatNumber(latestRowAverage)} dari ${latestDashboardRows.length} data.`,
      strongestLatestRow
        ? `Kinerja terkuat: ${strongestLatestRow.indicator} dengan nilai ${formatNumber(strongestLatestRow.value)} ${strongestLatestRow.unit}.`
        : "Kinerja terkuat belum tersedia.",
      weakestLatestRow
        ? `Perlu dipantau: ${weakestLatestRow.indicator} dengan nilai ${formatNumber(weakestLatestRow.value)} ${weakestLatestRow.unit}.`
        : "Area pemantauan belum tersedia.",
      ipsCard
        ? `Nilai IPS terbaru terbaca ${formatNumber(ipsCard.value)} dan perlu dijaga sebagai kualitas tata kelola data.`
        : "Nilai IPS belum tersedia di ringkasan terbaru.",
      focusSchedule
        ? `Agenda terdekat: ${focusSchedule.title}, ${focusSchedule.date} pukul ${focusSchedule.time}.`
        : "Agenda terdekat belum tersedia.",
      featuredNews
        ? `Berita terbaru: ${featuredNews.title}.`
        : "Berita terbaru belum tersedia dari portal resmi.",
    ];

    return points;
  }, [
    featuredNews,
    focusSchedule,
    latestCategoryCards,
    latestDashboardRows.length,
    latestRowAverage,
    strongestLatestRow,
    weakestLatestRow,
  ]);
  const updatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "sinkron otomatis";

  return (
    <main
      className={`executive-monitor-backdrop ${
        activeSlide === 2 || activeSlide === 5
          ? "executive-monitor-photo-backdrop"
          : ""
      }`}
      role="main"
    >
      <div className="executive-monitor-shell">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/20 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <BrandMark compact />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/75">
                SlideShow Monitoring
              </p>
              <h2 className="truncate text-lg font-bold text-white md:text-xl">
                Dashboard Digital Kanwil Kemenag Lampung
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur-2xl md:inline-flex">
              <RefreshCw className="h-3.5 w-3.5" />
              Update {updatedLabel}
            </span>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-10 w-10 border-white/30 bg-white/15 text-white hover:bg-white/25"
              onClick={() => setPlaying((value) => !value)}
              aria-label={playing ? "Jeda slideshow" : "Jalankan slideshow"}
            >
              {playing ? <Pause className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-10 w-10 border-white/30 bg-white/15 text-white hover:bg-white/25"
              onClick={handleClose}
              aria-label="Tutup slideshow"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr_auto] gap-4 p-4 md:p-6">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {slides.map((slide, index) => (
              <button
                key={slide}
                type="button"
                className={`executive-monitor-tab ${
                  index === activeSlide ? "executive-monitor-tab-active" : ""
                }`}
                onClick={() => setActiveSlide(index)}
              >
                {slide}
              </button>
            ))}
          </div>

          <div key={activeSlide} className="executive-monitor-slide">
            {activeSlide === 0 ? (
              <div className="grid h-full gap-4 xl:grid-cols-[1.08fr_0.92fr]">
                <div className="executive-monitor-card executive-hero-card flex min-h-0 flex-col p-5 md:p-7">
                  <div className="relative z-10 grid gap-6 xl:grid-cols-[1fr_300px] xl:items-start">
                    <div>
                      <Badge className="mb-5 w-fit border-white/40 bg-white/20 text-white backdrop-blur-2xl">
                        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                        Live SlideShow
                      </Badge>
                      <h3 className="max-w-3xl text-4xl font-bold leading-[0.98] text-white md:text-6xl">
                        Dashboard Interaktif Kanwil Kemenag Provinsi Lampung.
                      </h3>
                      <div className="mt-6 flex flex-wrap gap-2">
                        <span className="executive-hero-pill executive-hero-pill-cyan">
                          SIMANDA
                        </span>
                        <span className="executive-hero-pill executive-hero-pill-gold">
                          Berita Kanwil
                        </span>
                        <span className="executive-hero-pill executive-hero-pill-blue">
                          Data Strategis
                        </span>
                      </div>
                    </div>
                    <div className="executive-logo-showcase">
                      <BrandMark />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/70">
                          Kanwil Kemenag
                        </p>
                        <p className="mt-2 text-2xl font-bold leading-tight text-white">
                          Provinsi Lampung
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="executive-hero-metrics relative z-10 mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryStats.map((stat) => (
                      <SummaryDataCard key={stat.label} {...stat} />
                    ))}
                  </div>
                  <div className="latest-category-panel relative z-10 mt-4">
                    <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
                      <div>
                        <p className="summary-kicker summary-text-emerald">
                          Data terbaru per kategori
                        </p>
                        <h4 className="mt-1 text-2xl font-bold leading-tight text-white">
                          Capaian layanan tahun {trendSnapshot.latestYear}
                        </h4>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-white/[0.72]">
                          Ringkasan terbaru dari Pendidikan Madrasah, Bimas Islam,
                          SPAK, Layanan Publik, dan IPS dalam satu panel monitoring.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-[360px] lg:grid-cols-2">
                        <div
                          className="latest-category-chip chip-tone-gold"
                          style={toneStyle("gold")}
                        >
                          <span>Tahun</span>
                          <strong>{trendSnapshot.latestYear}</strong>
                        </div>
                        <div
                          className="latest-category-chip chip-tone-cyan"
                          style={toneStyle("cyan")}
                        >
                          <span>Rata-rata</span>
                          <strong>{formatNumber(trendSnapshot.average)}</strong>
                        </div>
                        <div
                          className="latest-category-chip chip-tone-violet"
                          style={toneStyle("violet")}
                        >
                          <span>Kategori</span>
                          <strong>{latestCategoryCards.length}</strong>
                        </div>
                        <div
                          className="latest-category-chip chip-tone-blue"
                          style={toneStyle("blue")}
                        >
                          <span>Tertinggi</span>
                          <strong>{formatNumber(trendSnapshot.strongestValue)}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                      {latestCategoryCards.map((item, index) => {
                        const Icon = item.icon;

                        return (
                          <div
                            key={item.category}
                            className={`latest-category-card latest-category-${item.tone}`}
                            style={
                              {
                                "--category-color": item.color,
                                "--summary-tone": toneColors[item.tone],
                              } as CSSProperties
                            }
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                className={`latest-category-icon summary-tone-${item.tone}`}
                                style={toneStyle(item.tone)}
                              >
                                <Icon className="h-4 w-4" />
                              </span>
                              <div className="min-w-0">
                                <p
                                  className={`summary-kicker summary-text-${item.tone}`}
                                  style={toneStyle(item.tone)}
                                >
                                  {item.isStrongest ? "Nilai tertinggi" : "Data terbaru"}
                                </p>
                                <h5 className="line-clamp-2 text-base font-bold leading-tight text-white">
                                  {item.category}
                                </h5>
                              </div>
                            </div>
                            <div className="mt-3 flex items-end justify-between gap-3">
                              <p className="text-2xl font-bold leading-none text-white">
                                {formatNumber(item.value)}
                                <span className="ml-1 text-base text-white/[0.72]">%</span>
                              </p>
                              <span className="rounded-full border border-white/20 bg-white/[0.12] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/[0.78]">
                                {trendSnapshot.latestYear}
                              </span>
                            </div>
                            <div className="latest-category-meter mt-3">
                              <div
                                className="latest-category-fill"
                                style={{
                                  width: `${Math.max(8, Math.min(100, item.value))}%`,
                                  animationDelay: `${index * 140}ms`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="grid min-h-0 gap-3">
                  {latestIndicators.map((indicator, index) => {
                    const Icon = serviceIcon(indicator.category);
                    const tone = serviceTone(indicator.category);

                    return (
                    <div
                      key={indicator.id}
                      className={`executive-monitor-tile executive-indicator-tile tile-tone-${index % 4}`}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span
                          className={`summary-service-icon summary-tone-${tone}`}
                          style={toneStyle(tone)}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                        <p
                          className={`text-xs font-semibold uppercase tracking-wide summary-text-${tone}`}
                          style={toneStyle(tone)}
                        >
                          {indicator.category}
                        </p>
                        <h4 className="mt-1 font-bold leading-tight text-white">
                          {indicator.name}
                        </h4>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/65">
                          {indicator.description}
                        </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-white">
                          {formatNumber(indicator.value)}
                          {indicator.unit === "persen" ? "%" : ""}
                        </p>
                        <p className="text-xs text-white/60">Tahun {indicator.year}</p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {activeSlide === 1 ? (
              <div className="executive-monitor-card grid h-full grid-rows-[auto_1fr] gap-5 p-5 md:p-7">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/85">
                      Data Strategis
                    </p>
                    <h3 className="mt-2 text-3xl font-bold text-white md:text-4xl">
                      Point penting dataset Kanwil
                    </h3>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-white/68">
                      Ringkasan pendek dari empat kelompok utama agar pimpinan cepat
                      melihat cakupan data dan fokus terbaru.
                    </p>
                  </div>
                  <Badge className="border-white/25 bg-white/15 px-3 py-2 text-white backdrop-blur-2xl">
                    <Database className="mr-2 h-4 w-4" />
                    {data.datasetDetails.length} Tabel Data
                  </Badge>
                </div>

                <div className="grid min-h-0 gap-4 xl:grid-cols-4">
                  {executiveDatasetSummaries.map((item) => (
                    <div
                      key={item.label}
                      className={`executive-monitor-tile monitor-stat-${item.tone} flex min-h-[330px] flex-col justify-between gap-5`}
                      style={toneStyle(item.tone)}
                    >
                      <div>
                        <div
                          className={`summary-service-icon summary-tone-${item.tone}`}
                          style={toneStyle(item.tone)}
                        >
                          <Database className="h-5 w-5" />
                        </div>
                        <p
                          className={`mt-5 summary-kicker summary-text-${item.tone}`}
                          style={toneStyle(item.tone)}
                        >
                          {item.label}
                        </p>
                        <h4 className="mt-2 text-2xl font-bold leading-tight text-white">
                          {item.title}
                        </h4>
                        <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/66">
                          Fokus terbaru: {item.latestTitle}
                        </p>
                      </div>
                      <div className="grid gap-3">
                        <div className="grid grid-cols-2 gap-3">
                          <MonitorStat
                            label="Tabel"
                            value={String(item.count)}
                            tone={item.tone}
                          />
                          <MonitorStat
                            label="Baris"
                            value={formatNumber(item.rows)}
                            tone={item.tone}
                          />
                        </div>
                        <div className="rounded-lg border border-white/20 bg-white/10 p-3 text-xs font-semibold uppercase tracking-[0.12em] text-white/72 backdrop-blur-2xl">
                          {item.latestTable} · {item.year}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {activeSlide === 2 ? (
              <div className="executive-photo-slide grid h-full min-h-0 gap-4 xl:grid-cols-[0.72fr_1.28fr]">
                <div className="executive-monitor-card executive-agenda-card grid min-h-0 grid-rows-[auto_1fr_auto] gap-5 p-5 md:p-7">
                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div>
                      <div className="w-fit rounded-lg border border-amber-200/35 bg-amber-200/20 p-3 text-amber-100 shadow-sm backdrop-blur-2xl">
                        <Landmark className="h-8 w-8" />
                      </div>
                      <h3 className="mt-5 text-4xl font-bold text-white">
                        Agenda Pimpinan
                      </h3>
                      <p className="mt-3 max-w-xl text-base leading-7 text-white/72">
                        Jadwal SIMANDA diringkas menjadi prioritas monitoring yang
                        mudah dibaca dari layar pimpinan.
                      </p>
                    </div>
                    <BrandMark compact />
                  </div>

                  <div className="relative z-10 grid min-h-0 content-start gap-4">
                    {focusSchedule ? (
                      <div className="executive-agenda-focus">
                        <div className="flex items-center justify-between gap-3">
                          <Badge className="border-emerald-200/40 bg-emerald-300/18 text-emerald-50 backdrop-blur-2xl">
                            Prioritas Terdekat
                          </Badge>
                          <span className={statusBadgeClass(focusSchedule.status)}>
                            {statusLabel(focusSchedule.status)}
                          </span>
                        </div>
                        <h4 className="mt-4 text-2xl font-bold leading-tight text-white">
                          {focusSchedule.title}
                        </h4>
                        <p className="mt-3 text-sm leading-6 text-white/70">
                          {focusSchedule.unit}
                        </p>
                        <div className="mt-5 grid gap-3 text-sm text-white/78">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-amber-200" />
                            {focusSchedule.date}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <Clock className="h-4 w-4 text-cyan-200" />
                            {focusSchedule.time}
                          </span>
                          <span className="inline-flex items-start gap-2">
                            <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" />
                            {focusSchedule.location}
                          </span>
                        </div>
                      </div>
                    ) : null}

                    <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                      <MonitorStat label="Agenda" value={String(agendaCount)} tone="emerald" />
                      <MonitorStat
                        label="Prioritas"
                        value={String(prioritySchedules.length)}
                        tone="gold"
                      />
                      <MonitorStat
                        label="Berjalan"
                        value={String(runningSchedules.length)}
                        tone="cyan"
                      />
                    </div>
                  </div>

                  <div className="relative z-10 grid gap-2 rounded-lg border border-white/20 bg-white/10 p-4 text-xs leading-5 text-white/72 backdrop-blur-2xl sm:grid-cols-3">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
                      Belum: {agendaCount - runningSchedules.length - completedSchedules.length}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                      Berjalan: {runningSchedules.length}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                      Selesai: {completedSchedules.length}
                    </span>
                  </div>
                </div>

                <div className="executive-monitor-card executive-agenda-board grid min-h-0 grid-rows-[auto_1fr] gap-4 p-4 md:p-5">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/80">
                        Jadwal Terkini
                      </p>
                      <h4 className="mt-1 text-2xl font-bold text-white md:text-3xl">
                        {agendaCount} agenda publik dari SIMANDA
                      </h4>
                    </div>
                    <Badge className="border-white/25 bg-white/15 text-white backdrop-blur-2xl">
                      Otomatis menyesuaikan jumlah agenda
                    </Badge>
                  </div>

                  <div
                    className={`executive-agenda-list ${
                      agendaCount <= 4
                        ? "executive-agenda-list-balanced"
                        : "executive-agenda-list-scroll"
                    }`}
                  >
                    {data.executiveSchedules.map((schedule, index) => (
                      <div
                        key={schedule.id}
                        className={`executive-agenda-item agenda-status-${schedule.status}`}
                      >
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="executive-agenda-number">
                            {String(index + 1).padStart(2, "0")}
                          </div>
                          <div className="min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              {schedule.priority === "utama" ? (
                                <Badge
                                  variant="success"
                                  className="border-emerald-200/45 bg-emerald-300/20 text-emerald-50"
                                >
                                  Prioritas Utama
                                </Badge>
                              ) : (
                                <span className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/55">
                                  -
                                </span>
                              )}
                              <span className={statusBadgeClass(schedule.status)}>
                                {statusLabel(schedule.status)}
                              </span>
                            </div>
                            <h5 className="text-lg font-bold leading-snug text-white">
                              {schedule.title}
                            </h5>
                            <p className="mt-1 text-sm text-white/65">{schedule.unit}</p>
                            <p className="mt-3 inline-flex items-start gap-1.5 text-sm text-emerald-100">
                              <MapPinned className="mt-0.5 h-4 w-4 shrink-0" />
                              {schedule.location}
                            </p>
                          </div>
                        </div>
                        <div className="grid shrink-0 gap-2 text-right">
                          <p className="font-semibold text-white">{schedule.date}</p>
                          <p className="text-sm text-white/68">{schedule.time}</p>
                        </div>
                      </div>
                    ))}
                    {!agendaCount ? (
                      <div className="grid h-full place-items-center rounded-lg border border-white/20 bg-white/10 p-8 text-center text-white/70">
                        Agenda publik SIMANDA belum tersedia.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {activeSlide === 3 ? (
              <div className="executive-monitor-card grid h-full grid-rows-[auto_1fr] gap-5 p-5 md:p-7">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/85">
                      Berita Kanwil
                    </p>
                    <h3 className="mt-2 text-3xl font-bold text-white md:text-4xl">
                      Top 5 berita terbaru Kanwil Kemenag Lampung
                    </h3>
                  </div>
                  <Badge className="border-white/25 bg-white/15 px-3 py-2 text-white backdrop-blur-2xl">
                    <Newspaper className="mr-2 h-4 w-4" />
                    {data.latestNews.length} Berita Terbaru
                  </Badge>
                </div>

                <div className="grid min-h-0 items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_520px]">
                  {featuredNews ? (
                    <Link
                      href={featuredNews.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group block min-h-0 overflow-hidden rounded-lg border border-white/35 bg-white/18 shadow-glass backdrop-blur-2xl"
                    >
                      <div className="relative h-full min-h-[460px] overflow-hidden">
                        <Image
                          src={featuredNews.imageUrl}
                          alt={featuredNews.title}
                          fill
                          sizes="(min-width: 1280px) calc(100vw - 640px), 100vw"
                          className="object-cover transition duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/92 via-slate-950/28 to-white/5" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(16,185,129,0.36),transparent_30%),radial-gradient(circle_at_82%_82%,rgba(245,158,11,0.28),transparent_34%)]" />
                        <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-6">
                          <div className="mb-4 flex flex-wrap items-center gap-2">
                            <Badge className="bg-emerald-500 text-white">
                              {featuredNews.category}
                            </Badge>
                            <span className="rounded-md border border-white/25 bg-white/20 px-2.5 py-1 text-xs font-semibold backdrop-blur-2xl">
                              {featuredNews.date}
                            </span>
                          </div>
                          <h4 className="max-w-4xl text-3xl font-bold leading-tight md:text-5xl">
                            {featuredNews.title}
                          </h4>
                          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/85">
                            Baca berita resmi
                            <ArrowUpRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="grid h-full place-items-center rounded-lg border border-white/20 bg-white/10 p-6 text-center text-white/70">
                      Berita terbaru belum tersedia dari API.
                    </div>
                  )}

                  <div className="grid min-h-0 content-start gap-4 overflow-hidden">
                    {secondaryNews.map((item, index) => (
                      <Link
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group grid min-h-[150px] overflow-hidden rounded-lg border border-white/35 bg-white/12 shadow-glass backdrop-blur-2xl transition duration-300 hover:border-emerald-200/55 hover:bg-white/18 md:grid-cols-[190px_1fr]"
                      >
                        <div className="relative min-h-[150px] overflow-hidden">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            sizes="190px"
                            className="object-cover transition duration-700 group-hover:scale-105"
                          />
                          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                            <Badge
                              className={index % 2 === 0 ? "bg-sky-500" : "bg-amber-500"}
                            >
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex min-h-[150px] flex-col justify-between p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-200">
                            {item.date}
                          </p>
                          <h4 className="mt-2 line-clamp-3 text-xl font-bold leading-snug text-white">
                            {item.title}
                          </h4>
                          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-200">
                            Baca selengkapnya
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {activeSlide === 4 ? (
              <div className="executive-monitor-card grid h-full gap-4 p-5 md:p-7">
                <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/75">
                      Dashboard Interaktif
                    </p>
                    <h3 className="mt-2 text-3xl font-bold text-white md:text-4xl">
                      Tren indikator layanan per tahun
                    </h3>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[400px]">
                    <MonitorStat label="Tahun" value={String(trendSnapshot.latestYear)} />
                    <MonitorStat label="Rata-rata" value={formatNumber(trendSnapshot.average)} />
                    <MonitorStat
                      label="Tertinggi"
                      value={formatNumber(trendSnapshot.strongestValue)}
                    />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="executive-monitor-tile">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
                      Kondisi umum
                    </span>
                    <strong className="text-2xl text-white">
                      {formatNumber(latestRowAverage)}
                    </strong>
                    <span className="text-sm text-white/68">
                      Rata-rata {latestDashboardRows.length} data terbaru.
                    </span>
                  </div>
                  <div className="executive-monitor-tile">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-200">
                      Capaian kuat
                    </span>
                    <strong className="text-2xl text-white">
                      {strongestLatestRow?.category ?? "-"}
                    </strong>
                    <span className="text-sm text-white/68">
                      {strongestLatestRow
                        ? `${strongestLatestRow.indicator}: ${formatNumber(strongestLatestRow.value)} ${strongestLatestRow.unit}`
                        : "Belum ada data terbaru."}
                    </span>
                  </div>
                  <div className="executive-monitor-tile">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
                      Perhatian
                    </span>
                    <strong className="text-2xl text-white">
                      {weakestLatestRow?.category ?? "-"}
                    </strong>
                    <span className="text-sm text-white/68">
                      {weakestLatestRow
                        ? `${weakestLatestRow.indicator}: ${formatNumber(weakestLatestRow.value)} ${weakestLatestRow.unit}`
                        : "Belum ada data terbaru."}
                    </span>
                  </div>
                </div>
                <div className="min-h-[360px] rounded-lg border border-white/20 bg-white/10 p-3 backdrop-blur-2xl">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartSeries} margin={{ top: 24, right: 24, bottom: 8, left: 0 }}>
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="4 10"
                        stroke="rgba(255, 255, 255, 0.18)"
                      />
                      <XAxis
                        dataKey="year"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "rgba(255,255,255,0.72)", fontSize: 12, fontWeight: 700 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "rgba(255,255,255,0.62)", fontSize: 12, fontWeight: 700 }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(255, 255, 255, 0.78)",
                          border: "1px solid rgba(255, 255, 255, 0.8)",
                          borderRadius: "12px",
                          boxShadow: "0 24px 70px rgba(0, 0, 0, 0.22)",
                          backdropFilter: "blur(18px)",
                        }}
                      />
                      <Legend wrapperStyle={{ color: "#ffffff", fontWeight: 700 }} />
                      {visibleCategories.map((item) => (
                        <Area
                          key={item}
                          type="monotone"
                          dataKey={item}
                          stroke={chartColors[item as keyof typeof chartColors]}
                          fill={chartColors[item as keyof typeof chartColors]}
                          fillOpacity={0.1}
                          strokeWidth={4}
                          dot={{ r: 3, fill: "#fff" }}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : null}

            {activeSlide === 5 ? (
              <div className="executive-photo-slide grid h-full min-h-0 gap-4 xl:grid-cols-[1.12fr_0.88fr]">
                <div className="executive-monitor-card overflow-hidden p-4 md:p-5">
                  {latestAward ? (
                    <div className="relative h-full min-h-[560px] overflow-hidden rounded-lg border border-white/25 bg-white/10">
                      <Image
                        src={latestAward.item.imageUrl}
                        alt={latestAward.item.title}
                        fill
                        sizes="(min-width: 1280px) 58vw, 100vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/88 via-slate-950/18 to-transparent" />
                      <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                        <Badge className="border-amber-100/50 bg-amber-300/80 text-slate-950">
                          Penghargaan Terbaru
                        </Badge>
                        <Badge className="border-white/35 bg-white/18 text-white backdrop-blur-2xl">
                          {latestAward.item.year}
                        </Badge>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                        <div className="rounded-lg border border-white/25 bg-slate-950/46 p-5 text-white shadow-glass backdrop-blur-2xl">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">
                            {latestAward.collection.title}
                          </p>
                          <h3 className="mt-3 text-4xl font-bold leading-tight">
                            {latestAward.item.title}
                          </h3>
                          <p className="mt-3 max-w-3xl text-base leading-7 text-white/72">
                            {latestAward.item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid h-full min-h-[560px] place-items-center rounded-lg border border-white/20 bg-white/10 p-8 text-center text-white/70">
                      Koleksi penghargaan belum tersedia.
                    </div>
                  )}
                </div>

                <div className="executive-monitor-card grid min-h-0 grid-rows-[auto_1fr] gap-5 p-5 md:p-7">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/85">
                      Penghargaan Kanwil
                    </p>
                    <h3 className="mt-2 text-3xl font-bold text-white md:text-4xl">
                      Prestasi terbaru untuk etalase pimpinan
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-white/68">
                      Menampilkan koleksi capaian Kanwil dan PPID sebagai bukti
                      layanan, tata kelola, serta keterbukaan informasi.
                    </p>
                  </div>

                  <div className="grid min-h-0 content-start gap-3">
                    <MonitorStat
                      label="Total Foto"
                      value={String(awardPhotoCount)}
                      tone="gold"
                    />
                    <MonitorStat
                      label="Koleksi"
                      value={String(data.awardCollections.length)}
                      tone="emerald"
                    />
                    {data.awardCollections.map((collection) => (
                      <div
                        key={collection.id}
                        className="rounded-lg border border-white/18 bg-white/12 p-4 shadow-glass backdrop-blur-2xl"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
                              {collection.id === "ppid" ? "PPID" : "Capaian Kanwil"}
                            </p>
                            <h4 className="mt-2 text-xl font-bold text-white">
                              {collection.title}
                            </h4>
                          </div>
                          <Badge className="border-white/25 bg-white/15 text-white">
                            {uniqueAwardItems(collection.items).length} Foto
                          </Badge>
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/66">
                          {collection.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {activeSlide === 6 ? (
              <div className="executive-monitor-card grid h-full min-h-0 gap-5 p-5 md:p-7 xl:grid-cols-[0.88fr_1.12fr]">
                <div className="grid min-h-0 content-between gap-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/85">
                      Kesimpulan Eksekutif
                    </p>
                    <h3 className="mt-2 text-4xl font-bold leading-tight text-white md:text-5xl">
                      Performance Kanwil saat ini
                    </h3>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
                      Ringkasan otomatis dari indikator, dataset, agenda SIMANDA,
                      berita resmi, dan penghargaan terbaru.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <MonitorStat
                      label="Rata-rata"
                      value={formatNumber(latestRowAverage)}
                      tone="emerald"
                    />
                    <MonitorStat
                      label="Data terbaru"
                      value={String(latestDashboardRows.length)}
                      tone="cyan"
                    />
                    <MonitorStat
                      label="Agenda dekat"
                      value={focusSchedule ? "1" : "0"}
                      tone="gold"
                    />
                    <MonitorStat
                      label="Berita"
                      value={String(data.latestNews.length)}
                      tone="blue"
                    />
                  </div>

                  <div className="rounded-lg border border-amber-200/25 bg-amber-300/12 p-5 shadow-glass backdrop-blur-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-100">
                      Rekomendasi singkat
                    </p>
                    <p className="mt-3 text-lg font-semibold leading-8 text-white">
                      Pertahankan capaian tertinggi, pantau indikator terendah,
                      pastikan agenda prioritas terdekat terbaca jelas, dan terus
                      perbarui dataset agar AI serta slideshow memberi ringkasan
                      yang relevan.
                    </p>
                  </div>
                </div>

                <div className="grid min-h-0 content-start gap-3 overflow-y-auto pr-1">
                  {executiveConclusions.map((point, index) => {
                    const tones = ["emerald", "cyan", "gold", "blue", "violet", "rose"] as const;
                    const tone = tones[index % tones.length];

                    return (
                      <div
                        key={point}
                        className={`executive-monitor-tile monitor-stat-${tone} items-start gap-4`}
                        style={toneStyle(tone)}
                      >
                        <div
                          className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-white/20 bg-white/12 text-sm font-bold text-white shadow-glass summary-tone-${tone}`}
                          style={toneStyle(tone)}
                        >
                          {index + 1}
                        </div>
                        <p className="text-lg font-semibold leading-8 text-white/86">
                          {point}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {activeSlide === 7 ? (
              <div className="executive-photo-slide grid h-full gap-4 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="executive-monitor-card p-5 md:p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/75">
                    Jadwal Rilis
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-white md:text-4xl">
                    Publikasi data dan dokumen resmi
                  </h3>
                  <p className="mt-3 text-base leading-7 text-white/70">
                    Menu ini menggantikan blok publikasi lama agar jadwal penerbitan
                    data, buku statistik, dan dokumen pendukung lebih terstruktur
                    seperti portal Satu Data.
                  </p>
                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    <MonitorStat
                      label="Jadwal"
                      value={String(data.releaseSchedules.length)}
                      tone="emerald"
                    />
                    <MonitorStat
                      label="Rilis"
                      value={String(
                        data.releaseSchedules.filter((release) => release.status === "rilis")
                          .length,
                      )}
                      tone="gold"
                    />
                  </div>
                </div>
                <div className="executive-monitor-card p-5 md:p-7">
                  <div className="grid gap-3">
                    {data.releaseSchedules.map((release, index) => (
                      <div key={release.id} className="executive-monitor-tile">
                        <div className="flex items-start gap-4">
                          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-white/25 bg-white/15 text-lg font-bold text-white">
                            {index + 1}
                          </div>
                          <div className="min-w-0">
                            <Badge className="mb-2 border-white/25 bg-white/15 text-white">
                              {release.format}
                            </Badge>
                            <h4 className="text-lg font-bold leading-snug text-white">
                              {release.title}
                            </h4>
                            <p className="mt-1 text-sm text-white/62">
                              Periode {release.period} · {release.language}
                            </p>
                          </div>
                        </div>
                        <div className="grid shrink-0 gap-2 text-right text-sm">
                          <span className="font-semibold text-white">
                            Jadwal {release.scheduledDate}
                          </span>
                          <span className="text-white/60">
                            Realisasi {release.realizedDate}
                          </span>
                          <Badge className="justify-center border-emerald-200/35 bg-emerald-300/18 text-emerald-50">
                            {release.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {activeSlide === 8 ? (
              <div className="executive-photo-slide grid h-full gap-4 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="executive-monitor-card p-5 md:p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/75">
                    Geotagging
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-white">
                    Lokasi kantor Kemenag se-Lampung
                  </h3>
                  <p className="mt-3 text-base leading-7 text-white/70">
                    Satu titik Kanwil dan lima belas kantor kabupaten/kota disajikan
                    sebagai peta operasional untuk memudahkan koordinasi wilayah.
                  </p>
                  <div className="mt-7 grid gap-3">
                    <MonitorStat
                      label="Total Kantor"
                      value={String(data.officeLocations.length)}
                      tone="emerald"
                    />
                    <MonitorStat label="Kanwil" value="1" tone="gold" />
                    <MonitorStat
                      label="Kab/Kota"
                      value={String(Math.max(data.officeLocations.length - 1, 0))}
                      tone="cyan"
                    />
                  </div>
                </div>
                <div className="executive-monitor-card grid min-h-0 grid-rows-[1fr_auto] gap-4 p-4 md:p-5">
                  <div className="overflow-hidden rounded-lg border border-white/25 bg-white/10">
                    {data.officeLocations[0] ? (
                      <iframe
                        title={`Peta ${data.officeLocations[0].name}`}
                        src={`https://www.google.com/maps?q=${data.officeLocations[0].latitude},${data.officeLocations[0].longitude}&z=9&output=embed`}
                        className="h-full min-h-[360px] w-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    ) : null}
                  </div>
                  <div className="grid max-h-52 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                    {data.officeLocations.slice(0, 8).map((office) => (
                      <Link
                        key={office.id}
                        href={office.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-white/20 bg-white/10 p-3 text-white transition hover:bg-white/16"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100/70">
                          {office.type}
                        </p>
                        <h4 className="mt-1 line-clamp-1 font-bold">{office.name}</h4>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/62">
                          {office.address}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <div className="h-2 overflow-hidden rounded-full border border-white/20 bg-white/10 backdrop-blur-2xl">
              <div
                key={`${activeSlide}-${playing}`}
                className={`executive-monitor-progress ${playing ? "running" : ""}`}
                style={{ animationDuration: `${intervalMs}ms` }}
              />
            </div>
            <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-white/70 md:justify-end">
              <span>
                Slide {activeSlide + 1}/{slides.length}
              </span>
              <span>{playing ? "Auto play" : "Paused"}</span>
            </div>
          </div>
        </div>
      </div>
      <AiAssistant variant="slideshow" />
    </main>
  );
}

function SummaryDataCard({
  label,
  value,
  helper,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  helper: string;
  icon: ElementType;
  tone: DashboardTone;
}) {
  return (
    <div
      className={`summary-data-card monitor-stat-${tone} summary-tone-${tone}`}
      style={{ "--summary-tone": toneColors[tone] } as CSSProperties}
    >
      <span className={`summary-data-icon summary-tone-${tone}`} style={toneStyle(tone)}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className={`summary-kicker summary-text-${tone}`} style={toneStyle(tone)}>
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold leading-none text-white">
          {formatNumber(value)}
        </p>
        <p className="mt-1 truncate text-xs text-white/65">{helper}</p>
      </div>
    </div>
  );
}

function MonitorStat({
  label,
  value,
  tone = "emerald",
}: {
  label: string;
  value: string;
  tone?: DashboardTone;
}) {
  return (
    <div className={`monitor-stat monitor-stat-${tone}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/70">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold leading-none text-white">{value}</p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="p-4">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

function ScheduleMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/20 bg-white/10 p-3 shadow-sm backdrop-blur-2xl">
      <p className="text-xs font-medium uppercase tracking-wide text-white/60">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function statusLabel(status: DashboardData["executiveSchedules"][number]["status"]) {
  const labels = {
    terjadwal: "Terjadwal",
    berjalan: "Berjalan",
    selesai: "Selesai",
    belum: "Belum",
  };

  return labels[status];
}

function statusBadgeClass(status: DashboardData["executiveSchedules"][number]["status"]) {
  const base =
    "inline-flex w-fit items-center justify-center rounded-md border px-3 py-1 text-sm font-semibold shadow-sm backdrop-blur-2xl";
  const styles = {
    berjalan:
      "border-amber-300/70 bg-amber-100/70 text-amber-800 shadow-amber-900/5",
    terjadwal:
      "border-sky-300/70 bg-sky-100/70 text-sky-800 shadow-sky-900/5",
    selesai:
      "border-emerald-300/70 bg-emerald-100/70 text-emerald-800 shadow-emerald-900/5",
    belum:
      "border-yellow-300/70 bg-yellow-100/75 text-yellow-800 shadow-yellow-900/5",
  };

  return `${base} ${styles[status]}`;
}

function EmptyState() {
  return (
    <div className="grid min-h-[180px] place-items-center rounded-lg border border-dashed border-white/70 bg-white/30 p-6 text-center text-sm text-muted-foreground backdrop-blur-2xl">
      Tidak ada data untuk kombinasi filter ini.
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-md border border-white/70 bg-white/30 p-3 shadow-sm backdrop-blur-2xl">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function Footer({ contact }: { contact: DashboardData["contact"] }) {
  return (
    <footer className="border-t border-white/10 bg-slate-950/95 text-white backdrop-blur-xl">
      <div className="container grid gap-8 py-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <div className="flex items-center gap-3">
            <BrandMark compact />
            <div>
              <p className="font-bold">Dashboard Digital Kanwil</p>
              <p className="text-sm text-white/70">{contact.institution}</p>
            </div>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
            Media penyajian agenda pimpinan, data strategis, publikasi statistik,
            dan layanan informasi Kanwil Kementerian Agama Provinsi Lampung.
          </p>
        </div>
        <div>
          <p className="font-semibold">Kanal</p>
          <div className="mt-3 grid gap-2 text-sm text-white/70">
            <span>{contact.instagram}</span>
            <span>{contact.youtube}</span>
            <span>{contact.whatsapp}</span>
          </div>
        </div>
        <div>
          <p className="font-semibold">Hak Cipta</p>
          <p className="mt-3 text-sm leading-6 text-white/70">
            © 2026 {contact.institution}. Seluruh informasi disajikan untuk
            pelayanan publik.
          </p>
        </div>
      </div>
    </footer>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 1,
  }).format(value);
}

function normalizeDisplayText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
