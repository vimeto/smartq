/*
  Warnings:

  - You are about to drop the column `restaurant` on the `LunchDate` table. All the data in the column will be lost.
  - Added the required column `restaurantId` to the `LunchDate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `LunchDate` DROP COLUMN `restaurant`,
    ADD COLUMN `restaurantId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `LunchDate` ADD CONSTRAINT `LunchDate_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
