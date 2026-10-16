CREATE TABLE "about_profile" (
  "id" UUID NOT NULL,
  "eyebrow" VARCHAR(120) NOT NULL,
  "title" VARCHAR(220) NOT NULL,
  "introduction" VARCHAR(500) NOT NULL,
  "personal_title" VARCHAR(120) NOT NULL,
  "personal_body" TEXT NOT NULL,
  "quote" VARCHAR(500) NOT NULL,
  "site_title" VARCHAR(120) NOT NULL,
  "site_body" TEXT NOT NULL,
  "site_facts" JSONB NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "about_profile_pkey" PRIMARY KEY ("id")
);

INSERT INTO "about_profile" (
  "id", "eyebrow", "title", "introduction", "personal_title", "personal_body",
  "quote", "site_title", "site_body", "site_facts"
)
SELECT
  gen_random_uuid(),
  'A PERSONAL NOTE',
  '在网络上，留一间自己的房间。',
  '这里是一段独立的 About 页面引言，请在后台替换为你的内容。',
  '关于我',
  '这里介绍你自己、关注的方向，以及希望长期记录的事情。',
  '保持好奇，认真完成，并把值得留下的东西保存下来。',
  '关于网站',
  '这里介绍网站的目的、内容和持续维护方式。',
  '[{"label":"Since","value":"2026"},{"label":"Focus","value":"Writing & Building"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM "about_profile");
