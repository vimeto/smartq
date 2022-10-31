/*
  Warnings:

  - You are about to drop the column `dateDate` on the `LunchDate` table. All the data in the column will be lost.
  - Added the required column `date` to the `LunchDate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `LunchDate` DROP COLUMN `dateDate`,
    ADD COLUMN `date` DATETIME(3) NOT NULL;
