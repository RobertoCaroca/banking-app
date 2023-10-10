import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/navbar';
import Home from './components/home';
import CreateAccount from './components/createaccount';
import Login from './components/login';
import Deposit from './components/deposit';
import Withdraw from './components/withdraw';
import Balance from './components/balance';
import Transfer from './components/transfer';
import Payment from './components/payment';
import AllUsers from './components/allusers';
import UserBalance from './components/userbalance';
import { AppContextProvider } from './context/context';

function App() {
  return (
    <Router>
      <AppContextProvider>
        <NavBar />
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
      </AppContextProvider>
    </Router>
  );
}

export default App;
