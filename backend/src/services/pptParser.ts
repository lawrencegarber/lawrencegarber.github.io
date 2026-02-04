import path from "node:path";
import AdmZip from "adm-zip";
import type { DataCheckIssue } from "./validationService.js";

export type ParsedCampaign = {
  fields: {
    name: string;
    region: string;
    year: number;
    startDate?: Date | null;
    endDate?: Date | null;
    mediaKeyMoment?: string | null;
    sportsCultureBrandLead?: string | null;
    mediaNetworkProjectLead?: string | null;
    ioNumber?: string | null;
    ideaInSentence?: string | null;
    why?: string | null;
    whoIsThisFor?: string | null;
    consumerHearsAboutIt?: string | null;
    whatDoesSuccessLookLike?: string | null;
    hooks?: string | null;
    ticketingPlan?: string | null;
    merchandisingPlan?: string | null;
    partnershipPlan?: string | null;
    totalBudget?: number | null;
    budgetCulture?: number | null;
    budgetMediaNetwork?: number | null;
    budgetDirectAdvertising?: number | null;
    budgetCultureIncome?: number | null;
    totalPlannedEvents?: number | null;
    totalPlannedAttendees?: number | null;
    totalEventBudget?: number | null;
  };
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
  templateErrors: DataCheckIssue[];
};

export const parsePptx = (filePath: string): ParsedCampaign => {
  const fileName = path.basename(filePath, path.extname(filePath));
  const templateErrors: DataCheckIssue[] = [];

  try {
    const zip = new AdmZip(filePath);
    const entries = zip.getEntries().map((entry) => entry.entryName);
    if (!entries.some((name) => name.includes("ppt/slides/slide1.xml"))) {
      templateErrors.push({
        field: "template",
        code: "template_not_recognized",
        message:
          "We could not match this PPT to the standard template. Check that you are using this year's file.",
      });
    }
  } catch (error) {
    templateErrors.push({
      field: "template",
      code: "invalid_pptx",
      message: "We could not read the PPTX file. Please upload a valid deck.",
    });
  }

  return {
    fields: {
      name: fileName.replace(/[-_]/g, " ").trim() || "New Campaign",
      region: "Northeast",
      year: new Date().getFullYear(),
      mediaKeyMoment: "Key moment from PPT",
      sportsCultureBrandLead: "TBD",
      mediaNetworkProjectLead: "TBD",
    },
    contentOutputs: [
      {
        platform: "Instagram Reels",
        lengthSeconds: 30,
        description: "Short teaser video.",
      },
    ],
    plannedEvents: [],
    templateErrors,
  };
};
