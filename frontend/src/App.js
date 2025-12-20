

import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import UserList from './UserList';
import RegisterUser from './RegisterUser';
import LoginUser from './LoginUser';
import BlogPosts from './BlogPosts';

// Main App component for the frontend

function App() {
  return (
    <div>
      <h1>SecureApp Frontend</h1>
      <nav>
        <Link to="/login">Login</Link> |{' '}
        <Link to="/register">Register</Link> |{' '}
        <Link to="/posts">Blog Posts</Link>
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
