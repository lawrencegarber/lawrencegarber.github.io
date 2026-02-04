import fs from "node:fs/promises";
import path from "node:path";
import { v4 as uuid } from "uuid";
import { config } from "../config.js";

const ensureDir = async (dirPath: string) => {
  await fs.mkdir(dirPath, { recursive: true });
};

export const saveUpload = async (
  fileBuffer: Buffer,
  originalName: string,
  subdir: string,
): Promise<string> => {
  const extension = path.extname(originalName) || ".pptx";
  const fileName = `${uuid()}${extension}`;
  const targetDir = path.join(config.uploadRoot, subdir);
  await ensureDir(targetDir);
  const targetPath = path.join(targetDir, fileName);
  await fs.writeFile(targetPath, fileBuffer);
  return targetPath;
};

export const saveBuffer = async (
  fileBuffer: Buffer,
  fileName: string,
  subdir: string,
): Promise<string> => {
  const targetDir = path.join(config.uploadRoot, subdir);
  await ensureDir(targetDir);
  const targetPath = path.join(targetDir, fileName);
  await fs.writeFile(targetPath, fileBuffer);
  return targetPath;
};

export const copyFile = async (
  sourcePath: string,
  fileName: string,
  subdir: string,
): Promise<string> => {
  const targetDir = path.join(config.uploadRoot, subdir);
  await ensureDir(targetDir);
  const targetPath = path.join(targetDir, fileName);
  await fs.copyFile(sourcePath, targetPath);
  return targetPath;
};
