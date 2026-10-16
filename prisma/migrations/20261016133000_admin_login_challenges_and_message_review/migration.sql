ALTER TYPE "ModerationStatus" ADD VALUE IF NOT EXISTS 'PENDING_REVIEW';

CREATE TABLE "admin_login_challenges" (
    "id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "challenge_token_hash" CHAR(64) NOT NULL,
    "code_hash" CHAR(64) NOT NULL,
    "attempts_remaining" INTEGER NOT NULL DEFAULT 5,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "consumed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_login_challenges_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "admin_login_challenges_attempts_check" CHECK ("attempts_remaining" >= 0 AND "attempts_remaining" <= 5)
);

CREATE UNIQUE INDEX "admin_login_challenges_challenge_token_hash_key"
ON "admin_login_challenges"("challenge_token_hash");
CREATE INDEX "admin_login_challenges_admin_id_expires_at_idx"
ON "admin_login_challenges"("admin_id", "expires_at");
CREATE INDEX "admin_login_challenges_expires_at_idx"
ON "admin_login_challenges"("expires_at");

ALTER TABLE "admin_login_challenges"
ADD CONSTRAINT "admin_login_challenges_admin_id_fkey"
FOREIGN KEY ("admin_id") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

UPDATE "messages"
SET "status" = 'PENDING_REVIEW'::"ModerationStatus"
WHERE "status" = 'PENDING_EMAIL'::"ModerationStatus";
