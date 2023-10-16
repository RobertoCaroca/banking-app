import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/context';


const Deposit = () => {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const { userData, refreshUserData} = useContext(AppContext);
  const backendURL = process.env.REACT_APP_BACKEND_URL;

  const handleDeposit = async () => {
    if (!parseFloat(amount) || parseFloat(amount) <= 0) {
      setMessage('Please enter a valid deposit amount.');
      return;
    }
  
    try {
      const response = await axios.post(`${backendURL}/transactions/deposit/${userData._id}/${userData.accounts[0]._id}`, { amount: parseFloat(amount) });
      
      // Checking HTTP status code for success
      if (response.status >= 200 && response.status < 300) {
        await refreshUserData();
        setMessage('Deposit was successful!');
      } else {
        setMessage(`Failed to deposit: ${response.data.message || 'API call failed'}`);
      }
    } catch (error) {
      setMessage(`API call failed: ${error.message}`);
    }
  };
 
  return (
      <div className='main-content'>
        <h1>Deposit</h1>
        <p>Your Balance: ${userData && userData.accounts[0].balance}</p>
          <h3>Amount to Deposit:</h3>
          <div>
            <input 
                type="number"
                placeholder="Enter deposit amount"
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
              />
          </div>
        <div>
            <button onClick={handleDeposit} disabled={!amount || parseFloat(amount) <= 0}>Deposit</button>
            {message && <p>{message}</p>}
        </div>
      </div>
  );
};

export default Deposit;
