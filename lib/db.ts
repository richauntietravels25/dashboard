import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);

let ready: Promise<void> | null = null;
export function ensureSchema() {
  ready ??= (async () => {
    await sql`create table if not exists tasks (
      id serial primary key, title text not null,
      priority smallint not null default 2, due date,
      done boolean not null default false, created_at timestamptz not null default now())`;
    await sql`create table if not exists habits (
      id serial primary key, name text not null, created_at timestamptz not null default now())`;
    await sql`create table if not exists habit_checks (
      habit_id int not null references habits(id) on delete cascade,
      day date not null, primary key (habit_id, day))`;
  })().catch((e) => { ready = null; throw e; });
  return ready;
}

/** Today as YYYY-MM-DD in APP_TIMEZONE. */
export const today = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: process.env.APP_TIMEZONE || "America/New_York" });

export function shiftDay(day: string, n: number) {
  const d = new Date(day + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
