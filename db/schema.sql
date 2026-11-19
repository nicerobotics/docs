-- D1 (SQLite) schema for the application form. Apply once to a new database:
--   npx wrangler d1 execute <database> --remote --file db/schema.sql
-- Timestamps are UTC text with microseconds (YYYY-MM-DDTHH:MM:SS.ffffffZ) and compare correctly as strings.
CREATE TABLE nice_applications (
  id TEXT PRIMARY KEY NOT NULL CHECK (
    length(id)=36 AND id=lower(id) AND substr(id,9,1)='-' AND substr(id,14,1)='-'
    AND substr(id,19,1)='-' AND substr(id,24,1)='-'
    AND length(replace(id,'-',''))=32 AND replace(id,'-','') NOT GLOB '*[^0-9a-f]*'
  ),
  hash TEXT NOT NULL,
  payload TEXT CHECK (payload IS NULL OR json_valid(payload)),
  state TEXT NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','syncing','synced','blocked')),
  record_id TEXT,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts BETWEEN -2147483648 AND 2147483647),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f','now') || '000Z') CHECK (
    length(created_at)=27 AND created_at GLOB '????-??-??T??:??:??.??????Z'
    AND replace(replace(replace(replace(replace(created_at,'-',''),'T',''),':',''),'.',''),'Z','') NOT GLOB '*[^0-9]*'
    AND date(substr(created_at,1,10),'+0 days') IS NOT NULL AND date(substr(created_at,1,10),'+0 days')=substr(created_at,1,10)
    AND substr(created_at,12,2)<='23' AND substr(created_at,15,2)<='59' AND substr(created_at,18,2)<='59'
  ),
  retry_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%f','now') || '000Z') CHECK (
    length(retry_at)=27 AND retry_at GLOB '????-??-??T??:??:??.??????Z'
    AND replace(replace(replace(replace(replace(retry_at,'-',''),'T',''),':',''),'.',''),'Z','') NOT GLOB '*[^0-9]*'
    AND date(substr(retry_at,1,10),'+0 days') IS NOT NULL AND date(substr(retry_at,1,10),'+0 days')=substr(retry_at,1,10)
    AND substr(retry_at,12,2)<='23' AND substr(retry_at,15,2)<='59' AND substr(retry_at,18,2)<='59'
  ),
  lease_until TEXT CHECK (lease_until IS NULL OR (
    length(lease_until)=27 AND lease_until GLOB '????-??-??T??:??:??.??????Z'
    AND replace(replace(replace(replace(replace(lease_until,'-',''),'T',''),':',''),'.',''),'Z','') NOT GLOB '*[^0-9]*'
    AND date(substr(lease_until,1,10),'+0 days') IS NOT NULL AND date(substr(lease_until,1,10),'+0 days')=substr(lease_until,1,10)
    AND substr(lease_until,12,2)<='23' AND substr(lease_until,15,2)<='59' AND substr(lease_until,18,2)<='59'
  )),
  synced_at TEXT CHECK (synced_at IS NULL OR (
    length(synced_at)=27 AND synced_at GLOB '????-??-??T??:??:??.??????Z'
    AND replace(replace(replace(replace(replace(synced_at,'-',''),'T',''),':',''),'.',''),'Z','') NOT GLOB '*[^0-9]*'
    AND date(substr(synced_at,1,10),'+0 days') IS NOT NULL AND date(substr(synced_at,1,10),'+0 days')=substr(synced_at,1,10)
    AND substr(synced_at,12,2)<='23' AND substr(synced_at,15,2)<='59' AND substr(synced_at,18,2)<='59'
  )),
  last_error TEXT
) STRICT;
CREATE INDEX nice_applications_due ON nice_applications (retry_at) WHERE state IN ('pending','syncing');
CREATE TABLE nice_application_rate (
  key TEXT NOT NULL,
  bucket INTEGER NOT NULL,
  count INTEGER NOT NULL CHECK (count BETWEEN -2147483648 AND 2147483647),
  PRIMARY KEY (key,bucket)
) STRICT;
