
import React from 'react';
import UserList from './UserList';
import RegisterUser from './RegisterUser';
import LoginUser from './LoginUser';

// Main App component for the frontend
function App() {
  return (
    <div>
      {/* Application title */}
      <h1>SecureApp Frontend</h1>
      {/* Registration and Login Forms */}
      <RegisterUser />
      <LoginUser />
      {/* Renders UserList component which fetches backend user data */}
      <UserList />
    </div>
  );
}

export default App;
