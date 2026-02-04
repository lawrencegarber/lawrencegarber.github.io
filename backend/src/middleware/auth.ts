import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

type JwtPayload = {
  userId: string;
  role: "regional" | "national" | "admin";
  region: "Northeast" | "Southeast" | "Midwest" | "Central" | "West" | "National" | null;
};

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: "Missing authorization header." });
    return;
  }

  const token = authHeader.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = {
      id: payload.userId,
      role: payload.role,
      region: payload.region,
    };
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
  }
};

export const isNationalOrAdmin = (role?: string) =>
  role === "national" || role === "admin";
