---
name: supabase-rls-postgres
description: Use this skill whenever writing or editing SQL migrations, RLS policies, or database schema for this project — especially anything touching applications, status_history, or parse_rate_limits tables. Also use when adding a new table, changing a foreign key, or when a bug report mentions data from one user appearing for another, a query returning unexpected empty results, or "permission denied" / policy errors from Supabase. Trigger even if the user just says "add a column" or "create a migration" without mentioning RLS explicitly — every table in this project needs a deliberate RLS decision, not a default.
---

# Supabase RLS & Postgres patterns for this project

RLS is the actual security boundary for user data isolation in this app — not application-code checks. A bug here means one user's job applications become readable or writable by another user. Treat every schema change as an RLS decision, not just a column addition.

## The three tables and their RLS posture

| Table | RLS posture | Why |
|---|---|---|
| `applications` | Full CRUD policy scoped to `user_id = auth.uid()` | Directly owned by a user via `user_id` column |
| `status_history` | Full CRUD policy scoped via a subquery to the parent `applications` row | No direct `user_id` column — ownership is inherited |
| `parse_rate_limits` | RLS enabled, **no client-facing policy at all** | Only the Edge Function's service-role client should ever touch this table |

Do not add a default "allow authenticated users" policy to any table without deciding which of these three patterns it fits. If a new table is introduced, it must fit one of these shapes explicitly — ask which, don't guess.

## Standard owner-scoped policy (for tables with a direct `user_id` column)

```sql
alter table applications enable row level security;

create policy "applications_owner_all"
  on applications
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Both `using` and `with check` are required, not just one:
- `using` controls which existing rows are visible/affected (SELECT, UPDATE, DELETE).
- `with check` controls what new/modified row values are allowed (INSERT, UPDATE). Omitting it means a user could `UPDATE ... SET user_id = <someone else's id>` and hand off their own row, or insert a row with someone else's `user_id`.

Always write both clauses together for `for all` policies on directly-owned tables. Never write `using` alone and assume it covers inserts.

## Inherited-ownership policy (for tables like `status_history` with no direct `user_id`)

```sql
alter table status_history enable row level security;

create policy "status_history_owner_all"
  on status_history
  for all
  using (
    auth.uid() = (select user_id from applications where id = application_id)
  );
```

Notes:
- This subquery pattern is correct and is what this project uses — don't "simplify" it by adding a denormalized `user_id` column to `status_history` unless a specific performance problem shows up. The subquery is fine at this project's scale (single-user-owned rows, small tables).
- If a `with check` clause is added here later (e.g. if inserts ever need it beyond what the app-layer transaction already guarantees), it needs the same subquery shape — `application_id` must resolve to a row owned by `auth.uid()`.
- If you're tempted to add an index to speed this subquery up, index `applications(id, user_id)` — but don't add this preemptively without a demonstrated slow query; this project's scale doesn't need it at launch.

## No-client-access table (`parse_rate_limits`)

```sql
alter table parse_rate_limits enable row level security;
-- Deliberately no policy created here.
```

With RLS enabled and zero policies, **all client access is denied by default** — this is the desired state, not an oversight. The Edge Function's service-role client bypasses RLS entirely (that's what the service role key is for) and is the only code path that should touch this table. If you ever see a policy being added to `parse_rate_limits` to "let the client read its own rate limit status," stop and confirm that's actually wanted — it wasn't part of the original design and widens the table's exposure for a feature (showing remaining quota to the user) that hasn't been speced.

## Foreign key cascade behavior — check this on every FK, don't assume

Postgres does NOT cascade-delete by default. Every FK in this schema needs an explicit decision:

```sql
-- status_history.application_id → applications.id: DOES cascade (already correct in the schema)
application_id uuid references applications(id) on delete cascade not null

-- applications.user_id → auth.users.id: does NOT cascade by default, and currently
-- ISN'T explicitly set to cascade either. This is a known gap flagged in the project
-- spec (Section 8): deleting an auth.users row will NOT automatically delete that
-- user's applications unless one of the following is added before the account-deletion
-- feature ships:
--   Option A: add `on delete cascade` to the FK (simplest, but means deleting an
--   auth user always wipes their data with no separate confirmation step at the DB level)
--   Option B: a trigger or Edge Function that explicitly deletes owned applications
--   as a step in account deletion, before removing the auth user (more control,
--   more moving parts)
-- Do not assume this is handled. Check before implementing account deletion (M5).
```

When adding any new FK, state explicitly (in the migration comment) whether it cascades and why — don't leave it to Postgres's default (`no action`, which will make the parent delete fail with a constraint error instead of silently orphaning rows — better than silent orphaning, but still needs a decision about how the app handles that error).

## Required-field constraints (belt-and-suspenders with app validation)

Per project spec, `company` and `title` are required on `applications`. This is enforced at both layers — don't skip the DB constraint just because client/server-side validation exists in the Next.js app:

```sql
alter table applications add constraint company_required
  check (company is not null and length(trim(company)) > 0);
alter table applications add constraint title_required
  check (title is not null and length(trim(title)) > 0);
```

The DB constraint is the actual guarantee; app-layer validation is the good UX (inline error before a failed request round-trip). Both are required — one without the other is either bypassable (app-only) or a bad user experience (DB-only, surfacing a raw Postgres error).

## Migration file conventions

- One logical change per migration file (e.g. don't combine "add notes column" with "add a new table" in one file) — makes it easier to reason about and roll back individually if needed.
- Every new table: enable RLS in the same migration that creates it. Never leave a window where a table exists without RLS enabled, even briefly across separate migrations.
- Test every new/changed policy by querying as two different `auth.uid()` values (Supabase local dev supports impersonating a user via the SQL editor or `set local role`) before considering the migration done — don't just check "it compiles," check "user A cannot see user B's rows."

## Quick checklist for any schema change

1. Does this table need RLS? (Almost always yes — the only exception in this project is the deliberate no-policy case for `parse_rate_limits`.)
2. Does the new/changed column belong to a directly-owned table (`user_id` column, use the standard policy) or an inherited-ownership table (subquery policy)?
3. Are both `using` and `with check` present if the policy is `for all`?
4. Does every new FK have an explicit `on delete` decision (cascade, restrict, or set null) — not left to default?
5. If this is a required field per the spec, is there a DB-level `check` constraint, not just app-layer validation?
6. Have you tested the policy as two different users, not just confirmed it runs without error?
