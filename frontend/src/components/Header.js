// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import "./AuthStyles.css";

const Header = ({ isLoggedIn, username, onLogout }) => {
  return (
    <header className="header">
      <h1 className="header-title">Budget Manager</h1>
      <nav className="nav-links">
        {isLoggedIn ? (
          <>
            <span className="username">Pozdravljen, {username}</span>
            <Link to="/">Domov</Link>
            <Link to="/dashboard">Dashboard</Link>
            <button className="logout-button" onClick={onLogout}>Odjava</button>
          </>
        ) : (
          <>
            <Link to="/">Domov</Link>
            <Link to="/login">Prijava</Link>
            <Link to="/register">Registracija</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
