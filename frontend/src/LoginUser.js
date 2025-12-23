import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { maybeGetCsrfToken } from './csrf';

function LoginUser() {
  // Insecure login: backend returns success message only (no JWT), used for navigation demo.
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const csrfToken = await maybeGetCsrfToken();
    axios.post('/login', form, {
      headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : undefined
    })
      .then(res => {
        setMessage('Login successful!');
        if (res.data && res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        setTimeout(() => navigate('/posts'), 500); // Redirect after short delay
      })
      .catch(() => setMessage('Login failed.'));
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} autoComplete="username" required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} autoComplete="current-password" required />
        <button type="submit">Login</button>
      </form>
      {message && <div>{message}</div>}
    </div>
  );
}

export default LoginUser;
