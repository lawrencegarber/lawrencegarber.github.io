import type { CampaignWithRelations } from "../types/fieldMappings.js";

export type DataCheckIssue = {
  field: string;
  code: string;
  message: string;
};

export type DataCheckResult = {
  errors: DataCheckIssue[];
  warnings: DataCheckIssue[];
  info: DataCheckIssue[];
};

const optionalTextFields = [
  "ideaInSentence",
  "why",
  "whoIsThisFor",
  "consumerHearsAboutIt",
  "whatDoesSuccessLookLike",
  "hooks",
  "ticketingPlan",
  "merchandisingPlan",
  "partnershipPlan",
] as const;

type OptionalTextField = (typeof optionalTextFields)[number];

export const runDataCheck = (
  campaign: CampaignWithRelations,
  templateErrors: DataCheckIssue[] = [],
): DataCheckResult => {
  const errors: DataCheckIssue[] = [...templateErrors];
  const warnings: DataCheckIssue[] = [];
  const info: DataCheckIssue[] = [];

  optionalTextFields.forEach((field: OptionalTextField) => {
    const value = campaign[field];
    if (!value || value.trim() === "") {
      warnings.push({
        field,
        code: "optional_empty",
        message: "Optional field is empty. You can still submit.",
      });
    }
  });

  const eventBudgetSum = campaign.plannedEvents.reduce((sum, event) => {
    return sum + (event.budget ?? 0);
  }, 0);
  if (
    campaign.totalEventBudget !== null &&
    campaign.totalEventBudget !== undefined &&
    Math.abs((campaign.totalEventBudget ?? 0) - eventBudgetSum) > 1
  ) {
    warnings.push({
      field: "totalEventBudget",
      code: "event_budget_mismatch",
      message: "Planned event budgets do not match the total event budget.",
    });
  }

  info.push({
    field: "contentOutputs",
    code: "rows_detected",
    message: `${campaign.contentOutputs.length} Content Output rows detected.`,
  });
  info.push({
    field: "plannedEvents",
    code: "rows_detected",
    message: `${campaign.plannedEvents.length} Planned Events rows detected.`,
  });

  return { errors, warnings, info };
};
