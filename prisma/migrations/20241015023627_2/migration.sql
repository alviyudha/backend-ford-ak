/*
  Warnings:

  - You are about to drop the column `urlImgDesign` on the `minispec` table. All the data in the column will be lost.
  - You are about to drop the column `urlWarrantyImg` on the `trim` table. All the data in the column will be lost.
  - You are about to drop the column `warrantyImg` on the `trim` table. All the data in the column will be lost.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `user` table. All the data in the column will be lost.
  - Added the required column `imgMiniSpec` to the `miniSpec` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urlImgMiniSpec` to the `miniSpec` table without a default value. This is not possible if the table is not empty.
  - The required column `cuid` was added to the `user` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE `color` DROP FOREIGN KEY `Color_trimId_fkey`;

-- DropForeignKey
ALTER TABLE `minispec` DROP FOREIGN KEY `MiniSpec_trimId_fkey`;

-- DropForeignKey
ALTER TABLE `specification` DROP FOREIGN KEY `Specification_trimId_fkey`;

-- DropForeignKey
ALTER TABLE `trim` DROP FOREIGN KEY `Trim_vehicleId_fkey`;

-- AlterTable
ALTER TABLE `minispec` DROP COLUMN `urlImgDesign`,
    ADD COLUMN `imgMiniSpec` VARCHAR(191) NOT NULL,
    ADD COLUMN `urlImgMiniSpec` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `trim` DROP COLUMN `urlWarrantyImg`,
    DROP COLUMN `warrantyImg`;

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `cuid` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`cuid`);

-- AddForeignKey
ALTER TABLE `trim` ADD CONSTRAINT `trim_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `color` ADD CONSTRAINT `color_trimId_fkey` FOREIGN KEY (`trimId`) REFERENCES `trim`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `miniSpec` ADD CONSTRAINT `miniSpec_trimId_fkey` FOREIGN KEY (`trimId`) REFERENCES `trim`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `specification` ADD CONSTRAINT `specification_trimId_fkey` FOREIGN KEY (`trimId`) REFERENCES `trim`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RedefineIndex
CREATE UNIQUE INDEX `user_username_key` ON `user`(`username`);
DROP INDEX `User_username_key` ON `user`;
