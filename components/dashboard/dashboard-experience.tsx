"use client";

import { useEffect, useMemo, useRef, useState, type ElementType } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Award,
  BarChart3,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Globe2,
  Landmark,
  Mail,
  MapPinned,
  MapPin,
  Menu,
  Phone,
  PlayCircle,
  ShieldCheck,
  TrendingUp,
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
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DashboardData, DashboardRow } from "@/lib/types";

type DashboardExperienceProps = {
  data: DashboardData;
};

const chartColors = {
  "Pendidikan Madrasah": "#0f766e",
  "Bimas Islam": "#1d7f5f",
  "SPAK": "#ca8a04",
  "Layanan Publik": "#1e3a8a",
};

const navItems = [
  { label: "Penghargaan", href: "#penghargaan" },
  { label: "Indikator", href: "#indikator" },
  { label: "Agenda", href: "#agenda" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Publikasi", href: "#publikasi" },
  { label: "Video", href: "#video" },
  { label: "Kontak", href: "#kontak" },
  { label: "Lokasi", href: "#lokasi" },
  { label: "Admin", href: "/admin" },
];

export function DashboardExperience({ data }: DashboardExperienceProps) {
  const [year, setYear] = useState("Semua Tahun");
  const [category, setCategory] = useState("Semua Kategori");
  const [region, setRegion] = useState("Semua Wilayah");
  const [currentSlide, setCurrentSlide] = useState(0);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const filteredRows = useMemo(() => {
    return data.rows.filter((row) => {
      const yearMatch = year === "Semua Tahun" || String(row.year) === year;
      const categoryMatch = category === "Semua Kategori" || row.category === category;
      const regionMatch = region === "Semua Wilayah" || row.region === region;
      return yearMatch && categoryMatch && regionMatch;
    });
  }, [category, data.rows, region, year]);

  const kpi = useMemo(() => {
    const values = filteredRows.map((row) => row.value);
    const average = values.length
      ? values.reduce((total, value) => total + value, 0) / values.length
      : 0;
    const latestYear = filteredRows.length
      ? Math.max(...filteredRows.map((row) => row.year))
      : "-";
    const sources = new Set(filteredRows.map((row) => row.source)).size;

    return {
      count: filteredRows.length,
      average,
      latestYear,
      sources,
    };
  }, [filteredRows]);

  const pieData = useMemo(() => {
    const totals = filteredRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.category] = (acc[row.category] ?? 0) + row.value;
      return acc;
    }, {});

    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [filteredRows]);

  const chartSeries = useMemo(() => {
    if (year === "Semua Tahun") {
      return data.chartSeries;
    }

    return data.chartSeries.filter((point) => String(point.year) === year);
  }, [data.chartSeries, year]);

  const visibleCategories = useMemo(() => {
    if (category === "Semua Kategori") {
      return data.filters.categories.filter((item) => item !== "Semua Kategori");
    }

    return [category];
  }, [category, data.filters.categories]);

  const comparisonData = useMemo(() => {
    return filteredRows.slice(0, 6).map((row) => ({
      ...row,
      shortIndicator:
        row.indicator.length > 30 ? `${row.indicator.slice(0, 30)}...` : row.indicator,
    }));
  }, [filteredRows]);

  const currentActivity = data.activities[currentSlide];

  function downloadCsv() {
    const header = [
      "Indikator",
      "Kategori",
      "Wilayah",
      "Periode",
      "Tahun",
      "Nilai",
      "Satuan",
      "Sumber",
    ];
    const csvRows = filteredRows.map((row) =>
      [
        row.indicator,
        row.category,
        row.region,
        row.period,
        row.year,
        row.value,
        row.unit,
        row.source,
      ]
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...csvRows].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dashboard-data.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function exportImage() {
    if (!dashboardRef.current) return;

    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(dashboardRef.current, {
      backgroundColor: "#f8fafc",
      scale: 2,
    });
    const link = document.createElement("a");
    link.download = "dashboard-digital.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function exportPdf() {
    if (!dashboardRef.current) return;

    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");
    const canvas = await html2canvas(dashboardRef.current, {
      backgroundColor: "#f8fafc",
      scale: 2,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const width = canvas.width * ratio;
    const height = canvas.height * ratio;
    pdf.addImage(imgData, "PNG", (pageWidth - width) / 2, 8, width, height);
    pdf.save("dashboard-digital.pdf");
  }

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
          description="Kartu indikator menampilkan layanan PTSP, pendidikan madrasah, Bimas Islam, serta Survei Persepsi Anti Korupsi sebagai gambaran kinerja publik Kanwil."
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
                Jadwal pimpinan dan koordinasi prioritas Kanwil Kementerian Agama
                Provinsi Lampung untuk monitoring layanan minggu ini.
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
                Data agenda bersifat contoh tampilan frontend dan siap diganti dengan
                kalender pimpinan atau API internal.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-3">
            {data.executiveSchedules.map((schedule) => (
              <Card key={schedule.id} className="shadow-none">
                <CardContent className="grid gap-4 p-4 md:grid-cols-[150px_1fr_auto] md:items-center">
                  <div>
                    <Badge
                      variant={schedule.priority === "utama" ? "success" : "outline"}
                      className="mb-2 w-fit"
                    >
                      {priorityLabel(schedule.priority)}
                    </Badge>
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
              eyebrow="Dashboard interaktif"
              title="Grafik layanan Kanwil Kemenag Lampung"
              description="Gunakan filter untuk melihat perkembangan berdasarkan tahun, bidang layanan, dan kabupaten/kota."
            />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={downloadCsv}>
                <ArrowDownToLine className="h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" onClick={exportImage}>
                <Download className="h-4 w-4" />
                PNG
              </Button>
              <Button onClick={exportPdf}>
                <FileText className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>

          <div className="glass-panel-strong mt-7 grid gap-4 rounded-lg p-4 md:grid-cols-3">
            <Select
              label="Tahun"
              value={year}
              options={data.filters.years.map((item) => ({ label: item, value: item }))}
              onChange={setYear}
            />
            <Select
              label="Kategori"
              value={category}
              options={data.filters.categories.map((item) => ({ label: item, value: item }))}
              onChange={setCategory}
            />
            <Select
              label="Wilayah"
              value={region}
              options={data.filters.regions.map((item) => ({ label: item, value: item }))}
              onChange={setRegion}
            />
          </div>

          <div ref={dashboardRef} className="glass-panel-strong mt-6 space-y-4 rounded-lg p-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Data tampil" value={String(kpi.count)} helper="baris data" />
              <MetricCard
                label="Rata-rata nilai"
                value={formatNumber(kpi.average)}
                helper="berdasarkan filter"
              />
              <MetricCard label="Tahun terbaru" value={String(kpi.latestYear)} helper="periode data" />
              <MetricCard label="Sumber data" value={String(kpi.sources)} helper="instansi/unit" />
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Tren Indikator per Tahun</CardTitle>
                  <CardDescription>Legenda menunjukkan kategori data strategis.</CardDescription>
                </CardHeader>
                <CardContent className="h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartSeries}>
                      <defs>
                        {visibleCategories.map((item) => (
                          <linearGradient key={item} id={`fill-${item}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColors[item as keyof typeof chartColors]} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={chartColors[item as keyof typeof chartColors]} stopOpacity={0.03} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.32)" />
                      <XAxis dataKey="year" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Legend />
                      {visibleCategories.map((item) => (
                        <Area
                          key={item}
                          type="monotone"
                          dataKey={item}
                          stroke={chartColors[item as keyof typeof chartColors]}
                          fill={`url(#fill-${item})`}
                          strokeWidth={2}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Komposisi Kategori</CardTitle>
                  <CardDescription>Akumulasi nilai berdasarkan hasil filter.</CardDescription>
                </CardHeader>
                <CardContent className="h-[340px]">
                  {pieData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={58}
                          outerRadius={95}
                          paddingAngle={4}
                        >
                          {pieData.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={chartColors[entry.name as keyof typeof chartColors] ?? "#64748b"}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState />
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid items-start gap-4 xl:grid-cols-[minmax(360px,0.82fr)_minmax(560px,1.18fr)]">
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle>Perbandingan Data Tampil</CardTitle>
                  <CardDescription>
                    Ringkasan indikator teratas dalam format horizontal agar mudah dibaca.
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[360px]">
                  {comparisonData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={comparisonData}
                        layout="vertical"
                        margin={{ top: 8, right: 18, bottom: 8, left: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.32)" />
                        <XAxis type="number" tickLine={false} axisLine={false} />
                        <YAxis
                          type="category"
                          dataKey="shortIndicator"
                          width={132}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={18}>
                          {comparisonData.map((row) => (
                            <Cell
                              key={row.id}
                              fill={chartColors[row.category as keyof typeof chartColors] ?? "#64748b"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState />
                  )}
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle>Tabel Data Indikator</CardTitle>
                  <CardDescription>
                    Sumber dan periode data tetap terlihat untuk transparansi.
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[560px] overflow-auto pr-3">
                  <DataTable rows={filteredRows} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="overflow-hidden">
            <div
              className="min-h-[380px] bg-cover bg-center"
              style={{ backgroundImage: `url(${currentActivity.imageUrl})` }}
            >
              <div className="flex min-h-[380px] flex-col justify-end bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-white/5 p-5 text-white">
                <div className="max-w-2xl rounded-lg border border-white/25 bg-white/20 p-4 shadow-glass backdrop-blur-2xl">
                  <Badge className="mb-3 w-fit bg-white/20 text-white backdrop-blur-2xl">
                    Slideshow Kegiatan
                  </Badge>
                  <h2 className="text-2xl font-bold md:text-3xl">
                    {currentActivity.title}
                  </h2>
                  <p className="mt-2 text-sm text-white/85 md:text-base">
                    {currentActivity.caption}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      aria-label="Slide sebelumnya"
                      onClick={() =>
                        setCurrentSlide((value) =>
                          value === 0 ? data.activities.length - 1 : value - 1,
                        )
                      }
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      aria-label="Slide berikutnya"
                      onClick={() =>
                        setCurrentSlide((value) =>
                          value === data.activities.length - 1 ? 0 : value + 1,
                        )
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card id="video">
            <CardHeader>
              <div className="w-fit rounded-md border border-white/70 bg-rose-50/75 p-2 text-rose-700 shadow-sm backdrop-blur">
                <PlayCircle className="h-5 w-5" />
              </div>
              <CardTitle>{data.videos[0].title}</CardTitle>
              <CardDescription>{data.videos[0].description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video overflow-hidden rounded-lg border border-white/70 bg-white/40 shadow-inner backdrop-blur">
                <iframe
                  className="h-full w-full"
                  src={data.videos[0].embedUrl}
                  title={data.videos[0].title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="publikasi" className="liquid-band border-y border-white/60">
        <div className="section-shell">
          <SectionHeading
            eyebrow="Publikasi"
            title="Dokumen resmi dan materi informasi"
            description="Publikasi disiapkan sebagai pintu masuk menuju laporan, infografis, kebijakan, dan statistik sektoral."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {data.publications.map((publication) => (
              <Card key={publication.id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="outline">{publication.category}</Badge>
                    <span className="text-xs text-muted-foreground">{publication.date}</span>
                  </div>
                  <CardTitle className="leading-snug">{publication.title}</CardTitle>
                  <CardDescription>{publication.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3">
                  <span className="rounded-md border border-white/70 bg-white/40 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-2xl">
                    {publication.fileLabel}
                  </span>
                  <Button variant="outline" size="sm">
                    Baca/Unduh
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

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

function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/60 shadow-sm backdrop-blur-2xl">
      <div className="container flex min-h-16 items-center justify-between gap-4">
        <a href="#" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md border border-white/50 bg-primary/90 text-white shadow-sm backdrop-blur-2xl">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold leading-tight text-slate-900">Dashboard Digital Kanwil</p>
            <p className="text-xs text-muted-foreground">Kemenag Provinsi Lampung</p>
          </div>
        </a>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Button key={item.href} asChild variant="ghost" size="sm">
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
        <nav className="container grid gap-1 border-t border-white/50 bg-white/70 py-3 backdrop-blur-2xl md:hidden">
          {navItems.map((item) => (
            item.href.startsWith("#") ? (
              <a
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-white/60"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-white/60"
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
              <a href="#publikasi">
                Publikasi Resmi
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
  collection: DashboardData["awardCollections"][number];
  delay: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeAward = collection.items[activeIndex] ?? collection.items[0];
  const totalItems = collection.items.length;
  const accentLabel = collection.id === "ppid" ? "PPID" : "Capaian Kanwil";

  useEffect(() => {
    if (totalItems <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % totalItems);
    }, delay);

    return () => window.clearInterval(timer);
  }, [delay, totalItems]);

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
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1.5">
              {collection.items.map((award, index) => (
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
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
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

function DataTable({ rows }: { rows: DashboardRow[] }) {
  if (!rows.length) {
    return <EmptyState />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Indikator</TableHead>
          <TableHead>Kategori</TableHead>
          <TableHead>Wilayah</TableHead>
          <TableHead>Tahun</TableHead>
          <TableHead className="text-right">Nilai</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <div className="font-medium text-slate-900">{row.indicator}</div>
              <div className="text-xs text-muted-foreground">Sumber: {row.source}</div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{row.category}</Badge>
            </TableCell>
            <TableCell>{row.region}</TableCell>
            <TableCell>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                {row.year}
              </span>
            </TableCell>
            <TableCell className="text-right font-semibold">
              {formatNumber(row.value)} {row.unit}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function priorityLabel(priority: DashboardData["executiveSchedules"][number]["priority"]) {
  const labels = {
    utama: "Prioritas Utama",
    koordinasi: "Koordinasi",
    monitoring: "Monitoring",
  };

  return labels[priority];
}

function statusLabel(status: DashboardData["executiveSchedules"][number]["status"]) {
  const labels = {
    terjadwal: "Terjadwal",
    berjalan: "Berjalan",
    selesai: "Selesai",
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
            <div className="grid h-10 w-10 place-items-center rounded-md border border-white/20 bg-primary/90 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
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
