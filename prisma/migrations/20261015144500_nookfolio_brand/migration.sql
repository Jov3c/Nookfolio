ALTER TABLE "site_profiles"
ALTER COLUMN "brand_text" SET DEFAULT 'Nookfolio';

UPDATE "site_profiles"
SET "brand_text" = 'Nookfolio'
WHERE "brand_text" = 'JOV3';
