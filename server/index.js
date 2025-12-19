const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Update this to your Netlify URL once your frontend is deployed
app.use(cors()); 
app.use(express.json());

// Initialize Pool using Environment Variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// GET: All todos
app.get('/todos', async (req, res) => {
  try {
    const query = 'SELECT * FROM todo ORDER BY impact DESC, effort ASC, task_date ASC';
    const result = await pool.query(query);
    res.json(result.rows || []);
  } catch (err) {
    console.error("GET Error:", err.message);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// POST: Add task
app.post('/todos', async (req, res) => {
  try {
    const { text, task_date, effort, impact } = req.body;
    const query = `
      INSERT INTO todo (text, task_date, effort, impact, completed) 
      VALUES ($1, $2, $3, $4, false) 
      RETURNING *
    `;
    const result = await pool.query(query, [text, task_date, effort, impact]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove task
app.delete('/todos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM todo WHERE id = $1', [req.params.id]);
    res.status(200).send("Deleted");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
