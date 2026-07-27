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
  (`id`, `name`, `slug`, `icon`, `description`, `createdAt`, `updatedAt`)
VALUES
  ('kiem-tra-chan-doan', 'Kiểm tra và chẩn đoán', 'kiem-tra-chan-doan', 'ScanSearch',
   'Đo kiểm, xác định nguyên nhân và đề xuất phương án trước khi sửa chữa.',
   NOW(3), NOW(3));

-- The legacy migration drill intentionally omits the earlier pricing-column
-- migration. Apply pricing only when all four optional columns are present.
SELECT IF(
  COUNT(*) = 4,
  'UPDATE `ServiceCategory`
   SET `referencePriceMin` = NULL,
       `referencePriceMax` = NULL,
       `surveyFee` = 100000,
       `pricingNote` = ''Phí khảo sát và phạm vi đo kiểm phải được xác nhận trước; chưa bao gồm chi phí sửa chữa hoặc vật tư.''
   WHERE `id` = ''kiem-tra-chan-doan''',
  'SELECT 1'
) INTO @dl247_category_pricing_sql
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'ServiceCategory'
  AND COLUMN_NAME IN (
    'referencePriceMin',
    'referencePriceMax',
    'surveyFee',
    'pricingNote'
  );

PREPARE dl247_category_pricing_statement FROM @dl247_category_pricing_sql;
EXECUTE dl247_category_pricing_statement;
DEALLOCATE PREPARE dl247_category_pricing_statement;
