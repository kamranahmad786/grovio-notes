const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { db, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Deployment CORS Configuration
const corsOptions = {
  origin: '*', // For production, you can replace this with your Vercel URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Debug Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Initialize Database
initDb().catch(err => console.error('DB Init Error:', err));

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.userId = user.userId;
    next();
  });
};

// Auth Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Protected Routes
// Get all notes for user
app.get('/api/notes', authenticateToken, async (req, res) => {
  try {
    const notes = await db('notes')
      .where({ user_id: req.userId })
      .select('*')
      .orderBy('updated_at', 'desc');
    
    // Attach tags to each note
    const notesWithTags = await Promise.all(notes.map(async (note) => {
      const tags = await db('tags')
        .join('note_tags', 'tags.id', 'note_tags.tag_id')
        .where('note_tags.note_id', note.id)
        .select('tags.*');
      return { ...note, tags };
    }));

    res.json(notesWithTags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single note
app.get('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const note = await db('notes').where({ id: req.params.id, user_id: req.userId }).first();
    if (!note) return res.status(404).json({ error: 'Note not found' });
    
    const tags = await db('tags')
      .join('note_tags', 'tags.id', 'note_tags.tag_id')
      .where('note_tags.note_id', note.id)
      .select('tags.*');
    
    res.json({ ...note, tags });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new note
app.post('/api/notes', authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  try {
    const [id] = await db('notes').insert({ 
      user_id: req.userId,
      title, 
      content: content || '',
      updated_at: db.fn.now(),
      created_at: db.fn.now()
    });
    const newNote = await db('notes').where({ id }).first();
    res.status(201).json(newNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a note + Create Version
app.put('/api/notes/:id', authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  try {
    const note = await db('notes').where({ id: req.params.id, user_id: req.userId }).first();
    if (!note) return res.status(404).json({ error: 'Note not found' });

    // Create version snapshot before updating if content changed significantly or periodically
    // For simplicity, we'll create a version every 5 saves or so, or just on every explicit save
    await db('note_versions').insert({ note_id: req.params.id, content: note.content });

    await db('notes')
      .where({ id: req.params.id })
      .update({ 
        title, 
        content, 
        updated_at: db.fn.now() 
      });

    // Handle tags if provided
    if (tags) {
      await db('note_tags').where({ note_id: req.params.id }).del();
      for (const tagName of tags) {
        let tag = await db('tags').where({ name: tagName }).first();
        if (!tag) {
          const [tagId] = await db('tags').insert({ name: tagName });
          tag = { id: tagId, name: tagName };
        }
        await db('note_tags').insert({ note_id: req.params.id, tag_id: tag.id });
      }
    }

    const updatedNote = await db('notes').where({ id: req.params.id }).first();
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a note
app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await db('notes').where({ id: req.params.id, user_id: req.userId }).del();
    if (!deleted) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Version History
app.get('/api/notes/:id/versions', authenticateToken, async (req, res) => {
  try {
    const note = await db('notes').where({ id: req.params.id, user_id: req.userId }).first();
    if (!note) return res.status(404).json({ error: 'Note not found' });
    
    const versions = await db('note_versions')
      .where({ note_id: req.params.id })
      .orderBy('created_at', 'desc')
      .limit(10);
    res.json(versions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Debug Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
