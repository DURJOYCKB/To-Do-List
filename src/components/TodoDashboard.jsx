import { useEffect, useState } from "react";

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    if (!saved) return [];

    return JSON.parse(saved).map(task => ({
      id: task.id ?? Date.now() + Math.random(),
      ...task,
    }));
  });

  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [day, setDay] = useState("Today");
  const [filter, setFilter] = useState("All");

  // 💾 Save tasks
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // 🕛 Auto move Tomorrow → Today (once per day)
  useEffect(() => {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem("lastDate");

    if (lastDate !== today) {
      setTasks(prev =>
        prev.map(task =>
          task.day === "Tomorrow"
            ? { ...task, day: "Today" }
            : task
        )
      );
    
      localStorage.setItem("lastDate", today);
    }

  }, []);

  // 📊 Progress
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const progressColor =
    progress < 40
      ? "bg-red-500"
      : progress < 80
      ? "bg-yellow-400"
      : "bg-green-500";

  // ➕ Add task
  const addTask = () => {
    if (!input.trim()) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setTasks([
      ...tasks,
      {
        id: Date.now(), // ✅ unique id
        text: input,
        completed: false,
        time,
        day,
      },
    ]);
    setInput("");
  };

  // ✔ Toggle
  const toggleTask = (id) => {
    setTasks(tasks =>
      tasks.map(task =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );

    if (editId === id) {
      setEditId(null);
      setEditText("");
    }
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

  // 🔍 Filter
 const todayTasks = tasks.filter(t => t.day === "Today");
  const tomorrowTasks = tasks.filter(t => t.day === "Tomorrow");

  const visibleToday =
    filter === "All" || filter === "Today" ? todayTasks : [];

  const visibleTomorrow =
    filter === "All" || filter === "Tomorrow" ? tomorrowTasks : [];

  // 📋 Render list
  const renderTasks = (list) =>
    list.map(task => (
      <li
        key={task.id}
        className={`${
          darkMode ? "bg-orange-200" : "bg-green-200"
        } px-4 py-3 rounded-xl`}
      >
        <div className="flex justify-between items-start gap-2">
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
                {task.completed && (
                  <span className="text-green-600 font-bold">✔</span>
                )}
                {task.text}
              </p>
            )}
            <p className="text-xs text-slate-600 mt-1">⏰ {task.time}</p>
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
      <div className={`${
        darkMode ? "bg-green-100 text-black" : "bg-orange-100 text-slate-800"
      } w-full max-w-md rounded-2xl shadow-xl p-6`}>
        {/* Header */}
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">📝 To Do ..</h1>
          <button onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-blue-900">
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Input */}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add task..."
          className="w-full mb-2 px-4 py-2 rounded-xl border"
        />

        {/* Today / Tomorrow */}
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
          <div className="h-3 bg-gray-300 rounded-full overflow-hidden">
            <div
              className={`${progressColor} h-full`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button
          onClick={addTask}
          className="w-full bg-blue-400 text-white py-2 rounded-xl mb-3"
        >
          Add
        </button>

        {/* Filters */}
        <div className="flex gap-2 mb-3">
          {["All", "Today", "Tomorrow"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === f ? "bg-black text-white" : "bg-gray-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Today */}
        {visibleToday.length > 0 && (
          <>
            <h2 className="font-bold mb-1"> Today</h2>
            <ul className="space-y-2 mb-3">{renderTasks(visibleToday)}</ul>
          </>
        )}

        {/* Tomorrow */}
        {visibleTomorrow.length > 0 && (
          <>
            <h2 className="font-bold mb-1"> Tomorrow</h2>
            <ul className="space-y-2">{renderTasks(visibleTomorrow)}</ul>
          </>
        )}
      </div>
    </div>
  );
}
