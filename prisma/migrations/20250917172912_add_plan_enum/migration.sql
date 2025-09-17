/*
  Warnings:

  - Added the required column `plan` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Profile` ADD COLUMN `plan` ENUM('pro_user', 'enterprise_user') NOT NULL;
