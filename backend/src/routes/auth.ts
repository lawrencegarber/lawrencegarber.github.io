import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../db.js";
import { config } from "../config.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  role: z.enum(["regional", "national", "admin"]),
  region: z
    .enum(["Northeast", "Southeast", "Midwest", "Central", "West", "National"])
    .nullable()
    .optional(),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid login payload." });
    return;
  }

  const { email, role, region } = parsed.data;
  if (role === "regional" && !region) {
    res.status(400).json({ message: "Region is required for regional users." });
    return;
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { role, region: role === "regional" ? region : null },
    create: { email, role, region: role === "regional" ? region : null },
  });

  const token = jwt.sign(
    { userId: user.id, role: user.role, region: user.region },
    config.jwtSecret,
    { expiresIn: "7d" },
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      region: user.region,
    },
  });
});

export default router;
