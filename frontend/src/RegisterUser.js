import React, { useState } from 'react';
import axios from 'axios';
import { getCsrfToken } from './csrf';

function RegisterUser() {
  // Registration UI. Note: `email` is kept for future extension; backend currently stores username + password hash.
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // Backend requires CSRF token for registration.
    const csrfToken = await getCsrfToken();
    axios.post('/register', {
      username: form.username,
      password: form.password
    }, {
      headers: { 'X-CSRF-Token': csrfToken }
    })
      .then(res => setMessage('Registration successful!'))
      .catch(() => setMessage('Registration failed.'));
  };

  return (
    <div>
      <h2>Register User</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} autoComplete="username" required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} autoComplete="new-password" required />
        <button type="submit">Register</button>
      </form>
      {message && <div>{message}</div>}
    </div>
  );
}

export default RegisterUser;
