import React from 'react';
import axios from 'axios';
import { getCsrfToken } from './csrf';

function LogoutUser({ onLogout }) {
  const handleLogout = async () => {
    const csrfToken = await getCsrfToken();
    // Remove JWT from localStorage/sessionStorage if used
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    await axios.post('http://localhost:4000/logout', {}, {
      headers: { 'X-CSRF-Token': csrfToken }
    });
    if (onLogout) onLogout();
    // No reload; App.js will handle UI update and navigation
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
}

export default LogoutUser;
