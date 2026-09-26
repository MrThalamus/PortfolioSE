-- Replaced by the generic "RateLimit" table. Kept as a separate migration so
-- the new table can be created before deploying, while the old table stays
-- in place for the currently live code until the new code ships.
DROP TABLE "ChatRateLimit";
