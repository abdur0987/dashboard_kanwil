import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getIpsScoreCategory, getIpsScoreCategoryFromText } from "@/lib/ips";
import type { DashboardRow, Indicator } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const lampungRegions = [
  "Lampung Barat",
  "Tanggamus",
  "Lampung Selatan",
  "Lampung Timur",
  "Lampung Tengah",
  "Lampung Utara",
  "Way Kanan",
  "Tulang Bawang",
  "Pesawaran",
  "Pringsewu",
  "Mesuji",
  "Tulang Bawang Barat",
  "Pesisir Barat",
  "Bandar Lampung",
  "Metro",
];

type ImportedRecord = {
  region: string;
  value: number;
  scoreCategory?: string;
};

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
  }

  const category = String(formData.get("category") || "IPS").trim();
  const year = normalizeImportYear(Number(formData.get("year")));
  const indicator =
    String(formData.get("indicator") || "").trim() ||
    (category === "IPS"
      ? "Nilai Indeks Pembangunan Statistik"
      : `Nilai ${category}`);
  const source =
    String(formData.get("source") || "").trim() ||
    `Upload ${file.name}`;
  const unit =
    String(formData.get("unit") || "").trim() ||
    (category === "IPS" ? "indeks" : "persen");

  try {
    const extracted = await extractRecords(file);

    if (!extracted.length) {
      return NextResponse.json(
        {
          error:
            "Data wilayah dan nilai belum dapat dibaca. Gunakan tabel dengan kolom wilayah/satuan kerja dan nilai.",
        },
        { status: 422 },
      );
    }

    const rows: Omit<DashboardRow, "id">[] = extracted.map((record) => ({
      indicator,
      category,
      region: record.region,
      period: "Tahunan",
      year,
      value: record.value,
      unit,
      source,
      scoreCategory:
        category === "IPS"
          ? record.scoreCategory || getIpsScoreCategory(record.value)
          : record.scoreCategory ?? "",
    }));

    const average =
      rows.reduce((sum, row) => sum + row.value, 0) / Math.max(rows.length, 1);
    const indicatorSummary: Omit<Indicator, "id"> = {
      name:
        category === "IPS"
          ? "Indeks Pembangunan Statistik"
          : indicator,
      description:
        category === "IPS"
          ? "Rekap nilai IPS kabupaten/kota sebagai gambaran tingkat kematangan statistik sektoral."
          : `Ringkasan hasil upload ${category} dari ${file.name}.`,
      category,
      unit,
      source,
      year,
      value: Number(average.toFixed(3)),
      trend: 0,
      status: "aktif",
    };

    return NextResponse.json({
      rows,
      indicator: indicatorSummary,
      meta: {
        fileName: file.name,
        records: rows.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "File gagal diproses.",
      },
      { status: 422 },
    );
  }
}

async function extractRecords(file: File): Promise<ImportedRecord[]> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const buffer = Buffer.from(await file.arrayBuffer());

  if (extension === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return extractRecordsFromText(result.value);
  }

  if (extension === "doc") {
    const { createRequire } = await import("node:module");
    const require = createRequire(import.meta.url);
    const WordExtractor = require("word-extractor") as new () => {
      extract(input: Buffer): Promise<{ getBody(): string }>;
    };
    const extractor = new WordExtractor();
    const result = await extractor.extract(buffer);
    return extractRecordsFromText(result.getBody());
  }

  if (["xlsx", "xls", "csv"].includes(extension)) {
    const xlsx = await import("xlsx");
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const values = xlsx.utils.sheet_to_json<string[]>(sheet, { header: 1 });
    return extractRecordsFromCells(values);
  }

  if (extension === "pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      return extractRecordsFromText(result.text);
    } finally {
      await parser.destroy();
    }
  }

  throw new Error("Format file belum didukung.");
}

function normalizeImportYear(value: number) {
  return Number.isFinite(value) && value >= 1900 && value <= 2200
    ? Math.trunc(value)
    : 2025;
}

function extractRecordsFromCells(values: string[][]): ImportedRecord[] {
  const rows = values
    .map((row) =>
      row
        .map((cell) => String(cell ?? "").trim())
        .filter(Boolean),
    )
    .filter((row) => row.length >= 2);

  const records: ImportedRecord[] = [];

  for (const row of rows) {
    const joined = row.join(" ");
    const region = findRegion(joined);
    const value = findNumericValue(row);

    if (region && value !== null) {
      records.push({
        region,
        value,
        scoreCategory: getIpsScoreCategoryFromText(joined),
      });
    }
  }

  return uniqueRecords(records);
}

function extractRecordsFromText(text: string): ImportedRecord[] {
  const normalized = text
    .replace(/\u00a0/g, " ")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ");
  const records: ImportedRecord[] = [];

  for (const region of lampungRegions) {
    const regionPattern = region.replace(/\s+/g, "\\s+");
    const match = normalized.match(
      new RegExp(`${regionPattern}[\\s\\S]{0,120}?([0-9]+(?:[,.][0-9]+)?)`, "i"),
    );

    if (match?.[1]) {
      const recordText = normalized.slice(match.index ?? 0, (match.index ?? 0) + 220);

      records.push({
        region,
        value: parseLocaleNumber(match[1]),
        scoreCategory: getIpsScoreCategoryFromText(recordText),
      });
    }
  }

  if (records.length) {
    return uniqueRecords(records);
  }

  const lines = normalized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (let index = 0; index < lines.length; index += 1) {
    const region = findRegion(lines[index]);
    const value = findNumericValue(lines.slice(index, index + 4));

    if (region && value !== null) {
      records.push({
        region,
        value,
        scoreCategory: getIpsScoreCategoryFromText(lines.slice(index, index + 5).join(" ")),
      });
    }
  }

  return uniqueRecords(records);
}

function findRegion(text: string) {
  const normalized = normalizeRegionName(text);

  return lampungRegions.find((region) =>
    normalized.includes(normalizeRegionName(region)),
  );
}

function findNumericValue(cells: string[]) {
  const values: number[] = [];

  for (const cell of cells) {
    const matches = Array.from(
      String(cell).matchAll(/\b([0-9]+(?:[,.][0-9]+)?)\b/g),
    );

    for (const match of matches) {
      if (!match[1]) {
        continue;
      }

      const value = parseLocaleNumber(match[1]);

      if (Number.isFinite(value) && value > 0) {
        values.push(value);
      }
    }
  }

  const meaningfulValues = values.filter(
    (value) => value < 1000 && !Number.isInteger(value),
  );

  return meaningfulValues.at(-1) ?? values.filter((value) => value < 1000).at(-1) ?? null;
}

function parseLocaleNumber(value: string) {
  const normalized = value.trim();

  if (normalized.includes(",")) {
    return Number(normalized.replace(/\./g, "").replace(",", "."));
  }

  return Number(normalized);
}

function normalizeRegionName(value: string) {
  return value
    .toLowerCase()
    .replace(/kan\.?\s*kemenag/g, "")
    .replace(/kab\.?|kota/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueRecords(records: ImportedRecord[]) {
  const map = new Map<string, ImportedRecord>();

  for (const record of records) {
    map.set(record.region, record);
  }

  return Array.from(map.values());
}
