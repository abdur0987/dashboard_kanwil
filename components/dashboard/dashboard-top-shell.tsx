import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Database,
  ExternalLink,
  Globe2,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type { DashboardData } from "@/lib/types";

const navigation = [
  { label: "Layanan", href: "#layanan-kanwil" },
  { label: "Capaian", href: "#capaian-kanwil" },
  { label: "Infografis", href: "#infografis-kanwil" },
  { label: "Penghargaan", href: "#penghargaan" },
  { label: "Indikator", href: "#indikator" },
  { label: "Agenda", href: "#agenda" },
  { label: "Satu Data", href: "#dashboard" },
  { label: "Berita", href: "#berita" },
];

export function DashboardTopShell({
  contact,
}: {
  contact: DashboardData["contact"];
}) {
  return (
    <>
      <div className="border-b border-white/10 bg-slate-950 text-white shadow-sm">
        <div className="container flex flex-col gap-2 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
            <span className="inline-flex items-center gap-2 text-white/88">
              <Phone className="h-3.5 w-3.5" />
              {contact.phone}
            </span>
            <span className="inline-flex items-center gap-2 text-white/88">
              <Mail className="h-3.5 w-3.5" />
              {contact.email}
            </span>
          </div>
          <span className="inline-flex items-center gap-2 text-white/75">
            <Globe2 className="h-3.5 w-3.5" />
            {contact.website}
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-emerald-950/10 bg-white/88 shadow-[0_12px_35px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
        <div className="container flex items-center justify-between gap-5 py-3">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm">
              <Image
                src="/brand/logo-kanwil-kemenag-lampung-icon.png"
                alt="Logo Kanwil Kementerian Agama Provinsi Lampung"
                width={48}
                height={48}
                className="h-full w-full object-contain p-0.5"
                priority
              />
            </span>
            <span className="min-w-0">
              <strong className="block truncate text-sm font-black tracking-tight text-slate-950 sm:text-base">
                Dashboard Digital Kanwil
              </strong>
              <span className="block truncate text-[11px] font-medium text-slate-500 sm:text-xs">
                Kementerian Agama Provinsi Lampung
              </span>
            </span>
          </Link>

          <nav
            aria-label="Navigasi dashboard"
            className="hidden items-center gap-1 xl:flex"
          >
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/slideshow"
              className="hidden items-center gap-2 rounded-xl border border-emerald-100 bg-white px-3.5 py-2.5 text-sm font-bold text-emerald-800 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 sm:inline-flex"
            >
              <BarChart3 className="h-4 w-4" />
              Slideshow
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-3.5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900"
            >
              Admin
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="border-t border-emerald-950/5 xl:hidden">
          <nav className="container flex gap-1 overflow-x-auto py-2" aria-label="Navigasi ringkas">
            {navigation.slice(0, 7).map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-emerald-950/10 bg-[linear-gradient(135deg,#052e25_0%,#075f46_52%,#0f766e_100%)] text-white">
        <div className="absolute inset-0 -z-10 opacity-70 [background-image:radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_88%_14%,rgba(251,191,36,0.28),transparent_24%),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:auto,auto,42px_42px,42px_42px]" />
        <div className="container grid gap-10 py-14 md:py-20 xl:grid-cols-[1.12fr_0.88fr] xl:items-center xl:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-50 backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Portal Data dan Layanan Terpadu
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl">
              Layanan publik, capaian, dan data Kanwil dalam satu pengalaman.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-emerald-50/78 md:text-lg">
              Akses cepat aplikasi resmi, pantau capaian layanan, baca infografis standar
              pelayanan, dan telusuri statistik sektoral Kementerian Agama Provinsi Lampung.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#layanan-kanwil"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-black text-emerald-950 shadow-[0_16px_38px_rgba(251,191,36,0.22)] transition hover:-translate-y-0.5 hover:bg-amber-300"
              >
                Jelajahi Layanan
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/16"
              >
                <Database className="h-4 w-4" />
                Buka Portal Satu Data
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-amber-300/12 blur-3xl" />
            <div className="overflow-hidden rounded-[1.75rem] border border-white/20 bg-white/10 p-4 shadow-[0_30px_90px_rgba(2,44,34,0.38)] backdrop-blur-2xl md:p-5">
              <div className="rounded-[1.35rem] border border-white/15 bg-slate-950/28 p-5 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-200">
                      Ringkasan Portal
                    </p>
                    <h2 className="mt-2 text-2xl font-black">Akses yang lebih terarah</h2>
                  </div>
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-emerald-200/20 bg-emerald-200/12 text-emerald-100">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                  <HeroSummaryCard
                    icon={Globe2}
                    label="Aplikasi"
                    value="20"
                    description="Layanan resmi"
                  />
                  <HeroSummaryCard
                    icon={ShieldCheck}
                    label="SPAK"
                    value="95,29"
                    description="April–Juni 2026"
                  />
                  <HeroSummaryCard
                    icon={Database}
                    label="Data"
                    value="Terpadu"
                    description="Statistik dan metadata"
                  />
                </div>

                <div className="mt-4 rounded-xl border border-white/15 bg-white/8 p-4 text-sm leading-6 text-white/72">
                  Informasi ditata berdasarkan kebutuhan pengguna: layanan terlebih dahulu,
                  kemudian capaian, infografis, indikator, agenda, dan dataset rinci.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function HeroSummaryCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof Globe2;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-emerald-100/80">
        <Icon className="h-4 w-4 text-amber-300" />
        {label}
      </div>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs leading-5 text-white/62">{description}</p>
    </div>
  );
}
