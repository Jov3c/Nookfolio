ALTER TABLE "site_profile"
ADD COLUMN "brand_text" VARCHAR(80) NOT NULL DEFAULT 'JOV3',
ADD COLUMN "brand_icon_media_id" UUID;

ALTER TABLE "site_profile"
ADD CONSTRAINT "site_profile_brand_icon_media_id_fkey"
FOREIGN KEY ("brand_icon_media_id") REFERENCES "media_assets"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
