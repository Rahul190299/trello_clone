-- AlterTable
ALTER TABLE `Profile` MODIFY `plan` ENUM('none', 'pro_user', 'enterprise_user') NOT NULL DEFAULT 'none';
