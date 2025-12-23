// Frontend app shell
// Purpose: minimal React router + auth gate (token present => protected routes available).
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import UserList from './UserList';
import RegisterUser from './RegisterUser';
import LoginUser from './LoginUser';
import BlogPosts from './BlogPosts';
import LogoutUser from './LogoutUser';

function App() {
  // Auth state is derived from the presence of a JWT stored in browser storage.
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on page load.
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // Keep auth state in sync across tabs/windows.
  useEffect(() => {
    const handleStorage = () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      setIsAuthenticated(!!token);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Called by the login component after it stores the JWT.
  const handleLogin = () => {
    setIsAuthenticated(true);
    window.location.href = '/users';
  };

  // Called by the logout component after it clears storage.
  const handleLogout = () => {
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="App">
        <h1>Secure/Insecure Demo App</h1>
        <nav>
          <ul>
            {!isAuthenticated && <li><Link to="/login">Login</Link></li>}
            {!isAuthenticated && <li><Link to="/register">Register</Link></li>}
            {isAuthenticated && <li><Link to="/users">User List</Link></li>}
            {isAuthenticated && <li><Link to="/logout">Logout</Link></li>}
          </ul>
        </nav>
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/users" /> : <LoginUser onLogin={handleLogin} />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/users" /> : <RegisterUser />} />
          <Route path="/users" element={isAuthenticated ? <><UserList /><BlogPosts /></> : <Navigate to="/login" />} />
          <Route path="/logout" element={isAuthenticated ? <LogoutUser onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/users" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
