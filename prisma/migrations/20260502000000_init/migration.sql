-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('IMPORTER', 'EXPORTER', 'BOTH');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('CUSTOMS_DATA', 'GOOGLE_MAPS', 'LINKEDIN', 'MANUAL', 'APOLLO', 'TRADE_ATLAS', 'CSV_IMPORT');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('EMAIL', 'CALL', 'MEETING', 'WHATSAPP', 'NOTE');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "country" TEXT NOT NULL,
    "city" TEXT,
    "region" TEXT,
    "type" "CompanyType" NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "source" "LeadSource" NOT NULL,
    "hsCodes" TEXT[],
    "annualVolumeUsd" DOUBLE PRECISION,
    "employeeCount" INTEGER,
    "description" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "linkedIn" TEXT,
    "title" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "product" TEXT NOT NULL,
    "hsCode" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "valueUsd" DOUBLE PRECISION,
    "originCountry" TEXT,
    "destinationCountry" TEXT,
    "portOfLoading" TEXT,
    "portOfDischarge" TEXT,
    "source" "LeadSource" NOT NULL,
    "rawData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "contactId" TEXT,
    "type" "ActivityType" NOT NULL,
    "notes" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyTag" (
    "companyId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "CompanyTag_pkey" PRIMARY KEY ("companyId","tagId")
);

-- CreateIndex
CREATE INDEX "Company_country_idx" ON "Company"("country");
CREATE INDEX "Company_status_idx" ON "Company"("status");
CREATE INDEX "Company_type_idx" ON "Company"("type");
CREATE INDEX "Company_source_idx" ON "Company"("source");
CREATE INDEX "Contact_companyId_idx" ON "Contact"("companyId");
CREATE INDEX "Contact_email_idx" ON "Contact"("email");
CREATE INDEX "Shipment_companyId_idx" ON "Shipment"("companyId");
CREATE INDEX "Shipment_hsCode_idx" ON "Shipment"("hsCode");
CREATE INDEX "Shipment_date_idx" ON "Shipment"("date");
CREATE INDEX "Activity_companyId_idx" ON "Activity"("companyId");
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CompanyTag" ADD CONSTRAINT "CompanyTag_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyTag" ADD CONSTRAINT "CompanyTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
