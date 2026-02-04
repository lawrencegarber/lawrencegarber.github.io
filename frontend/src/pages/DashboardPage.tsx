import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  exportExcel,
  fetchCampaigns,
  importExcel,
} from "../api/client.ts";
import type { Campaign } from "../types.ts";
import { useAuth } from "../state/AuthContext.tsx";
import { StatusPill } from "../components/StatusPill.tsx";

const regions = [
  "Northeast",
  "Southeast",
  "Midwest",
  "Central",
  "West",
  "National",
];

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("2026");
  const [regionFilter, setRegionFilter] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const data = await fetchCampaigns({
        status: statusFilter === "All" ? undefined : statusFilter,
        year: yearFilter,
        region: regionFilter || undefined,
      });
      setCampaigns(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [statusFilter, yearFilter, regionFilter]);

  const handleExport = async () => {
    try {
      await exportExcel({
        status: statusFilter === "All" ? undefined : statusFilter,
        year: yearFilter,
        region: regionFilter || undefined,
      });
      setToast("Excel exported.");
    } catch {
      setToast("Export failed.");
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const summary = await importExcel(file);
      setToast(
        `Changes applied. ${summary.campaignsUpdated} campaigns updated.`,
      );
      await loadCampaigns();
    } catch {
      setToast("Import failed.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <main className="page-container">
      <section className="page-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Campaign Dashboard</h1>
            <p className="subtle">
              Upload decks, run data checks, and manage status.
            </p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => navigate("/upload")}
            >
              Upload PPT
            </button>
            <button className="btn btn-secondary" type="button" onClick={handleExport}>
              Export to Excel
            </button>
            {user?.role !== "regional" ? (
              <>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Import Excel Changes
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  className="hidden-input"
                  onChange={handleImport}
                />
              </>
            ) : null}
          </div>
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <label>Status</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All</option>
              <option>Draft</option>
              <option>Submitted</option>
              <option value="ChangesRequested">Changes Requested</option>
              <option>Approved</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Planning Year</label>
            <select
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
            >
              <option>2026</option>
              <option>2025</option>
            </select>
          </div>
          {user?.role !== "regional" ? (
            <div className="filter-group">
              <label>Region</label>
              <select
                value={regionFilter}
                onChange={(event) => setRegionFilter(event.target.value)}
              >
                <option value="">All regions</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="filter-group">
              <label>Region</label>
              <input value="Your campaigns" readOnly />
            </div>
          )}
          <div className="filter-group">
            <label>Search</label>
            <input placeholder="Search campaigns" disabled />
          </div>
        </div>

        <div className="card">
          <div className="card-header">Campaign List</div>
          <div className="card-body">
            {loading ? (
              <div className="subtle">Loading campaigns...</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Campaign Name</th>
                    <th>Region</th>
                    <th>Start-End</th>
                    <th>Total Budget</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr
                      key={campaign.id}
                      onClick={() => navigate(`/campaign/${campaign.id}`)}
                    >
                      <td>{campaign.name}</td>
                      <td>{campaign.region}</td>
                      <td>
                        {campaign.startDate ?? "TBD"} - {campaign.endDate ?? "TBD"}
                      </td>
                      <td>
                        {campaign.totalBudget
                          ? `$${campaign.totalBudget.toLocaleString()}`
                          : "TBD"}
                      </td>
                      <td>
                        <StatusPill status={campaign.status} />
                      </td>
                      <td>{campaign.updatedAt?.slice(0, 10) ?? "Recently"}</td>
                    </tr>
                  ))}
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="subtle">
                        No campaigns found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
      {toast ? <div className="toast">{toast}</div> : null}
    </main>
  );
};
