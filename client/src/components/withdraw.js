import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/context';

const Withdraw = () => {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const { userData, setUserData, refreshUserData} = useContext(AppContext);
  const backendURL = process.env.REACT_APP_BACKEND_URL;

  const handleWithdraw = async () => {
    if (!parseFloat(amount) || parseFloat(amount) <= 0) {
      setMessage('Please enter a valid withdrawal amount.');
      return;
    }
    if (parseFloat(amount) > userData.accounts[0].balance) {
      setMessage('The amount to withdraw exceeds the available balance!');
      return;
    }
    try {
      const response = await axios.post(`${backendURL}/transactions/withdraw/${userData._id}/${userData.accounts[0]._id}`, { amount: parseFloat(amount) });

      if (response.status >= 200 && response.status < 300) {
        await refreshUserData();
        const updatedBalance = userData.accounts[0].balance - parseFloat(amount);
        setUserData(prevData => ({
          ...prevData,
          accounts: [{
            ...prevData.accounts[0],
            balance: updatedBalance
          }]
        }));
        setMessage('Withdrawal was successful!');
      } else {
        setMessage(`Failed to withdraw: ${response.data.message || 'API call failed'}`);
      }
    } catch (error) {
      setMessage(`API call failed: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>Withdraw</h1>
      <p>Your Balance: ${userData && userData.accounts[0].balance}</p>
      <div>
        <label>
          Amount to Withdraw:
          <input 
            type="number"
            placeholder="Enter withdrawal amount"
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
          />
        </label>
        <button onClick={handleWithdraw}>Withdraw</button>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Withdraw;
