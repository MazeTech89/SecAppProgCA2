import React, { useState } from 'react';
import axios from 'axios';

function RegisterUser() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Only username and password are used in backend
    axios.post('http://localhost:4000/register', {
      username: form.username,
      password: form.password
    })
      .then(res => setMessage('Registration successful!'))
      .catch(() => setMessage('Registration failed.'));
  };

  return (
    <div>
      <h2>Register User</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
      {message && <div>{message}</div>}
    </div>
  );
}

export default RegisterUser;
