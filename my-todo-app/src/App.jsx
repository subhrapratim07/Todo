import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]); // Initialized as empty array
  const [form, setForm] = useState({ 
    text: '', 
    task_date: '', 
    effort: 5, 
    impact: 5 
  });

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch('https://todo-xc7k.onrender.com/todos');
      const data = await res.json();
      
      // CRITICAL: Check if data is actually an array
      if (Array.isArray(data)) {
        setTodos(data);
      } else {
        console.error("Server didn't return an array:", data);
        setTodos([]); 
      }
    } catch (err) { 
      console.error("Fetch failed:", err);
      setTodos([]);
    }
  };

  const handleAdd = async () => {
    if (!form.text || !form.task_date) return alert("Fill task name and date");

    const payload = {
      text: form.text,
      task_date: form.task_date,
      effort: parseInt(form.effort), 
      impact: parseInt(form.impact)
    };

    try {
      const response = await fetch('https://todo-xc7k.onrender.com/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setForm({ text: '', task_date: '', effort: 5, impact: 5 });
        fetchTodos();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (err) {
      alert("Could not connect to server");
    }
  };

  const handleDelete = async (id) => {
    try {
      // FIX: Added "/todos/" to the URL path to match the backend route
      const response = await fetch(`https://todo-xc7k.onrender.com/todos/${id}`, { 
        method: 'DELETE' 
      });
      
      if (response.ok) {
        fetchTodos();
      } else {
        console.error("Failed to delete the task on the server.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="todo-container">
      <h2>Add New Task</h2>
      
      <div className="input-group">
        <input 
          type="text" placeholder="Task Name" value={form.text}
          onChange={e => setForm({...form, text: e.target.value})}
        />
        <input 
          type="date" value={form.task_date}
          onChange={e => setForm({...form, task_date: e.target.value})}
        />
        
        <div className="slider-group">
          <label>Effort (1-10): <b>{form.effort}</b></label>
          <input type="range" min="1" max="10" value={form.effort} 
            onChange={e => setForm({...form, effort: e.target.value})} />
        </div>

        <div className="slider-group">
          <label>Impact (1-10): <b>{form.impact}</b></label>
          <input type="range" min="1" max="10" value={form.impact} 
            onChange={e => setForm({...form, impact: e.target.value})} />
        </div>

        <button className="add-btn" onClick={handleAdd}>Add Task</button>
      </div>

      <hr style={{ borderColor: '#333' }} />

      <h3>Priority Order:</h3>
      <ul className="todo-list">
        {/* Guarding the map function */}
        {todos && todos.length > 0 ? (
          todos.map(t => (
            <li key={t.id}>
              <div className="task-info">
                <strong>{t.text}</strong>
                <div className="task-meta">
                  Date: {t.task_date?.split('T')[0]} | 
                  Impact: <span style={{ color: '#4caf50' }}>{t.impact ?? 'N/A'}</span> | 
                  Effort: <span style={{ color: '#ff4444' }}>{t.effort ?? 'N/A'}</span>
                </div>
              </div>
              <button className="delete-btn" onClick={() => handleDelete(t.id)}>Delete</button>
            </li>
          ))
        ) : (
          <p>No tasks found. Try adding one!</p>
        )}
      </ul>
    </div>
  );
}

export default App;
