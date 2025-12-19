const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Note: Using a connection string with special characters in the password 
// can sometimes require URL encoding, but standard pg should handle it.
const connectionString = "postgresql://postgres:Subhra@1234@db.dxixiyflyymitiydfhyu.supabase.co:5432/postgres";

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

// Test Database Connection on startup
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to Supabase PostgreSQL');
  release();
});

// GET: All todos sorted by priority (High Impact, Low Effort)
app.get('/todos', async (req, res) => {
  try {
    const query = 'SELECT * FROM todo ORDER BY impact DESC, effort ASC, task_date ASC';
    const result = await pool.query(query);
    
    // Always return an array, even if empty
    res.json(result.rows || []); 
  } catch (err) {
    console.error("GET Error:", err.message);
    res.status(500).json({ error: "Database retrieval failed", details: err.message });
  }
});

// POST: Add new task
app.post('/todos', async (req, res) => {
  try {
    const { text, task_date, effort, impact } = req.body;
    
    // Basic validation
    if (!text || !task_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      INSERT INTO todo (text, task_date, effort, impact, completed) 
      VALUES ($1, $2, $3, $4, false) 
      RETURNING *
    `;
    const values = [text, task_date, effort, impact];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST Error:", err.message);
    res.status(500).json({ error: "Failed to save task", details: err.message });
  }
});

// DELETE: Remove task
app.delete('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM todo WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).send("Task not found");
    }
    res.status(200).send("Deleted successfully");
  } catch (err) {
    console.error("DELETE Error:", err.message);
    res.status(500).send(err.message);
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));