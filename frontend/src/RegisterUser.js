import React, { useState } from 'react';
import axios from 'axios';
import { maybeGetCsrfToken } from './csrf';

function RegisterUser() {
  // Insecure registration: password is stored as plaintext by the backend.
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const csrfToken = await maybeGetCsrfToken();
    // Only username and password are used in backend
    axios.post('/register', {
      username: form.username,
      password: form.password
    }, {
      headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : undefined
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
