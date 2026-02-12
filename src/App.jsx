import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:3001';

function App() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('personal');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const predefinedCategories = ['work', 'personal', 'fitness', 'wellness', 'others'];

  // Load todos from backend
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/todos`);
      if (!res.ok) throw new Error('Failed to fetch todos');
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (inputValue.trim() === '') return;

    const finalCategory = showCustomInput && customCategory.trim()
      ? customCategory.trim().toLowerCase()
      : selectedCategory;

    const newTodo = { text: inputValue, category: finalCategory, priority: 'medium' };

    try {
      const res = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo)
      });
      if (!res.ok) throw new Error('Failed to add todo');

      const savedTodo = await res.json();
      setTodos([...todos, savedTodo]);
      setInputValue('');
      setCustomCategory('');
      setShowCustomInput(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleTodo = async (id) => {
    const todoToUpdate = todos.find(t => t.id === id);
    try {
      const res = await fetch(`${API_URL}/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todoToUpdate.completed })
      });
      if (!res.ok) throw new Error('Failed to update todo');
      const updatedTodo = await res.json();
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const res = await fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete todo');
      setTodos(todos.filter(t => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    if (value === 'custom') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      setCustomCategory('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') addTodo();
  };

  const remainingCount = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t => t.completed).length;

  const getCategoryColor = (category) => {
    const colors = {
      work: '#9B3A3A',
      personal: '#5E657E',
      wellness: '#210706',
      fitness: '#4A7C59',
      home: '#FE6D2',
      others: '#8B7355'
    };
    return colors[category] || '#5E657E';
  };

  const getPriorityEmoji = (priority) => {
    const emojis = {
      high: '⭐',
      medium: '✨',
      low: '💫'
    };
    return emojis[priority] || '';
  };

  if (loading) return <p className="loading">Loading todos...</p>;

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1 className="title">My Daily Tasks</h1>
          <p className="subtitle">Elegant productivity, one task at a time</p>
        </header>

        {/* Stats */}
        <div className="stats-container">
          <div className="stat-card stat-todo">
            <div className="stat-number">{remainingCount}</div>
            <div className="stat-label">To Do</div>
          </div>
          <div className="stat-card stat-completed">
            <div className="stat-number">{completedCount}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card stat-total">
            <div className="stat-number">{todos.length}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>

        {/* Input Section */}
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="What's on your agenda today?"
            className="todo-input"
          />
          <select value={selectedCategory} onChange={handleCategoryChange} className="category-select">
            {predefinedCategories.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
            <option value="custom">+ Custom</option>
          </select>
          {showCustomInput && (
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Custom category..."
              className="custom-category-input"
            />
          )}
          <button onClick={addTodo} className="add-button">+ Add Task</button>
        </div>

        {/* Todos Grid */}
        <div className="todos-grid">
          {todos.map(todo => (
            <div key={todo.id} className={`todo-card ${todo.completed ? 'completed' : ''}`} style={{ borderTopColor: getCategoryColor(todo.category) }}>
              <div className="todo-header">
                <span className="priority-badge">{getPriorityEmoji(todo.priority)}</span>
                <button onClick={() => deleteTodo(todo.id)} className="delete-btn" aria-label="Delete todo">×</button>
              </div>
              <div className="todo-content" onClick={() => toggleTodo(todo.id)}>
                <div className={`checkbox ${todo.completed ? 'checked' : ''}`}>{todo.completed && <span className="checkmark">✓</span>}</div>
                <p className="todo-text">{todo.text}</p>
              </div>
              <div className="todo-footer">
                <span className="category-tag" style={{ backgroundColor: getCategoryColor(todo.category) }}>{todo.category}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {todos.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>All Clear</h3>
            <p>Time to add some new tasks</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
            <button onClick={fetchTodos} className="retry-button">Retry</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
