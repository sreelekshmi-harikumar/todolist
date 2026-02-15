const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
// Render uses process.env.PORT, so we use that or 3001 locally
const PORT = process.env.PORT || 3001; 

// 1. Middleware
app.use(cors());
app.use(express.json());

// 2. MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// 3. Define the Todo Schema (The blueprint for your data)
const todoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  category: { type: String, default: 'personal' },
  priority: { type: String, default: 'medium' }
});

const Todo = mongoose.model('Todo', todoSchema);

// 4. API Routes

// GET /todos - Get all todos from MongoDB
app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// POST /todos - Add a new todo to MongoDB
app.post('/todos', async (req, res) => {
  const { text, category, priority } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Todo text is required' });
  }

  try {
    const newTodo = new Todo({
      text: text.trim(),
      completed: false,
      category: category || 'personal',
      priority: priority || 'medium'
    });

    await newTodo.save(); // Saves to the cloud database
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save todo' });
  }
});

// PUT /todos/:id - Toggle completed
app.put('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });

    todo.completed = !todo.completed;
    
    if (req.body.category) todo.category = req.body.category;
    if (req.body.priority) todo.priority = req.body.priority;

    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// DELETE /todos/:id - Delete a todo
app.delete('/todos/:id', async (req, res) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
    if (!deletedTodo) return res.status(404).json({ error: 'Todo not found' });
    res.json(deletedTodo);
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Health check and root
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/', (req, res) => {
  res.send('<h1>Welcome to the Todo API</h1><p>Go to <a href="/todos">/todos</a> to see the data.</p>');
});

// 5. Start server
app.listen(PORT, () => {
  console.log(`🚀 Todo API server running on port ${PORT}`);
});