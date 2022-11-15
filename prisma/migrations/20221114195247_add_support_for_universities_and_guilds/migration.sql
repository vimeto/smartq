-- AlterTable
ALTER TABLE `User` ADD COLUMN `guildConfigured` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `UserGroup` ADD COLUMN `category` INTEGER NOT NULL DEFAULT 2,
    ADD COLUMN `parentId` VARCHAR(191) NULL,
    MODIFY `externalId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `UserGroup` ADD CONSTRAINT `UserGroup_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `UserGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
