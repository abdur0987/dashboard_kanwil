"use client";

import { useMemo, useState, type ComponentType } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  BookOpenText,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Database,
  ExternalLink,
  FileCheck2,
  FileSignature,
  Files,
  Fingerprint,
  GraduationCap,
  HeartHandshake,
  IdCard,
  Landmark,
  LayoutGrid,
  Medal,
  PenTool,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

type ServiceCategory =
  | "Semua"
  | "Pelayanan Publik"
  | "Kepegawaian"
  | "Persuratan & Administrasi"
  | "Pendidikan"
  | "Keagamaan"
  | "Data & Informasi";

type ServiceItem = {
  name: string;
  category: Exclude<ServiceCategory, "Semua">;
  description: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

type InfographicItem = {
  id: string;
  title: string;
  unit: string;
  imageUrl: string;
};

const categoryTabs: ServiceCategory[] = [
  "Pelayanan Publik",
  "Kepegawaian",
  "Persuratan & Administrasi",
  "Pendidikan",
  "Keagamaan",
  "Data & Informasi",
  "Semua",
];

const services: ServiceItem[] = [
  {
    name: "PTSP Online",
    category: "Pelayanan Publik",
    description: "Pelayanan terpadu satu pintu Kementerian Agama.",
    href: "https://ptsp.kemenag.go.id",
    icon: FileCheck2,
  },
  {
    name: "Legalisir Ijazah",
    category: "Pelayanan Publik",
    description: "Pengajuan dan verifikasi legalisir ijazah madrasah.",
    href: "https://appmadrasah.kemenag.go.id",
    icon: BadgeCheck,
  },
  {
    name: "SIPPN-CARIYANLIK",
    category: "Pelayanan Publik",
    description: "Informasi standar dan katalog pelayanan publik.",
    href: "https://sippn.menpan.go.id",
    icon: SearchCheck,
  },
  {
    name: "PUSAKA",
    category: "Pelayanan Publik",
    description: "Super Apps layanan keagamaan dan Kementerian Agama.",
    href: "https://pusaka-v3.kemenag.go.id",
    icon: LayoutGrid,
  },
  {
    name: "LCKH Pegawai",
    category: "Kepegawaian",
    description: "Pelaporan capaian kinerja harian pegawai.",
    href: "https://sigerlampung.kemenag.go.id",
    icon: BriefcaseBusiness,
  },
  {
    name: "KINERJA",
    category: "Kepegawaian",
    description: "Pengelolaan dan evaluasi kinerja ASN.",
    href: "https://kinerja.bkn.go.id",
    icon: BarChart3,
  },
  {
    name: "ASN DIGITAL",
    category: "Kepegawaian",
    description: "Portal layanan digital aparatur sipil negara.",
    href: "https://asndigital.bkn.go.id",
    icon: IdCard,
  },
  {
    name: "ABSENSI",
    category: "Kepegawaian",
    description: "Presensi dan pemantauan kehadiran pegawai.",
    href: "https://absensi.kemenag.go.id",
    icon: Fingerprint,
  },
  {
    name: "HRMS",
    category: "Kepegawaian",
    description: "Human resources management system Kementerian Agama.",
    href: "https://hrms.kemenag.go.id",
    icon: UsersRound,
  },
  {
    name: "SIMPEG",
    category: "Kepegawaian",
    description: "Sistem informasi manajemen kepegawaian.",
    href: "https://simpeg5.kemenag.go.id",
    icon: BriefcaseBusiness,
  },
  {
    name: "TTE",
    category: "Persuratan & Administrasi",
    description: "Tanda tangan elektronik untuk dokumen kedinasan.",
    href: "https://tte.kemenag.go.id",
    icon: PenTool,
  },
  {
    name: "SRIKANDI",
    category: "Persuratan & Administrasi",
    description: "Sistem informasi kearsipan dinamis terintegrasi.",
    href: "https://srikandi.arsip.go.id",
    icon: Files,
  },
  {
    name: "e-REPORTING",
    category: "Persuratan & Administrasi",
    description: "Pelaporan kegiatan dan administrasi organisasi.",
    href: "https://lppk.dwp.or.id",
    icon: FileSignature,
  },
  {
    name: "Maktabah Al-Madrasah",
    category: "Pendidikan",
    description: "Perpustakaan digital pendidikan madrasah Lampung.",
    href: "https://digiliblampung.kemenag.go.id",
    icon: BookOpenText,
  },
  {
    name: "PINTAR",
    category: "Pendidikan",
    description: "Pelatihan dan pengembangan kompetensi ASN Kemenag.",
    href: "https://pintar.kemenag.go.id",
    icon: GraduationCap,
  },
  {
    name: "EMIS",
    category: "Pendidikan",
    description: "Sistem data pendidikan Islam terintegrasi.",
    href: "https://emis.kemenag.go.id",
    icon: Database,
  },
  {
    name: "HALAL",
    category: "Keagamaan",
    description: "Layanan pengajuan dan informasi sertifikasi halal.",
    href: "https://ptsp.halal.go.id",
    icon: CheckCircle2,
  },
  {
    name: "SIMAS",
    category: "Keagamaan",
    description: "Sistem informasi masjid dan musala nasional.",
    href: "https://simas.kemenag.go.id",
    icon: Landmark,
  },
  {
    name: "SIMKAH",
    category: "Keagamaan",
    description: "Sistem informasi manajemen nikah Kementerian Agama.",
    href: "https://simkah4.kemenag.go.id",
    icon: HeartHandshake,
  },
  {
    name: "DATA LAMPUNG",
    category: "Data & Informasi",
    description: "Portal data dan informasi Kanwil Kemenag Lampung.",
    href: "https://datalampung.kemenag.go.id",
    icon: Database,
  },
];

const infographics: InfographicItem[] = [
  {
    id: "tata-usaha",
    title: "Standar Pelayanan Bagian Tata Usaha",
    unit: "Bagian Tata Usaha",
    imageUrl: "https://lampung.kemenag.go.id/storage/infografis/infografis_2.jpg",
  },
  {
    id: "pendidikan-madrasah",
    title: "Standar Pelayanan Bidang Pendidikan Madrasah",
    unit: "Pendidikan Madrasah",
    imageUrl: "https://lampung.kemenag.go.id/storage/infografis/infografis_3.jpg",
  },
  {
    id: "papki",
    title: "Standar Pelayanan Bidang PAPKI",
    unit: "Pendidikan Agama dan Keagamaan Islam",
    imageUrl: "https://lampung.kemenag.go.id/storage/infografis/infografis_4.jpg",
  },
  {
    id: "urais",
    title: "Standar Pelayanan Bidang Urusan Agama Islam",
    unit: "Urusan Agama Islam",
    imageUrl: "https://lampung.kemenag.go.id/storage/infografis/infografis_5.jpg",
  },
  {
    id: "penais-zawa",
    title: "Standar Pelayanan Bidang Penais Zawa",
    unit: "Penerangan Agama Islam, Zakat dan Wakaf",
    imageUrl: "https://lampung.kemenag.go.id/storage/infografis/infografis_6.jpg",
  },
  {
    id: "bimas-hindu",
    title: "Standar Pelayanan Bimbingan Masyarakat Hindu",
    unit: "Bimas Hindu",
    imageUrl: "https://lampung.kemenag.go.id/storage/infografis/infografis_7.jpg",
  },
  {
    id: "bimas-katolik",
    title: "Standar Pelayanan Bimbingan Masyarakat Katolik",
    unit: "Bimas Katolik",
    imageUrl: "https://lampung.kemenag.go.id/storage/infografis/infografis_8.jpg",
  },
  {
    id: "bimas-kristen",
    title: "Standar Pelayanan Bimbingan Masyarakat Kristen",
    unit: "Bimas Kristen",
    imageUrl: "https://lampung.kemenag.go.id/storage/infografis/infografis_9.jpg",
  },
  {
    id: "bimas-buddha",
    title: "Standar Pelayanan Bimbingan Masyarakat Buddha",
    unit: "Bimas Buddha",
    imageUrl: "https://lampung.kemenag.go.id/storage/infografis/infografis_10.jpg",
  },
];

const categoryStyles: Record<
  Exclude<ServiceCategory, "Semua">,
  { icon: ComponentType<{ className?: string }>; accent: string; surface: string }
> = {
  "Pelayanan Publik": {
    icon: FileCheck2,
    accent: "text-blue-700",
    surface: "border-blue-100 bg-blue-50/65",
  },
  Kepegawaian: {
    icon: BriefcaseBusiness,
    accent: "text-violet-700",
    surface: "border-violet-100 bg-violet-50/65",
  },
  "Persuratan & Administrasi": {
    icon: Files,
    accent: "text-amber-700",
    surface: "border-amber-100 bg-amber-50/70",
  },
  Pendidikan: {
    icon: GraduationCap,
    accent: "text-cyan-700",
    surface: "border-cyan-100 bg-cyan-50/65",
  },
  Keagamaan: {
    icon: Landmark,
    accent: "text-emerald-700",
    surface: "border-emerald-100 bg-emerald-50/65",
  },
  "Data & Informasi": {
    icon: Database,
    accent: "text-rose-700",
    surface: "border-rose-100 bg-rose-50/65",
  },
};

export function ServiceAchievementShowcase() {
  const [activeCategory, setActiveCategory] =
    useState<ServiceCategory>("Pelayanan Publik");
  const [featuredInfographicId, setFeaturedInfographicId] = useState(
    infographics[0].id,
  );
  const [previewInfographicId, setPreviewInfographicId] = useState<string | null>(
    null,
  );

  const filteredServices = useMemo(() => {
    if (activeCategory === "Semua") return services;
    return services.filter((service) => service.category === activeCategory);
  }, [activeCategory]);

  const featuredInfographic =
    infographics.find((item) => item.id === featuredInfographicId) ?? infographics[0];
  const previewInfographic = previewInfographicId
    ? infographics.find((item) => item.id === previewInfographicId) ?? null
    : null;

  return (
    <>
      <section id="layanan-kanwil" className="border-b border-slate-200/80 bg-slate-50/70">
        <div className="container py-12 md:py-16">
          <SectionIntro
            eyebrow="Akses Cepat"
            title="Layanan Kanwil Kemenag Provinsi Lampung"
            description="Aplikasi resmi disusun berdasarkan kebutuhan pengguna agar layanan publik, kepegawaian, administrasi, pendidikan, keagamaan, dan data tidak bercampur dalam satu daftar panjang."
          />

          <div className="mt-7 flex gap-2 overflow-x-auto pb-2">
            {categoryTabs.map((category) => {
              const count =
                category === "Semua"
                  ? services.length
                  : services.filter((service) => service.category === category).length;
              const active = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition",
                    active
                      ? "border-emerald-800 bg-emerald-800 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800",
                  )}
                >
                  {category}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-black",
                      active ? "bg-white/16 text-white" : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-4 md:p-5">
            <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                  Kategori aktif
                </p>
                <h3 className="mt-1 text-xl font-black text-slate-950">
                  {activeCategory}
                </h3>
              </div>
              <p className="max-w-xl text-sm leading-6 text-slate-500">
                {filteredServices.length} aplikasi tersedia. Setiap kartu membuka sistem resmi
                pada tab baru.
              </p>
            </div>

            <div
              className={cn(
                "grid gap-3",
                activeCategory === "Semua"
                  ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
              )}
            >
              {filteredServices.map((service) => (
                <ServiceCard key={service.name} service={service} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="capaian-kanwil" className="relative isolate overflow-hidden bg-white">
        <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.14),transparent_48%),radial-gradient(circle_at_82%_10%,rgba(251,191,36,0.16),transparent_42%)]" />
        <div className="container py-12 md:py-16">
          <SectionIntro
            eyebrow="Capaian Kanwil"
            title="Capaian layanan yang mudah dibaca dan memiliki konteks"
            description="Capaian tidak hanya ditampilkan sebagai angka besar. Periode, jumlah responden, dan konteks pengukuran ditempatkan berdampingan agar tidak mudah disalahartikan."
          />

          <div className="mt-8 grid gap-4 xl:grid-cols-[1.16fr_0.84fr]">
            <article className="relative isolate overflow-hidden rounded-[1.75rem] border border-emerald-900/15 bg-[linear-gradient(135deg,#064e3b_0%,#047857_55%,#16a34a_100%)] p-6 text-white shadow-[0_28px_85px_rgba(6,78,59,0.2)] md:p-8">
              <div className="absolute -right-16 -top-16 -z-10 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
              <div className="absolute -bottom-24 left-1/4 -z-10 h-72 w-72 rounded-full bg-emerald-200/12 blur-3xl" />

              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-emerald-50">
                    <ShieldCheck className="h-4 w-4 text-amber-300" />
                    Survei Persepsi Anti Korupsi
                  </div>
                  <h3 className="mt-5 max-w-2xl text-3xl font-black leading-tight md:text-5xl">
                    Pelayanan publik yang transparan dan akuntabel
                  </h3>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50/76 md:text-base">
                    Nilai SPAK periode April sampai Juni 2026 menjadi capaian layanan
                    berbasis persepsi pengguna, bukan sekadar klaim internal instansi.
                  </p>
                </div>
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-white/20 bg-white/12 text-amber-300 backdrop-blur-xl">
                  <Medal className="h-8 w-8" />
                </span>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <AchievementMetric
                  icon={ShieldCheck}
                  label="Nilai Indeks"
                  value="95,29"
                  note="Skala indeks layanan"
                />
                <AchievementMetric
                  icon={UsersRound}
                  label="Pengguna Layanan"
                  value="102"
                  note="Responden survei"
                />
                <AchievementMetric
                  icon={CalendarDays}
                  label="Periode"
                  value="Apr–Jun"
                  note="Tahun 2026"
                />
              </div>
            </article>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <article className="rounded-2xl border border-amber-100 bg-amber-50/75 p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.13em] text-amber-700">
                      Prinsip penyajian
                    </p>
                    <h4 className="mt-2 text-xl font-black text-slate-950">
                      Nilai, periode, dan sumber tampil bersama
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Pengguna dapat membedakan capaian survei triwulanan dari indikator
                      tahunan atau statistik sektoral lainnya.
                    </p>
                  </div>
                </div>
              </article>

              <article className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.13em] text-emerald-700">
                      Galeri capaian
                    </p>
                    <h4 className="mt-2 text-xl font-black text-slate-950">
                      Siap dikembangkan menjadi riwayat capaian
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Struktur ini dapat dihubungkan ke panel admin untuk menyimpan judul,
                      tahun, nilai, sumber, dan gambar capaian secara dinamis.
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="infografis-kanwil" className="border-y border-slate-200/80 bg-slate-50/80">
        <div className="container py-12 md:py-16">
          <SectionIntro
            eyebrow="Galeri Infografis"
            title="Standar pelayanan berdasarkan unit kerja"
            description="Satu infografis ditampilkan sebagai fokus utama, sementara unit lainnya tersedia sebagai thumbnail. Pola ini menjaga halaman tetap rapi meskipun jumlah materi terus bertambah."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.08)]">
              <button
                type="button"
                onClick={() => setPreviewInfographicId(featuredInfographic.id)}
                className="group block w-full text-left"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                  <img
                    src={featuredInfographic.imageUrl}
                    alt={featuredInfographic.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/42 to-transparent p-5 pt-24 text-white md:p-6">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] backdrop-blur-xl">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Buka ukuran penuh
                    </span>
                    <h3 className="mt-3 text-2xl font-black leading-tight md:text-3xl">
                      {featuredInfographic.title}
                    </h3>
                    <p className="mt-2 text-sm text-white/72">{featuredInfographic.unit}</p>
                  </div>
                </div>
              </button>
            </article>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
              {infographics
                .filter((item) => item.id !== featuredInfographic.id)
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFeaturedInfographicId(item.id)}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_18px_45px_rgba(15,118,110,0.1)]"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3.5">
                      <p className="line-clamp-2 text-sm font-black leading-5 text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500">
                        {item.unit}
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </section>

      {previewInfographic ? (
        <div
          className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/88 p-3 backdrop-blur-md md:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={previewInfographic.title}
          onClick={() => setPreviewInfographicId(null)}
        >
          <div
            className="relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-950 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 text-white md:px-5">
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{previewInfographic.title}</p>
                <p className="mt-0.5 truncate text-xs text-white/60">
                  {previewInfographic.unit}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewInfographicId(null)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/16"
                aria-label="Tutup preview infografis"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-slate-900 p-2 md:p-4">
              <img
                src={previewInfographic.imageUrl}
                alt={previewInfographic.title}
                className="mx-auto h-auto max-h-[82vh] max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ServiceCard({ service }: { service: ServiceItem }) {
  const style = categoryStyles[service.category];
  const Icon = service.icon;

  return (
    <a
      href={service.href}
      target="_blank"
      rel="noreferrer"
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_18px_45px_rgba(15,118,110,0.1)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "grid h-12 w-12 shrink-0 place-items-center rounded-xl border",
            style.surface,
            style.accent,
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-700" />
      </div>
      <h4 className="mt-4 text-base font-black text-slate-950">{service.name}</h4>
      <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">
        {service.description}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <span className={cn("text-[10px] font-black uppercase tracking-[0.12em]", style.accent)}>
          {service.category}
        </span>
        <span className="text-[10px] font-bold text-slate-400">Aplikasi resmi</span>
      </div>
    </a>
  );
}

function AchievementMetric({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-white/16 bg-white/10 p-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-emerald-100/80">
        <Icon className="h-4 w-4 text-amber-300" />
        {label}
      </div>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs text-white/60">{note}</p>
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-4xl">
      <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        {eyebrow}
      </div>
      <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
        {description}
      </p>
    </div>
  );
}
