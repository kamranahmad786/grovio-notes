import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Plus, Trash2, Search, Save, Loader2, BookOpen, 
  Edit3, Menu, X, Eye, LogOut, History, Hash, Clock,
  Sun, Moon
} from 'lucide-react';
import { debounce } from 'lodash';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { AuthForms } from './components/Auth/AuthForms';

const API_URL = 'http://localhost:5001/api';

function App() {
  const { user, logout, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState('edit'); 
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [versions, setVersions] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Fetch all notes
  const fetchNotes = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${API_URL}/notes`);
      setNotes(data);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  // Debounced Save
  const saveNote = useCallback(
    debounce(async (id, title, content, tags) => {
      setIsSaving(true);
      try {
        await axios.put(`${API_URL}/notes/${id}`, { 
          title, 
          content, 
          tags: tags.map(t => typeof t === 'string' ? t : t.name) 
        });
        setNotes(prev => prev.map(n => n.id === id ? { ...n, title, content, tags, updated_at: new Date().toISOString() } : n));
      } catch (err) {
        console.error('Save error:', err);
      } finally {
        setTimeout(() => setIsSaving(false), 500);
      }
    }, 1000),
    []
  );

  const handleUpdateNote = (field, value) => {
    if (!activeNote) return;
    const updatedNotes = notes.map(n => 
      n.id === activeNoteId ? { ...n, [field]: value } : n
    );
    setNotes(updatedNotes);
    
    const note = updatedNotes.find(n => n.id === activeNoteId);
    saveNote(note.id, note.title, note.content, note.tags || []);
  };

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const newTags = [...(activeNote.tags || []), tagInput.trim()];
      handleUpdateNote('tags', newTags);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    const newTags = activeNote.tags.filter(t => (typeof t === 'string' ? t : t.name) !== tagToRemove);
    handleUpdateNote('tags', newTags);
  };

  const createNote = async () => {
    try {
      const { data } = await axios.post(`${API_URL}/notes`, { title: 'New Note', content: '' });
      setNotes([{...data, tags: []}, ...notes]);
      setActiveNoteId(data.id);
      setIsSidebarOpen(false);
    } catch (err) {
      console.error('Create error:', err);
    }
  };

  const deleteNote = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await axios.delete(`${API_URL}/notes/${id}`);
      setNotes(notes.filter(n => n.id !== id));
      if (activeNoteId === id) setActiveNoteId(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const fetchVersions = async () => {
    if (!activeNoteId) return;
    try {
      const { data } = await axios.get(`${API_URL}/notes/${activeNoteId}/versions`);
      setVersions(data);
      setIsHistoryOpen(true);
    } catch (err) {
      console.error('Fetch versions error:', err);
    }
  };

  const restoreVersion = (content) => {
    handleUpdateNote('content', content);
    setIsHistoryOpen(false);
  };

  if (!token) {
    return <AuthForms />;
  }

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (n.tags && n.tags.some(t => (typeof t === 'string' ? t : t.name).toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      <aside className={`sidebar ${isSidebarOpen ? 'visible' : ''}`}>
        <div className="sidebar-header" style={{ padding: '1.25rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
              <img src="/favicon.png" alt="Logo" style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'contain', filter: theme === 'dark' ? 'invert(1) brightness(2)' : 'none' }} />
              <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>Grovio</h1>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <button className="logout-btn" onClick={toggleTheme} title="Theme" style={{ padding: '0.35rem' }}>
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              <button className="logout-btn" onClick={logout} title="Logout" style={{ padding: '0.35rem' }}>
                <LogOut size={14} />
              </button>
              <button className="new-note-btn" onClick={createNote} style={{ padding: '0.4rem 0.6rem' }}>
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="search-container">
          <div style={{position: 'relative'}}>
            <Search size={16} style={{position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8'}} />
            <input 
              className="search-input" 
              placeholder="Search notes or tags..." 
              style={{paddingLeft: '35px'}}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="notes-list">
          {filteredNotes.map(note => (
            <div 
              key={note.id} 
              className={`note-item ${activeNoteId === note.id ? 'active' : ''}`}
              onClick={() => { setActiveNoteId(note.id); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
            >
              <h3>{note.title || 'Untitled'}</h3>
              <p>{note.content ? note.content.substring(0, 40) + '...' : 'Empty note'}</p>
              <div className="tag-pills" style={{marginTop: '0.5rem'}}>
                {note.tags?.map((tag, i) => (
                  <span key={i} className="tag-pill" style={{fontSize: '0.6rem'}}>
                    {typeof tag === 'string' ? tag : tag.name}
                  </span>
                ))}
              </div>
              <button className="delete-btn" onClick={(e) => deleteNote(note.id, e)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <main className="main-content">
        <header className="mobile-header" style={{ padding: '0.75rem 1rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(true)} style={{ padding: 0 }}>
              <Menu size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/favicon.png" alt="Logo" style={{ width: '24px', height: '24px', objectFit: 'contain', filter: theme === 'dark' ? 'invert(1) brightness(2)' : 'none' }} />
              <h2 className="mobile-logo" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Grovio</h2>
            </div>
          </div>
          <button className="nav-btn" onClick={toggleTheme} style={{ background: 'rgba(255,255,255,0.05)' }}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        {activeNote ? (
          <>
            <div className="editor-header">
              <input 
                className="title-input" 
                value={activeNote.title}
                onChange={(e) => handleUpdateNote('title', e.target.value)}
              />
              <div className="editor-controls">
                <button className="nav-btn" onClick={fetchVersions} title="History">
                  <History size={18} />
                </button>
                <div className="view-switcher-mobile">
                  <button className={`nav-btn ${viewMode === 'edit' ? 'active' : ''}`} onClick={() => setViewMode('edit')}><Edit3 size={16} /></button>
                  <button className={`nav-btn ${viewMode === 'preview' ? 'active' : ''}`} onClick={() => setViewMode('preview')}><Eye size={16} /></button>
                </div>
                <div className="status-indicator">
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                </div>
              </div>
            </div>

            <div className="tags-input-container" style={{padding: '0 2rem'}}>
                <div className="tag-pills">
                  {activeNote.tags?.map((tag, i) => {
                    const tagName = typeof tag === 'string' ? tag : tag.name;
                    return (
                      <span key={i} className="tag-pill">
                        <Hash size={10} /> {tagName}
                        <button onClick={() => removeTag(tagName)}><X size={10} /></button>
                      </span>
                    );
                  })}
                  <input 
                    className="tag-input"
                    placeholder="+ Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                  />
                </div>
            </div>

            <div className={`editor-panes ${viewMode}`}>
              <div className={`editor-pane ${viewMode === 'edit' ? 'mobile-show' : 'mobile-hide'}`}>
                <textarea 
                  value={activeNote.content}
                  onChange={(e) => handleUpdateNote('content', e.target.value)}
                />
              </div>
              <div className={`preview-pane ${viewMode === 'preview' ? 'mobile-show' : 'mobile-hide'}`}>
                <div className="preview-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeNote.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <BookOpen size={48} />
            <h2>Welcome, {user?.email.split('@')[0]}</h2>
            <button className="new-note-btn" onClick={createNote}>Create Your First Note</button>
          </div>
        )}
      </main>

      {/* Version History Modal */}
      {isHistoryOpen && (
        <div className="modal-overlay" onClick={() => setIsHistoryOpen(false)}>
          <div className="version-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Version History</h3>
              <button onClick={() => setIsHistoryOpen(false)}><X size={20} /></button>
            </div>
            <div className="version-list">
              {versions.length === 0 ? (
                <div style={{padding: '2rem', textAlign: 'center', color: '#64748b'}}>No versions recorded yet</div>
              ) : versions.map(v => (
                <div key={v.id} className="version-item">
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <Clock size={16} color="#6366f1" />
                    <div>
                      <div style={{fontSize: '0.9rem'}}>{new Date(v.created_at).toLocaleString()}</div>
                      <div style={{fontSize: '0.75rem', color: '#64748b'}}>{v.content.substring(0, 30)}...</div>
                    </div>
                  </div>
                  <button className="nav-btn" onClick={() => restoreVersion(v.content)} style={{color: '#6366f1'}}>Restore</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
