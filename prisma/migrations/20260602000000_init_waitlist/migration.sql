-- @polsia:framework-owned - DO NOT EDIT. Code installed by polsia/modules/waitlist@0.2.0. Drift = commit rejected.
-- Forward-only. Applied by `prisma migrate deploy` at deploy time (NOT at install).

CREATE TABLE "WaitlistEntry" (
    "id"        TEXT NOT NULL,
    "email"     TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaitlistEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WaitlistEntry_email_key" ON "WaitlistEntry"("email");
