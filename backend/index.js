const fs = require('fs');
const path = require('path');
const TODOS_FILE = path.join(__dirname, 'todos.json');

// Load todos from JSON file
let todos = [];
let nextId = 1;

try {
  const data = fs.readFileSync(TODOS_FILE, 'utf-8');
  todos = JSON.parse(data);
  // update nextId so new todos get unique IDs
  nextId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;
} catch (err) {
  console.log('No existing todos file, starting fresh.');
}

// Helper to save todos to file
const saveTodos = () => {
  fs.writeFileSync(TODOS_FILE, JSON.stringify(todos, null, 2));
};

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());


// GET /todos - Get all todos
app.get('/todos', (req, res) => {
  res.json(todos);
});

// POST /todos - Add a new todo
app.post('/todos', (req, res) => {
  const { text, category, priority } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Todo text is required' });
  }

  const newTodo = {
    id: nextId++,
    text: text.trim(),
    completed: false,
    category: category || 'personal',
    priority: priority || 'medium'
  };

    todos.push(newTodo);
    saveTodos(); // <— save after adding
    res.status(201).json(newTodo);
});

// PUT /todos/:id - Toggle completed, optionally update category/priority
app.put('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);

  if (!todo) return res.status(404).json({ error: 'Todo not found' });

  // Toggle completed
    todo.completed = !todo.completed;
    saveTodos(); // <— save after toggling
    res.json(todo);

  // Optional updates
  if (req.body.category) todo.category = req.body.category;
  if (req.body.priority) todo.priority = req.body.priority;

  res.json(todo);
});

// DELETE /todos/:id - Delete a todo
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(t => t.id === id);

  if (index === -1) return res.status(404).json({ error: 'Todo not found' });

    todos.splice(index, 1);
    saveTodos(); // <— save after deleting
    res.json(deletedTodo);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});
app.get('/', (req, res) => {
  res.send('<h1>Welcome to the Todo API</h1><p>Go to <a href="/todos">/todos</a> to see the data.</p>');
});
// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Todo API server running on http://0.0.0.0:${PORT}`);
});
