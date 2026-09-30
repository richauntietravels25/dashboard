import { sql, ensureSchema, today, shiftDay } from "@/lib/db";
import { addTask, toggleTask, deleteTask, addHabit, deleteHabit, toggleCheck } from "./actions";

export const dynamic = "force-dynamic";

type Task = { id: number; title: string; priority: number; due: string | null; done: boolean };
type Habit = { id: number; name: string };
type Check = { habit_id: number; day: string };

const fmt = (day: string, o: Intl.DateTimeFormatOptions) =>
  new Date(day + "T00:00:00Z").toLocaleDateString("en-US", { timeZone: "UTC", ...o });
const PRIORITY = ["", "High", "Normal", "Low"];

export default async function Page() {
  await ensureSchema();
  const t = today();
  const days = Array.from({ length: 7 }, (_, i) => shiftDay(t, i - 6));

  const [taskRows, habitRows, checkRows] = await Promise.all([
    sql`select id, title, priority, due::text as due, done from tasks
        order by done, priority, due nulls last, id`,
    sql`select id, name from habits order by id`,
    sql`select habit_id, day::text as day from habit_checks where day >= ${days[0]}::date`,
  ]);
  const tasks = taskRows as Task[];
  const habits = habitRows as Habit[];
  const checks = new Set((checkRows as Check[]).map((c) => `${c.habit_id}|${c.day}`));
  const open = tasks.filter((x) => !x.done).length;

  return (
    <main>
      <header className="masthead">
        <h1>{fmt(t, { weekday: "long" })}</h1>
        <p>{fmt(t, { month: "long", day: "numeric", year: "numeric" })}</p>
        <p className="tally">{open === 0 ? "Nothing open." : `${open} open task${open === 1 ? "" : "s"}`}</p>
      </header>

      <section aria-labelledby="habits-h">
        <h2 id="habits-h">Habits</h2>
        {habits.length === 0 && <p className="empty">Add a habit to start tracking it day by day.</p>}
        {habits.map((h) => {
          const count = days.filter((d) => checks.has(`${h.id}|${d}`)).length;
          return (
            <div className="habit" key={h.id}>
              <div className="habit-head">
                <span>{h.name}</span>
                <span className="muted">{count}/7 this week</span>
                <form action={deleteHabit.bind(null, h.id)}>
                  <button className="link" aria-label={`Delete habit ${h.name}`}>Delete</button>
                </form>
              </div>
              <div className="strip">
                {days.map((d) => {
                  const on = checks.has(`${h.id}|${d}`);
                  return (
                    <form key={d} action={toggleCheck.bind(null, h.id, d)}>
                      <button
                        className={`dot${on ? " on" : ""}${d === t ? " today" : ""}`}
                        aria-pressed={on}
                        aria-label={`${h.name}, ${fmt(d, { weekday: "long" })}`}
                      >
                        {fmt(d, { weekday: "narrow" })}
                      </button>
                    </form>
                  );
                })}
              </div>
            </div>
          );
        })}
        <form action={addHabit} className="row">
          <input name="name" placeholder="New habit" maxLength={200} required aria-label="Habit name" />
          <button className="primary">Add habit</button>
        </form>
      </section>

      <section aria-labelledby="tasks-h">
        <h2 id="tasks-h">Tasks</h2>
        <form action={addTask} className="row wrap">
          <input name="title" placeholder="New task" maxLength={200} required aria-label="Task title" />
          <select name="priority" defaultValue="2" aria-label="Priority">
            <option value="1">High</option><option value="2">Normal</option><option value="3">Low</option>
          </select>
          <input type="date" name="due" aria-label="Due date" />
          <button className="primary">Add task</button>
        </form>
        {tasks.length === 0 && <p className="empty">No tasks yet. Add the first thing you need to finish.</p>}
        <ul className="tasks">
          {tasks.map((k) => {
            const late = !k.done && k.due && k.due < t;
            return (
              <li key={k.id} className={`${k.done ? "done" : ""} p${k.priority}`}>
                <form action={toggleTask.bind(null, k.id)}>
                  <button className="check" aria-label={k.done ? "Mark as open" : "Mark as done"} aria-pressed={k.done} />
                </form>
                <div className="grow">
                  <span className="title">{k.title}</span>
                  <span className={`meta${late ? " late" : ""}`}>
                    {PRIORITY[k.priority]}
                    {k.due ? `, due ${fmt(k.due, { month: "short", day: "numeric" })}${late ? " (overdue)" : ""}` : ""}
                  </span>
                </div>
                <form action={deleteTask.bind(null, k.id)}>
                  <button className="link" aria-label={`Delete task ${k.title}`}>Delete</button>
                </form>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
