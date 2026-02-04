import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  approveCampaign,
  fetchCampaign,
  generatePpt,
  requestChanges,
  submitCampaign,
  updateCampaign,
} from "../api/client.ts";
import type { Campaign, ContentOutput, PlannedEvent } from "../types.ts";
import { StatusPill } from "../components/StatusPill.tsx";
import { useAuth } from "../state/AuthContext.tsx";

export const CampaignDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [toast, setToast] = useState("");

  const loadCampaign = async () => {
    if (!id) return;
    const data = await fetchCampaign(id);
    setCampaign(data);
  };

  useEffect(() => {
    loadCampaign();
  }, [id]);

  const canEdit =
    user?.role !== "regional" ||
    campaign?.status === "Draft" ||
    campaign?.status === "ChangesRequested";

  const updateField = (key: keyof Campaign, value: Campaign[keyof Campaign]) => {
    if (!campaign) return;
    setCampaign({ ...campaign, [key]: value });
  };

  const updateContentOutput = (
    index: number,
    field: keyof ContentOutput,
    value: string | number | null,
  ) => {
    if (!campaign) return;
    const next = [...campaign.contentOutputs];
    next[index] = { ...next[index], [field]: value };
    setCampaign({ ...campaign, contentOutputs: next });
  };

  const updatePlannedEvent = (
    index: number,
    field: keyof PlannedEvent,
    value: string | number | null,
  ) => {
    if (!campaign) return;
    const next = [...campaign.plannedEvents];
    next[index] = { ...next[index], [field]: value };
    setCampaign({ ...campaign, plannedEvents: next });
  };

  const addContentOutput = () => {
    if (!campaign) return;
    setCampaign({
      ...campaign,
      contentOutputs: [...campaign.contentOutputs, {}],
    });
  };

  const addPlannedEvent = () => {
    if (!campaign) return;
    setCampaign({
      ...campaign,
      plannedEvents: [...campaign.plannedEvents, {}],
    });
  };

  const removeContentOutput = (index: number) => {
    if (!campaign) return;
    const next = campaign.contentOutputs.filter((_, idx) => idx !== index);
    setCampaign({ ...campaign, contentOutputs: next });
  };

  const removePlannedEvent = (index: number) => {
    if (!campaign) return;
    const next = campaign.plannedEvents.filter((_, idx) => idx !== index);
    setCampaign({ ...campaign, plannedEvents: next });
  };

  const handleSave = async () => {
    if (!campaign || !id) return;
    const updated = await updateCampaign(id, campaign);
    setCampaign(updated);
    setToast("Draft saved.");
  };

  const handleSubmit = async () => {
    if (!id) return;
    await submitCampaign(id);
    setToast("Submitted to national team.");
    await loadCampaign();
  };

  const handleApprove = async () => {
    if (!id) return;
    await approveCampaign(id);
    setToast("Campaign approved.");
    await loadCampaign();
  };

  const handleRequestChanges = async () => {
    if (!id) return;
    await requestChanges(id);
    setToast("Changes requested.");
    await loadCampaign();
  };

  const handleGeneratePpt = async () => {
    if (!id) return;
    await generatePpt(id);
    setToast("PPT generated.");
  };

  const eventBudgetTotal = useMemo(() => {
    return campaign?.plannedEvents.reduce((sum, event) => {
      return sum + (event.budget ?? 0);
    }, 0);
  }, [campaign]);

  if (!campaign) {
    return (
      <main className="page-container">
        <div className="subtle">Loading campaign...</div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <section className="page-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Campaign Detail</p>
            <h2>{campaign.name}</h2>
          </div>
          <StatusPill status={campaign.status} />
        </div>

        <div className="detail-grid">
          <div className="detail-main">
            <div className="card">
              <div className="card-header">Overview</div>
              <div className="card-body">
                <div className="form-grid">
                  <label className="form-group">
                    <span>Campaign Name</span>
                    <input
                      value={campaign.name}
                      onChange={(event) =>
                        updateField("name", event.target.value)
                      }
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="form-group">
                    <span>Region</span>
                    <input value={campaign.region} readOnly />
                  </label>
                  <label className="form-group">
                    <span>Start Date</span>
                    <input
                      type="date"
                      value={campaign.startDate?.slice(0, 10) ?? ""}
                      onChange={(event) =>
                        updateField("startDate", event.target.value)
                      }
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="form-group">
                    <span>End Date</span>
                    <input
                      type="date"
                      value={campaign.endDate?.slice(0, 10) ?? ""}
                      onChange={(event) =>
                        updateField("endDate", event.target.value)
                      }
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="form-group">
                    <span>Media Key Moment</span>
                    <input
                      value={campaign.mediaKeyMoment ?? ""}
                      onChange={(event) =>
                        updateField("mediaKeyMoment", event.target.value)
                      }
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="form-group">
                    <span>IO / Budget Code</span>
                    <input
                      value={campaign.ioNumber ?? ""}
                      onChange={(event) =>
                        updateField("ioNumber", event.target.value)
                      }
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="form-group">
                    <span>Sports/Culture/Brand Lead</span>
                    <input
                      value={campaign.sportsCultureBrandLead ?? ""}
                      onChange={(event) =>
                        updateField("sportsCultureBrandLead", event.target.value)
                      }
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="form-group">
                    <span>Media Network Project Lead</span>
                    <input
                      value={campaign.mediaNetworkProjectLead ?? ""}
                      onChange={(event) =>
                        updateField(
                          "mediaNetworkProjectLead",
                          event.target.value,
                        )
                      }
                      disabled={!canEdit}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">Strategy and Story</div>
              <div className="card-body">
                <div className="form-stack">
                  <label className="form-group">
                    <span>Idea in a Sentence</span>
                    <textarea
                      rows={2}
                      value={campaign.ideaInSentence ?? ""}
                      onChange={(event) =>
                        updateField("ideaInSentence", event.target.value)
                      }
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="form-group">
                    <span>Why</span>
                    <textarea
                      rows={3}
                      value={campaign.why ?? ""}
                      onChange={(event) => updateField("why", event.target.value)}
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="form-group">
                    <span>Who is this for</span>
                    <textarea
                      rows={3}
                      value={campaign.whoIsThisFor ?? ""}
                      onChange={(event) =>
                        updateField("whoIsThisFor", event.target.value)
                      }
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="form-group">
                    <span>How does a consumer hear about it</span>
                    <textarea
                      rows={3}
                      value={campaign.consumerHearsAboutIt ?? ""}
                      onChange={(event) =>
                        updateField("consumerHearsAboutIt", event.target.value)
                      }
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="form-group">
                    <span>What does success look like</span>
                    <textarea
                      rows={3}
                      value={campaign.whatDoesSuccessLookLike ?? ""}
                      onChange={(event) =>
                        updateField(
                          "whatDoesSuccessLookLike",
                          event.target.value,
                        )
                      }
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="form-group">
                    <span>Hook(s)</span>
                    <textarea
                      rows={2}
                      value={campaign.hooks ?? ""}
                      onChange={(event) =>
                        updateField("hooks", event.target.value)
                      }
                      disabled={!canEdit}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">Main Content Output</div>
              <div className="card-body">
                <div className="table-actions">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={addContentOutput}
                    disabled={!canEdit}
                  >
                    Add Row
                  </button>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Platform</th>
                      <th>Length (sec)</th>
                      <th>Description</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaign.contentOutputs.map((output, index) => (
                      <tr key={`output-${index}`}>
                        <td>
                          <input
                            value={output.platform ?? ""}
                            onChange={(event) =>
                              updateContentOutput(
                                index,
                                "platform",
                                event.target.value,
                              )
                            }
                            disabled={!canEdit}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={output.lengthSeconds ?? ""}
                            onChange={(event) =>
                              updateContentOutput(
                                index,
                                "lengthSeconds",
                                event.target.value === ""
                                  ? null
                                  : Number(event.target.value),
                              )
                            }
                            disabled={!canEdit}
                          />
                        </td>
                        <td>
                          <input
                            value={output.description ?? ""}
                            onChange={(event) =>
                              updateContentOutput(
                                index,
                                "description",
                                event.target.value,
                              )
                            }
                            disabled={!canEdit}
                          />
                        </td>
                        <td>
                          <button
                            className="btn btn-ghost"
                            type="button"
                            onClick={() => removeContentOutput(index)}
                            disabled={!canEdit}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {campaign.contentOutputs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="subtle">
                          No content outputs yet.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-header">Ticketing, Merch, Partnerships</div>
              <div className="card-body">
                <div className="three-column">
                  <label className="form-group">
                    <span>Ticketing Plan</span>
                    <textarea
                      rows={4}
                      value={campaign.ticketingPlan ?? ""}
                      onChange={(event) =>
                        updateField("ticketingPlan", event.target.value)
                      }
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="form-group">
                    <span>Merchandising Plan</span>
                    <textarea
                      rows={4}
                      value={campaign.merchandisingPlan ?? ""}
                      onChange={(event) =>
                        updateField("merchandisingPlan", event.target.value)
                      }
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="form-group">
                    <span>Partnership Plan</span>
                    <textarea
                      rows={4}
                      value={campaign.partnershipPlan ?? ""}
                      onChange={(event) =>
                        updateField("partnershipPlan", event.target.value)
                      }
                      disabled={!canEdit}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">Planned Events</div>
              <div className="card-body">
                {campaign.totalEventBudget &&
                eventBudgetTotal &&
                Math.abs(campaign.totalEventBudget - eventBudgetTotal) > 1 ? (
                  <div className="inline-warning">
                    Heads up: Planned event budgets do not match the total event
                    budget.
                  </div>
                ) : null}
                <div className="table-actions">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={addPlannedEvent}
                    disabled={!canEdit}
                  >
                    Add Row
                  </button>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Event Name</th>
                      <th>Event Type</th>
                      <th>City, State</th>
                      <th>Planned Attendees</th>
                      <th>Budget</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaign.plannedEvents.map((event, index) => (
                      <tr key={`event-${index}`}>
                        <td>
                          <input
                            type="date"
                            value={event.date?.slice(0, 10) ?? ""}
                            onChange={(ev) =>
                              updatePlannedEvent(index, "date", ev.target.value)
                            }
                            disabled={!canEdit}
                          />
                        </td>
                        <td>
                          <input
                            value={event.name ?? ""}
                            onChange={(ev) =>
                              updatePlannedEvent(index, "name", ev.target.value)
                            }
                            disabled={!canEdit}
                          />
                        </td>
                        <td>
                          <input
                            value={event.type ?? ""}
                            onChange={(ev) =>
                              updatePlannedEvent(index, "type", ev.target.value)
                            }
                            disabled={!canEdit}
                          />
                        </td>
                        <td>
                          <input
                            value={event.cityState ?? ""}
                            onChange={(ev) =>
                              updatePlannedEvent(
                                index,
                                "cityState",
                                ev.target.value,
                              )
                            }
                            disabled={!canEdit}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={event.plannedAttendees ?? ""}
                            onChange={(ev) =>
                              updatePlannedEvent(
                                index,
                                "plannedAttendees",
                                ev.target.value === "" ? null : Number(ev.target.value),
                              )
                            }
                            disabled={!canEdit}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={event.budget ?? ""}
                            onChange={(ev) =>
                              updatePlannedEvent(
                                index,
                                "budget",
                                ev.target.value === "" ? null : Number(ev.target.value),
                              )
                            }
                            disabled={!canEdit}
                          />
                        </td>
                        <td>
                          <button
                            className="btn btn-ghost"
                            type="button"
                            onClick={() => removePlannedEvent(index)}
                            disabled={!canEdit}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {campaign.plannedEvents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="subtle">
                          No planned events yet.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-header">Budgets and Totals</div>
              <div className="card-body">
                <div className="metric-grid">
                  <div className="metric-card">
                    <div className="metric-label">Total Budget</div>
                    <div className="metric-value">
                      {campaign.totalBudget ?? "TBD"}
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Culture</div>
                    <div className="metric-value">
                      {campaign.budgetCulture ?? "TBD"}
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Media Network</div>
                    <div className="metric-value">
                      {campaign.budgetMediaNetwork ?? "TBD"}
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Direct Advertising</div>
                    <div className="metric-value">
                      {campaign.budgetDirectAdvertising ?? "TBD"}
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Culture Income</div>
                    <div className="metric-value">
                      {campaign.budgetCultureIncome ?? "TBD"}
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Total Planned Events</div>
                    <div className="metric-value">
                      {campaign.totalPlannedEvents ?? "TBD"}
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Total Planned Attendees</div>
                    <div className="metric-value">
                      {campaign.totalPlannedAttendees ?? "TBD"}
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Total Event Budget</div>
                    <div className="metric-value">
                      {campaign.totalEventBudget ?? "TBD"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="detail-side">
            <div className="card">
              <div className="card-header">Campaign Logo</div>
              <div className="card-body">
                <div className="logo-preview">
                  {campaign.logoImagePath ? (
                    <img
                      src={campaign.logoImagePath}
                      alt="Campaign logo"
                      className="logo-image"
                    />
                  ) : (
                    "Logo Preview"
                  )}
                </div>
                <div className="subtle">Imported from PPT.</div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">Actions</div>
              <div className="card-body">
                {user?.role === "regional" ? (
                  <div className="action-group">
                    <div className="action-title">Regional User</div>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={handleSave}
                      disabled={!canEdit}
                    >
                      Save Draft
                    </button>
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={handleSubmit}
                      disabled={!canEdit}
                    >
                      Submit to National Team
                    </button>
                  </div>
                ) : (
                  <div className="action-group">
                    <div className="action-title">National Team</div>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={handleSave}
                    >
                      Save Changes
                    </button>
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={handleApprove}
                    >
                      Approve Campaign
                    </button>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={handleRequestChanges}
                    >
                      Mark as Changes Requested
                    </button>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={handleGeneratePpt}
                    >
                      Generate Updated PPT
                    </button>
                  </div>
                )}
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => navigate("/dashboard")}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>
      {toast ? <div className="toast">{toast}</div> : null}
    </main>
  );
};
