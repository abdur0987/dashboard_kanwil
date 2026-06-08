import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import { getDashboardData } from "@/lib/services/dashboard";

type KnowledgeRow = {
    id: string;
    datasetId: number | string;
    datasetTitle: string;
    sheetName: string;
    tableTitle: string;
    rowText: string;
    searchableText: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const KNOWLEDGE_FILE = path.join(DATA_DIR, "assistant-knowledge.json");

function normalizeText(value: string) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function cellToText(value: unknown) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
}

function getKeywords(message: string) {
    const stopwords = new Set([
        "apa",
        "berapa",
        "yang",
        "dan",
        "atau",
        "di",
        "ke",
        "dari",
        "untuk",
        "dengan",
        "tahun",
        "data",
        "jumlah",
        "kemenag",
        "kanwil",
        "provinsi",
        "lampung",
        "tolong",
        "tampilkan",
        "ringkas",
    ]);

    return normalizeText(message)
        .split(" ")
        .filter((word) => word.length > 2 && !stopwords.has(word));
}

function resolvePublicFile(fileUrl: string) {
    if (!fileUrl) return null;
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) return null;

    const cleanUrl = fileUrl.replace(/^\/+/, "");
    const fullPath = path.join(process.cwd(), "public", cleanUrl);

    return fs.existsSync(fullPath) ? fullPath : null;
}

function isTableTitleRow(row: unknown[]) {
    const firstCell = cellToText(row[0]).toLowerCase();
    return firstCell.startsWith("table ") || firstCell.startsWith("tabel ");
}

function isEmptyRow(row: unknown[]) {
    return row.map(cellToText).every((cell) => !cell);
}

function isTotalRow(row: unknown[]) {
    return cellToText(row[0]).toLowerCase() === "total";
}

function rowHasUsefulHeader(row: unknown[]) {
    const filled = row.map(cellToText).filter(Boolean);
    return filled.length >= 2;
}

function rowsFromWorkbook(
    filePath: string,
    datasetId: number | string,
    datasetTitle: string,
) {
    const buffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const knowledgeRows: KnowledgeRow[] = [];

    for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
            header: 1,
            defval: "",
            blankrows: false,
        });

        let currentTableTitle = sheetName;
        let headers: string[] = [];
        let waitingForHeader = false;

        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex];

            if (isEmptyRow(row)) {
                continue;
            }

            if (isTableTitleRow(row)) {
                currentTableTitle = row.map(cellToText).filter(Boolean).join(" ");
                headers = [];
                waitingForHeader = true;
                continue;
            }

            if (waitingForHeader && rowHasUsefulHeader(row)) {
                headers = row.map(cellToText).map((header, index) => {
                    return header || `Kolom ${index + 1}`;
                });
                waitingForHeader = false;
                continue;
            }

            if (!headers.length) {
                continue;
            }

            const values = row.map(cellToText);

            if (!values.some(Boolean)) {
                continue;
            }

            const pairs = headers
                .map((header, index) => {
                    const value = values[index];
                    if (!value) return "";
                    return `${header}: ${value}`;
                })
                .filter(Boolean);

            if (!pairs.length) {
                continue;
            }

            const rowText = pairs.join("; ");
            const combinedText = [
                datasetTitle,
                sheetName,
                currentTableTitle,
                rowText,
            ].join(" ");

            knowledgeRows.push({
                id: `${datasetId}-${sheetName}-${rowIndex}`,
                datasetId,
                datasetTitle,
                sheetName,
                tableTitle: currentTableTitle,
                rowText,
                searchableText: normalizeText(combinedText),
            });

            if (isTotalRow(row)) {
                headers = [];
                waitingForHeader = false;
            }
        }
    }

    return knowledgeRows;
}

export async function trainAssistantKnowledge() {
    const dashboard = await getDashboardData();
    const knowledgeRows: KnowledgeRow[] = [];
    const errors: string[] = [];

    for (const dataset of dashboard.datasets) {
        const filePath = resolvePublicFile(dataset.excelUrl);

        if (!filePath) {
            errors.push(`${dataset.title}: file Excel tidak ditemukan di ${dataset.excelUrl}`);
            continue;
        }

        try {
            const rows = rowsFromWorkbook(filePath, dataset.id, dataset.title);
            knowledgeRows.push(...rows);
        } catch (error) {
            errors.push(
                `${dataset.title}: gagal dibaca - ${error instanceof Error ? error.message : "unknown error"
                }`,
            );
        }
    }

    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(
        KNOWLEDGE_FILE,
        JSON.stringify(knowledgeRows, null, 2),
        "utf-8",
    );

    return {
        datasets: dashboard.datasets.length,
        knowledgeRows: knowledgeRows.length,
        errors,
    };
}

export function loadAssistantKnowledge() {
    if (!fs.existsSync(KNOWLEDGE_FILE)) return [] as KnowledgeRow[];

    try {
        return JSON.parse(fs.readFileSync(KNOWLEDGE_FILE, "utf-8")) as KnowledgeRow[];
    } catch {
        return [] as KnowledgeRow[];
    }
}

export function searchAssistantKnowledge(message: string, limit = 6) {
    const keywords = getKeywords(message);
    if (!keywords.length) return [];

    const normalizedMessage = normalizeText(message);
    const rows = loadAssistantKnowledge();

    return rows
        .map((row) => {
            let score = 0;

            for (const keyword of keywords) {
                if (row.searchableText.includes(keyword)) {
                    score += 1;
                }
            }

            const tableTitle = normalizeText(row.tableTitle);
            const rowText = normalizeText(row.rowText);
            const datasetTitle = normalizeText(row.datasetTitle);

            if (
                normalizedMessage.includes("penduduk") &&
                normalizedMessage.includes("islam") &&
                tableTitle.includes("penduduk") &&
                tableTitle.includes("agama")
            ) {
                score += 30;
            }

            if (
                normalizedMessage.includes("penduduk") &&
                normalizedMessage.includes("agama") &&
                tableTitle.includes("penduduk") &&
                tableTitle.includes("agama")
            ) {
                score += 25;
            }

            if (
                normalizedMessage.includes("rumah ibadah") &&
                tableTitle.includes("rumah ibadah")
            ) {
                score += 25;
            }

            if (
                normalizedMessage.includes("masjid") &&
                tableTitle.includes("masjid")
            ) {
                score += 25;
            }

            if (
                normalizedMessage.includes("lampung selatan") &&
                rowText.includes("lampung selatan")
            ) {
                score += 20;
            }

            if (
                normalizedMessage.includes("lampung barat") &&
                rowText.includes("lampung barat")
            ) {
                score += 20;
            }

            if (
                normalizedMessage.includes("pelayanan keagamaan") &&
                datasetTitle.includes("pelayanan keagamaan")
            ) {
                score += 10;
            }

            return { ...row, score };
        })
        .filter((row) => row.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}