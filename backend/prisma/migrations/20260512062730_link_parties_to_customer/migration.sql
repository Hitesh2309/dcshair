/*
  Warnings:

  - Added the required column `customerId` to the `Buyer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `Consignee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `ContactPerson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `NotifyParty` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Buyer_email_key";

-- DropIndex
DROP INDEX "Consignee_email_key";

-- DropIndex
DROP INDEX "ContactPerson_email_key";

-- DropIndex
DROP INDEX "NotifyParty_email_key";

-- AlterTable
ALTER TABLE "Buyer" ADD COLUMN     "customerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Consignee" ADD COLUMN     "customerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ContactPerson" ADD COLUMN     "customerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "buyerId" INTEGER,
ADD COLUMN     "consigneeId" INTEGER,
ADD COLUMN     "contactPersonId" INTEGER,
ADD COLUMN     "notifyPartyId" INTEGER;

-- AlterTable
ALTER TABLE "NotifyParty" ADD COLUMN     "customerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Consignee" ADD CONSTRAINT "Consignee_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Buyer" ADD CONSTRAINT "Buyer_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotifyParty" ADD CONSTRAINT "NotifyParty_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPerson" ADD CONSTRAINT "ContactPerson_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_consigneeId_fkey" FOREIGN KEY ("consigneeId") REFERENCES "Consignee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_notifyPartyId_fkey" FOREIGN KEY ("notifyPartyId") REFERENCES "NotifyParty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "ContactPerson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
