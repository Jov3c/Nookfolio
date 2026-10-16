UPDATE "messages"
SET "status" = 'PENDING_REVIEW'::"ModerationStatus"
WHERE "status" = 'PENDING_EMAIL'::"ModerationStatus";
