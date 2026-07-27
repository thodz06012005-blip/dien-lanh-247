-- Customer booking fields are additive so existing requests remain valid.
ALTER TABLE `ServiceRequest`
  ADD COLUMN `province` VARCHAR(120) NOT NULL DEFAULT 'Hà Nội',
  ADD COLUMN `ward` VARCHAR(120) NULL,
  ADD COLUMN `applianceBrand` VARCHAR(120) NULL,
  ADD COLUMN `applianceModel` VARCHAR(160) NULL,
  ADD COLUMN `accessNote` VARCHAR(500) NULL,
  ADD COLUMN `photoNote` VARCHAR(500) NULL,
  ADD COLUMN `contactConsentAt` DATETIME(3) NULL,
  ADD COLUMN `dataProcessingConsentAt` DATETIME(3) NULL,
  ADD COLUMN `termsAcceptedVersion` VARCHAR(32) NULL;

-- Public proof gates: previously published seed/demo content stays hidden
-- until an editor records evidence and confirms image usage rights.
ALTER TABLE `Project`
  ADD COLUMN `evidenceReference` VARCHAR(500) NULL,
  ADD COLUMN `imageRightsConfirmed` BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE `Testimonial`
  ADD COLUMN `isVerified` BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN `verificationReference` VARCHAR(500) NULL;

INSERT IGNORE INTO `ServiceCategory`
  (`id`, `name`, `slug`, `icon`, `description`,
   `referencePriceMin`, `referencePriceMax`, `surveyFee`, `pricingNote`,
   `createdAt`, `updatedAt`)
VALUES
  ('kiem-tra-chan-doan', 'Kiểm tra và chẩn đoán', 'kiem-tra-chan-doan', 'ScanSearch',
   'Đo kiểm, xác định nguyên nhân và đề xuất phương án trước khi sửa chữa.',
   NULL, NULL, 100000,
   'Phí khảo sát và phạm vi đo kiểm phải được xác nhận trước; chưa bao gồm chi phí sửa chữa hoặc vật tư.',
   NOW(3), NOW(3));
