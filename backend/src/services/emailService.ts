import fs from "node:fs/promises";
import nodemailer from "nodemailer";
import { config } from "../config.js";

export const sendCampaignUpdatedEmail = async (
  recipientEmail: string,
  pptFilePath: string,
): Promise<void> => {
  if (!config.smtp.host || !config.smtp.user) {
    return;
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: false,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  const attachmentBuffer = await fs.readFile(pptFilePath);

  await transporter.sendMail({
    from: config.smtp.from,
    to: recipientEmail,
    subject: "Your campaign has been updated",
    text: "Your campaign has been updated. The latest PPTX is attached.",
    attachments: [
      {
        filename: "campaign-update.pptx",
        content: attachmentBuffer,
      },
    ],
  });
};
