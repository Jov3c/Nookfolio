CREATE TYPE "CaptchaPurpose" AS ENUM ('COMMENT', 'MESSAGE', 'REPLY');

CREATE TABLE "captcha_challenges" (
    "id" UUID NOT NULL,
    "purpose" "CaptchaPurpose" NOT NULL,
    "answer_hash" CHAR(64) NOT NULL,
    "ip_hash" CHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "consumed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "captcha_challenges_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "captcha_challenges_expires_at_idx" ON "captcha_challenges"("expires_at");
CREATE INDEX "captcha_challenges_ip_hash_created_at_idx" ON "captcha_challenges"("ip_hash", "created_at");
