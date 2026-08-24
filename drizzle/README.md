# Neon and Drizzle setup

Use a separate Neon branch and connection string for Development, Preview, and
Production. `DATABASE_URL` is server-only and must not use a `NEXT_PUBLIC_`
prefix.

Apply the checked-in migration from an owner connection:

```bash
DATABASE_URL='postgresql://...' npm run db:migrate
```

Then run `runtime-role-grants.sql` as the schema owner in a database dedicated
to this showcase app. The script revokes `CREATE` on the `public` schema from
`PUBLIC`, grants the capability role schema `USAGE`, and limits the table and
identity sequence to append-only access.

Create a separate LOGIN role in Neon for the application, keep it non-owner and
without direct grants, grant it membership in the capability role, and use that
login's connection string as `DATABASE_URL`:

```sql
ALTER ROLE "your_neon_runtime_login"
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS INHERIT;
GRANT showcase_design_writer TO "your_neon_runtime_login";

SELECT
  has_schema_privilege('your_neon_runtime_login', 'public', 'USAGE') AS can_use_schema,
  has_schema_privilege('your_neon_runtime_login', 'public', 'CREATE') AS can_create_in_schema,
  has_table_privilege('your_neon_runtime_login', 'public.showcase_designs', 'SELECT,INSERT')
    AS can_read_and_insert,
  has_table_privilege('your_neon_runtime_login', 'public.showcase_designs', 'UPDATE,DELETE')
    AS can_mutate_existing_rows;
```

The expected verification values are `true`, `false`, `true`, and `false`.
Do not grant the runtime login schema ownership, table ownership, or additional
roles.

The capability role can only `SELECT` and `INSERT` rows and use the identity
sequence. It has no `UPDATE` or `DELETE` permission. The owner connection is
only for migrations and must not be configured in Vercel runtime environments.

Without `DATABASE_URL`, the existing showcase still builds and renders. Only
the registered-design area reports that its storage is unavailable.
