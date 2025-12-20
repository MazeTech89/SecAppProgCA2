import React, { useState } from 'react';
import axios from 'axios';

function LoginUser() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    axios.post('http://localhost:4000/login', form)
      .then(res => setMessage('Login successful!'))
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
