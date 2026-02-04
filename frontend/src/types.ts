export type UserRole = "regional" | "national" | "admin";

export type Region =
  | "Northeast"
  | "Southeast"
  | "Midwest"
  | "Central"
  | "West"
  | "National";

export type CampaignStatus =
  | "Draft"
  | "Submitted"
  | "ChangesRequested"
  | "Approved";

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  region: Region | null;
};

export type ContentOutput = {
  id?: string;
  platform?: string | null;
  lengthSeconds?: number | null;
  description?: string | null;
};

export type PlannedEvent = {
  id?: string;
  date?: string | null;
  name?: string | null;
  type?: string | null;
  cityState?: string | null;
  plannedAttendees?: number | null;
  budget?: number | null;
};

export type Campaign = {
  id: string;
  name: string;
  region: Region;
  year: number;
  status: CampaignStatus;
  startDate?: string | null;
  endDate?: string | null;
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
  originalPptPath?: string | null;
  latestGeneratedPptPath?: string | null;
  logoImagePath?: string | null;
  contentOutputs: ContentOutput[];
  plannedEvents: PlannedEvent[];
  createdAt?: string;
  updatedAt?: string;
};

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
