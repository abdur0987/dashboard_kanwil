"use client";

import { useMemo, useRef, useState, type ElementType } from "react";
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
  BarChart3,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Globe2,
  Mail,
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
  Kesehatan: "#0f766e",
  Pendidikan: "#1d4ed8",
  Ekonomi: "#d97706",
  "Layanan Publik": "#be123c",
};

const navItems = [
  { label: "Indikator", href: "#indikator" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Publikasi", href: "#publikasi" },
  { label: "Video", href: "#video" },
  { label: "Kontak", href: "#kontak" },
  { label: "Lokasi", href: "#lokasi" },
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

      <section id="indikator" className="section-shell">
        <SectionHeading
          eyebrow="Indikator strategis"
          title="Ringkasan data prioritas instansi"
          description="Kartu indikator menampilkan angka utama, sumber data, dan status validasi agar masyarakat dapat memahami informasi penting tanpa membuka banyak dokumen."
        />
        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.indicators.map((indicator) => (
            <Card key={indicator.id} className="group overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-md border border-white/70 bg-white/50 p-2 text-primary shadow-sm backdrop-blur-xl transition group-hover:bg-white/80">
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
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {indicator.unit} - {indicator.year}
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

      <section id="dashboard" className="liquid-band border-y border-white/60">
        <div className="section-shell">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Dashboard interaktif"
              title="Eksplorasi grafik, tabel, dan sumber data"
              description="Gunakan filter untuk melihat perkembangan berdasarkan tahun, kategori, dan wilayah."
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

            <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Perbandingan Data Tampil</CardTitle>
                  <CardDescription>Nilai setiap indikator setelah filter diterapkan.</CardDescription>
                </CardHeader>
                <CardContent className="h-[320px]">
                  {filteredRows.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={filteredRows.slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.32)" />
                        <XAxis dataKey="category" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {filteredRows.slice(0, 8).map((row) => (
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

              <Card>
                <CardHeader>
                  <CardTitle>Tabel Data Indikator</CardTitle>
                  <CardDescription>Sumber dan periode data tetap terlihat untuk transparansi.</CardDescription>
                </CardHeader>
                <CardContent>
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
                <div className="max-w-2xl rounded-lg border border-white/20 bg-white/10 p-4 shadow-glass backdrop-blur-2xl">
                  <Badge className="mb-3 w-fit bg-white/20 text-white backdrop-blur">
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
                  <span className="rounded-md border border-white/70 bg-white/50 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
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
          <div className="grid h-10 w-10 place-items-center rounded-md border border-white/50 bg-primary/90 text-white shadow-sm backdrop-blur">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold leading-tight text-slate-900">Dashboard Digital</p>
            <p className="text-xs text-muted-foreground">Instansi Pemerintah</p>
          </div>
        </a>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Button key={item.href} asChild variant="ghost" size="sm">
              <a href={item.href}>{item.label}</a>
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
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-white/60"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
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
          "linear-gradient(100deg, rgba(7, 20, 43, 0.9), rgba(14, 116, 144, 0.42), rgba(255, 255, 255, 0.08)), url(https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80)",
      }}
    >
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      <div className="container relative flex min-h-[460px] flex-col justify-center py-12 text-white md:min-h-[560px]">
        <div className="max-w-4xl rounded-lg border border-white/20 bg-white/10 p-5 shadow-glass backdrop-blur-2xl md:p-7">
          <Badge className="mb-5 w-fit bg-white/20 text-white backdrop-blur">
            Portal data strategis dan layanan informasi
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
            Dashboard Digital Instansi Pemerintah
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 md:text-lg">
            Satu halaman untuk memantau indikator prioritas, grafik, tabel, publikasi,
            video informasi, kontak, dan lokasi resmi secara cepat.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="#dashboard">
                Lihat Dashboard
                <TrendingUp className="h-4 w-4" />
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
    <Card className="bg-white/50 shadow-none">
      <CardContent className="p-4">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
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

function EmptyState() {
  return (
    <div className="grid min-h-[180px] place-items-center rounded-lg border border-dashed border-white/70 bg-white/40 p-6 text-center text-sm text-muted-foreground backdrop-blur-xl">
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
    <div className="flex gap-3 rounded-md border border-white/70 bg-white/40 p-3 shadow-sm backdrop-blur-xl">
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
              <p className="font-bold">Dashboard Digital</p>
              <p className="text-sm text-white/70">{contact.institution}</p>
            </div>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
            Media penyajian data strategis, publikasi, dan layanan informasi yang
            mendukung transparansi serta keterbukaan data instansi.
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
