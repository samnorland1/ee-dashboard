import { google } from "googleapis";

const SPREADSHEET_ID = process.env.SPREADSHEET_ID!;

function getGoogleAuth() {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!key) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not set");
  const credentials = JSON.parse(key);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

export async function getSheetData(range: string) {
  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range,
  });
  return response.data.values || [];
}

function parseNum(str: string | undefined): number {
  if (!str) return 0;
  return parseFloat(str.replace(/[£$,\s%]/g, "")) || 0;
}

const MONTH_MAP: Record<string, string> = {
  January: "Jan", February: "Feb", March: "Mar", April: "Apr",
  May: "May", June: "Jun", July: "Jul", August: "Aug",
  September: "Sep", October: "Oct", November: "Nov", December: "Dec",
};

const ALL_TABS = [
  { tab: "2026 Q1-Q2", year: 2026, half: "H1" as const },
  { tab: "2025 Q3-Q4", year: 2025, half: "H2" as const },
  { tab: "2025 Q1-Q2", year: 2025, half: "H1" as const },
  { tab: "2024 Q3-Q4", year: 2024, half: "H2" as const },
  { tab: "2024 Q1-Q2", year: 2024, half: "H1" as const },
  { tab: "2023 Q3-Q4", year: 2023, half: "H2" as const },
  { tab: "2023 Q1-Q2", year: 2023, half: "H1" as const },
  { tab: "2022 Q3-Q4", year: 2022, half: "H2" as const },
  { tab: "2022 Q1-Q2", year: 2022, half: "H1" as const },
];

const CURRENT_TAB = "'2026 Q1-Q2'";

/** Parse a full tab's raw rows into structured YearData */
function parseTabRows(rows: string[][], year: number, half: "H1" | "H2" | "full", tab: string): YearData {
  const monthlyMap: Record<string, { earnings: number; jobs: number; hours: number }> = {};
  let bankTotal = 0, bankTotalUSD = 0, totalHours = 0, perHour = 0;
  let summaryFound = false;
  let monthlyHoursRows: string[][] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Detect summary header row: col C = "$ Amount"
    if (!summaryFound && row[2]?.trim() === "$ Amount") {
      const valRow = rows[i + 1] || [];
      bankTotalUSD = parseNum(valRow[2]);
      bankTotal = parseNum(valRow[3]);
      totalHours = parseNum(valRow[4]);
      perHour = parseNum(valRow[5]);
      summaryFound = true;

      // Monthly hours breakdown is 2 rows below header at col O (index 14)
      for (let j = i + 3; j < Math.min(i + 12, rows.length); j++) {
        const mRow = rows[j];
        if (mRow[13] && MONTH_MAP[mRow[13]?.trim()]) {
          monthlyHoursRows.push(mRow);
        }
      }
      continue;
    }

    // Client row: col G is a known month name and col J starts with £
    const monthFull = row[6]?.trim();
    const bankAmt = row[9]?.trim();
    if (monthFull && MONTH_MAP[monthFull] && bankAmt && bankAmt.startsWith("£")) {
      const abbr = MONTH_MAP[monthFull];
      if (!monthlyMap[abbr]) monthlyMap[abbr] = { earnings: 0, jobs: 0, hours: 0 };
      monthlyMap[abbr].earnings += parseNum(bankAmt);
      monthlyMap[abbr].jobs += 1;
    }
  }

  // Apply hours from pre-computed summary section
  for (const hRow of monthlyHoursRows) {
    const m = MONTH_MAP[hRow[13]?.trim()];
    if (m) {
      if (!monthlyMap[m]) monthlyMap[m] = { earnings: 0, jobs: 0, hours: 0 };
      monthlyMap[m].hours = parseNum(hRow[14]);
    }
  }

  const months = Object.entries(monthlyMap)
    .map(([month, d]) => ({ month, ...d }))
    .sort((a, b) => Object.values(MONTH_MAP).indexOf(a.month) - Object.values(MONTH_MAP).indexOf(b.month));

  return { year, half, tab, bankTotal, bankTotalUSD, hours: totalHours, perHour, jobs: months.reduce((s, m) => s + m.jobs, 0), months };
}

export async function getAllDashboardData(): Promise<DashboardData> {
  if (!process.env.SPREADSHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    return getMockData();
  }

  try {
    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: "v4", auth });

    // Batch fetch: current tab summary sections + all tabs' full data
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: [
        `${CURRENT_TAB}!A49:V62`,  // [0] current tab summary
        `${CURRENT_TAB}!I68:J74`,  // [1] investment section (Jan row 68 → Total row 74)
        `${CURRENT_TAB}!R49:S62`,  // [2] other info (lifetime totals)
        ...ALL_TABS.map(({ tab }) => `'${tab}'!A2:R120`), // [3+] all tabs full data
      ],
    });

    const vr = response.data.valueRanges || [];
    const s = vr[0]?.values || [];
    const inv = vr[1]?.values || [];
    const oi = vr[2]?.values || [];

    // --- Current tab KPIs ---
    const statsRow = s[1] || [];
    const bankTotalUSD = parseNum(statsRow[2]);
    const bankTotal = parseNum(statsRow[3]);
    const totalHours = parseNum(statsRow[4]);
    const perHour = parseNum(statsRow[5]);

    const targetRow = s[3] || [];
    const targetProgress = parseNum(targetRow[3]);
    const targetAmount = targetProgress > 0 ? Math.round((bankTotal / targetProgress) * 100) : 0;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const monthly: MonthlyData[] = monthNames.map((month, i) => {
      const row = s[4 + i] || [];
      return {
        month,
        earnings: parseNum(row[9]),
        jobs: parseNum(row[10]),
        hours: parseNum(row[14]),
        investment: 0,
      };
    });

    const b2c = parseNum((s[6] || [])[3]);
    const b2b = parseNum((s[7] || [])[3]);
    const totalEmails = parseNum((s[8] || [])[3]);
    const perEmail = parseNum((s[9] || [])[3]);

    const avgRow = s[10] || [];
    const perMonth = parseNum(avgRow[8]);
    const hoursPerMonth = parseNum(avgRow[13]);

    const newClientsQ3Q4 = parseNum((s[12] || [])[14]);
    const returning = parseNum((s[13] || [])[14]);

    // Investment
    monthly.forEach((m, i) => {
      if (inv[i]) m.investment = parseNum(inv[i][1]);
    });
    const invTotal = parseNum((inv[6] || [])[1]);

    // Lifetime totals
    const freelancingLifetime = parseNum((oi[4] || [])[1]);
    const freelancingLifetimeUSD = parseNum((oi[5] || [])[1]);
    const yearTurnoverTotal = parseNum((oi[8] || [])[1]);

    // --- Historical data from all tabs ---
    const historical: YearData[] = ALL_TABS.map(({ tab, year, half }, i) => {
      const rows = (vr[3 + i]?.values || []) as string[][];
      return parseTabRows(rows, year, half, tab);
    });

    return {
      summary: {
        bankTotal,
        bankTotalUSD,
        totalHours,
        perHour,
        freelancingLifetime,
        freelancingLifetimeUSD,
        yearTurnoverTotal,
        targetYear: 2026,
        targetAmount,
        targetProgress,
      },
      monthly,
      clients: { b2c, b2b, newClientsQ3Q4, returning, totalEmails, perEmail },
      averages: { perMonth, hoursPerMonth },
      investment: { total: invTotal, rate: 20 },
      historical,
    };
  } catch (error) {
    console.error("Failed to fetch sheet data:", error);
    return getMockData();
  }
}

export function getMockData(): DashboardData {
  return {
    summary: {
      bankTotal: 32636.35,
      bankTotalUSD: 44372.00,
      totalHours: 440,
      perHour: 74.17,
      freelancingLifetime: 355400.28,
      freelancingLifetimeUSD: 506884.35,
      yearTurnoverTotal: 34083.54,
      targetYear: 2026,
      targetAmount: 116558,
      targetProgress: 28,
    },
    monthly: [
      { month: "Jan", earnings: 9765.95, hours: 150, jobs: 9, investment: 1553.19 },
      { month: "Feb", earnings: 8270.60, hours: 140, jobs: 8, investment: 1264.12 },
      { month: "Mar", earnings: 12089.80, hours: 150, jobs: 10, investment: 2017.96 },
      { month: "Apr", earnings: 0, hours: 0, jobs: 0, investment: 0 },
      { month: "May", earnings: 0, hours: 0, jobs: 0, investment: 0 },
      { month: "Jun", earnings: 2510.00, hours: 0, jobs: 0, investment: 0 },
    ],
    clients: { b2c: 26, b2b: 1, newClientsQ3Q4: 3, returning: 24, totalEmails: 219, perEmail: 149.02 },
    averages: { perMonth: 5439.39, hoursPerMonth: 146.7 },
    investment: { total: 4825.27, rate: 20 },
    historical: [],
  };
}

export interface MonthlyData {
  month: string;
  earnings: number;
  hours: number;
  jobs: number;
  investment: number;
}

export interface YearData {
  year: number;
  half: "H1" | "H2" | "full";
  tab: string;
  bankTotal: number;
  bankTotalUSD: number;
  hours: number;
  perHour: number;
  jobs: number;
  months: { month: string; earnings: number; jobs: number; hours: number }[];
}

export interface DashboardData {
  summary: {
    bankTotal: number;
    bankTotalUSD: number;
    totalHours: number;
    perHour: number;
    freelancingLifetime: number;
    freelancingLifetimeUSD: number;
    yearTurnoverTotal: number;
    targetYear: number;
    targetAmount: number;
    targetProgress: number;
  };
  monthly: MonthlyData[];
  clients: {
    b2c: number;
    b2b: number;
    newClientsQ3Q4: number;
    returning: number;
    totalEmails: number;
    perEmail: number;
  };
  averages: {
    perMonth: number;
    hoursPerMonth: number;
  };
  investment: {
    total: number;
    rate: number;
  };
  historical: YearData[];
}
