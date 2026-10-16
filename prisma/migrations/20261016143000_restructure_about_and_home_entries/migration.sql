-- Update only exact, untouched legacy defaults. Any user-edited field protects the row.
UPDATE "home_entries"
SET "sort_order" = 10, "updated_at" = CURRENT_TIMESTAMP
WHERE "title" = 'Blog'
  AND "description" = '阅读文章与记录。'
  AND "icon" = '↗'
  AND "icon_media_id" IS NULL
  AND "url" = '/blog'
  AND "target_type" = 'INTERNAL'
  AND "open_new_tab" = FALSE
  AND "sort_order" = 20
  AND "visible" = TRUE;

UPDATE "home_entries"
SET "sort_order" = 20, "updated_at" = CURRENT_TIMESTAMP
WHERE "title" = 'Projects'
  AND "description" = '查看项目与作品。'
  AND "icon" = '↗'
  AND "icon_media_id" IS NULL
  AND "url" = '/projects'
  AND "target_type" = 'INTERNAL'
  AND "open_new_tab" = FALSE
  AND "sort_order" = 10
  AND "visible" = TRUE;

UPDATE "home_entries"
SET
  "title" = 'CV',
  "description" = '查看个人简历与经历。',
  "url" = '/about/cv',
  "updated_at" = CURRENT_TIMESTAMP
WHERE "title" = 'Notes'
  AND "description" = '浏览全部文章归档。'
  AND "icon" = '↗'
  AND "icon_media_id" IS NULL
  AND "url" = '/blog/archive'
  AND "target_type" = 'INTERNAL'
  AND "open_new_tab" = FALSE
  AND "sort_order" = 30
  AND "visible" = TRUE;

WITH "migrated_about" AS (
  UPDATE "home_entries"
  SET
    "description" = '了解我与这个网站。',
    "url" = '/about',
    "updated_at" = CURRENT_TIMESTAMP
  WHERE "title" = 'About'
    AND "description" = '查看个人资料与时间线。'
    AND "icon" = '↗'
    AND "icon_media_id" IS NULL
    AND "url" = '/about/timeline'
    AND "target_type" = 'INTERNAL'
    AND "open_new_tab" = FALSE
    AND "sort_order" = 40
    AND "visible" = TRUE
  RETURNING "id"
)
INSERT INTO "home_entries" (
  "id", "title", "description", "icon", "url", "target_type",
  "open_new_tab", "sort_order", "visible", "created_at", "updated_at"
)
SELECT
  gen_random_uuid(), 'Timeline', '浏览人生时间线。', '↗', '/about/timeline', 'INTERNAL',
  FALSE, 50, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "migrated_about"
WHERE NOT EXISTS (
  SELECT 1 FROM "home_entries" WHERE "url" = '/about/timeline'
)
LIMIT 1;
