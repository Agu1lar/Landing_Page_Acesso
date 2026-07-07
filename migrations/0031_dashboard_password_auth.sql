ALTER TABLE "dashboard_allowlist" ADD COLUMN IF NOT EXISTS "password_hash" varchar(255);

INSERT INTO "dashboard_allowlist" ("email", "role", "password_hash", "added_by_email")
VALUES (
  'tecnologia@acessoequipamentos.com.br',
  'admin',
  '593ba4f982a17f432f6c9bcf6c5e3e57:ede11ae8087c00af0d492e4c18e270d9b0df26df06034a713c9b5b64fcafdcf97aadb8b04ec1197d1be951ecbe7cfe8438e035ebeafcccaa17465005cd4ca2b6',
  'system'
)
ON CONFLICT ("email") DO UPDATE SET
  "role" = 'admin',
  "password_hash" = EXCLUDED."password_hash";
