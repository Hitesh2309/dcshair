-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "contractId" INTEGER,
ADD COLUMN     "pricePerKg" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
