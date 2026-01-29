import { useEffect, useState } from "react";

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
 
  const [darkMode, setDarkMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!input.trim()) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setTasks([
      ...tasks,
      { text: input, completed: false, time },
    ]);
    setInput("");
  };

  const toggleTask = (index) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    setTasks(updated);

    // exit edit mode if completed
    if (editIndex === index) {
      setEditIndex(null);
      setEditText("");
    }
  };

  const deleteTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const startEdit = (index, text) => {
    if (tasks[index].completed) return; // 🚫 no edit if completed
    setEditIndex(index);
    setEditText(text);
  };

  const saveEdit = (index) => {
    if (!editText.trim()) return;

    const updated = [...tasks];
    updated[index].text = editText;
    setTasks(updated);
    setEditIndex(null);
    setEditText("");
  };

  return (
    <div
      className={`${
        darkMode ? "bg-[#0a192f]" : "bg-blue-100"
      } min-h-screen flex items-center justify-center p-4`}
    >
      <div
        className={`${
          darkMode ? "bg-green-100 text-black" : "bg-orange-100 text-slate-800"
        } w-full max-w-md rounded-2xl shadow-xl p-6`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">📝 To Do..</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-blue-900"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Input */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Add a task..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Priority + Add */}
        <div className="flex gap-2 mb-4">
          
          <button
            onClick={addTask}
            className="bg-blue-300 hover:bg-blue-500 text-white px-4 py-2 rounded-xl"
          >
            Add
          </button>
        </div>

        {/* Task List */}
        <ul className="space-y-2">
          {tasks.map((task, index) => (
            <li
              key={index}
              className={`${
                darkMode ? "bg-orange-200" : "bg-green-200"
              } px-4 py-3 rounded-xl`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  {editIndex === index ? (
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && saveEdit(index)
                      } // ⌨️ Enter to save
                      className="w-full px-2 py-1 rounded border"
                      autoFocus
                    />
                  ) : (
                    <p
                      className={`flex items-center gap-2 ${
                        task.completed ? "opacity-70" : ""
                      }`}
                    >
                      {task.completed && (
                        <span className="text-green-600 font-bold text-lg">
                          ✔
                        </span>
                      )}
                      {task.text}
                    </p>

                  )}

                  <p className="text-xs text-slate-600 mt-1">
                    ⏰ {task.time}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => toggleTask(index)}
                    className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                  >
                    ✔
                  </button>

                  {editIndex === index ? (
                    <button
                      onClick={() => saveEdit(index)}
                      className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(index, task.text)}
                      disabled={task.completed}
                      className={`text-xs px-2 py-1 rounded ${
                        task.completed
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-yellow-300 hover:bg-yellow-500 text-black"
                      }`}
                    >
                      ✏️
                    </button>
                  )}

                  <button
                    onClick={() => deleteTask(index)}
                    className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {tasks.length === 0 && (
          <p className="text-center text-blue-400 mt-4">
            No tasks yet 👀
          </p>
        )}
      </div>
    </div>
  );
}
