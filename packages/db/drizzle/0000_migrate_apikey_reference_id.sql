ALTER TABLE "apikey" ADD COLUMN IF NOT EXISTS "config_id" text DEFAULT 'default' NOT NULL;
ALTER TABLE "apikey" ADD COLUMN IF NOT EXISTS "reference_id" text;

UPDATE "apikey"
SET "reference_id" = "user_id"
WHERE "reference_id" IS NULL
  AND "user_id" IS NOT NULL;

ALTER TABLE "apikey" ALTER COLUMN "reference_id" SET NOT NULL;
ALTER TABLE "apikey" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "apikey" ALTER COLUMN "updated_at" SET DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'apikey_reference_id_user_id_fk'
  ) THEN
    ALTER TABLE "apikey"
      ADD CONSTRAINT "apikey_reference_id_user_id_fk"
      FOREIGN KEY ("reference_id") REFERENCES "user"("id")
      ON DELETE cascade;
  END IF;
END $$;

DROP INDEX IF EXISTS "apikey_userId_idx";
CREATE INDEX IF NOT EXISTS "apikey_configId_idx" ON "apikey" ("config_id");
CREATE INDEX IF NOT EXISTS "apikey_referenceId_idx" ON "apikey" ("reference_id");
CREATE INDEX IF NOT EXISTS "apikey_key_idx" ON "apikey" ("key");

ALTER TABLE "apikey" DROP COLUMN IF EXISTS "user_id";
