-- Run this as superuser: sudo -u postgres psql -f scripts/setup-db.sql

CREATE DATABASE ai_tutor;
CREATE USER ai_tutor_user WITH PASSWORD 'ai_tutor_pass';
GRANT ALL PRIVILEGES ON DATABASE ai_tutor TO ai_tutor_user;

\c ai_tutor

CREATE TABLE IF NOT EXISTS "Student" (
  id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name      TEXT NOT NULL,
  email     TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Document" (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  filename    TEXT NOT NULL UNIQUE,
  content     TEXT NOT NULL,
  type        TEXT NOT NULL,
  "uploadedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Session" (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "studentId" TEXT REFERENCES "Student"(id),
  "documentId" TEXT REFERENCES "Document"(id),
  mode        TEXT NOT NULL,
  position    INT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Message" (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "sessionId" TEXT NOT NULL REFERENCES "Session"(id) ON DELETE CASCADE,
  role        TEXT NOT NULL,
  content     TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Score" (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "studentId" TEXT REFERENCES "Student"(id),
  mode        TEXT NOT NULL,
  correct     INT NOT NULL DEFAULT 0,
  total       INT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT ALL ON ALL TABLES IN SCHEMA public TO ai_tutor_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ai_tutor_user;
