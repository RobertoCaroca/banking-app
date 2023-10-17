import React from 'react';
import { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Home from './components/home';
import SideNavbar from './components/sidenavbar';
import CreateAccount from './components/createaccount';
import Login from './components/login';
import Deposit from './components/deposit';
import Withdraw from './components/withdraw';
import Balance from './components/balance';
import Transfer from './components/transfer';
import AllUsers from './components/allusers';
import UserBalance from './components/userbalance';
import { AppContext } from './context/context';

function App() {
  const [user, setUser] = useState(null);
  const { userData } = useContext(AppContext);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      {user ? (
        <>
        <div className="app-wrapper">
          <SideNavbar user={user} userData={userData} />
          <Routes>
            <Route path="/balance" element={<Balance />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/transfer" element={<Transfer />} />
            <Route path="/allusers" element={<AllUsers />} />
            <Route path="/userbalance/:userId" element={<UserBalance />} />
          </Routes>
        </div>
        </>
      ) : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
