import React from 'react';
import { Link } from 'react-router-dom';

const SideNavbar = ({ user, handleLogout, userData }) => {
  return (
    <div className="app-wrapper">
      <div className="side-navbar">
        <Link className="navbar-brand" to="/">Brand</Link>
        
        {/* Display the user's name or email */}
        <span>Welcome, {user.displayName || user.email}</span>

        {/* Links accessible to the logged-in user */}
        <Link to="/balance">Balance</Link>
        <Link to="/deposit">Deposit</Link>
        <Link to="/withdraw">Withdraw</Link>
        <Link to="/transfer">Transfer</Link>

        {/* Admin specific link */}
        {userData && userData.role === "admin" && (
          <Link to="/allusers">All Users</Link>
        )}

        {/* Logout Button */}
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default SideNavbar;
