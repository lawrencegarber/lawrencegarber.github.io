import type {
  Campaign,
  DataCheckResult,
  AuthUser,
  UserRole,
  Region,
} from "../types.ts";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

const getToken = () => {
  try {
    const raw = localStorage.getItem("culturePlansAuth");
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed.token ?? null;
  } catch {
    return null;
  }
};

const request = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Request failed.");
  }
  return response.json() as Promise<T>;
};

export const loginRequest = async (payload: {
  email: string;
  role: UserRole;
  region?: Region | null;
}): Promise<{ token: string; user: AuthUser }> => {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const fetchCampaigns = async (filters: {
  region?: string;
  status?: string;
  year?: string;
}): Promise<Campaign[]> => {
  const params = new URLSearchParams();
  if (filters.region) params.set("region", filters.region);
  if (filters.status) params.set("status", filters.status);
  if (filters.year) params.set("year", filters.year);
  const query = params.toString();
  return request(`/campaigns${query ? `?${query}` : ""}`);
};

export const fetchCampaign = async (id: string): Promise<Campaign> => {
  return request(`/campaigns/${id}`);
};

export const uploadPpt = async (
  file: File,
): Promise<{ campaign: Campaign; dataCheck: DataCheckResult }> => {
  const body = new FormData();
  body.append("file", file);
  return request("/campaigns/upload-ppt", {
    method: "POST",
    body,
  });
};

export const updateCampaign = async (
  id: string,
  payload: Partial<Campaign>,
): Promise<Campaign> => {
  return request(`/campaigns/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const submitCampaign = async (id: string): Promise<Campaign> => {
  return request(`/campaigns/${id}/submit`, { method: "POST" });
};

export const approveCampaign = async (id: string): Promise<Campaign> => {
  return request(`/campaigns/${id}/approve`, { method: "POST" });
};

export const requestChanges = async (id: string): Promise<Campaign> => {
  return request(`/campaigns/${id}/request-changes`, { method: "POST" });
};

export const generatePpt = async (
  id: string,
): Promise<{ pptFilePath: string }> => {
  return request(`/campaigns/${id}/generate-ppt`, { method: "POST" });
};

export const exportExcel = async (filters: {
  region?: string;
  status?: string;
  year?: string;
}): Promise<void> => {
  const token = getToken();
  const response = await fetch(`${API_URL}/campaigns/export-excel`, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(filters),
  });

  if (!response.ok) {
    throw new Error("Export failed.");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "campaigns.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const importExcel = async (
  file: File,
): Promise<{
  campaignsDetected: number;
  campaignsUpdated: number;
  conflicts: Array<{ campaignId: string; message: string }>;
}> => {
  const body = new FormData();
  body.append("file", file);
  return request("/campaigns/import-excel", {
    method: "POST",
    body,
  });
};
