import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // No authentication, just continue
    if (onLogin) onLogin();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/login-logo.png" alt="Login Logo" className="login-logo" />
        <h1 className="login-title">SUPERHEROES</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="login-username" className="sr-only">Username</label>
            <span className="input-icon">
              <svg width="24" height="24" fill="#7b8ca3" viewBox="0 0 24 24"><path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4zm0-2a4 4 0 100-8 4 4 0 000 8z"/></svg>
            </span>
            <input id="login-username" type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div className="input-group">
            <label htmlFor="login-password" className="sr-only">Password</label>
            <span className="input-icon">
              <svg width="24" height="24" fill="#7b8ca3" viewBox="0 0 24 24"><path d="M12 17a2 2 0 002-2v-2a2 2 0 00-4 0v2a2 2 0 002 2zm6-6V9a6 6 0 10-12 0v2a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2zm-8-2a4 4 0 118 0v2H6V9z"/></svg>
            </span>
            <input id="login-password" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button className="login-btn" type="submit">LOG IN</button>
          <div className="forgot-password">
            <a href="#">Forgot password?</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
