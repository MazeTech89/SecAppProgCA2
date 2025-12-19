import React, { useEffect, useState } from 'react';
import axios from 'axios';

// UserList component fetches user data from backend
function UserList() {
  // State to store user list
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  // Fetch users from backend when component mounts
  useEffect(() => {
    axios.get('/api/users')
      .then(res => setUsers(res.data))
      .catch(() => setError('Error connecting to backend'));
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
            <li key={user.id}>{user.username} ({user.email})</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserList;
