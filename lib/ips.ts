export const ipsScoreCategoryRules = [
  { label: "Tidak Mengikuti", range: "0" },
  { label: "Kurang", range: "1 <= Nilai IPS < 1,8" },
  { label: "Cukup", range: "1,8 <= Nilai IPS < 2,6" },
  { label: "Baik", range: "2,6 <= Nilai IPS < 3,5" },
  { label: "Sangat Baik", range: "3,5 <= Nilai IPS < 4,2" },
  { label: "Memuaskan", range: "4,2 <= Nilai IPS <= 5,0" },
] as const;

export const ipsScoreCategoryOptions = ipsScoreCategoryRules.map((rule) => ({
  label: rule.label,
  value: rule.label,
}));

export function getIpsScoreCategory(value: number) {
  if (!Number.isFinite(value)) return "";
  if (value === 0) return "Tidak Mengikuti";
  if (value >= 1 && value < 1.8) return "Kurang";
  if (value >= 1.8 && value < 2.6) return "Cukup";
  if (value >= 2.6 && value < 3.5) return "Baik";
  if (value >= 3.5 && value < 4.2) return "Sangat Baik";
  if (value >= 4.2 && value <= 5) return "Memuaskan";
  return "";
}

export function getIpsScoreCategoryFromText(value: string) {
  const normalized = normalizeIpsCategoryText(value);
  const sortedRules = [...ipsScoreCategoryRules].sort(
    (a, b) => b.label.length - a.label.length,
  );

  return (
    sortedRules.find((rule) =>
      normalized.includes(normalizeIpsCategoryText(rule.label)),
    )?.label ?? ""
  );
}

export function formatIpsWorkUnit(region: string) {
  const cleanRegion = region.replace(/^kanwil\s+/i, "").trim();

  if (/^bandar lampung$|^metro$/i.test(cleanRegion)) {
    return `Kan. Kemenag Kota ${cleanRegion}`;
  }

  if (/^lampung|^tanggamus$|^way kanan$|^tulang bawang|^pesawaran$|^pringsewu$|^mesuji$|^pesisir barat$/i.test(cleanRegion)) {
    return `Kan. Kemenag Kab. ${cleanRegion}`;
  }

  return region;
}

function normalizeIpsCategoryText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
