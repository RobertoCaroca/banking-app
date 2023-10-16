import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './navbar';
import '../styles/home.css';

function Home() {
  return (
    <>
    <div className="home-wrapper">
      <Navbar />
      <div className="home-content">
        <p className="lead">Open your account for <span className='emphasis'>Free!</span></p>
        <p className="claim"> Not interest or hide payments</p>
        <Link className="home-btn" to="/create-account">Create Account</Link>      </div>
      <div className="footer">@roberto.caroca - 2023</div>
    </div>
    </>
  );
}

export default Home;
