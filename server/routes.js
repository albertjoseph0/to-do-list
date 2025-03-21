const express = require('express');
const router = express.Router();
const { db } = require('./database/schema');

// GET all tasks
router.get('/tasks', (req, res) => {
  db.all('SELECT * FROM tasks ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET a single task
router.get('/tasks/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(row);
  });
});

// POST a new task
router.post('/tasks', (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  db.run(
    'INSERT INTO tasks (title, description) VALUES (?, ?)',
    [title, description || ''],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json(row);
      });
    }
  );
});

// PUT (update) a task
router.put('/tasks/:id', (req, res) => {
  const id = req.params.id;
  const { title, description, completed } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  db.run(
    'UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?',
    [title, description || '', completed ? 1 : 0, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(row);
      });
    }
  );
});

// PATCH (partial update) a task
router.patch('/tasks/:id', (req, res) => {
  const id = req.params.id;
  const { completed } = req.body;
  
  if (completed === undefined) {
    return res.status(400).json({ error: 'Completed status is required' });
  }

  db.run(
    'UPDATE tasks SET completed = ? WHERE id = ?',
    [completed ? 1 : 0, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(row);
      });
    }
  );
});

// DELETE a task
router.delete('/tasks/:id', (req, res) => {
  const id = req.params.id;
  
  db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted', id });
  });
});

module.exports = router;