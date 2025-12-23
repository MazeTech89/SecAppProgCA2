import React, { useEffect, useState } from 'react';
import axios from 'axios';

// UserList
// Purpose: show the authenticated user's view of the user directory.
// Security: backend returns minimal fields (id + username) and requires JWT.
function UserList() {

  // State to store user list
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  // Fetch users once on mount.
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      setError('Not authenticated. Please log in.');
      return;
    }
    // JWT is sent in Authorization header.
    axios.get('/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setUsers(res.data);
        setError('');
      })
      .catch(() => {
        setUsers([]);
        setError('Failed to fetch users. Are you logged in?');
      });
  }, []);

  // Display the user list or error
  return (
    <div>
      <h2>User List</h2>
      {error ? (
        <div>{error}</div>
      ) : (
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.username}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserList;
