export type IndicatorStatus = "aktif" | "perlu-validasi";

export type Indicator = {
  id: number;
  name: string;
  description: string;
  category: string;
  unit: string;
  source: string;
  year: number;
  value: number;
  trend: number;
  status: IndicatorStatus;
};

export type DashboardRow = {
  id: number;
  indicator: string;
  category: string;
  region: string;
  period: string;
  year: number;
  value: number;
  unit: string;
  source: string;
};

export type ChartPoint = {
  year: number;
  Kesehatan: number;
  Pendidikan: number;
  Ekonomi: number;
  "Layanan Publik": number;
};

export type Publication = {
  id: number;
  title: string;
  description: string;
  date: string;
  category: string;
  fileLabel: string;
};

export type ActivitySlide = {
  id: number;
  title: string;
  caption: string;
  imageUrl: string;
};

export type VideoItem = {
  id: number;
  title: string;
  description: string;
  embedUrl: string;
};

export type ContactInfo = {
  institution: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  youtube: string;
  website: string;
  mapEmbedUrl: string;
};

export type DashboardData = {
  indicators: Indicator[];
  rows: DashboardRow[];
  chartSeries: ChartPoint[];
  publications: Publication[];
  activities: ActivitySlide[];
  videos: VideoItem[];
  contact: ContactInfo;
  filters: {
    years: string[];
    categories: string[];
    regions: string[];
  };
};
