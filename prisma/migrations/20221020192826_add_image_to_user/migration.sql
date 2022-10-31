/*
  Warnings:

  - You are about to drop the column `externalId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isRoot` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `locale` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mfaEnabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mfaSecret` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `externalId`,
    DROP COLUMN `isRoot`,
    DROP COLUMN `locale`,
    DROP COLUMN `mfaEnabled`,
    DROP COLUMN `mfaSecret`,
    DROP COLUMN `provider`,
    ADD COLUMN `image` VARCHAR(191) NULL;
