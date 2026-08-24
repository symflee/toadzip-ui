-- Run this as the Neon schema owner after applying migrations.
-- The NOLOGIN role is a capability role. Grant it to a separate Neon login role
-- used only by DATABASE_URL; do not use the schema owner as the app runtime role.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname = 'showcase_design_writer'
  ) THEN
    CREATE ROLE showcase_design_writer NOLOGIN;
  END IF;
END
$$;

-- This database is dedicated to the showcase app. Prevent PUBLIC membership
-- from restoring schema CREATE to the runtime capability role.
REVOKE CREATE ON SCHEMA public FROM PUBLIC, showcase_design_writer;
GRANT USAGE ON SCHEMA public TO showcase_design_writer;

REVOKE ALL ON TABLE public.showcase_designs FROM PUBLIC, showcase_design_writer;
REVOKE ALL ON SEQUENCE public.showcase_designs_sequence_seq
  FROM PUBLIC, showcase_design_writer;

GRANT SELECT, INSERT ON TABLE public.showcase_designs TO showcase_design_writer;
GRANT USAGE ON SEQUENCE public.showcase_designs_sequence_seq TO showcase_design_writer;

REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON TABLE public.showcase_designs
  FROM showcase_design_writer;
