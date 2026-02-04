import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitCampaign, uploadPpt } from "../api/client.ts";
import type { Campaign, DataCheckResult } from "../types.ts";
import { StatusPill } from "../components/StatusPill.tsx";

export const UploadPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [dataCheck, setDataCheck] = useState<DataCheckResult | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setStatusMessage("");
    try {
      const response = await uploadPpt(file);
      setCampaign(response.campaign);
      setDataCheck(response.dataCheck);
      if (response.dataCheck.errors.length > 0) {
        setStatusMessage("Upload complete. Issues found.");
      } else if (response.dataCheck.warnings.length > 0) {
        setStatusMessage("Upload complete. Warnings found.");
      } else {
        setStatusMessage("Upload complete. No issues found.");
      }
    } catch {
      setStatusMessage("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!campaign) return;
    try {
      await submitCampaign(campaign.id);
      setStatusMessage("Campaign submitted to national team.");
      navigate(`/campaign/${campaign.id}`);
    } catch {
      setStatusMessage("Submission blocked. Resolve data check errors.");
    }
  };

  return (
    <main className="page-container">
      <section className="page-section">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Upload PPT</p>
            <h2>Upload Wizard</h2>
            <p className="subtle">Drop your deck and run data check.</p>
          </div>
        </div>

        <div className="wizard-grid">
          <div className="card">
            <div className="card-header">Step 1 - Upload File</div>
            <div className="card-body">
              <div className="dropzone">
                <div className="dropzone-icon">PPT</div>
                <div>
                  <div className="dropzone-title">
                    Drop your PPT campaign deck here or browse.
                  </div>
                  <input
                    type="file"
                    accept=".pptx"
                    onChange={(event) =>
                      setFile(event.target.files?.[0] ?? null)
                    }
                  />
                </div>
              </div>
              <div className="button-row">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleUpload}
                  disabled={!file || loading}
                >
                  {loading ? "Uploading..." : "Run Data Check"}
                </button>
                {campaign ? (
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => navigate(`/campaign/${campaign.id}`)}
                  >
                    View Draft
                  </button>
                ) : null}
              </div>
              {statusMessage ? (
                <div className="inline-success">{statusMessage}</div>
              ) : null}
            </div>
          </div>

          <div className="card">
            <div className="card-header">Step 2 - Data Check</div>
            <div className="card-body">
              {dataCheck ? (
                <div className="check-grid">
                  <div>
                    <div className="check-title error">Errors (blocking)</div>
                    <ul className="check-list">
                      {dataCheck.errors.length === 0 ? (
                        <li className="subtle">No blocking errors.</li>
                      ) : (
                        dataCheck.errors.map((issue, index) => (
                          <li key={`${issue.code}-${index}`}>
                            <span className="status-dot status-error" />
                            <div>
                              <div className="check-label">{issue.field}</div>
                              <div className="check-message">{issue.message}</div>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                  <div>
                    <div className="check-title warning">Warnings</div>
                    <ul className="check-list">
                      {dataCheck.warnings.length === 0 ? (
                        <li className="subtle">No warnings.</li>
                      ) : (
                        dataCheck.warnings.map((issue, index) => (
                          <li key={`${issue.code}-${index}`}>
                            <span className="status-dot status-warning" />
                            <div>
                              <div className="check-label">{issue.field}</div>
                              <div className="check-message">{issue.message}</div>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                  <div>
                    <div className="check-title info">Info</div>
                    <ul className="check-list">
                      {dataCheck.info.map((issue, index) => (
                        <li key={`${issue.code}-${index}`}>
                          <span className="status-dot status-info" />
                          <div>
                            <div className="check-label">{issue.field}</div>
                            <div className="check-message">{issue.message}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="subtle">Run data check to see results.</div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">Step 3 - Confirmation</div>
            <div className="card-body">
              {campaign ? (
                <>
                  <div className="summary-card">
                    <div className="summary-title">Campaign Summary</div>
                    <div className="summary-row">
                      <span>Campaign</span>
                      <span>{campaign.name}</span>
                    </div>
                    <div className="summary-row">
                      <span>Region</span>
                      <span>{campaign.region}</span>
                    </div>
                    <div className="summary-row">
                      <span>Status</span>
                      <StatusPill status={campaign.status} />
                    </div>
                  </div>
                  <div className="button-row">
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => navigate(`/campaign/${campaign.id}`)}
                    >
                      Save as Draft
                    </button>
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={handleSubmit}
                      disabled={Boolean(dataCheck?.errors.length)}
                    >
                      Submit to National Team
                    </button>
                  </div>
                </>
              ) : (
                <div className="subtle">Upload a deck to continue.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
