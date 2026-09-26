-- Renumber each section's items to a clean 0, 1, 2… sequence, keeping the
-- order visitors currently see (ties broken newest first). From now on the
-- admin keeps it that way when items are added, moved or deleted
-- (lib/ordering.ts). Data-only: no schema change.

UPDATE "Project" AS t SET "order" = r.position
FROM (
  SELECT "id", (ROW_NUMBER() OVER (ORDER BY "order" ASC, "createdAt" DESC) - 1)::int AS position
  FROM "Project"
) AS r
WHERE t."id" = r."id" AND t."order" <> r.position;

UPDATE "Achievement" AS t SET "order" = r.position
FROM (
  SELECT "id", (ROW_NUMBER() OVER (ORDER BY "order" ASC, "createdAt" DESC) - 1)::int AS position
  FROM "Achievement"
) AS r
WHERE t."id" = r."id" AND t."order" <> r.position;

UPDATE "Certificate" AS t SET "order" = r.position
FROM (
  SELECT "id", (ROW_NUMBER() OVER (ORDER BY "order" ASC, "createdAt" DESC) - 1)::int AS position
  FROM "Certificate"
) AS r
WHERE t."id" = r."id" AND t."order" <> r.position;

UPDATE "BeyondAcademicsEntry" AS t SET "order" = r.position
FROM (
  SELECT "id", (ROW_NUMBER() OVER (ORDER BY "order" ASC, "createdAt" DESC) - 1)::int AS position
  FROM "BeyondAcademicsEntry"
) AS r
WHERE t."id" = r."id" AND t."order" <> r.position;

UPDATE "Involvement" AS t SET "order" = r.position
FROM (
  SELECT "id", (ROW_NUMBER() OVER (ORDER BY "order" ASC, "createdAt" DESC) - 1)::int AS position
  FROM "Involvement"
) AS r
WHERE t."id" = r."id" AND t."order" <> r.position;

UPDATE "ResearchItem" AS t SET "order" = r.position
FROM (
  SELECT "id", (ROW_NUMBER() OVER (ORDER BY "order" ASC, "createdAt" DESC) - 1)::int AS position
  FROM "ResearchItem"
) AS r
WHERE t."id" = r."id" AND t."order" <> r.position;

UPDATE "Photo" AS t SET "order" = r.position
FROM (
  SELECT "id", (ROW_NUMBER() OVER (ORDER BY "order" ASC, "createdAt" DESC) - 1)::int AS position
  FROM "Photo"
) AS r
WHERE t."id" = r."id" AND t."order" <> r.position;

UPDATE "GalleryImage" AS t SET "order" = r.position
FROM (
  SELECT "id", (ROW_NUMBER() OVER (ORDER BY "order" ASC, "createdAt" DESC) - 1)::int AS position
  FROM "GalleryImage"
) AS r
WHERE t."id" = r."id" AND t."order" <> r.position;
