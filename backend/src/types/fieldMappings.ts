import type { Campaign, ContentOutput, PlannedEvent, User } from "@prisma/client";

export type CampaignWithRelations = Campaign & {
  contentOutputs: ContentOutput[];
  plannedEvents: PlannedEvent[];
  createdBy: User;
};

export type FieldMapping = {
  key: string;
  label: string;
  getValue: (campaign: CampaignWithRelations) => string | number | null;
};

export const MAX_CONTENT_OUTPUTS = 5;
export const MAX_PLANNED_EVENTS = 6;

const formatDate = (value: Date | null) =>
  value ? value.toISOString().slice(0, 10) : "";

const formatNumber = (value: number | null) =>
  typeof value === "number" ? value : "";

const formatText = (value: string | null) => value ?? "";

const contentOutputMappings = (index: number): FieldMapping[] => {
  const position = index + 1;
  return [
    {
      key: `MAIN_CONTENT_OUTPUT_PLATFORM_${position}`,
      label: `Main Content Output - Platform ${position}`,
      getValue: (campaign) =>
        formatText(campaign.contentOutputs[index]?.platform ?? null),
    },
    {
      key: `MAIN_CONTENT_OUTPUT_LENGTH_${position}`,
      label: `Main Content Output - Length ${position}`,
      getValue: (campaign) =>
        formatNumber(campaign.contentOutputs[index]?.lengthSeconds ?? null),
    },
    {
      key: `MAIN_CONTENT_OUTPUT_DESCRIPTION_${position}`,
      label: `Main Content Output - Description ${position}`,
      getValue: (campaign) =>
        formatText(campaign.contentOutputs[index]?.description ?? null),
    },
  ];
};

const plannedEventMappings = (index: number): FieldMapping[] => {
  const position = index + 1;
  return [
    {
      key: `PLANNED_EVENT_${position}_DATE`,
      label: `Planned Event ${position} - Date`,
      getValue: (campaign) =>
        formatDate(campaign.plannedEvents[index]?.date ?? null),
    },
    {
      key: `PLANNED_EVENT_${position}_NAME`,
      label: `Planned Event ${position} - Name`,
      getValue: (campaign) =>
        formatText(campaign.plannedEvents[index]?.name ?? null),
    },
    {
      key: `PLANNED_EVENT_${position}_TYPE`,
      label: `Planned Event ${position} - Type`,
      getValue: (campaign) =>
        formatText(campaign.plannedEvents[index]?.type ?? null),
    },
    {
      key: `PLANNED_EVENT_${position}_CITY_STATE`,
      label: `Planned Event ${position} - City, State`,
      getValue: (campaign) =>
        formatText(campaign.plannedEvents[index]?.cityState ?? null),
    },
    {
      key: `PLANNED_EVENT_${position}_ATTENDEES`,
      label: `Planned Event ${position} - Planned Attendees`,
      getValue: (campaign) =>
        formatNumber(campaign.plannedEvents[index]?.plannedAttendees ?? null),
    },
    {
      key: `PLANNED_EVENT_${position}_BUDGET`,
      label: `Planned Event ${position} - Budget`,
      getValue: (campaign) =>
        formatNumber(campaign.plannedEvents[index]?.budget ?? null),
    },
  ];
};

export const baseFieldMappings: FieldMapping[] = [
  {
    key: "CAMPAIGN_ID",
    label: "Campaign ID",
    getValue: (campaign) => campaign.id,
  },
  {
    key: "CAMPAIGN_NAME",
    label: "Campaign Name",
    getValue: (campaign) => formatText(campaign.name),
  },
  {
    key: "REGION",
    label: "Region",
    getValue: (campaign) => campaign.region,
  },
  {
    key: "YEAR",
    label: "Planning Year",
    getValue: (campaign) => campaign.year,
  },
  {
    key: "STATUS",
    label: "Status",
    getValue: (campaign) => campaign.status,
  },
  {
    key: "START_DATE",
    label: "Start Date",
    getValue: (campaign) => formatDate(campaign.startDate),
  },
  {
    key: "END_DATE",
    label: "End Date",
    getValue: (campaign) => formatDate(campaign.endDate),
  },
  {
    key: "MEDIA_KEY_MOMENT",
    label: "Media Key Moment",
    getValue: (campaign) => formatText(campaign.mediaKeyMoment),
  },
  {
    key: "SPORTS_CULTURE_BRAND_LEAD",
    label: "Sports/Culture/Brand Lead",
    getValue: (campaign) => formatText(campaign.sportsCultureBrandLead),
  },
  {
    key: "MEDIA_NETWORK_PROJECT_LEAD",
    label: "Media Network Project Lead",
    getValue: (campaign) => formatText(campaign.mediaNetworkProjectLead),
  },
  {
    key: "IO_NUMBER",
    label: "IO / Budget Code",
    getValue: (campaign) => formatText(campaign.ioNumber),
  },
  {
    key: "IDEA_IN_SENTENCE",
    label: "Idea in a Sentence",
    getValue: (campaign) => formatText(campaign.ideaInSentence),
  },
  {
    key: "WHY",
    label: "Why",
    getValue: (campaign) => formatText(campaign.why),
  },
  {
    key: "WHO_IS_THIS_FOR",
    label: "Who is this for",
    getValue: (campaign) => formatText(campaign.whoIsThisFor),
  },
  {
    key: "CONSUMER_HEARS_ABOUT_IT",
    label: "How does a consumer hear about it",
    getValue: (campaign) => formatText(campaign.consumerHearsAboutIt),
  },
  {
    key: "SUCCESS_LOOKS_LIKE",
    label: "What does success look like",
    getValue: (campaign) => formatText(campaign.whatDoesSuccessLookLike),
  },
  {
    key: "HOOKS",
    label: "Hook(s)",
    getValue: (campaign) => formatText(campaign.hooks),
  },
  {
    key: "TICKETING_PLAN",
    label: "Ticketing Plan",
    getValue: (campaign) => formatText(campaign.ticketingPlan),
  },
  {
    key: "MERCHANDISING_PLAN",
    label: "Merchandising Plan",
    getValue: (campaign) => formatText(campaign.merchandisingPlan),
  },
  {
    key: "PARTNERSHIP_PLAN",
    label: "Partnership Plan",
    getValue: (campaign) => formatText(campaign.partnershipPlan),
  },
  {
    key: "TOTAL_BUDGET",
    label: "Total Budget",
    getValue: (campaign) => formatNumber(campaign.totalBudget),
  },
  {
    key: "BUDGET_CULTURE",
    label: "Budget - Culture",
    getValue: (campaign) => formatNumber(campaign.budgetCulture),
  },
  {
    key: "BUDGET_MEDIA_NETWORK",
    label: "Budget - Media Network",
    getValue: (campaign) => formatNumber(campaign.budgetMediaNetwork),
  },
  {
    key: "BUDGET_DIRECT_ADVERTISING",
    label: "Budget - Direct Advertising",
    getValue: (campaign) => formatNumber(campaign.budgetDirectAdvertising),
  },
  {
    key: "BUDGET_CULTURE_INCOME",
    label: "Budget - Culture Income",
    getValue: (campaign) => formatNumber(campaign.budgetCultureIncome),
  },
  {
    key: "TOTAL_PLANNED_EVENTS",
    label: "Total Planned Events",
    getValue: (campaign) => formatNumber(campaign.totalPlannedEvents),
  },
  {
    key: "TOTAL_PLANNED_ATTENDEES",
    label: "Total Planned Attendees",
    getValue: (campaign) => formatNumber(campaign.totalPlannedAttendees),
  },
  {
    key: "TOTAL_EVENT_BUDGET",
    label: "Total Event Budget",
    getValue: (campaign) => formatNumber(campaign.totalEventBudget),
  },
];

export const getAllFieldMappings = (): FieldMapping[] => {
  const mappings: FieldMapping[] = [...baseFieldMappings];
  for (let i = 0; i < MAX_CONTENT_OUTPUTS; i += 1) {
    mappings.push(...contentOutputMappings(i));
  }
  for (let i = 0; i < MAX_PLANNED_EVENTS; i += 1) {
    mappings.push(...plannedEventMappings(i));
  }
  return mappings;
};

export const getPlaceholderMap = (
  campaign: CampaignWithRelations,
): Record<string, string> => {
  const mappings = getAllFieldMappings();
  return mappings.reduce<Record<string, string>>((acc, mapping) => {
    const value = mapping.getValue(campaign);
    acc[`{{${mapping.key}}}`] = value === null ? "" : String(value);
    return acc;
  }, {});
};
