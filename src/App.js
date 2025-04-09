import React, { useState, useEffect } from "react";
import "./index.css";
import { v4 as uuidv4 } from "uuid";

const PREDEFINED_TASKS = [
  "Sign NDA",
  "Submit ID Document",
  "Set Up Email",
  "Complete HR Orientation",
  "Access Company Tools (GitHub)",
];

const getProgress = (tasks) => {
  const completed = tasks.filter((t) => t.completed).length;
  return Math.round((completed / tasks.length) * 100);
};

function App() {
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("employees"));
    if (data) setEmployees(data);
  }, []);

  useEffect(() => {
    localStorage.setItem("employees", JSON.stringify(employees));
  }, [employees]);

  const addEmployee = (e) => {
    e.preventDefault();
    const form = e.target;
    const newEmployee = {
      id: uuidv4(),
      name: form.name.value,
      email: form.email.value,
      role: form.role.value,
      startDate: form.startDate.value,
      tasks: PREDEFINED_TASKS.map((task, i) => ({
        id: i,
        text: task,
        completed: false,
      })),
      customTasks: [],
    };
    setEmployees([...employees, newEmployee]);
    form.reset();
  };

  const toggleTask = (empId, taskId, isCustom = false) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === empId) {
          const taskList = isCustom ? emp.customTasks : emp.tasks;
          const updatedTasks = taskList.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          );
          return {
            ...emp,
            [isCustom ? "customTasks" : "tasks"]: updatedTasks,
          };
        }
        return emp;
      })
    );
  };

  const addCustomTask = (empId, taskText) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === empId) {
          return {
            ...emp,
            customTasks: [
              ...emp.customTasks,
              { id: uuidv4(), text: taskText, completed: false },
            ],
          };
        }
        return emp;
      })
    );
  };

  const getColorClass = (percentage) => {
    if (percentage === 100) return "green";
    if (percentage > 0) return "yellow";
    return "red";
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase());
    const progress = getProgress([...emp.tasks, ...emp.customTasks]);
    const matchesFilter =
      filter === "" ||
      (filter === "not-started" && progress === 0) ||
      (filter === "in-progress" && progress > 0 && progress < 100) ||
      (filter === "completed" && progress === 100);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container">
      <h1>HR Onboarding Dashboard</h1>

      <form onSubmit={addEmployee}>
        <input name="name" placeholder="Full Name" required />
        <input name="email" placeholder="Email" type="email" required />
        <input name="role" placeholder="Job Role / Department" required />
        <input name="startDate" type="date" required />
        <button type="submit">Add Employee</button>
      </form>

      <div style={{ margin: "20px 0" }}>
        <input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: "10px", padding: "8px", width: "100%" }}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Filter by status</option>
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {filteredEmployees.map((emp) => {
        const allTasks = [...emp.tasks, ...emp.customTasks];
        const progress = getProgress(allTasks);
        return (
          <div
            key={emp.id}
            className={`employee-card ${getColorClass(progress)}`}
          >
            <h3>{emp.name}</h3>
            <p>
              <strong>{emp.role}</strong> | {emp.email} | Start: {emp.startDate}
            </p>

            <div className="progress-bar">
              <div
                className="progress-bar-inner"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p>{progress}% completed</p>

            <ul className="task-list">
              {emp.tasks.map((task) => (
                <li key={task.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(emp.id, task.id)}
                    />{" "}
                    {task.text}
                  </label>
                </li>
              ))}
              {emp.customTasks.map((task) => (
                <li key={task.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(emp.id, task.id, true)}
                    />{" "}
                    {task.text}
                  </label>
                </li>
              ))}
            </ul>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const text = e.target.customTask.value.trim();
                if (text) addCustomTask(emp.id, text);
                e.target.reset();
              }}
            >
              <input name="customTask" placeholder="Add custom task..." />
            </form>
          </div>
        );
      })}
    </div>
  );
}

export default App;
