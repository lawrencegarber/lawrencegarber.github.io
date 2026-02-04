import ExcelJS from "exceljs";
import type { Campaign } from "@prisma/client";
import {
  getAllFieldMappings,
  MAX_CONTENT_OUTPUTS,
  MAX_PLANNED_EVENTS,
} from "../types/fieldMappings.js";
import type { CampaignWithRelations } from "../types/fieldMappings.js";

export type ParsedExcelUpdate = {
  campaignId: string;
  campaignUpdate: Partial<Campaign>;
  contentOutputs: Array<{
    platform?: string | null;
    lengthSeconds?: number | null;
    description?: string | null;
  }>;
  plannedEvents: Array<{
    date?: Date | null;
    name?: string | null;
    type?: string | null;
    cityState?: string | null;
    plannedAttendees?: number | null;
    budget?: number | null;
  }>;
};

const campaignFieldMap: Record<string, keyof Campaign> = {
  CAMPAIGN_NAME: "name",
  REGION: "region",
  YEAR: "year",
  STATUS: "status",
  START_DATE: "startDate",
  END_DATE: "endDate",
  MEDIA_KEY_MOMENT: "mediaKeyMoment",
  SPORTS_CULTURE_BRAND_LEAD: "sportsCultureBrandLead",
  MEDIA_NETWORK_PROJECT_LEAD: "mediaNetworkProjectLead",
  IO_NUMBER: "ioNumber",
  IDEA_IN_SENTENCE: "ideaInSentence",
  WHY: "why",
  WHO_IS_THIS_FOR: "whoIsThisFor",
  CONSUMER_HEARS_ABOUT_IT: "consumerHearsAboutIt",
  SUCCESS_LOOKS_LIKE: "whatDoesSuccessLookLike",
  HOOKS: "hooks",
  TICKETING_PLAN: "ticketingPlan",
  MERCHANDISING_PLAN: "merchandisingPlan",
  PARTNERSHIP_PLAN: "partnershipPlan",
  TOTAL_BUDGET: "totalBudget",
  BUDGET_CULTURE: "budgetCulture",
  BUDGET_MEDIA_NETWORK: "budgetMediaNetwork",
  BUDGET_DIRECT_ADVERTISING: "budgetDirectAdvertising",
  BUDGET_CULTURE_INCOME: "budgetCultureIncome",
  TOTAL_PLANNED_EVENTS: "totalPlannedEvents",
  TOTAL_PLANNED_ATTENDEES: "totalPlannedAttendees",
  TOTAL_EVENT_BUDGET: "totalEventBudget",
};

const numericFields = new Set<keyof Campaign>([
  "year",
  "totalBudget",
  "budgetCulture",
  "budgetMediaNetwork",
  "budgetDirectAdvertising",
  "budgetCultureIncome",
  "totalPlannedEvents",
  "totalPlannedAttendees",
  "totalEventBudget",
]);

const dateFields = new Set<keyof Campaign>(["startDate", "endDate"]);

const parseNumber = (value: ExcelJS.CellValue) => {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const parseDate = (value: ExcelJS.CellValue) => {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

export const exportCampaignsToExcel = async (
  campaigns: CampaignWithRelations[],
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Campaigns");
  const mappings = getAllFieldMappings();

  sheet.addRow(mappings.map((mapping) => mapping.label));

  campaigns.forEach((campaign) => {
    const rowValues = mappings.map((mapping) => mapping.getValue(campaign));
    sheet.addRow(rowValues);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer as ArrayBuffer);
};

export const parseExcelUpdates = async (
  fileBuffer: Buffer,
): Promise<ParsedExcelUpdate[]> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return [];
  }

  const mappings = getAllFieldMappings();
  const headers = sheet.getRow(1).values?.slice(1) as string[];
  const headerIndexMap = new Map<string, number>();
  headers.forEach((header, index) => {
    if (typeof header === "string") {
      headerIndexMap.set(header.trim(), index + 1);
    }
  });

  const updates: ParsedExcelUpdate[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }
    const getCellValue = (label: string) => {
      const columnIndex = headerIndexMap.get(label);
      if (!columnIndex) {
        return null;
      }
      return row.getCell(columnIndex).value ?? null;
    };

    const campaignId = getCellValue("Campaign ID");
    if (typeof campaignId !== "string" || campaignId.trim() === "") {
      return;
    }

    const campaignUpdate: Partial<Campaign> = {};
    mappings.forEach((mapping) => {
      if (!campaignFieldMap[mapping.key]) {
        return;
      }
      const value = getCellValue(mapping.label);
      const fieldKey = campaignFieldMap[mapping.key];

      if (value === null || value === "") {
        return;
      }

      if (dateFields.has(fieldKey)) {
        const parsed = parseDate(value);
        if (parsed) {
          campaignUpdate[fieldKey] = parsed as never;
        }
        return;
      }

      if (numericFields.has(fieldKey)) {
        const parsed = parseNumber(value);
        if (parsed !== null) {
          campaignUpdate[fieldKey] = parsed as never;
        }
        return;
      }

      if (typeof value === "string") {
        campaignUpdate[fieldKey] = value as never;
        return;
      }

      if (typeof value === "number") {
        campaignUpdate[fieldKey] = value as never;
      }
    });

    const contentOutputs = Array.from(
      { length: MAX_CONTENT_OUTPUTS },
      () => ({
        platform: null,
        lengthSeconds: null,
        description: null,
      }),
    );
    for (let i = 0; i < MAX_CONTENT_OUTPUTS; i += 1) {
      const platform = getCellValue(
        `Main Content Output - Platform ${i + 1}`,
      );
      const length = getCellValue(
        `Main Content Output - Length ${i + 1}`,
      );
      const description = getCellValue(
        `Main Content Output - Description ${i + 1}`,
      );

      contentOutputs[i].platform =
        typeof platform === "string" ? platform : null;
      contentOutputs[i].lengthSeconds = parseNumber(length);
      contentOutputs[i].description =
        typeof description === "string" ? description : null;
    }

    const plannedEvents = Array.from({ length: MAX_PLANNED_EVENTS }, () => ({
      date: null,
      name: null,
      type: null,
      cityState: null,
      plannedAttendees: null,
      budget: null,
    }));

    for (let i = 0; i < MAX_PLANNED_EVENTS; i += 1) {
      const dateValue = getCellValue(`Planned Event ${i + 1} - Date`);
      const name = getCellValue(`Planned Event ${i + 1} - Name`);
      const type = getCellValue(`Planned Event ${i + 1} - Type`);
      const cityState = getCellValue(`Planned Event ${i + 1} - City, State`);
      const attendees = getCellValue(
        `Planned Event ${i + 1} - Planned Attendees`,
      );
      const budget = getCellValue(`Planned Event ${i + 1} - Budget`);

      plannedEvents[i].date = parseDate(dateValue);
      plannedEvents[i].name = typeof name === "string" ? name : null;
      plannedEvents[i].type = typeof type === "string" ? type : null;
      plannedEvents[i].cityState = typeof cityState === "string" ? cityState : null;
      plannedEvents[i].plannedAttendees = parseNumber(attendees);
      plannedEvents[i].budget = parseNumber(budget);
    }

    updates.push({
      campaignId: campaignId.trim(),
      campaignUpdate,
      contentOutputs: contentOutputs.filter(
        (item) =>
          item.platform ||
          item.lengthSeconds ||
          item.description,
      ),
      plannedEvents: plannedEvents.filter(
        (event) =>
          event.date ||
          event.name ||
          event.type ||
          event.cityState ||
          event.plannedAttendees ||
          event.budget,
      ),
    });
  });

  return updates;
};
