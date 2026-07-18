-- Phase 5-6 service-only database safety and booking hardening.
-- Expand-only migration: legacy commerce data remains intact for verified rollback.

CREATE TABLE `LegacyDomainMetadata` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `domain` VARCHAR(64) NOT NULL,
  `tableName` VARCHAR(191) NOT NULL,
  `lifecycle` VARCHAR(32) NOT NULL DEFAULT 'LEGACY_READ_ONLY',
  `runtimeExposed` BOOLEAN NOT NULL DEFAULT FALSE,
  `archivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `backupChecksum` VARCHAR(128) NULL,
  `notes` VARCHAR(500) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `LegacyDomainMetadata_tableName_key` (`tableName`),
  INDEX `LegacyDomainMetadata_domain_lifecycle_idx` (`domain`, `lifecycle`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `LegacyDomainMetadata` (`domain`, `tableName`, `notes`) VALUES
  ('CATALOG', 'Category', 'Retained for v1.0 rollback; never exposed by service-only runtime.'),
  ('CATALOG', 'Brand', 'Retained for v1.0 rollback; never exposed by service-only runtime.'),
  ('CATALOG', 'Product', 'Retained for v1.0 rollback; never exposed by service-only runtime.'),
  ('CATALOG', 'ProductImage', 'Retained for v1.0 rollback; never exposed by service-only runtime.'),
  ('INVENTORY', 'Variant', 'Legacy product stock only; service material lines remain active.'),
  ('CART', 'Cart', 'Retained for v1.0 rollback; never exposed by service-only runtime.'),
  ('CART', 'CartItem', 'Retained for v1.0 rollback; never exposed by service-only runtime.'),
  ('ORDER', 'Order', 'Retained for v1.0 rollback; service requests and quotes remain active.'),
  ('ORDER', 'OrderItem', 'Retained for v1.0 rollback; never exposed by service-only runtime.'),
  ('ORDER_PAYMENT', 'Payment', 'Legacy order payment only; ServicePaymentRecord remains active.'),
  ('SHIPPING', 'Shipping', 'Retained for v1.0 rollback; never exposed by service-only runtime.'),
  ('PROMOTION', 'Coupon', 'Retained for v1.0 rollback; never exposed by service-only runtime.'),
  ('CATALOG', 'Review', 'Legacy product reviews only; ServiceRequestReview remains active.');

ALTER TABLE `ServiceCategory`
  ADD COLUMN `referencePriceMin` DECIMAL(12,2) NULL,
  ADD COLUMN `referencePriceMax` DECIMAL(12,2) NULL,
  ADD COLUMN `surveyFee` DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN `pricingNote` VARCHAR(500) NULL;

UPDATE `ServiceCategory`
SET `referencePriceMin` = 150000,
    `referencePriceMax` = 650000,
    `surveyFee` = 100000,
    `pricingNote` = 'Giá tham khảo; kỹ thuật viên chỉ chốt báo giá sau khi kiểm tra. Phí khảo sát được thông báo trước và có thể được khấu trừ khi thực hiện dịch vụ.'
WHERE `referencePriceMin` IS NULL;

ALTER TABLE `ServiceRequest`
  ADD COLUMN `pricingDisclosureVersion` VARCHAR(32) NOT NULL DEFAULT '2026-07-v1',
  ADD COLUMN `pricingDisclosureAcceptedAt` DATETIME(3) NULL,
  ADD COLUMN `referencePriceMinSnapshot` DECIMAL(12,2) NULL,
  ADD COLUMN `referencePriceMaxSnapshot` DECIMAL(12,2) NULL,
  ADD COLUMN `surveyFeeSnapshot` DECIMAL(12,2) NOT NULL DEFAULT 0;

CREATE TABLE `ServiceRequestSubmission` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `idempotencyKeyHash` CHAR(64) NOT NULL,
  `requestFingerprintHash` CHAR(64) NOT NULL,
  `requestId` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `ServiceRequestSubmission_idempotencyKeyHash_key` (`idempotencyKeyHash`),
  INDEX `ServiceRequestSubmission_requestId_idx` (`requestId`),
  INDEX `ServiceRequestSubmission_expiresAt_idx` (`expiresAt`),
  CONSTRAINT `ServiceRequestSubmission_requestId_fkey`
    FOREIGN KEY (`requestId`) REFERENCES `ServiceRequest` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ServiceRequestScheduleChange` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `requestId` VARCHAR(191) NOT NULL,
  `fromPreferredDate` VARCHAR(32) NOT NULL,
  `fromPreferredTimeSlot` VARCHAR(80) NOT NULL,
  `toPreferredDate` VARCHAR(32) NOT NULL,
  `toPreferredTimeSlot` VARCHAR(80) NOT NULL,
  `reason` VARCHAR(500) NOT NULL,
  `actorType` VARCHAR(32) NOT NULL,
  `actorId` VARCHAR(64) NULL,
  `fromRequestVersion` INT NOT NULL,
  `toRequestVersion` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `ServiceRequestScheduleChange_request_created_idx` (`requestId`, `createdAt`),
  CONSTRAINT `ServiceRequestScheduleChange_requestId_fkey`
    FOREIGN KEY (`requestId`) REFERENCES `ServiceRequest` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
