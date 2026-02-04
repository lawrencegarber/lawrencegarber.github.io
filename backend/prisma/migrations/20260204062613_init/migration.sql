-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "region" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "startDate" DATETIME,
    "endDate" DATETIME,
    "mediaKeyMoment" TEXT,
    "sportsCultureBrandLead" TEXT,
    "mediaNetworkProjectLead" TEXT,
    "ioNumber" TEXT,
    "ideaInSentence" TEXT,
    "why" TEXT,
    "whoIsThisFor" TEXT,
    "consumerHearsAboutIt" TEXT,
    "whatDoesSuccessLookLike" TEXT,
    "hooks" TEXT,
    "ticketingPlan" TEXT,
    "merchandisingPlan" TEXT,
    "partnershipPlan" TEXT,
    "totalBudget" REAL,
    "budgetCulture" REAL,
    "budgetMediaNetwork" REAL,
    "budgetDirectAdvertising" REAL,
    "budgetCultureIncome" REAL,
    "totalPlannedEvents" INTEGER,
    "totalPlannedAttendees" INTEGER,
    "totalEventBudget" REAL,
    "originalPptPath" TEXT,
    "latestGeneratedPptPath" TEXT,
    "logoImagePath" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Campaign_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentOutput" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "platform" TEXT,
    "lengthSeconds" INTEGER,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContentOutput_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlannedEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "date" DATETIME,
    "name" TEXT,
    "type" TEXT,
    "cityState" TEXT,
    "plannedAttendees" INTEGER,
    "budget" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlannedEvent_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CampaignVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "pptFilePath" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CampaignVersion_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CampaignVersion_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
