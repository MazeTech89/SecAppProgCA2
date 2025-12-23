// InsecureApp frontend shell
// Purpose: simple router + navigation for the insecure demo flows.
import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import UserList from './UserList';
import RegisterUser from './RegisterUser';
import LoginUser from './LoginUser';
import BlogPosts from './BlogPosts';

function App() {
  const navigate = useNavigate();

  // Demo logout: just navigates back to login (no token/session to clear on insecure branch).
  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div>
      <h1>SecureApp Frontend</h1>
      <nav>
        <Link to="/login">Login</Link> |{' '}
        <Link to="/register">Register</Link> |{' '}
        <Link to="/posts">Blog Posts</Link> |{' '}
        <button onClick={handleLogout} style={{marginLeft: 8}}>Logout</button>
      </nav>
      <Routes>
        <Route path="/login" element={<LoginUser />} />
        <Route path="/register" element={<RegisterUser />} />
        <Route path="/posts" element={<BlogPosts />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/" element={<LoginUser />} />
      </Routes>
    </div>
  );
}

export default App;
