import path from "node:path";

const resolvePath = (relativePath: string) =>
  path.resolve(process.cwd(), relativePath);

export const config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  uploadRoot: resolvePath("uploads"),
  templatePath: resolvePath("templates/culture_campaign_template.pptx"),
  smtp: {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.SMTP_FROM ?? "no-reply@cultureplanshub.local",
  },
  appUrl: process.env.APP_URL ?? "http://localhost:5173",
};
