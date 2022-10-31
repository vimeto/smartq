/*
  Warnings:

  - You are about to drop the `ChatRoom` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ChatRoomToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Chat` DROP FOREIGN KEY `Chat_chatRoomId_fkey`;

-- DropForeignKey
ALTER TABLE `ChatRoom` DROP FOREIGN KEY `ChatRoom_userGroupId_fkey`;

-- DropForeignKey
ALTER TABLE `_ChatRoomToUser` DROP FOREIGN KEY `_ChatRoomToUser_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ChatRoomToUser` DROP FOREIGN KEY `_ChatRoomToUser_B_fkey`;

-- DropTable
DROP TABLE `ChatRoom`;

-- DropTable
DROP TABLE `_ChatRoomToUser`;

-- CreateTable
CREATE TABLE `LunchDate` (
    `id` VARCHAR(191) NOT NULL,
    `dateDate` VARCHAR(191) NOT NULL,
    `restaurant` VARCHAR(191) NOT NULL,
    `comments` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userGroupId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_LunchDateToUser` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_LunchDateToUser_AB_unique`(`A`, `B`),
    INDEX `_LunchDateToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LunchDate` ADD CONSTRAINT `LunchDate_userGroupId_fkey` FOREIGN KEY (`userGroupId`) REFERENCES `UserGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_chatRoomId_fkey` FOREIGN KEY (`chatRoomId`) REFERENCES `LunchDate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_LunchDateToUser` ADD CONSTRAINT `_LunchDateToUser_A_fkey` FOREIGN KEY (`A`) REFERENCES `LunchDate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_LunchDateToUser` ADD CONSTRAINT `_LunchDateToUser_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
