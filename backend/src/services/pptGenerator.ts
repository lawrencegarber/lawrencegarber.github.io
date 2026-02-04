import fs from "node:fs/promises";
import path from "node:path";
import AdmZip from "adm-zip";
import { config } from "../config.js";
import { saveBuffer } from "./fileStorage.js";
import { getPlaceholderMap } from "../types/fieldMappings.js";
import type { CampaignWithRelations } from "../types/fieldMappings.js";

export const generatePptx = async (
  campaign: CampaignWithRelations,
): Promise<string> => {
  const templateBuffer = await fs.readFile(config.templatePath);
  const zip = new AdmZip(templateBuffer);
  const placeholderMap = getPlaceholderMap(campaign);

  zip.getEntries().forEach((entry) => {
    if (!entry.entryName.startsWith("ppt/slides/slide")) {
      return;
    }
    const xml = entry.getData().toString("utf8");
    const updatedXml = Object.entries(placeholderMap).reduce(
      (current, [placeholder, value]) =>
        current.split(placeholder).join(value),
      xml,
    );
    zip.updateFile(entry.entryName, Buffer.from(updatedXml, "utf8"));
  });

  const outputBuffer = zip.toBuffer();
  const fileName = `campaign_${campaign.id}_${Date.now()}.pptx`;
  return saveBuffer(outputBuffer, fileName, "ppt/generated");
};
