import React from 'react';
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
        <button className="home-btn">Create Account</button>
      </div>
      <div className="footer">@roberto.caroca - 2023</div>
    </div>
    </>
  );
}

export default Home;
