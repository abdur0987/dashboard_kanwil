"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Maximize2,
  Minimize2,
  Newspaper,
  Pause,
  Play,
  Sparkles,
  Video,
  X,
} from "lucide-react";

import type { DashboardData } from "@/lib/types";

import styles from "./slideshow-experience.module.css";

type SlideShowExperienceProps = {
  data: DashboardData;
  onClose?: () => void;
};

type PresentationTheme =
  | "emerald"
  | "cyan"
  | "violet"
  | "gold"
  | "blue"
  | "rose";

type PresentationSlide = {
  id:
    | "overview"
    | "performance"
    | "ips"
    | "agenda"
    | "news"
    | "achievement";
  label: string;
  theme: PresentationTheme;
  durationMs: number;
};

const dashboardRefreshIntervalMs = 5 * 60 * 1000;

const presentationSlides: PresentationSlide[] = [
  { id: "overview", label: "Ringkasan", theme: "emerald", durationMs: 11000 },
  { id: "performance", label: "Kinerja", theme: "cyan", durationMs: 12000 },
  { id: "ips", label: "IPS Lampung", theme: "violet", durationMs: 12000 },
  { id: "agenda", label: "Agenda", theme: "gold", durationMs: 12000 },
  { id: "news", label: "Kabar", theme: "blue", durationMs: 12000 },
  { id: "achievement", label: "Prestasi", theme: "rose", durationMs: 19000 },
];

const themeClasses: Record<PresentationTheme, string> = {
  emerald: styles.themeEmerald,
  cyan: styles.themeCyan,
  violet: styles.themeViolet,
  gold: styles.themeGold,
  blue: styles.themeBlue,
  rose: styles.themeRose,
};

export function SlideShowExperience({
  data: initialData,
  onClose,
}: SlideShowExperienceProps) {
  const [data, setData] = useState(initialData);
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progressCycle, setProgressCycle] = useState(0);
  const [activeAwardIndex, setActiveAwardIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const stageRef = useRef<HTMLElement>(null);
  const autoplayIntentRef = useRef(true);

  const activeSlide = presentationSlides[activeIndex] ?? presentationSlides[0];

  const performanceSnapshot = useMemo(() => {
    const percentageIndicators = data.indicators.filter((indicator) =>
      /persen|%/i.test(indicator.unit),
    );
    const latestByCategory = new Map<
      string,
      DashboardData["indicators"][number]
    >();

    percentageIndicators.forEach((indicator) => {
      const current = latestByCategory.get(indicator.category);

      if (!current || indicator.year > current.year) {
        latestByCategory.set(indicator.category, indicator);
      }
    });

    const indicators = Array.from(latestByCategory.values()).sort(
      (left, right) => right.value - left.value,
    );
    const years = Array.from(
      new Set(indicators.map((indicator) => indicator.year)),
    ).sort((left, right) => left - right);
    const periodLabel = years.length
      ? years.length === 1
        ? String(years[0])
        : String(years[0]) + "–" + String(years[years.length - 1])
      : "Terkini";
    const average = indicators.length
      ? indicators.reduce((total, indicator) => total + indicator.value, 0) /
        indicators.length
      : 0;

    return {
      average,
      indicators,
      periodLabel,
      strongest: indicators[0] ?? null,
      attention: indicators[indicators.length - 1] ?? null,
    };
  }, [data.indicators]);

  const ipsSnapshot = useMemo(() => {
    const ipsRows = data.rows.filter((row) => row.category === "IPS");
    const years = ipsRows.map((row) => row.year);
    const latestYear = years.length ? Math.max(...years) : null;
    const rows = ipsRows
      .filter((row) => latestYear === null || row.year === latestYear)
      .sort((left, right) => right.value - left.value);
    const average = rows.length
      ? rows.reduce((total, row) => total + row.value, 0) / rows.length
      : 0;

    return {
      rows,
      average,
      latestYear,
      strongest: rows[0] ?? null,
      attention: rows[rows.length - 1] ?? null,
    };
  }, [data.rows]);

  const latestDataYear = useMemo(() => {
    const years = [
      ...data.indicators.map((item) => item.year),
      ...data.rows.map((item) => item.year),
      ...data.datasets.map((item) => item.year),
    ].filter(Number.isFinite);

    return years.length ? Math.max(...years) : "Terkini";
  }, [data.datasets, data.indicators, data.rows]);

  const focusSchedule = useMemo(() => {
    return (
      data.executiveSchedules.find((schedule) => schedule.status === "berjalan") ??
      data.executiveSchedules.find((schedule) => schedule.status !== "selesai") ??
      data.executiveSchedules[0] ??
      null
    );
  }, [data.executiveSchedules]);

  const supportingSchedules = useMemo(() => {
    return data.executiveSchedules.filter(
      (schedule) => schedule.id !== focusSchedule?.id,
    );
  }, [data.executiveSchedules, focusSchedule]);
  const focusScheduleMapUrl = focusSchedule?.location
    ? "https://www.google.com/maps?q=" +
      encodeURIComponent(focusSchedule.location + ", Lampung") +
      "&z=15&output=embed"
    : "";

  const awardHighlights = useMemo(() => {
    const seen = new Set<string>();

    return data.awardCollections
      .flatMap((collection) =>
        collection.items.map((item) => ({
          ...item,
          collectionTitle: collection.title,
        })),
      )
      .filter((item) => {
        const key = item.imageUrl.trim().toLowerCase();

        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((left, right) => right.year - left.year);
  }, [data.awardCollections]);

  const featuredAward = awardHighlights[0] ?? null;
  const normalizedAwardIndex = awardHighlights.length
    ? activeAwardIndex % awardHighlights.length
    : 0;
  const activeAward =
    awardHighlights[normalizedAwardIndex] ??
    featuredAward;

  const featuredStory = useMemo(() => {
    const news = data.latestNews[0];

    if (news) {
      return {
        label: news.category || "Berita resmi",
        title: news.title,
        meta: news.date,
        description:
          "Informasi terbaru dari portal resmi Kanwil Kementerian Agama Provinsi Lampung.",
        imageUrl: news.imageUrl,
        alt: news.title,
      };
    }

    const activity = data.activities[0];

    if (activity) {
      return {
        label: "Aktivitas Kanwil",
        title: activity.title,
        meta: "Dokumentasi kegiatan",
        description: activity.caption,
        imageUrl: featuredAward?.imageUrl || "/brand/kanwil-office-bg.jpg",
        alt: featuredAward?.alt || activity.title,
      };
    }

    const publication = data.publications[0];

    return {
      label: publication?.category || "Informasi Kanwil",
      title: publication?.title || "Informasi publik Kanwil Kemenag Lampung",
      meta: publication?.date || String(latestDataYear),
      description:
        publication?.description ||
        "Ringkasan informasi layanan, data, dan kegiatan Kanwil Kementerian Agama Provinsi Lampung.",
      imageUrl: featuredAward?.imageUrl || "/brand/kanwil-office-bg.jpg",
      alt: featuredAward?.alt || "Kantor Wilayah Kementerian Agama Provinsi Lampung",
    };
  }, [
    data.activities,
    data.latestNews,
    data.publications,
    featuredAward,
    latestDataYear,
  ]);

  const supportingStories = useMemo(() => {
    if (data.latestNews.length > 1) {
      return data.latestNews.slice(1, 3).map((news) => ({
        label: news.category,
        title: news.title,
        meta: news.date,
      }));
    }

    if (data.publications.length) {
      return data.publications.slice(0, 2).map((publication) => ({
        label: publication.category,
        title: publication.title,
        meta: publication.date,
      }));
    }

    return data.activities.slice(1, 3).map((activity) => ({
      label: "Aktivitas",
      title: activity.title,
      meta: "Kanwil Kemenag Lampung",
    }));
  }, [data.activities, data.latestNews, data.publications]);

  const regionalOfficeCount = data.officeLocations.filter(
    (office) => office.type === "kabupaten-kota",
  ).length;

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
      return;
    }

    window.location.assign("/");
  }, [onClose]);

  const restartProgress = useCallback(() => {
    setProgressCycle((cycle) => cycle + 1);
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      setActiveIndex(
        ((index % presentationSlides.length) + presentationSlides.length) %
          presentationSlides.length,
      );
      restartProgress();
    },
    [restartProgress],
  );

  const goNext = useCallback(() => {
    setActiveIndex((index) => (index + 1) % presentationSlides.length);
    restartProgress();
  }, [restartProgress]);

  const goPrevious = useCallback(() => {
    setActiveIndex(
      (index) =>
        (index - 1 + presentationSlides.length) % presentationSlides.length,
    );
    restartProgress();
  }, [restartProgress]);

  const goToAward = useCallback(
    (index: number) => {
      if (!awardHighlights.length) return;

      setActiveAwardIndex(
        ((index % awardHighlights.length) + awardHighlights.length) %
          awardHighlights.length,
      );
    },
    [awardHighlights.length],
  );

  const goToNextAward = useCallback(() => {
    if (!awardHighlights.length) return;

    setActiveAwardIndex((index) => (index + 1) % awardHighlights.length);
  }, [awardHighlights.length]);

  const goToPreviousAward = useCallback(() => {
    if (!awardHighlights.length) return;

    setActiveAwardIndex(
      (index) =>
        (index - 1 + awardHighlights.length) % awardHighlights.length,
    );
  }, [awardHighlights.length]);

  const togglePlayback = useCallback(() => {
    setPlaying((current) => {
      const next = !current;
      autoplayIntentRef.current = next;

      if (next) {
        restartProgress();
      }

      return next;
    });
  }, [restartProgress]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await stageRef.current?.requestFullscreen();
      }
    } catch {
      // Fullscreen can be declined by the browser; the display remains usable.
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function refreshDashboardData() {
      try {
        const response = await fetch("/api/dashboard?ts=" + Date.now(), {
          cache: "no-store",
        });

        if (!response.ok) return;

        const nextData = (await response.json()) as DashboardData;

        if (mounted) {
          setData(nextData);
          setLastUpdated(new Date());
        }
      } catch {
        // Keep the latest visible snapshot while the next refresh retries.
      }
    }

    void refreshDashboardData();

    const timer = window.setInterval(
      refreshDashboardData,
      dashboardRefreshIntervalMs,
    );

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const updateClock = () => setCurrentTime(new Date());

    updateClock();
    const timer = window.setInterval(updateClock, 30000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotion.matches) {
      autoplayIntentRef.current = false;
      setPlaying(false);
    }
  }, []);

  useEffect(() => {
    if (!playing) return;

    const timer = window.setTimeout(() => {
      setActiveIndex((index) => (index + 1) % presentationSlides.length);
    }, activeSlide.durationMs);

    return () => window.clearTimeout(timer);
  }, [activeSlide.durationMs, activeIndex, playing, progressCycle]);

  useEffect(() => {
    if (activeSlide.id === "achievement") {
      setActiveAwardIndex(0);
    }
  }, [activeSlide.id]);

  useEffect(() => {
    if (
      activeSlide.id !== "achievement" ||
      !playing ||
      awardHighlights.length <= 1
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveAwardIndex((index) => (index + 1) % awardHighlights.length);
    }, 4500);

    return () => window.clearTimeout(timer);
  }, [
    activeAwardIndex,
    activeSlide.id,
    awardHighlights.length,
    playing,
  ]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        setPlaying(false);
        return;
      }

      setPlaying(autoplayIntentRef.current);
      if (autoplayIntentRef.current) restartProgress();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [restartProgress]);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    document.body.classList.add("overflow-hidden");

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrevious();
      } else if (event.code === "Space") {
        event.preventDefault();
        togglePlayback();
      } else if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        void toggleFullscreen();
      } else if (event.key === "Escape" && !document.fullscreenElement) {
        handleClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [goNext, goPrevious, handleClose, toggleFullscreen, togglePlayback]);

  const clockLabel = currentTime
    ? currentTime.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";
  const dateLabel = currentTime
    ? currentTime.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "short",
      })
    : "Waktu Indonesia Barat";
  const updatedLabel = lastUpdated
    ? "Diperbarui " +
      lastUpdated.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Sinkron otomatis";

  let slideContent: ReactNode;

  switch (activeSlide.id) {
    case "overview":
      slideContent = (
        <div className={styles.overviewLayout}>
          <div className={styles.primaryCopy}>
            <p className={styles.eyebrow}>
              <Sparkles aria-hidden="true" />
              Ringkasan eksekutif · {latestDataYear}
            </p>
            <h1 className={styles.heroTitle}>
              Satu layar untuk
              <span> membaca Lampung.</span>
            </h1>
            <p className={styles.heroDescription}>
              Informasi kinerja, data, agenda, dan kabar Kanwil bergerak otomatis
              dalam satu cerita yang mudah dipahami.
            </p>
            <div className={styles.metricRow}>
              <DisplayMetric
                value={
                  performanceSnapshot.indicators.length
                    ? formatPercentage(performanceSnapshot.average)
                    : "—"
                }
                label="Rata-rata layanan"
                detail={performanceSnapshot.periodLabel}
              />
              <DisplayMetric
                value={String(regionalOfficeCount || data.officeLocations.length)}
                label="Kabupaten / kota"
                detail="Cakupan layanan"
              />
              <DisplayMetric
                value={String(data.datasets.length)}
                label="Katalog data"
                detail="Sumber terkelola"
              />
            </div>
          </div>
          <div className={styles.yearHalo} aria-label={"Data tahun " + latestDataYear}>
            <span>Dashboard aktif</span>
            <strong>{latestDataYear}</strong>
            <p>{data.indicators.length} indikator strategis</p>
            <div className={styles.haloOrbit} aria-hidden="true" />
          </div>
        </div>
      );
      break;

    case "performance":
      slideContent = (
        <div className={styles.performanceLayout}>
          <div className={styles.scorePanel}>
            <p className={styles.eyebrow}>
              <BarChart3 aria-hidden="true" />
              Detak kinerja layanan
            </p>
            <p className={styles.scoreLabel}>Rata-rata capaian</p>
            <p className={styles.scoreNumber}>
              {performanceSnapshot.indicators.length
                ? formatPercentage(performanceSnapshot.average)
                : "—"}
            </p>
            <p className={styles.largeSupport}>
              {performanceSnapshot.indicators.length
                ? "Snapshot layanan strategis " + performanceSnapshot.periodLabel
                : "Data indikator belum tersedia"}
            </p>
            <div className={styles.insightPair}>
              <div>
                <span>Terkuat</span>
                <strong>
                  {performanceSnapshot.strongest?.name || "Belum tersedia"}
                </strong>
              </div>
              <div>
                <span>Fokus berikutnya</span>
                <strong>
                  {performanceSnapshot.attention?.name || "Belum tersedia"}
                </strong>
              </div>
            </div>
          </div>
          <div className={styles.barList}>
            {performanceSnapshot.indicators.map((indicator, index) => (
              <div className={styles.barItem} key={indicator.id}>
                <div className={styles.barHeader}>
                  <div>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{indicator.name}</strong>
                  </div>
                  <b>{formatPercentage(indicator.value)}</b>
                </div>
                <div className={styles.barTrack}>
                  <span
                    className={styles.barFill}
                    style={
                      {
                        "--bar-size":
                          String(Math.max(0, Math.min(indicator.value, 100))) + "%",
                      } as CSSProperties
                    }
                  />
                </div>
                <p>
                  {indicator.category} · tren{" "}
                  {indicator.trend >= 0 ? "+" : ""}
                  {formatCompactNumber(indicator.trend)}
                </p>
              </div>
            ))}
            {!performanceSnapshot.indicators.length ? (
              <div className={styles.emptyMessage}>
                Indikator persentase belum tersedia pada snapshot ini.
              </div>
            ) : null}
          </div>
        </div>
      );
      break;

    case "ips":
      slideContent = (
        <div className={styles.ipsLayout}>
          <div className={styles.ipsLead}>
            <p className={styles.eyebrow}>
              <MapPin aria-hidden="true" />
              Indeks Pembangunan Statistik · {ipsSnapshot.latestYear ?? "Terkini"}
            </p>
            <p className={styles.scoreLabel}>Capaian tertinggi</p>
            <h2 className={styles.regionTitle}>
              {ipsSnapshot.strongest?.region || "Data IPS belum tersedia"}
            </h2>
            <p className={styles.ipsNumber}>
              {ipsSnapshot.strongest
                ? formatScore(ipsSnapshot.strongest.value)
                : "—"}
            </p>
            <div className={styles.ipsSummary}>
              <div>
                <span>Rata-rata Lampung</span>
                <strong>
                  {ipsSnapshot.rows.length
                    ? formatScore(ipsSnapshot.average)
                    : "—"}
                </strong>
              </div>
              <div>
                <span>Cakupan</span>
                <strong>{ipsSnapshot.rows.length} wilayah</strong>
              </div>
            </div>
          </div>
          <div className={styles.rankPanel}>
            <div className={styles.rankHeading}>
              <div>
                <span>Peringkat teratas</span>
                <strong>Mutu statistik kabupaten / kota</strong>
              </div>
              <b>Skala 5,00</b>
            </div>
            <div className={styles.rankList}>
              {ipsSnapshot.rows.slice(0, 5).map((row, index) => (
                <div className={styles.rankItem} key={row.id}>
                  <span className={styles.rankNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <strong>{row.region}</strong>
                    <div className={styles.rankTrack}>
                      <span
                        style={
                          {
                            "--rank-size":
                              String(
                                Math.max(0, Math.min((row.value / 5) * 100, 100)),
                              ) + "%",
                          } as CSSProperties
                        }
                      />
                    </div>
                  </div>
                  <b>{formatScore(row.value)}</b>
                </div>
              ))}
            </div>
            {ipsSnapshot.attention ? (
              <p className={styles.attentionLine}>
                Ruang penguatan berikutnya:{" "}
                <strong>{ipsSnapshot.attention.region}</strong>
              </p>
            ) : null}
          </div>
        </div>
      );
      break;

    case "agenda":
      slideContent = (
        <div className={styles.agendaLayout}>
          <div className={styles.agendaFocus}>
            <div className={styles.agendaFocusContent}>
              <p className={styles.eyebrow}>
                <CalendarDays aria-hidden="true" />
                Agenda pimpinan
              </p>
              {focusSchedule ? (
                <>
                  <div className={styles.agendaMeta}>
                    <span className={statusClassName(focusSchedule.status)}>
                      {scheduleStatusLabel(focusSchedule.status)}
                    </span>
                    <span>{focusSchedule.date}</span>
                  </div>
                  <h2 className={styles.agendaTitle}>{focusSchedule.title}</h2>
                  <div className={styles.agendaTime}>
                    <Clock3 aria-hidden="true" />
                    <strong>{focusSchedule.time}</strong>
                  </div>
                  <div className={styles.agendaLocation}>
                    <span>Lokasi</span>
                    <strong>{focusSchedule.location}</strong>
                    <p>{focusSchedule.unit}</p>
                  </div>
                </>
              ) : (
                <div className={styles.emptyMessage}>
                  Agenda pimpinan belum tersedia pada snapshot ini.
                </div>
              )}
            </div>
            {focusSchedule && focusScheduleMapUrl ? (
              <div className={styles.agendaMap}>
                <iframe
                  title={"Peta lokasi " + focusSchedule.location}
                  src={focusScheduleMapUrl}
                  loading="eager"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className={styles.agendaMapLabel}>
                  <MapPin aria-hidden="true" />
                  <div>
                    <span>Titik lokasi agenda</span>
                    <strong>{focusSchedule.location}</strong>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <div className={styles.agendaQueue}>
            <div className={styles.sectionHeading}>
              <span>Agenda berikutnya</span>
              <strong>
                {supportingSchedules.length} agenda berikutnya
              </strong>
            </div>
            <div
              className={styles.agendaQueueList}
              style={
                {
                  "--agenda-items": Math.max(supportingSchedules.length, 1),
                } as CSSProperties
              }
            >
              {supportingSchedules.map((schedule, index) => (
                <div className={styles.queueItem} key={schedule.id}>
                  <span className={styles.queueNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className={styles.queueMeta}>
                      <p>{schedule.date}</p>
                      <span className={queueStatusClassName(schedule.status)}>
                        {scheduleStatusLabel(schedule.status)}
                      </span>
                    </div>
                    <strong>{schedule.title}</strong>
                    <span className={styles.queueDetail}>
                      <MapPin aria-hidden="true" />
                      {schedule.time} · {schedule.location}
                    </span>
                  </div>
                </div>
              ))}
              {!supportingSchedules.length ? (
                <div className={styles.quietMessage}>
                  Belum ada antrean agenda berikutnya.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      );
      break;

    case "news":
      slideContent = (
        <div className={styles.newsLayout}>
          <div className={styles.newsVisual}>
            <Image
              src={featuredStory.imageUrl}
              alt={featuredStory.alt}
              fill
              sizes="(min-width: 900px) 52vw, 100vw"
              className={styles.coverImage}
              priority={activeIndex === 4}
            />
            <div className={styles.imageShade} />
            <div className={styles.newsStamp}>
              <span>{featuredStory.label}</span>
              <strong>{featuredStory.meta}</strong>
            </div>
          </div>
          <div className={styles.newsCopy}>
            <p className={styles.eyebrow}>
              <Newspaper aria-hidden="true" />
              Kabar dan media
            </p>
            <h2 className={styles.newsTitle}>{featuredStory.title}</h2>
            <p className={styles.newsDescription}>{featuredStory.description}</p>
            <div className={styles.mediaCounts}>
              <div>
                <Newspaper aria-hidden="true" />
                <span>{data.latestNews.length} berita</span>
              </div>
              <div>
                <Video aria-hidden="true" />
                <span>{data.videos.length} video</span>
              </div>
            </div>
            <div className={styles.storyList}>
              {supportingStories.map((story, index) => (
                <div key={story.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>
                    <b>{story.label}</b>
                    <strong>{story.title}</strong>
                    <small>{story.meta}</small>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
      break;

    case "achievement":
      slideContent = (
        <div className={styles.achievementLayout}>
          <div className={styles.awardVisual}>
            <Image
              key={activeAward?.imageUrl || "office"}
              src={activeAward?.imageUrl || "/brand/kanwil-office-front.jpg"}
              alt={
                activeAward?.alt ||
                "Kantor Wilayah Kementerian Agama Provinsi Lampung"
              }
              fill
              sizes="(min-width: 900px) 52vw, 100vw"
              className={styles.awardImage}
            />
            <div className={styles.awardGlow} />
            <span className={styles.awardYear}>
              {activeAward?.year || latestDataYear}
            </span>
            {awardHighlights.length > 1 ? (
              <>
                <button
                  type="button"
                  className={[styles.awardArrow, styles.awardArrowPrevious].join(
                    " ",
                  )}
                  onClick={goToPreviousAward}
                  aria-label="Penghargaan sebelumnya"
                >
                  <ChevronLeft aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={[styles.awardArrow, styles.awardArrowNext].join(" ")}
                  onClick={goToNextAward}
                  aria-label="Penghargaan berikutnya"
                >
                  <ChevronRight aria-hidden="true" />
                </button>
                <div
                  className={styles.awardDots}
                  aria-label="Pilihan penghargaan"
                >
                  {awardHighlights.map((award, index) => (
                    <button
                      key={award.imageUrl}
                      type="button"
                      className={
                        index === normalizedAwardIndex ? styles.activeAwardDot : ""
                      }
                      onClick={() => goToAward(index)}
                      aria-label={"Tampilkan penghargaan " + award.title}
                      aria-current={
                        index === normalizedAwardIndex ? "step" : undefined
                      }
                    >
                      <span />
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>
          <div
            key={activeAward?.imageUrl || "achievement-copy"}
            className={[
              styles.achievementCopy,
              styles.awardCopyMotion,
            ].join(" ")}
          >
            <p className={styles.eyebrow}>
              <Award aria-hidden="true" />
              Prestasi dan kepercayaan
            </p>
            <h2 className={styles.achievementTitle}>
              {activeAward?.title || "Melayani Lampung dengan data yang terbuka."}
            </h2>
            <p className={styles.newsDescription}>
              {activeAward?.description ||
                "Dashboard Digital Kanwil hadir untuk memperkuat layanan informasi publik yang cepat, jelas, dan dapat dipercaya."}
            </p>
            <div className={styles.awardMeta}>
              <span>
                {activeAward?.collectionTitle ||
                  "Kanwil Kementerian Agama Provinsi Lampung"}
              </span>
              <strong>{awardHighlights.length} dokumentasi penghargaan</strong>
            </div>
            <div className={styles.contactStrip}>
              <span>{data.contact.website}</span>
              <span>{data.contact.email}</span>
            </div>
          </div>
        </div>
      );
      break;
  }

  return (
    <main
      ref={stageRef}
      className={[styles.stage, themeClasses[activeSlide.theme]].join(" ")}
      role="main"
    >
      <div className={styles.ambientOne} aria-hidden="true" />
      <div className={styles.ambientTwo} aria-hidden="true" />
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <Image
                src="/brand/logo-kanwil-kemenag-lampung-icon.png"
                alt=""
                width={52}
                height={52}
                priority
              />
            </div>
            <div>
              <span>Dashboard Digital</span>
              <strong>Kanwil Kemenag Lampung</strong>
            </div>
          </div>

          <div className={styles.headerMeta}>
            <div className={styles.liveState}>
              <span aria-hidden="true" />
              <div>
                <strong>LIVE DATA</strong>
                <small>{updatedLabel}</small>
              </div>
            </div>
            <div className={styles.clock}>
              <strong>{clockLabel}</strong>
              <span>{dateLabel}</span>
            </div>
            <div className={styles.headerControls}>
              <button
                type="button"
                onClick={togglePlayback}
                className={styles.iconButton}
                aria-label={playing ? "Jeda slideshow" : "Jalankan slideshow"}
                aria-pressed={!playing}
                title={playing ? "Jeda (Spasi)" : "Putar (Spasi)"}
              >
                {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
              </button>
              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                className={styles.iconButton}
                aria-label={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
                title={isFullscreen ? "Keluar layar penuh (F)" : "Layar penuh (F)"}
              >
                {isFullscreen ? (
                  <Minimize2 aria-hidden="true" />
                ) : (
                  <Maximize2 aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className={styles.iconButton}
                aria-label="Tutup slideshow"
                title="Kembali ke dashboard (Esc)"
              >
                <X aria-hidden="true" />
              </button>
            </div>
          </div>
        </header>

        <section
          key={activeSlide.id}
          className={styles.scene}
          aria-label={activeSlide.label}
          aria-roledescription="slide"
        >
          {slideContent}
        </section>

        <footer className={styles.footer}>
          <div className={styles.slideIdentity}>
            <span>{String(activeIndex + 1).padStart(2, "0")}</span>
            <small>/ {String(presentationSlides.length).padStart(2, "0")}</small>
            <strong>{activeSlide.label}</strong>
          </div>

          <nav className={styles.navigation} aria-label="Navigasi slideshow">
            <button
              type="button"
              onClick={goPrevious}
              aria-label="Slide sebelumnya"
              title="Sebelumnya (Panah kiri)"
            >
              <ArrowLeft aria-hidden="true" />
            </button>
            <div className={styles.dots}>
              {presentationSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goToSlide(index)}
                  className={index === activeIndex ? styles.activeDot : ""}
                  aria-label={"Buka slide " + slide.label}
                  aria-current={index === activeIndex ? "step" : undefined}
                  title={slide.label}
                >
                  <span />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={goNext}
              aria-label="Slide berikutnya"
              title="Berikutnya (Panah kanan)"
            >
              <ArrowRight aria-hidden="true" />
            </button>
          </nav>

          <div className={styles.playbackState}>
            <span>{playing ? "Berjalan otomatis" : "Dijeda"}</span>
            <strong>{Math.round(activeSlide.durationMs / 1000)} detik</strong>
          </div>

          <div className={styles.progressTrack} aria-hidden="true">
            <span
              key={activeSlide.id + "-" + progressCycle}
              className={[
                styles.progressFill,
                playing ? "" : styles.progressPaused,
              ].join(" ")}
              style={
                {
                  "--slide-duration": String(activeSlide.durationMs) + "ms",
                } as CSSProperties
              }
            />
          </div>
        </footer>
      </div>
    </main>
  );
}

function DisplayMetric({
  value,
  label,
  detail,
  icon,
}: {
  value: string;
  label: string;
  detail: string;
  icon?: ReactNode;
}) {
  return (
    <div className={styles.displayMetric}>
      {icon ? <span className={styles.metricIcon}>{icon}</span> : null}
      <strong>{value}</strong>
      <span>{label}</span>
      <small>{detail}</small>
    </div>
  );
}

function scheduleStatusLabel(
  status: DashboardData["executiveSchedules"][number]["status"],
) {
  const labels = {
    terjadwal: "Terjadwal",
    berjalan: "Sedang berjalan",
    selesai: "Selesai",
    belum: "Belum dimulai",
  };

  return labels[status];
}

function statusClassName(
  status: DashboardData["executiveSchedules"][number]["status"],
) {
  const classes = {
    terjadwal: styles.statusScheduled,
    berjalan: styles.statusRunning,
    selesai: styles.statusDone,
    belum: styles.statusWaiting,
  };

  return [styles.statusPill, classes[status]].join(" ");
}

function queueStatusClassName(
  status: DashboardData["executiveSchedules"][number]["status"],
) {
  const classes = {
    terjadwal: styles.statusScheduled,
    berjalan: styles.statusRunning,
    selesai: styles.statusDone,
    belum: styles.statusWaiting,
  };

  return [styles.queueStatus, classes[status]].join(" ");
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 1,
  }).format(value);
}

function formatPercentage(value: number) {
  return formatCompactNumber(value) + "%";
}

function formatScore(value: number) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
