-- Phase 9 is additive: it records data-subject requests without deleting
-- service, quote, payment, material or warranty records automatically.
CREATE TABLE `PersonalDataRequest` (
  `id` CHAR(36) NOT NULL,
  `userId` INTEGER NOT NULL,
  `requestType` VARCHAR(32) NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'RECEIVED',
  `reason` VARCHAR(500) NULL,
  `legalHoldNote` VARCHAR(500) NULL,
  `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `dueAt` DATETIME(3) NOT NULL,
  `completedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `PersonalDataRequest_userId_requestedAt_idx` (`userId`, `requestedAt`),
  INDEX `PersonalDataRequest_status_dueAt_idx` (`status`, `dueAt`),
  CONSTRAINT `PersonalDataRequest_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
