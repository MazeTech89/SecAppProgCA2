import React, { useState } from 'react';
import axios from 'axios';
import { getCsrfToken } from './csrf';

function LoginUser({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const csrfToken = await getCsrfToken();
    axios.post('http://localhost:4000/login', form, {
      headers: { 'X-CSRF-Token': csrfToken }
    })
      .then(res => {
        setMessage('Login successful!');
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        if (onLogin) onLogin();
      })
      .catch(() => setMessage('Login failed.'));
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit">Login</button>
      </form>
      {message && <div>{message}</div>}
    </div>
  );
}

export default LoginUser;
