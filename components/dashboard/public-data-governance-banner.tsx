import { AlertTriangle, Database, ShieldCheck } from "lucide-react";

import type { DashboardData } from "@/lib/types";

export function PublicDataGovernanceBanner({
  rawData,
}: {
  rawData: DashboardData;
}) {
  const validationCount = rawData.indicators.filter(
    (indicator) => indicator.status === "perlu-validasi",
  ).length;
  const governedDatasetCount = rawData.datasets.filter((dataset) =>
    [1, 2, 3, 5].includes(dataset.id),
  ).length;

  return (
    <aside className="border-b border-amber-200/80 bg-amber-50/95 text-slate-900">
      <div className="container py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-800">
              <ShieldCheck className="h-4 w-4" />
              Tata Kelola Data Publik
            </div>
            <h2 className="mt-1 text-lg font-bold md:text-xl">
              Cara membaca data Bab 1–3 dan Indeks Pembangunan Statistik
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              Dashboard menampilkan data agregat. Indikator berstatus perlu-validasi
              tidak diterbitkan pada card publik, sedangkan nilai 0 dan N/A harus
              dibaca bersama periode, cakupan, definisi, dan sumber datanya.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[620px]">
            <GovernanceItem
              label="Angka 0"
              value="Bukan otomatis gagal"
              description="Pada IPS berarti Tidak Mengikuti; pada tabel lain harus dikonfirmasi produsen data."
            />
            <GovernanceItem
              label="N/A / kosong"
              value="Tidak dihitung sebagai 0"
              description="Ditampilkan sebagai tidak tersedia atau tidak berlaku sesuai konteks tabel."
            />
            <GovernanceItem
              label="Status publik"
              value={`${governedDatasetCount} dataset utama`}
              description={`${validationCount} indikator yang masih perlu validasi disembunyikan dari card publik.`}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-amber-200/70 pt-3 text-xs font-medium text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-amber-700" />
            Sumber: Dataset Bab 1, Bab 2, Bab 3, dan IPS Kanwil Kemenag Lampung
          </span>
          <span className="inline-flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />
            Data mentah tetap tersedia; grafik publik menggunakan lapisan validasi dan interpretasi.
          </span>
        </div>
      </div>
    </aside>
  );
}

function GovernanceItem({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-amber-200 bg-white/80 px-3 py-2.5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-[11px] leading-4 text-slate-600">{description}</p>
    </div>
  );
}
