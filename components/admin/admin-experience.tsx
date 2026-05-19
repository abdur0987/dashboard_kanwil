"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import {
  ArrowLeft,
  Database,
  FileJson,
  LayoutDashboard,
  MapPin,
  Plus,
  Save,
  Trash2,
  Video,
} from "lucide-react";
import Link from "next/link";

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
import type {
  ActivitySlide,
  ContactInfo,
  DashboardData,
  DashboardRow,
  Indicator,
  IndicatorStatus,
  Publication,
  VideoItem,
} from "@/lib/types";

type AdminExperienceProps = {
  data: DashboardData;
};

type AdminTab = "overview" | "indicators" | "datasets" | "content" | "contact";

const tabs: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Ringkasan", icon: LayoutDashboard },
  { id: "indicators", label: "Indikator", icon: Database },
  { id: "datasets", label: "Data Tabel", icon: FileJson },
  { id: "content", label: "Konten", icon: Video },
  { id: "contact", label: "Kontak", icon: MapPin },
];

export function AdminExperience({ data }: AdminExperienceProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [indicators, setIndicators] = useState<Indicator[]>(data.indicators);
  const [rows, setRows] = useState<DashboardRow[]>(data.rows);
  const [publications, setPublications] = useState<Publication[]>(data.publications);
  const [activities, setActivities] = useState<ActivitySlide[]>(data.activities);
  const [videos, setVideos] = useState<VideoItem[]>(data.videos);
  const [contact, setContact] = useState<ContactInfo>(data.contact);

  const snapshot = useMemo(
    () => ({
      indicators,
      rows,
      chartSeries: data.chartSeries,
      publications,
      activities,
      videos,
      executiveSchedules: data.executiveSchedules,
      contact,
      filters: data.filters,
    }),
    [
      activities,
      contact,
      data.chartSeries,
      data.executiveSchedules,
      data.filters,
      indicators,
      publications,
      rows,
      videos,
    ],
  );

  const stats = useMemo(() => {
    const latestYear = rows.length ? Math.max(...rows.map((row) => row.year)) : "-";
    const validationCount = indicators.filter(
      (indicator) => indicator.status === "perlu-validasi",
    ).length;

    return {
      indicatorCount: indicators.length,
      rowCount: rows.length,
      publicationCount: publications.length,
      mediaCount: activities.length + videos.length,
      latestYear,
      validationCount,
    };
  }, [activities.length, indicators, publications.length, rows, videos.length]);

  function exportJson() {
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dashboard-admin-draft.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function addIndicator() {
    const nextId = nextNumericId(indicators);
    setIndicators((current) => [
      ...current,
      {
        id: nextId,
        name: "Indikator Baru",
        description: "Deskripsi singkat indikator.",
        category: "Layanan Publik",
        unit: "persen",
        source: "Sumber Data",
        year: 2026,
        value: 0,
        trend: 0,
        status: "perlu-validasi",
      },
    ]);
  }

  function addRow() {
    const nextId = nextNumericId(rows);
    setRows((current) => [
      ...current,
      {
        id: nextId,
        indicator: "Data Baru",
        category: "Layanan Publik",
        region: "Semua Wilayah",
        period: "Tahunan",
        year: 2026,
        value: 0,
        unit: "persen",
        source: "Sumber Data",
      },
    ]);
  }

  function addPublication() {
    const nextId = nextNumericId(publications);
    setPublications((current) => [
      ...current,
      {
        id: nextId,
        title: "Publikasi Baru",
        description: "Ringkasan dokumen publikasi.",
        date: "17 Mei 2026",
        category: "Laporan",
        fileLabel: "PDF",
      },
    ]);
  }

  function addActivity() {
    const nextId = nextNumericId(activities);
    setActivities((current) => [
      ...current,
      {
        id: nextId,
        title: "Kegiatan Baru",
        caption: "Keterangan singkat kegiatan.",
        imageUrl:
          "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
      },
    ]);
  }

  return (
    <main className="min-h-screen text-slate-950">
      <header className="border-b border-white/60 bg-white/65 shadow-sm backdrop-blur-2xl">
        <div className="container flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge variant="outline" className="mb-2 w-fit">
              Panel Admin
            </Badge>
            <h1 className="text-2xl font-bold md:text-3xl">
              Manajemen Dashboard Digital
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola draft indikator, data tabel, publikasi, media, dan kontak sebelum
              disambungkan ke API produksi.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Dashboard Publik
              </Link>
            </Button>
            <Button onClick={exportJson}>
              <Save className="h-4 w-4" />
              Ekspor Draft
            </Button>
          </div>
        </div>
      </header>

      <div className="section-shell">
        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <aside className="glass-panel-strong h-fit rounded-lg p-3">
            <nav className="grid gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex h-11 items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition ${
                      activeTab === tab.id
                        ? "bg-primary/90 text-white shadow-sm"
                        : "text-slate-700 hover:bg-white/60"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
            <div className="mt-4 rounded-md border border-amber-200/80 bg-amber-50/75 p-3 text-xs leading-5 text-amber-900">
              Perubahan masih berupa state lokal browser. Tombol ekspor menyediakan
              JSON draft untuk integrasi backend berikutnya.
            </div>
          </aside>

          <section className="space-y-4">
            {activeTab === "overview" ? (
              <OverviewPanel stats={stats} />
            ) : null}

            {activeTab === "indicators" ? (
              <IndicatorsPanel
                indicators={indicators}
                categories={data.filters.categories}
                onAdd={addIndicator}
                onDelete={(id) =>
                  setIndicators((current) => current.filter((item) => item.id !== id))
                }
                onUpdate={(id, patch) =>
                  setIndicators((current) =>
                    current.map((item) =>
                      item.id === id ? { ...item, ...patch } : item,
                    ),
                  )
                }
              />
            ) : null}

            {activeTab === "datasets" ? (
              <RowsPanel
                rows={rows}
                categories={data.filters.categories}
                regions={data.filters.regions}
                onAdd={addRow}
                onDelete={(id) =>
                  setRows((current) => current.filter((item) => item.id !== id))
                }
                onUpdate={(id, patch) =>
                  setRows((current) =>
                    current.map((item) =>
                      item.id === id ? { ...item, ...patch } : item,
                    ),
                  )
                }
              />
            ) : null}

            {activeTab === "content" ? (
              <ContentPanel
                publications={publications}
                activities={activities}
                videos={videos}
                onAddPublication={addPublication}
                onAddActivity={addActivity}
                onDeletePublication={(id) =>
                  setPublications((current) =>
                    current.filter((item) => item.id !== id),
                  )
                }
                onDeleteActivity={(id) =>
                  setActivities((current) => current.filter((item) => item.id !== id))
                }
                onUpdatePublication={(id, patch) =>
                  setPublications((current) =>
                    current.map((item) =>
                      item.id === id ? { ...item, ...patch } : item,
                    ),
                  )
                }
                onUpdateActivity={(id, patch) =>
                  setActivities((current) =>
                    current.map((item) =>
                      item.id === id ? { ...item, ...patch } : item,
                    ),
                  )
                }
                onUpdateVideo={(id, patch) =>
                  setVideos((current) =>
                    current.map((item) =>
                      item.id === id ? { ...item, ...patch } : item,
                    ),
                  )
                }
              />
            ) : null}

            {activeTab === "contact" ? (
              <ContactPanel
                contact={contact}
                onUpdate={(patch) => setContact((current) => ({ ...current, ...patch }))}
              />
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}

function OverviewPanel({
  stats,
}: {
  stats: {
    indicatorCount: number;
    rowCount: number;
    publicationCount: number;
    mediaCount: number;
    latestYear: number | string;
    validationCount: number;
  };
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetric label="Indikator" value={stats.indicatorCount} helper="kartu strategis" />
        <AdminMetric label="Baris Data" value={stats.rowCount} helper="siap difilter" />
        <AdminMetric
          label="Publikasi"
          value={stats.publicationCount}
          helper="dokumen tampil"
        />
        <AdminMetric label="Media" value={stats.mediaCount} helper="video dan slide" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Status Pengelolaan</CardTitle>
          <CardDescription>
            Ringkasan kesiapan konten berdasarkan draft dashboard saat ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <StatusRow label="Tahun data terbaru" value={String(stats.latestYear)} />
          <StatusRow
            label="Butuh validasi"
            value={`${stats.validationCount} indikator`}
          />
          <StatusRow label="Mode simpan" value="Draft lokal + ekspor JSON" />
          <StatusRow label="Target integrasi" value="API admin atau CMS headless" />
        </CardContent>
      </Card>
    </>
  );
}

function IndicatorsPanel({
  indicators,
  categories,
  onAdd,
  onDelete,
  onUpdate,
}: {
  indicators: Indicator[];
  categories: string[];
  onAdd: () => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, patch: Partial<Indicator>) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Manajemen Indikator Strategis</CardTitle>
          <CardDescription>
            Ubah nama, kategori, angka utama, sumber, dan status validasi.
          </CardDescription>
        </div>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        {indicators.map((indicator) => (
          <div
            key={indicator.id}
            className="rounded-lg border border-white/70 bg-white/45 p-4 shadow-sm backdrop-blur-xl"
          >
            <div className="grid gap-3 lg:grid-cols-[1.3fr_0.9fr_0.6fr_0.6fr]">
              <InputField
                label="Nama indikator"
                value={indicator.name}
                onChange={(value) => onUpdate(indicator.id, { name: value })}
              />
              <Select
                label="Kategori"
                value={indicator.category}
                options={categories
                  .filter((item) => item !== "Semua Kategori")
                  .map((item) => ({ label: item, value: item }))}
                onChange={(value) => onUpdate(indicator.id, { category: value })}
              />
              <InputField
                label="Nilai"
                type="number"
                value={indicator.value}
                onChange={(value) =>
                  onUpdate(indicator.id, { value: Number(value) })
                }
              />
              <InputField
                label="Tahun"
                type="number"
                value={indicator.year}
                onChange={(value) => onUpdate(indicator.id, { year: Number(value) })}
              />
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_0.5fr_0.7fr_0.6fr]">
              <InputField
                label="Deskripsi"
                value={indicator.description}
                onChange={(value) => onUpdate(indicator.id, { description: value })}
              />
              <InputField
                label="Satuan"
                value={indicator.unit}
                onChange={(value) => onUpdate(indicator.id, { unit: value })}
              />
              <InputField
                label="Sumber"
                value={indicator.source}
                onChange={(value) => onUpdate(indicator.id, { source: value })}
              />
              <Select
                label="Status"
                value={indicator.status}
                options={[
                  { label: "Aktif", value: "aktif" },
                  { label: "Perlu Validasi", value: "perlu-validasi" },
                ]}
                onChange={(value) =>
                  onUpdate(indicator.id, { status: value as IndicatorStatus })
                }
              />
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(indicator.id)}
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RowsPanel({
  rows,
  categories,
  regions,
  onAdd,
  onDelete,
  onUpdate,
}: {
  rows: DashboardRow[];
  categories: string[];
  regions: string[];
  onAdd: () => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, patch: Partial<DashboardRow>) => void;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Manajemen Data Tabel</CardTitle>
          <CardDescription>
            Draft data ini menjadi sumber filter, tabel, dan ekspor dashboard.
          </CardDescription>
        </div>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className="grid gap-3 rounded-lg border border-white/70 bg-white/45 p-4 shadow-sm backdrop-blur-xl xl:grid-cols-[1.2fr_0.8fr_0.8fr_0.6fr_0.55fr_auto]"
          >
            <InputField
              label="Indikator"
              value={row.indicator}
              onChange={(value) => onUpdate(row.id, { indicator: value })}
            />
            <Select
              label="Kategori"
              value={row.category}
              options={categories
                .filter((item) => item !== "Semua Kategori")
                .map((item) => ({ label: item, value: item }))}
              onChange={(value) => onUpdate(row.id, { category: value })}
            />
            <Select
              label="Wilayah"
              value={row.region}
              options={regions.map((item) => ({ label: item, value: item }))}
              onChange={(value) => onUpdate(row.id, { region: value })}
            />
            <InputField
              label="Tahun"
              type="number"
              value={row.year}
              onChange={(value) => onUpdate(row.id, { year: Number(value) })}
            />
            <InputField
              label="Nilai"
              type="number"
              value={row.value}
              onChange={(value) => onUpdate(row.id, { value: Number(value) })}
            />
            <div className="flex items-end justify-end">
              <Button variant="outline" size="icon" onClick={() => onDelete(row.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ContentPanel({
  publications,
  activities,
  videos,
  onAddPublication,
  onAddActivity,
  onDeletePublication,
  onDeleteActivity,
  onUpdatePublication,
  onUpdateActivity,
  onUpdateVideo,
}: {
  publications: Publication[];
  activities: ActivitySlide[];
  videos: VideoItem[];
  onAddPublication: () => void;
  onAddActivity: () => void;
  onDeletePublication: (id: number) => void;
  onDeleteActivity: (id: number) => void;
  onUpdatePublication: (id: number, patch: Partial<Publication>) => void;
  onUpdateActivity: (id: number, patch: Partial<ActivitySlide>) => void;
  onUpdateVideo: (id: number, patch: Partial<VideoItem>) => void;
}) {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Publikasi</CardTitle>
            <CardDescription>Kelola kartu dokumen resmi pada dashboard publik.</CardDescription>
          </div>
          <Button onClick={onAddPublication}>
            <Plus className="h-4 w-4" />
            Tambah
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3">
          {publications.map((publication) => (
            <div
              key={publication.id}
              className="grid gap-3 rounded-lg border border-white/70 bg-white/45 p-4 shadow-sm backdrop-blur-xl lg:grid-cols-[1fr_0.6fr_0.5fr_auto]"
            >
              <InputField
                label="Judul"
                value={publication.title}
                onChange={(value) =>
                  onUpdatePublication(publication.id, { title: value })
                }
              />
              <InputField
                label="Kategori"
                value={publication.category}
                onChange={(value) =>
                  onUpdatePublication(publication.id, { category: value })
                }
              />
              <InputField
                label="Format"
                value={publication.fileLabel}
                onChange={(value) =>
                  onUpdatePublication(publication.id, { fileLabel: value })
                }
              />
              <div className="flex items-end justify-end">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDeletePublication(publication.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <TextAreaField
                className="lg:col-span-4"
                label="Deskripsi"
                value={publication.description}
                onChange={(value) =>
                  onUpdatePublication(publication.id, { description: value })
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Video Informasi</CardTitle>
          <CardDescription>Perbarui embed YouTube dan narasi video prioritas.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="grid gap-3 rounded-lg border border-white/70 bg-white/45 p-4 shadow-sm backdrop-blur-xl lg:grid-cols-2"
            >
              <InputField
                label="Judul video"
                value={video.title}
                onChange={(value) => onUpdateVideo(video.id, { title: value })}
              />
              <InputField
                label="URL embed"
                value={video.embedUrl}
                onChange={(value) => onUpdateVideo(video.id, { embedUrl: value })}
              />
              <TextAreaField
                className="lg:col-span-2"
                label="Deskripsi"
                value={video.description}
                onChange={(value) =>
                  onUpdateVideo(video.id, { description: value })
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Slideshow Kegiatan</CardTitle>
            <CardDescription>Atur judul, caption, dan URL foto kegiatan.</CardDescription>
          </div>
          <Button onClick={onAddActivity}>
            <Plus className="h-4 w-4" />
            Tambah
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="grid gap-3 rounded-lg border border-white/70 bg-white/45 p-4 shadow-sm backdrop-blur-xl lg:grid-cols-[0.75fr_1fr_auto]"
            >
              <div
                className="min-h-32 rounded-md border border-white/70 bg-cover bg-center"
                style={{ backgroundImage: `url(${activity.imageUrl})` }}
              />
              <div className="grid gap-3">
                <InputField
                  label="Judul"
                  value={activity.title}
                  onChange={(value) => onUpdateActivity(activity.id, { title: value })}
                />
                <InputField
                  label="URL gambar"
                  value={activity.imageUrl}
                  onChange={(value) =>
                    onUpdateActivity(activity.id, { imageUrl: value })
                  }
                />
                <TextAreaField
                  label="Caption"
                  value={activity.caption}
                  onChange={(value) =>
                    onUpdateActivity(activity.id, { caption: value })
                  }
                />
              </div>
              <div className="flex items-start justify-end">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDeleteActivity(activity.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ContactPanel({
  contact,
  onUpdate,
}: {
  contact: ContactInfo;
  onUpdate: (patch: Partial<ContactInfo>) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Kontak dan Lokasi</CardTitle>
        <CardDescription>
          Data ini digunakan pada topbar, kontak resmi, peta, dan footer dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {(Object.keys(contact) as (keyof ContactInfo)[]).map((key) => (
          <InputField
            key={key}
            label={contactLabels[key]}
            value={contact[key]}
            onChange={(value) => onUpdate({ [key]: value })}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function AdminMetric({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-white/70 bg-white/45 px-4 py-3 shadow-sm backdrop-blur-xl">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  className,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number";
  className?: string;
}) {
  return (
    <label className={`grid gap-2 text-sm font-medium text-slate-700 ${className ?? ""}`}>
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        className="h-11 rounded-md border border-white/70 bg-white/60 px-3 text-sm text-slate-900 shadow-sm outline-none backdrop-blur-xl transition hover:bg-white/75 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`grid gap-2 text-sm font-medium text-slate-700 ${className ?? ""}`}>
      <span>{label}</span>
      <textarea
        value={value}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
        rows={3}
        className="rounded-md border border-white/70 bg-white/60 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none backdrop-blur-xl transition hover:bg-white/75 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

const contactLabels: Record<keyof ContactInfo, string> = {
  institution: "Instansi",
  address: "Alamat",
  phone: "Telepon",
  whatsapp: "WhatsApp",
  email: "Email",
  instagram: "Instagram",
  youtube: "YouTube",
  website: "Website",
  mapEmbedUrl: "URL embed peta",
};

function nextNumericId(items: { id: number }[]) {
  return items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}
