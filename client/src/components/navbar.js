import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { AppContext } from '../context/context';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { userData, refreshUserData } = useContext(AppContext);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    // Cleanup the subscription
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div>
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <a className="navbar-brand" href="/">Brand</a>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ml-auto">
          {user ? (
            <>
              <li className="nav-item">
                <span className="navbar-text">Welcome, {user.displayName || user.email}</span>
              </li>
              <li className="nav-item">
                <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link className="btn btn-outline-primary" to="/create-account">Create Account</Link>
              </li>
              <li className="nav-item ml-2"> {/* Add margin left */}
                <Link className="btn btn-outline-primary" to="/login">Login</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
      {user && (
        <nav className="navbar navbar-expand-lg navbar-light bg-light mt-2">
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/balance">Balance</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/deposit">Deposit</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/withdraw">Withdraw</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/transfer">Transfer</Link>
              </li>
              {userData && userData.role === "admin" && (
                  <li className="nav-item">
                      <Link className="nav-link" to="/allusers">All Users</Link>
                  </li>
              )}
            </ul>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Navbar;
