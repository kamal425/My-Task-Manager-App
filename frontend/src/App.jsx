import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");

  const token = localStorage.getItem("token");

  const userName = localStorage.getItem("name");
  const totalTasks = tasks.length;

const completedTasks = tasks.filter(
  (task) => task.completed
).length;

const pendingTasks = totalTasks - completedTasks;

  const logout = () => {
  const ok = window.confirm("Do you want to logout?");

  if (ok) {
    localStorage.removeItem("token");

    localStorage.removeItem("name");

    alert("✅ Logout Successful");

    window.location.href = "/login";
  }
};

  // 🔥 LOAD TASKS (LOGIN KE BAAD)
  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch("http://localhost:5000/tasks", {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }, []);

  // ➕ ADD TASK
  const addTask = () => {
    if (!task.trim()) return;

    fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ title: task }),
    })
      .then((res) => res.json())
      .then((data) => {
        setTasks([...tasks, data]);
        setTask("");
      });
  };

  // ❌ DELETE TASK
  const deleteTask = (id) => {
    fetch(`http://localhost:5000/tasks/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    });

    setTasks(tasks.filter((t) => t._id !== id));
  };

  // ✏️ EDIT TASK
  const editTask = async (id, currentTitle) => {
    const newTitle = prompt("Edit Task", currentTitle);

    if (!newTitle || !newTitle.trim()) return;

    const res = await fetch(
      `http://localhost:5000/tasks/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ title: newTitle }),
      }
    );

    const updatedTask = await res.json();

    setTasks(
      tasks.map((t) =>
        t._id === id ? updatedTask : t
      )
    );
  };

  // ✅ TOGGLE COMPLETE
  const toggleComplete = async (id) => {
    const res = await fetch(
      `http://localhost:5000/tasks/${id}/complete`,
      {
        method: "PUT",
        headers: {
          Authorization: token,
        },
      }
    );

    const updatedTask = await res.json();

    setTasks(
      tasks.map((t) =>
        t._id === id ? updatedTask : t
      )
    );
  };

  return (
    <div className="app">
      <div className="task-card">
       <div className="header-section">

  <div>
    <h1>🚀 Task Manager</h1>

    <p className="dashboard-subtitle">
      Organize • Track • Complete 🚀
    </p>

    <h3 className="welcome-text">
      Welcome, {userName} 👋
    </h3>
  </div>

  <button
    className="logout-btn"
    onClick={logout}
  >
    Logout
  </button>

</div>
<div className="stats-container">

  <div className="stat-card">
    <h2>{totalTasks}</h2>
    <p>Total Tasks</p>
  </div>

  <div className="stat-card">
    <h2>{completedTasks}</h2>
    <p>Completed</p>
  </div>

  <div className="stat-card">
    <h2>{pendingTasks}</h2>
    <p>Pending</p>
  </div>

</div>

        <div className="top-bar">
  
</div>

        <div className="input-section">
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Enter task..."
          />
          <button onClick={addTask}>Add</button>
        </div>
        <div className="filter-buttons">

  <button
    className={filter === "all" ? "active-filter" : ""}
    onClick={() => setFilter("all")}
  >
    All
  </button>

  <button
    className={filter === "completed" ? "active-filter" : ""}
    onClick={() => setFilter("completed")}
  >
    Completed
  </button>

  <button
    className={filter === "pending" ? "active-filter" : ""}
    onClick={() => setFilter("pending")}
  >
    Pending
  </button>

</div>

        <div className="tasks">
         {tasks
  .filter((task) => {
    if (filter === "completed") {
      return task.completed;
    }

    if (filter === "pending") {
      return !task.completed;
    }

    return true;
  })
  .map((item) => (
            <div key={item._id} className="task-item">
              <span>
                {item.completed ? "✅" : "⬜"} {item.title}
              </span>

             <div className="task-actions">
  <button className="done-btn" onClick={() => toggleComplete(item._id)}>
    Done
  </button>

  <button className="edit-btn" onClick={() => editTask(item._id, item.title)}>
    Edit
  </button>

  <button className="delete-btn" onClick={() => deleteTask(item._id)}>
    Delete
  </button>
</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;