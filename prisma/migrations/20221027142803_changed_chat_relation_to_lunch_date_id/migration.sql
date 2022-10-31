/*
  Warnings:

  - You are about to drop the column `chatRoomId` on the `Chat` table. All the data in the column will be lost.
  - Added the required column `lunchDateId` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Chat` DROP FOREIGN KEY `Chat_chatRoomId_fkey`;

-- AlterTable
ALTER TABLE `Chat` DROP COLUMN `chatRoomId`,
    ADD COLUMN `lunchDateId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_lunchDateId_fkey` FOREIGN KEY (`lunchDateId`) REFERENCES `LunchDate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
