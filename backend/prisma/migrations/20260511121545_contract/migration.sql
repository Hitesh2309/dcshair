/*
  Warnings:

  - You are about to drop the `_ContractToProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Carrier" AS ENUM ('Sea', 'Air', 'Road');

-- DropForeignKey
ALTER TABLE "_ContractToProduct" DROP CONSTRAINT "_ContractToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "_ContractToProduct" DROP CONSTRAINT "_ContractToProduct_B_fkey";

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "expectedDeliveryDate" TIMESTAMP(3),
ADD COLUMN     "expectedDepartureDate" TIMESTAMP(3),
ADD COLUMN     "insurance" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "operatingAirlines" TEXT,
ADD COLUMN     "packing" TEXT,
ADD COLUMN     "portOfFinalDestination" TEXT,
ADD COLUMN     "portOfLoading" TEXT,
ADD COLUMN     "preCarriageBy" "Carrier",
ADD COLUMN     "speacialCondition" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "contractId" INTEGER;

-- DropTable
DROP TABLE "_ContractToProduct";

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
