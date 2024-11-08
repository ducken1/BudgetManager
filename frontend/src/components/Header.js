// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ isLoggedIn, username, onLogout }) => {
  return (
    <header>
      <nav>
        <h1>Budget Manager</h1>
        <div>
          {isLoggedIn ? (
            <>
              <span>Hello, {username}</span>
              <Link to="/">Home</Link>
              <Link to="/dashboard">Dashboard</Link>
              <button onClick={onLogout}>Logout</button> {/* Logout button */}
            </>
          ) : (
            <>
              <Link to="/">Home</Link>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
