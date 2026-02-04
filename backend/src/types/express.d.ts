import type { UserRole, Region } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        region: Region | null;
      };
    }
  }
}

export {};
