import { useState, useEffect } from "react";
import "./App.css";
import heracross from "./assets/heracross.png";
import charmander from "./assets/charmander.png";
import bulbasaur from "./assets/bulbasaur.png";
import squirtle from "./assets/squirtle.png";
import ralts from "./assets/ralts.png";
import eevee from "./assets/eevee.png";

const SPRITES = {
  espresso: charmander,
  matcha: bulbasaur,
  taro: squirtle,
  berry: ralts,
};

const CATEGORIES = {
  espresso: { tag: "Espresso · Build" },
  matcha: { tag: "Matcha · Design" },
  berry: { tag: "Strawberry · Jobs" },
  taro: { tag: "Taro · Study" },
};

const NAV = [
  ["today", "Today"],
  ["calendar", "Calendar"],
  ["orders", "Orders"],
  ["regulars", "Regulars"],
];

function toKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function fromKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function getWeek(key) {
  const date = fromKey(key);
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatTime(t) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function formatDate(key) {
  return fromKey(key).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

const todayKey = toKey(new Date());
const initialTasks = [
  { id: 1, date: todayKey, time: "09:00", title: "Finish React to-do", category: "espresso", done: true },
  { id: 2, date: todayKey, time: "11:00", title: "Portfolio case study", category: "matcha", done: false },
  { id: 3, date: todayKey, time: "14:00", title: "Send 3 applications", category: "berry", done: false },
  { id: 4, date: todayKey, time: "16:30", title: "Python practice", category: "taro", done: false },
];
function Ticket({ task, onToggle, onEdit, onDelete }) {
  return (
    <div className="row">
      <div className="tm">{formatTime(task.time)}</div>
      <div className={`tk ${task.category} ${task.done ? "done" : ""}`}>
        <button
          className="ck"
          aria-label={task.done ? "Mark not done" : "Mark done"}
          onClick={() => onToggle(task.id)}
        >
          <span className="box">{task.done ? "✓" : ""}</span>
        </button>
        <div className="info">
          <h3>{task.title}</h3>
          <small>{CATEGORIES[task.category].tag}</small>
        </div>
        <Sprite src={SPRITES[task.category]} />
        {task.done ? (
          <button className="act" onClick={() => onDelete(task.id)}>
            Delete
          </button>
        ) : (
          <button className="act" onClick={() => onEdit(task)}>
            Edit
          </button>
        )}
      </div>
    </div>
  );
}

function Sprite({ src }) {
  if (src) return <img className="sprite" src={src} alt="" />;
  return <div className="sprite" aria-hidden="true"></div>;
}

function MonthGrid({ selectedDate, tasks, onPick }) {
  const sel = fromKey(selectedDate);
  const year = sel.getFullYear();
  const month = sel.getMonth();
  const blanks = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const busy = new Set(tasks.map((t) => t.date));

  return (
    <div className="cal">
      {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
        <span key={i} className="head">
          {d}
        </span>
      ))}
      {Array.from({ length: blanks }, (_, i) => (
        <span key={"b" + i}></span>
      ))}
      {Array.from({ length: daysInMonth }, (_, i) => {
        const key = toKey(new Date(year, month, i + 1));
        const cls = `${key === selectedDate ? "on" : ""} ${busy.has(key) ? "has" : ""}`;
        return (
          <button key={key} className={cls} onClick={() => onPick(key)}>
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

function TaskForm({ task, defaultDate, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(task ? task.title : "");
  const [time, setTime] = useState(task ? task.time : "09:00");
  const [date, setDate] = useState(
    task ? task.date : defaultDate < todayKey ? todayKey : defaultDate,
  );
  const [category, setCategory] = useState(task ? task.category : "espresso");

  function handleSubmit(e) {
    e.preventDefault();
    if (title.trim() === "") return;
    if (date < todayKey) return;
    onSave({ title: title.trim(), time, date, category });
  }

  return (
    <div className="overlay" onClick={onClose}>
      <form
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2>{task ? "Edit order" : "New order"}</h2>
        <label>
          What's the order?
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Study for exam"
            autoFocus
          />
        </label>
        <label>
          Time
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </label>
        <label>
          Date
          <input
            type="date"
            value={date}
            min={todayKey}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
        <label>
          Drink
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {Object.entries(CATEGORIES).map(([key, c]) => (
              <option key={key} value={key}>
                {c.tag}
              </option>
            ))}
          </select>
        </label>
        <div className="modal-actions">
          <button type="button" className="cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="save">
            Save
          </button>
        </div>
        {task && (
          <button
            type="button"
            className="remove"
            onClick={() => onDelete(task.id)}
          >
            Delete this order
          </button>
        )}
      </form>
    </div>
  );
}

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("cafe-tasks");
    return saved ? JSON.parse(saved) : initialTasks;
  });
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [view, setView] = useState("today");
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    localStorage.setItem("cafe-tasks", JSON.stringify(tasks));
  }, [tasks]);

  function toggleDone(id) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function deleteTask(id) {
    setTasks(tasks.filter((t) => t.id !== id));
    setEditing(null);
  }

  function saveTask(data) {
    if (editing === "new") {
      setTasks([...tasks, { id: Date.now(), done: false, ...data }]);
    } else {
      setTasks(tasks.map((t) => (t.id === editing.id ? { ...t, ...data } : t)));
    }
    setSelectedDate(data.date);
    setEditing(null);
  }

  function pickDate(key) {
    setSelectedDate(key);
    setView("today");
  }

  function moveMonth(delta) {
    const d = fromKey(selectedDate);
    setSelectedDate(toKey(new Date(d.getFullYear(), d.getMonth() + delta, 1)));
  }

  function goView(v) {
    if (v === "today") setSelectedDate(todayKey);
    setView(v);
  }

  function navBtn([key, label], cls) {
    return (
      <button
        key={key}
        className={`${cls} ${view === key ? "on" : ""}`}
        onClick={() => goView(key)}
      >
        {label}
      </button>
    );
  }

  const dayTasks = tasks
    .filter((t) => t.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));
  const doneCount = dayTasks.filter((t) => t.done).length;
  const left = dayTasks.length - doneCount;
  const percent = dayTasks.length ? (doneCount / dayTasks.length) * 100 : 0;
  const allSorted = [...tasks].sort((a, b) =>
    (a.date + a.time).localeCompare(b.date + b.time),
  );
  const totalServed = tasks.filter((t) => t.done).length;

  const monthTitle = fromKey(selectedDate).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const titles = {
    today: monthTitle,
    calendar: monthTitle,
    orders: "All Orders",
    regulars: "Regulars",
  };
  const isPast = view === "today" && selectedDate < todayKey;
  const pillText = isPast
    ? "Date passed"
    : dayTasks.length === 0
      ? "No orders yet"
      : left === 0
        ? "All served!"
        : left === 1
          ? "1 order left!"
          : `${left} orders left!`;
  const isToday = selectedDate === todayKey;

  function renderTicket(t) {
    return (
      <Ticket
        key={t.id}
        task={t}
        onToggle={toggleDone}
        onEdit={setEditing}
        onDelete={deleteTask}
      />
    );
  }

  return (
    <div className="app">
      <nav className="side">
        <div className="logo">
          <Sprite src={eevee} />
          PokeCafé Planner
        </div>
        {NAV.map((n) => navBtn(n, "nv"))}
        <button
          className="new"
          disabled={isPast}
          onClick={() => setEditing("new")}
        >
          + New order
        </button>
      </nav>

      <main className="main">
        <div className="hd">
          <div className="hd-top">
            <div>
              <div className="eyebrow">POKECAFÉ PLANNER</div>
              <h1>{titles[view]}</h1>
            </div>
            <div className="hd-right">
              <Sprite src={heracross} />
              {view === "today" && <div className="pill">{pillText}</div>}
            </div>
          </div>
          {view === "today" && (
            <div className="wk">
              {getWeek(selectedDate).map((d) => {
                const key = toKey(d);
                const cls = `dy ${key === selectedDate ? "on" : ""} ${key === todayKey ? "today" : ""}`;
                return (
                  <button
                    key={key}
                    className={cls}
                    onClick={() => setSelectedDate(key)}
                  >
                    {d.toLocaleDateString("en-US", { weekday: "short" })}
                    <b>{d.getDate()}</b>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {view === "today" && (
          <>
            <div className="sec">
              <h2>
                {isToday
                  ? "Today's Menu"
                  : "Menu for " + formatDate(selectedDate)}
              </h2>
              <span className="muted">{dayTasks.length} orders</span>
            </div>
            <div className="list">
              {isPast && (
                <div className="notice">
                  This date has passed. You can't add new orders here.
                </div>
              )}
              {dayTasks.length === 0 && (
                <div className="empty">
                  {isPast
                    ? "No orders were made on this day."
                    : "No orders yet. Tap + New order to add one."}
                </div>
              )}
              {dayTasks.map(renderTicket)}
            </div>
          </>
        )}

        {view === "calendar" && (
          <div className="list">
            <div className="card big">
              <div className="mrow">
                <button
                  className="mnav"
                  aria-label="Previous month"
                  onClick={() => moveMonth(-1)}
                >
                  ‹
                </button>
                <h2>{monthTitle}</h2>
                <button
                  className="mnav"
                  aria-label="Next month"
                  onClick={() => moveMonth(1)}
                >
                  ›
                </button>
              </div>
              <MonthGrid
                selectedDate={selectedDate}
                tasks={tasks}
                onPick={pickDate}
              />
            </div>
          </div>
        )}

        {view === "orders" && (
          <div className="list">
            {allSorted.length === 0 && (
              <div className="empty">No orders yet.</div>
            )}
            {[...new Set(allSorted.map((t) => t.date))].map((date) => (
              <div className="group" key={date}>
                <div className="day-label">{formatDate(date)}</div>
                {allSorted.filter((t) => t.date === date).map(renderTicket)}
              </div>
            ))}
          </div>
        )}

        {view === "regulars" && (
          <div className="list">
            <div className="card">
              <h2>Regulars</h2>
              <div className="muted">
                You've served {totalServed} orders so far. Your Pokémon regulars
                will show up here soon.
              </div>
            </div>
          </div>
        )}
      </main>

      <aside className="rail">
        {view !== "calendar" && (
          <div className="card">
            <h2>
              {fromKey(selectedDate).toLocaleDateString("en-US", {
                month: "long",
              })}
            </h2>
            <MonthGrid
              selectedDate={selectedDate}
              tasks={tasks}
              onPick={pickDate}
            />
          </div>
        )}
        <div className="card">
          <h2>{isToday ? "Served today" : "Served"}</h2>
          <div className="muted">
            {doneCount} of {dayTasks.length} orders
          </div>
          <div className="track">
            <div className="fill" style={{ width: percent + "%" }}></div>
          </div>
        </div>
      </aside>

      <nav className="bar">
        {NAV.slice(0, 2).map((n) => navBtn(n, ""))}
        <button
          className="plus"
          aria-label="New order"
          disabled={isPast}
          onClick={() => setEditing("new")}
        >
          +
        </button>
        {NAV.slice(2).map((n) => navBtn(n, ""))}
      </nav>

      {editing && (
        <TaskForm
          key={editing === "new" ? "new" : editing.id}
          task={editing === "new" ? null : editing}
          defaultDate={selectedDate}
          onSave={saveTask}
          onDelete={deleteTask}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

export default App;
