ALTER TABLE "site_profile"
ALTER COLUMN "brand_text" SET DEFAULT 'Nookfolio';

UPDATE "site_profile"
SET "brand_text" = 'Nookfolio'
WHERE "brand_text" = 'JOV3';
