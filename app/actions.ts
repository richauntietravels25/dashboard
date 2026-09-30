"use server";
import { revalidatePath } from "next/cache";
import { sql, ensureSchema } from "@/lib/db";

const clean = (v: FormDataEntryValue | null) => String(v ?? "").trim().slice(0, 200);
const done = () => revalidatePath("/");

export async function addTask(fd: FormData) {
  const title = clean(fd.get("title"));
  if (!title) return;
  const priority = [1, 2, 3].includes(Number(fd.get("priority"))) ? Number(fd.get("priority")) : 2;
  const due = clean(fd.get("due")) || null;
  await ensureSchema();
  await sql`insert into tasks (title, priority, due) values (${title}, ${priority}, ${due}::date)`;
  done();
}

export async function toggleTask(id: number) {
  await sql`update tasks set done = not done where id = ${id}`;
  done();
}

export async function deleteTask(id: number) {
  await sql`delete from tasks where id = ${id}`;
  done();
}

export async function addHabit(fd: FormData) {
  const name = clean(fd.get("name"));
  if (!name) return;
  await ensureSchema();
  await sql`insert into habits (name) values (${name})`;
  done();
}

export async function deleteHabit(id: number) {
  await sql`delete from habits where id = ${id}`;
  done();
}

export async function toggleCheck(habitId: number, day: string) {
  await sql`with removed as (
      delete from habit_checks where habit_id = ${habitId} and day = ${day}::date returning 1)
    insert into habit_checks (habit_id, day)
    select ${habitId}, ${day}::date where not exists (select 1 from removed)`;
  done();
}
