import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import campaignsRoutes from "./routes/campaigns.js";
import { config } from "./config.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/campaigns", campaignsRoutes);
app.use("/uploads", express.static(config.uploadRoot));

export default app;
