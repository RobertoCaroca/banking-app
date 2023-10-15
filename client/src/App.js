import React from 'react';
import { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import Home from './components/home';
import Navbar from './components/navbar';
import SideNavbar from './components/sidenavbar';
import CreateAccount from './components/createaccount';
import Login from './components/login';
import Deposit from './components/deposit';
import Withdraw from './components/withdraw';
import Balance from './components/balance';
import Transfer from './components/transfer';
import Payment from './components/payment';
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <Router>
      <div className="app-wrapper">
        {user ? <SideNavbar user={user} handleLogout={handleLogout} userData={userData} /> : <Navbar />}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/login" element={<Login />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/balance" element={<Balance />} />
            <Route path="/transfer" element={<Transfer />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/allusers" element={<AllUsers />} />
            <Route path="/userbalance/:userId" element={<UserBalance />} />
          </Routes>
        </div>
       </div> 
    </Router>
  );
}

export default App;
