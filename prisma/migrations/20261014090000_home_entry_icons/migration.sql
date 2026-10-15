ALTER TABLE "home_entries"
ADD COLUMN "icon_media_id" UUID;

ALTER TABLE "home_entries"
ALTER COLUMN "icon" TYPE VARCHAR(500);

CREATE INDEX "home_entries_icon_media_id_idx"
ON "home_entries"("icon_media_id");

ALTER TABLE "home_entries"
ADD CONSTRAINT "home_entries_icon_media_id_fkey"
FOREIGN KEY ("icon_media_id") REFERENCES "media_assets"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
