import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { prisma } from "../db.js";
import { authenticate, isNationalOrAdmin } from "../middleware/auth.js";
import { parsePptx } from "../services/pptParser.js";
import { saveUpload } from "../services/fileStorage.js";
import { runDataCheck } from "../services/validationService.js";
import { exportCampaignsToExcel, parseExcelUpdates } from "../services/excelService.js";
import { generatePptx } from "../services/pptGenerator.js";
import { sendCampaignUpdatedEmail } from "../services/emailService.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const campaignInclude = {
  contentOutputs: { orderBy: { index: "asc" } },
  plannedEvents: { orderBy: { index: "asc" } },
  createdBy: true,
};

const listQuerySchema = z.object({
  region: z.string().optional(),
  status: z.string().optional(),
  year: z.string().optional(),
});

const updateCampaignSchema = z.object({
  name: z.string().optional(),
  region: z
    .enum(["Northeast", "Southeast", "Midwest", "Central", "West", "National"])
    .optional(),
  year: z.number().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  mediaKeyMoment: z.string().nullable().optional(),
  sportsCultureBrandLead: z.string().nullable().optional(),
  mediaNetworkProjectLead: z.string().nullable().optional(),
  ioNumber: z.string().nullable().optional(),
  ideaInSentence: z.string().nullable().optional(),
  why: z.string().nullable().optional(),
  whoIsThisFor: z.string().nullable().optional(),
  consumerHearsAboutIt: z.string().nullable().optional(),
  whatDoesSuccessLookLike: z.string().nullable().optional(),
  hooks: z.string().nullable().optional(),
  ticketingPlan: z.string().nullable().optional(),
  merchandisingPlan: z.string().nullable().optional(),
  partnershipPlan: z.string().nullable().optional(),
  totalBudget: z.number().nullable().optional(),
  budgetCulture: z.number().nullable().optional(),
  budgetMediaNetwork: z.number().nullable().optional(),
  budgetDirectAdvertising: z.number().nullable().optional(),
  budgetCultureIncome: z.number().nullable().optional(),
  totalPlannedEvents: z.number().nullable().optional(),
  totalPlannedAttendees: z.number().nullable().optional(),
  totalEventBudget: z.number().nullable().optional(),
  contentOutputs: z
    .array(
      z.object({
        platform: z.string().nullable().optional(),
        lengthSeconds: z.number().nullable().optional(),
        description: z.string().nullable().optional(),
      }),
    )
    .optional(),
  plannedEvents: z
    .array(
      z.object({
        date: z.string().nullable().optional(),
        name: z.string().nullable().optional(),
        type: z.string().nullable().optional(),
        cityState: z.string().nullable().optional(),
        plannedAttendees: z.number().nullable().optional(),
        budget: z.number().nullable().optional(),
      }),
    )
    .optional(),
});

const parseDate = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getNextVersionNumber = async (campaignId: string) => {
  const latest = await prisma.campaignVersion.findFirst({
    where: { campaignId },
    orderBy: { versionNumber: "desc" },
  });
  return (latest?.versionNumber ?? 0) + 1;
};

router.get("/", authenticate, async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid query parameters." });
    return;
  }

  const { region, status, year } = parsed.data;
  const where: Record<string, unknown> = {};

  if (req.user?.role === "regional") {
    where.createdByUserId = req.user.id;
  } else if (region) {
    where.region = region;
  }

  if (status) {
    where.status = status;
  }
  if (year) {
    where.year = Number(year);
  }

  const campaigns = await prisma.campaign.findMany({
    where,
    include: campaignInclude,
    orderBy: { updatedAt: "desc" },
  });

  res.json(campaigns);
});

router.get("/:id", authenticate, async (req, res) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: req.params.id },
    include: campaignInclude,
  });

  if (!campaign) {
    res.status(404).json({ message: "Campaign not found." });
    return;
  }

  if (req.user?.role === "regional" && campaign.createdByUserId !== req.user.id) {
    res.status(404).json({ message: "Campaign not found." });
    return;
  }

  res.json(campaign);
});

router.post(
  "/upload-ppt",
  authenticate,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      res.status(400).json({ message: "PPT file is required." });
      return;
    }

    const originalPptPath = await saveUpload(
      req.file.buffer,
      req.file.originalname,
      "ppt/original",
    );

    const parsedPpt = parsePptx(originalPptPath);
    const campaignData = parsedPpt.fields;

    const campaign = await prisma.campaign.create({
      data: {
        name: campaignData.name,
        region:
          req.user?.role === "regional" && req.user.region
            ? req.user.region
            : (campaignData.region as never),
        year: campaignData.year,
        status: "Draft",
        startDate: campaignData.startDate ?? null,
        endDate: campaignData.endDate ?? null,
        mediaKeyMoment: campaignData.mediaKeyMoment ?? null,
        sportsCultureBrandLead: campaignData.sportsCultureBrandLead ?? null,
        mediaNetworkProjectLead: campaignData.mediaNetworkProjectLead ?? null,
        ioNumber: campaignData.ioNumber ?? null,
        ideaInSentence: campaignData.ideaInSentence ?? null,
        why: campaignData.why ?? null,
        whoIsThisFor: campaignData.whoIsThisFor ?? null,
        consumerHearsAboutIt: campaignData.consumerHearsAboutIt ?? null,
        whatDoesSuccessLookLike: campaignData.whatDoesSuccessLookLike ?? null,
        hooks: campaignData.hooks ?? null,
        ticketingPlan: campaignData.ticketingPlan ?? null,
        merchandisingPlan: campaignData.merchandisingPlan ?? null,
        partnershipPlan: campaignData.partnershipPlan ?? null,
        totalBudget: campaignData.totalBudget ?? null,
        budgetCulture: campaignData.budgetCulture ?? null,
        budgetMediaNetwork: campaignData.budgetMediaNetwork ?? null,
        budgetDirectAdvertising: campaignData.budgetDirectAdvertising ?? null,
        budgetCultureIncome: campaignData.budgetCultureIncome ?? null,
        totalPlannedEvents: campaignData.totalPlannedEvents ?? null,
        totalPlannedAttendees: campaignData.totalPlannedAttendees ?? null,
        totalEventBudget: campaignData.totalEventBudget ?? null,
        originalPptPath,
        createdByUserId: req.user?.id ?? "",
        contentOutputs: {
          create: parsedPpt.contentOutputs.map((output, index) => ({
            index,
            platform: output.platform ?? null,
            lengthSeconds: output.lengthSeconds ?? null,
            description: output.description ?? null,
          })),
        },
        plannedEvents: {
          create: parsedPpt.plannedEvents.map((event, index) => ({
            index,
            date: event.date ?? null,
            name: event.name ?? null,
            type: event.type ?? null,
            cityState: event.cityState ?? null,
            plannedAttendees: event.plannedAttendees ?? null,
            budget: event.budget ?? null,
          })),
        },
      },
      include: campaignInclude,
    });

    await prisma.campaignVersion.create({
      data: {
        campaignId: campaign.id,
        versionNumber: 1,
        type: "original_upload",
        pptFilePath: originalPptPath,
        createdByUserId: req.user?.id,
      },
    });

    const dataCheck = runDataCheck(campaign, parsedPpt.templateErrors);

    res.json({ campaign, dataCheck });
  },
);

router.put("/:id", authenticate, async (req, res) => {
  const parsed = updateCampaignSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid campaign payload." });
    return;
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: req.params.id },
  });

  if (!campaign) {
    res.status(404).json({ message: "Campaign not found." });
    return;
  }

  if (req.user?.role === "regional") {
    if (campaign.createdByUserId !== req.user.id) {
      res.status(404).json({ message: "Campaign not found." });
      return;
    }
    if (!["Draft", "ChangesRequested"].includes(campaign.status)) {
      res.status(403).json({ message: "Campaign is locked for edits." });
      return;
    }
  }

  const { contentOutputs, plannedEvents, ...campaignUpdate } = parsed.data;

  const updatedCampaign = await prisma.campaign.update({
    where: { id: campaign.id },
    data: {
      ...campaignUpdate,
      startDate:
        parsed.data.startDate === null
          ? null
          : parseDate(parsed.data.startDate) ?? undefined,
      endDate:
        parsed.data.endDate === null
          ? null
          : parseDate(parsed.data.endDate) ?? undefined,
    },
    include: campaignInclude,
  });

  if (contentOutputs) {
    await prisma.contentOutput.deleteMany({ where: { campaignId: campaign.id } });
    await prisma.contentOutput.createMany({
      data: contentOutputs.map((output, index) => ({
        campaignId: campaign.id,
        index,
        platform: output.platform ?? null,
        lengthSeconds: output.lengthSeconds ?? null,
        description: output.description ?? null,
      })),
    });
  }

  if (plannedEvents) {
    await prisma.plannedEvent.deleteMany({ where: { campaignId: campaign.id } });
    await prisma.plannedEvent.createMany({
      data: plannedEvents.map((event, index) => ({
        campaignId: campaign.id,
        index,
        date: parseDate(event.date) ?? null,
        name: event.name ?? null,
        type: event.type ?? null,
        cityState: event.cityState ?? null,
        plannedAttendees: event.plannedAttendees ?? null,
        budget: event.budget ?? null,
      })),
    });
  }

  const refreshed = await prisma.campaign.findUnique({
    where: { id: campaign.id },
    include: campaignInclude,
  });

  res.json(refreshed ?? updatedCampaign);
});

router.post("/:id/submit", authenticate, async (req, res) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: req.params.id },
    include: campaignInclude,
  });

  if (!campaign) {
    res.status(404).json({ message: "Campaign not found." });
    return;
  }

  if (req.user?.role === "regional" && campaign.createdByUserId !== req.user.id) {
    res.status(404).json({ message: "Campaign not found." });
    return;
  }

  const dataCheck = runDataCheck(campaign);
  if (dataCheck.errors.length > 0) {
    res.status(400).json({ message: "Data check errors found.", dataCheck });
    return;
  }

  const updated = await prisma.campaign.update({
    where: { id: campaign.id },
    data: { status: "Submitted" },
  });

  res.json(updated);
});

router.post("/:id/approve", authenticate, async (req, res) => {
  if (!isNationalOrAdmin(req.user?.role)) {
    res.status(403).json({ message: "Forbidden." });
    return;
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: req.params.id },
    include: campaignInclude,
  });

  if (!campaign) {
    res.status(404).json({ message: "Campaign not found." });
    return;
  }

  const dataCheck = runDataCheck(campaign);
  if (dataCheck.errors.length > 0) {
    res.status(400).json({ message: "Data check errors found.", dataCheck });
    return;
  }

  const updated = await prisma.campaign.update({
    where: { id: campaign.id },
    data: { status: "Approved" },
  });

  res.json(updated);
});

router.post("/:id/request-changes", authenticate, async (req, res) => {
  if (!isNationalOrAdmin(req.user?.role)) {
    res.status(403).json({ message: "Forbidden." });
    return;
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: req.params.id },
  });

  if (!campaign) {
    res.status(404).json({ message: "Campaign not found." });
    return;
  }

  const updated = await prisma.campaign.update({
    where: { id: campaign.id },
    data: { status: "ChangesRequested" },
  });

  res.json(updated);
});

router.post("/export-excel", authenticate, async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid export filters." });
    return;
  }

  const { region, status, year } = parsed.data;
  const where: Record<string, unknown> = {};

  if (req.user?.role === "regional") {
    where.createdByUserId = req.user.id;
  } else if (region) {
    where.region = region;
  }
  if (status) {
    where.status = status;
  }
  if (year) {
    where.year = Number(year);
  }

  const campaigns = await prisma.campaign.findMany({
    where,
    include: campaignInclude,
    orderBy: { updatedAt: "desc" },
  });

  const excelBuffer = await exportCampaignsToExcel(campaigns);
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader("Content-Disposition", "attachment; filename=campaigns.xlsx");
  res.send(excelBuffer);
});

router.post(
  "/import-excel",
  authenticate,
  upload.single("file"),
  async (req, res) => {
    if (!isNationalOrAdmin(req.user?.role)) {
      res.status(403).json({ message: "Forbidden." });
      return;
    }
    if (!req.file) {
      res.status(400).json({ message: "Excel file is required." });
      return;
    }

    const updates = await parseExcelUpdates(req.file.buffer);
    const summary = {
      campaignsDetected: updates.length,
      campaignsUpdated: 0,
      conflicts: [] as Array<{ campaignId: string; message: string }>,
    };

    for (const update of updates) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: update.campaignId },
        include: campaignInclude,
      });
      if (!campaign) {
        summary.conflicts.push({
          campaignId: update.campaignId,
          message: "Campaign not found.",
        });
        continue;
      }

      await prisma.campaign.update({
        where: { id: campaign.id },
        data: update.campaignUpdate,
      });

      await prisma.contentOutput.deleteMany({ where: { campaignId: campaign.id } });
      if (update.contentOutputs.length > 0) {
        await prisma.contentOutput.createMany({
          data: update.contentOutputs.map((output, index) => ({
            campaignId: campaign.id,
            index,
            platform: output.platform ?? null,
            lengthSeconds: output.lengthSeconds ?? null,
            description: output.description ?? null,
          })),
        });
      }

      await prisma.plannedEvent.deleteMany({ where: { campaignId: campaign.id } });
      if (update.plannedEvents.length > 0) {
        await prisma.plannedEvent.createMany({
          data: update.plannedEvents.map((event, index) => ({
            campaignId: campaign.id,
            index,
            date: event.date ?? null,
            name: event.name ?? null,
            type: event.type ?? null,
            cityState: event.cityState ?? null,
            plannedAttendees: event.plannedAttendees ?? null,
            budget: event.budget ?? null,
          })),
        });
      }

      const refreshed = await prisma.campaign.findUnique({
        where: { id: campaign.id },
        include: campaignInclude,
      });

      if (!refreshed) {
        continue;
      }

      const dataCheck = runDataCheck(refreshed);
      if (dataCheck.errors.length > 0) {
        summary.conflicts.push({
          campaignId: campaign.id,
          message: "Data check errors found.",
        });
        continue;
      }

      const pptFilePath = await generatePptx(refreshed);
      const versionNumber = await getNextVersionNumber(campaign.id);
      await prisma.campaignVersion.create({
        data: {
          campaignId: campaign.id,
          versionNumber,
          type: "excel_update",
          pptFilePath,
          createdByUserId: req.user?.id,
        },
      });
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { latestGeneratedPptPath: pptFilePath },
      });

      await sendCampaignUpdatedEmail(refreshed.createdBy.email, pptFilePath);
      summary.campaignsUpdated += 1;
    }

    res.json(summary);
  },
);

router.post("/:id/generate-ppt", authenticate, async (req, res) => {
  if (!isNationalOrAdmin(req.user?.role)) {
    res.status(403).json({ message: "Forbidden." });
    return;
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: req.params.id },
    include: campaignInclude,
  });
  if (!campaign) {
    res.status(404).json({ message: "Campaign not found." });
    return;
  }

  const pptFilePath = await generatePptx(campaign);
  const versionNumber = await getNextVersionNumber(campaign.id);
  await prisma.campaignVersion.create({
    data: {
      campaignId: campaign.id,
      versionNumber,
      type: "excel_update",
      pptFilePath,
      createdByUserId: req.user?.id,
    },
  });
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { latestGeneratedPptPath: pptFilePath },
  });

  res.json({ pptFilePath });
});

export default router;
