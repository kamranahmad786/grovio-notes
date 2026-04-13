import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, UserPlus, LogIn, Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

export const AuthForms = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const { data } = await axios.post(`${API_URL}${endpoint}`, { email, password });
      
      if (isLogin) {
        login(data.token, data.user);
      } else {
        setSuccess('Registration successful! Please login.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <img src="/favicon.png" alt="Logo" style={{width: '64px', height: '64px', borderRadius: '12px', marginBottom: '1.5rem', objectFit: 'contain', filter: 'brightness(1.2)'}} />
          <h1 style={{margin: 0, fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-main)'}}>Grovio</h1>
          <p style={{marginTop: '0.75rem', opacity: 0.7, fontSize: '1rem'}}>{isLogin ? 'Welcome back' : 'Create your account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success" style={{
            background: 'rgba(34, 197, 94, 0.1)',
            color: '#22c55e',
            padding: '0.75rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            textAlign: 'center'
          }}>{success}</div>}
          
          <div className="input-group">
            <Mail size={18} />
            <input 
              type="email" 
              placeholder="Email address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <Lock size={18} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? <LogIn size={20} /> : <UserPlus size={20} />)}
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};
