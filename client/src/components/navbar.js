import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar bg-body-tertiary">
      <div className="container-fluid">
      <a className="navbar-brand" to="/">Rob's Bank</a>
        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
          <Link className="btn btn-secondary" to="/create-account">Create Account</Link>
          </li>
          <li className="nav-item"> 
          <Link className="btn btn-primary" to="/login">Login</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
