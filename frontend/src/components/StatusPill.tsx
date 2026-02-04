import type { CampaignStatus } from "../types.ts";

const statusClassMap: Record<CampaignStatus, string> = {
  Draft: "status-draft",
  Submitted: "status-submitted",
  ChangesRequested: "status-changes",
  Approved: "status-approved",
};

const statusLabelMap: Record<CampaignStatus, string> = {
  Draft: "Draft",
  Submitted: "Submitted",
  ChangesRequested: "Changes Requested",
  Approved: "Approved",
};

export const StatusPill = ({ status }: { status: CampaignStatus }) => (
  <span className={`status-pill ${statusClassMap[status]}`}>
    {statusLabelMap[status]}
  </span>
);
