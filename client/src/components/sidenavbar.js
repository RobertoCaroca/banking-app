import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import '../styles/sidenavbar.css';

const SideNavbar = ({ user, handleLogout, userData }) => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
        await signOut(auth);
        navigate('/'); 
    } catch (error) {
        console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="app-wrapper">
      <div className="side-navbar">
        <Link className="navbar-brand" to="/">Rob's Bank</Link>
        
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
        <button className='danger' onClick={logout}>Logout</button>
      </div>
    </div>
  );
};

export default SideNavbar;
