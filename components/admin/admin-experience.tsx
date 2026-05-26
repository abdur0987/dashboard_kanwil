"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowLeft,
  Database,
  FileJson,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Trash2,
  UserPlus,
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
import { authClient } from "@/lib/auth-client";
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

type AdminTab =
  | "overview"
  | "indicators"
  | "datasets"
  | "content"
  | "contact"
  | "account";

const tabs: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Ringkasan", icon: LayoutDashboard },
  { id: "indicators", label: "Indikator", icon: Database },
  { id: "datasets", label: "Data Tabel", icon: FileJson },
  { id: "content", label: "Konten", icon: Video },
  { id: "contact", label: "Kontak", icon: MapPin },
  { id: "account", label: "Akun Admin", icon: Settings },
];

export function AdminExperience({ data }: AdminExperienceProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [indicators, setIndicators] = useState<Indicator[]>(data.indicators);
  const [rows, setRows] = useState<DashboardRow[]>(data.rows);
  const [publications, setPublications] = useState<Publication[]>(data.publications);
  const [activities, setActivities] = useState<ActivitySlide[]>(data.activities);
  const [videos, setVideos] = useState<VideoItem[]>(data.videos);
  const [contact, setContact] = useState<ContactInfo>(data.contact);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authName, setAuthName] = useState("Admin Kanwil");
  const [authEmail, setAuthEmail] = useState("admin@lampung.kemenag.go.id");
  const [authPassword, setAuthPassword] = useState("dashboard-kanwil");
  const [authMessage, setAuthMessage] = useState("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountMessage, setAccountMessage] = useState("");
  const [isAccountSaving, setIsAccountSaving] = useState(false);
  const session = authClient.useSession();

  useEffect(() => {
    if (!session.data?.user) {
      return;
    }

    setAccountName(session.data.user.name);
    setAccountEmail(session.data.user.email);
  }, [session.data?.user]);

  const snapshot = useMemo(
    () => ({
      indicators,
      rows,
      chartSeries: data.chartSeries,
      publications,
      activities,
      videos,
      executiveSchedules: data.executiveSchedules,
      awardCollections: data.awardCollections,
      contact,
      filters: data.filters,
    }),
    [
      activities,
      contact,
      data.chartSeries,
      data.awardCollections,
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

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthMessage("");
    setIsAuthSubmitting(true);

    try {
      const result =
        authMode === "signin"
          ? await authClient.signIn.email({
              email: authEmail,
              password: authPassword,
            })
          : await authClient.signUp.email({
              name: authName,
              email: authEmail,
              password: authPassword,
            });

      if (result.error) {
        setAuthMessage(result.error.message ?? "Autentikasi gagal.");
        return;
      }

      await session.refetch();
      setAuthMessage("Berhasil masuk ke panel admin.");
    } catch {
      setAuthMessage("Autentikasi gagal. Periksa email dan password.");
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  async function saveToApi() {
    setSaveMessage("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/dashboard", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(snapshot),
      });

      if (!response.ok) {
        throw new Error("save_failed");
      }

      setSaveMessage("Perubahan tersimpan ke SQLite melalui API dashboard.");
    } catch {
      setSaveMessage("Gagal menyimpan. Pastikan sesi admin masih aktif.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    await authClient.signOut();
    await session.refetch();
  }

  async function saveAccountProfile() {
    if (!session.data?.user) {
      return;
    }

    setAccountMessage("");
    setIsAccountSaving(true);

    try {
      if (accountName.trim() && accountName.trim() !== session.data.user.name) {
        await postAuthAction("/api/auth/update-user", {
          name: accountName.trim(),
        });
      }

      if (
        accountEmail.trim() &&
        accountEmail.trim().toLowerCase() !== session.data.user.email.toLowerCase()
      ) {
        await postAuthAction("/api/auth/change-email", {
          newEmail: accountEmail.trim().toLowerCase(),
        });
      }

      await session.refetch();
      setAccountMessage("Profil admin berhasil diperbarui.");
    } catch (error) {
      setAccountMessage(getErrorMessage(error, "Gagal memperbarui profil admin."));
    } finally {
      setIsAccountSaving(false);
    }
  }

  async function saveAccountPassword() {
    setAccountMessage("");

    if (!currentPassword || !newPassword) {
      setAccountMessage("Password lama dan password baru wajib diisi.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setAccountMessage("Konfirmasi password baru belum sama.");
      return;
    }

    setIsAccountSaving(true);

    try {
      await postAuthAction("/api/auth/change-password", {
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await session.refetch();
      setAccountMessage("Password admin berhasil diperbarui.");
    } catch (error) {
      setAccountMessage(getErrorMessage(error, "Gagal memperbarui password admin."));
    } finally {
      setIsAccountSaving(false);
    }
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

  if (session.isPending) {
    return (
      <main className="grid min-h-screen place-items-center text-slate-950">
        <div className="glass-panel-strong rounded-lg p-6 text-center">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-primary" />
          <p className="mt-3 text-sm font-semibold">Memeriksa sesi admin...</p>
        </div>
      </main>
    );
  }

  if (!session.data) {
    return (
      <AuthScreen
        mode={authMode}
        name={authName}
        email={authEmail}
        password={authPassword}
        message={authMessage}
        isSubmitting={isAuthSubmitting}
        onModeChange={setAuthMode}
        onNameChange={setAuthName}
        onEmailChange={setAuthEmail}
        onPasswordChange={setAuthPassword}
        onSubmit={handleAuthSubmit}
      />
    );
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
            <Button onClick={saveToApi} disabled={isSaving}>
              {isSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Simpan ke API
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="h-4 w-4" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <div className="section-shell">
        {saveMessage ? (
          <div className="mb-4 rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-900 shadow-sm backdrop-blur-xl">
            {saveMessage}
          </div>
        ) : null}
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
              Perubahan diedit di browser, lalu disimpan permanen melalui API dashboard
              ke SQLite. Ekspor JSON tetap tersedia untuk backup draft.
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

            {activeTab === "account" ? (
              <AccountPanel
                name={accountName}
                email={accountEmail}
                currentPassword={currentPassword}
                newPassword={newPassword}
                confirmPassword={confirmPassword}
                message={accountMessage}
                isSaving={isAccountSaving}
                onNameChange={setAccountName}
                onEmailChange={setAccountEmail}
                onCurrentPasswordChange={setCurrentPassword}
                onNewPasswordChange={setNewPassword}
                onConfirmPasswordChange={setConfirmPassword}
                onSaveProfile={saveAccountProfile}
                onSavePassword={saveAccountPassword}
              />
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}

function AuthScreen({
  mode,
  name,
  email,
  password,
  message,
  isSubmitting,
  onModeChange,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: {
  mode: "signin" | "signup";
  name: string;
  email: string;
  password: string;
  message: string;
  isSubmitting: boolean;
  onModeChange: (mode: "signin" | "signup") => void;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-slate-950">
      <section className="glass-panel-strong w-full max-w-md rounded-lg p-6 shadow-2xl">
        <Badge variant="outline" className="mb-4 w-fit">
          Admin Backend
        </Badge>
        <h1 className="text-2xl font-bold">Masuk Panel Dashboard</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Gunakan akun Better Auth untuk menyimpan perubahan dashboard ke API dan
          database SQLite.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg border border-white/70 bg-white/45 p-1 shadow-inner backdrop-blur-xl">
          <button
            type="button"
            onClick={() => onModeChange("signin")}
            className={`h-10 rounded-md text-sm font-semibold transition ${
              mode === "signin"
                ? "bg-primary text-white shadow-sm"
                : "text-slate-700 hover:bg-white/70"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => onModeChange("signup")}
            className={`h-10 rounded-md text-sm font-semibold transition ${
              mode === "signup"
                ? "bg-primary text-white shadow-sm"
                : "text-slate-700 hover:bg-white/70"
            }`}
          >
            Buat Akun
          </button>
        </div>

        <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
          {mode === "signup" ? (
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              <span>Nama</span>
              <input
                value={name}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  onNameChange(event.target.value)
                }
                className="h-11 rounded-md border border-white/70 bg-white/65 px-3 text-sm text-slate-900 shadow-sm outline-none backdrop-blur-xl transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
            </label>
          ) : null}

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onEmailChange(event.target.value)
              }
              className="h-11 rounded-md border border-white/70 bg-white/65 px-3 text-sm text-slate-900 shadow-sm outline-none backdrop-blur-xl transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onPasswordChange(event.target.value)
              }
              className="h-11 rounded-md border border-white/70 bg-white/65 px-3 text-sm text-slate-900 shadow-sm outline-none backdrop-blur-xl transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </label>

          {message ? (
            <p className="rounded-md border border-amber-200/80 bg-amber-50/85 px-3 py-2 text-xs font-medium text-amber-900">
              {message}
            </p>
          ) : null}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : mode === "signin" ? (
              <LogIn className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {mode === "signin" ? "Masuk" : "Buat Akun"}
          </Button>
        </form>

        <Button asChild variant="outline" className="mt-3 w-full">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard Publik
          </Link>
        </Button>
      </section>
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

function AccountPanel({
  name,
  email,
  currentPassword,
  newPassword,
  confirmPassword,
  message,
  isSaving,
  onNameChange,
  onEmailChange,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSaveProfile,
  onSavePassword,
}: {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  message: string;
  isSaving: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSaveProfile: () => void;
  onSavePassword: () => void;
}) {
  return (
    <div className="grid gap-4">
      {message ? (
        <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-900 shadow-sm backdrop-blur-xl">
          {message}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Profil Admin</CardTitle>
          <CardDescription>
            Ubah nama dan email akun yang digunakan untuk masuk ke panel admin.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <InputField label="Nama admin" value={name} onChange={onNameChange} />
          <InputField
            label="Email login"
            type="email"
            value={email}
            onChange={onEmailChange}
          />
          <div className="md:col-span-2">
            <Button onClick={onSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Simpan Profil
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password Admin</CardTitle>
          <CardDescription>
            Password baru akan disimpan oleh Better Auth sebagai hash di tabel account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <InputField
            label="Password lama"
            type="password"
            value={currentPassword}
            onChange={onCurrentPasswordChange}
          />
          <InputField
            label="Password baru"
            type="password"
            value={newPassword}
            onChange={onNewPasswordChange}
          />
          <InputField
            label="Konfirmasi password"
            type="password"
            value={confirmPassword}
            onChange={onConfirmPasswordChange}
          />
          <div className="md:col-span-3">
            <Button onClick={onSavePassword} disabled={isSaving}>
              {isSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Simpan Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
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
  type?: "email" | "number" | "password" | "text";
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

async function postAuthAction(path: string, body: Record<string, unknown>) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string; error?: string }
      | null;

    throw new Error(payload?.message ?? payload?.error ?? "auth_request_failed");
  }

  return response.json().catch(() => ({}));
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message !== "auth_request_failed") {
    return error.message;
  }

  return fallback;
}

function nextNumericId(items: { id: number }[]) {
  return items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}
