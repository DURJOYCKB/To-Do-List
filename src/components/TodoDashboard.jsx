import { useEffect, useState } from "react";

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState("");

  // 🔔 Manual reminder (default AM)
  const [reminderHour, setReminderHour] = useState("");
  const [reminderMinute, setReminderMinute] = useState("");
  const [reminderPeriod, setReminderPeriod] = useState("AM");

  const [darkMode, setDarkMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [day, setDay] = useState("Today");
  const [filter, setFilter] = useState("All");

  // 💾 Save to localStorage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // 🕛 Move Tomorrow → Today (once per day)
  useEffect(() => {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem("lastDate");

    if (lastDate !== today) {
      setTasks(prev =>
        prev.map(task =>
          task.day === "Tomorrow" ? { ...task, day: "Today" } : task
        )
      );
      localStorage.setItem("lastDate", today);
    }
  }, []);

  // 🔔 Reminder notification (AM/PM)
   const scheduleReminder = (task) => {
    const triggerReminder = () => {
      // 📱 Mobile fallback
      if (!("Notification" in window)) {
        alert(`⏰ Reminder: ${task.text}`);

        if ("vibrate" in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
        return;
      }

      // 💻 Desktop notification
      new Notification("⏰ Task Reminder", {
        body: task.text,
      });
    };

    // ⏰ Convert AM/PM → 24h
    const [time, period] = task.reminder.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);

    const delay = reminderTime - new Date();
    if (delay <= 0) return;

    // 🔔 Ask permission only if supported
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    setTimeout(triggerReminder, delay);
  };


  // ➕ Add task
  const addTask = () => {
    if (!input.trim()) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    let reminder = "";
    if (reminderHour && reminderMinute !== "") {
      const hh = reminderHour.padStart(2, "0");
      const mm = reminderMinute.padStart(2, "0");
      reminder = `${hh}:${mm} ${reminderPeriod}`;
    }

    const newTask = {
      id: Date.now(),
      text: input,
      completed: false,
      time,
      reminder,
      day,
    };

    setTasks([...tasks, newTask]);
    if (reminder) scheduleReminder(newTask);

    setInput("");
    setReminderHour("");
    setReminderMinute("");
    setReminderPeriod("AM");
  };

  // ✔ Toggle
  const toggleTask = (id) => {
    setTasks(tasks =>
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // 🗑 Delete
  const deleteTask = (id) => {
    setTasks(tasks => tasks.filter(task => task.id !== id));
  };

  // ✏️ Start edit
  const startEdit = (id, text) => {
    const task = tasks.find(t => t.id === id);
    if (task.completed) return;
    setEditId(id);
    setEditText(text);
  };

  // 💾 Save edit
  const saveEdit = (id) => {
    if (!editText.trim()) return;

    setTasks(tasks =>
      tasks.map(task =>
        task.id === id ? { ...task, text: editText } : task
      )
    );
    setEditId(null);
    setEditText("");
  };

  // 📊 Progress
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const progressColor =
    progress < 40 ? "bg-red-500"
    : progress < 80 ? "bg-yellow-400"
    : "bg-green-500";

  // 🔍 Filter
  const todayTasks = tasks.filter(t => t.day === "Today");
  const tomorrowTasks = tasks.filter(t => t.day === "Tomorrow");

  const visibleToday =
    filter === "All" || filter === "Today" ? todayTasks : [];

  const visibleTomorrow =
    filter === "All" || filter === "Tomorrow" ? tomorrowTasks : [];

  // 📋 Render tasks
  const renderTasks = (list) =>
    list.map(task => (
      <li
        key={task.id}
        className={`px-4 py-3 rounded-xl ${
          darkMode ? "bg-orange-200" : "bg-green-200"
        }`}
      >
        <div className="flex justify-between gap-2">
          <div className="flex-1">
            {editId === task.id ? (
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveEdit(task.id)}
                className="w-full px-2 py-1 rounded border"
                autoFocus
              />
            ) : (
              <p className={`flex items-center gap-2 ${task.completed ? "opacity-70" : ""}`}>
                {task.completed && <span className="text-green-600 font-bold">✔</span>}
                {task.text}
              </p>
            )}

            <p className="text-xs text-slate-600 mt-1">⏰ {task.time}</p>

            {task.reminder && (
              <p className="text-xs text-blue-600">
                🔔 Reminder at {task.reminder}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => toggleTask(task.id)}
              className="text-xs bg-green-500 text-white px-2 py-1 rounded"
            >
              ✔
            </button>

            {editId === task.id ? (
              <button
                onClick={() => saveEdit(task.id)}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => startEdit(task.id, task.text)}
                disabled={task.completed}
                className="text-xs bg-yellow-300 px-2 py-1 rounded"
              >
                ✏️
              </button>
            )}

            <button
              onClick={() => deleteTask(task.id)}
              className="text-xs bg-red-500 text-white px-2 py-1 rounded"
            >
              🗑
            </button>
          </div>
        </div>
      </li>
    ));

  return (
    <div className={`${darkMode ? "bg-[#0a192f]" : "bg-blue-100"} min-h-screen flex justify-center items-center p-4`}>
      <div className={`${darkMode ? "bg-green-100" : "bg-orange-100"} w-full max-w-md rounded-2xl shadow-xl p-6`}>

        {/* Header */}
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">📝 To Do ..</h1>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Task input */}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add task..."
          className="w-full mb-2 px-4 py-2 rounded-xl border"
        />

        {/* Manual reminder */}
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            min="1"
            max="12"
            placeholder="HH"
            value={reminderHour}
            onChange={(e) => setReminderHour(e.target.value)}
            className="w-1/3 px-3 py-2 rounded-xl border"
          />
          <input
            type="number"
            min="0"
            max="59"
            placeholder="MM"
            value={reminderMinute}
            onChange={(e) => setReminderMinute(e.target.value)}
            className="w-1/3 px-3 py-2 rounded-xl border"
          />
          <select
            value={reminderPeriod}
            onChange={(e) => setReminderPeriod(e.target.value)}
            className="w-1/3 px-3 py-2 rounded-xl border"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>

        {/* Day selector */}
        <div className="flex gap-2 mb-2">
          {["Today", "Tomorrow"].map(d => (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`px-3 py-1 rounded-full ${
                day === d ? "bg-blue-900 text-white" : "bg-gray-300"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs">
            <span>{completedCount}/{totalCount} completed</span>
            <span>{progress}%</span>
          </div>
          <div className="h-3 bg-gray-300 rounded-full">
            <div className={`${progressColor} h-full`} style={{ width: `${progress}%` }} />
          </div>
        </div>

        <button
          onClick={addTask}
          className="w-full bg-blue-400 hover:bg-blue-600 text-white py-2 rounded-xl mb-3"
        >
          Add Task
        </button>

        {/* Filters */}
        <div className="flex gap-2 mb-3">
          {["All", "Today", "Tomorrow"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full ${
                filter === f ? "bg-black text-white" : "bg-gray-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {visibleToday.length > 0 && (
          <>
            <h2 className="font-bold mb-1">Today</h2>
            <ul className="space-y-2 mb-3">{renderTasks(visibleToday)}</ul>
          </>
        )}

        {visibleTomorrow.length > 0 && (
          <>
            <h2 className="font-bold mb-1">Tomorrow</h2>
            <ul className="space-y-2">{renderTasks(visibleTomorrow)}</ul>
          </>
        )}
        <footer className="border-t border-black-200 dark:border-gray-700 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
      ©     {new Date().getFullYear()} Durjoy Chakraborty. All rights reserved.
        </footer>
      </div>
      
    

    </div>
    

  );
}
