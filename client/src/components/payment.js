import React, { useState, useContext } from 'react';
import { AppContext } from '../context/context';
import axios from 'axios';

const Payment = () => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const { userData, setUserData } = useContext(AppContext);
  const backendURL = process.env.REACT_APP_BACKEND_URL;

  const handlePayment = async () => {
    if (!parseFloat(amount) || parseFloat(amount) <= 0) {
      setMessage('Please enter a valid payment amount.');
      return;
    }
    if (parseFloat(amount) > userData.accounts[0].balance) {
      setMessage('The amount to pay exceeds the available balance!');
      return;
    }
    if (!recipient) {
      setMessage('Please enter a valid recipient account number.');
      return;
    }

    try {
      const response = await axios.post(`${backendURL}/transactions/payment`, {
        fromUserId: userData._id,
        fromAccountId: userData.accounts[0]._id,
        toAccountNumber: recipient,
        amount: parseFloat(amount)
      });

      if (response.status >= 200 && response.status < 300) {
        const updatedBalance = userData.accounts[0].balance - parseFloat(amount);
        setUserData(prevData => ({
          ...prevData,
          accounts: [{
            ...prevData.accounts[0],
            balance: updatedBalance
          }]
        }));
        setMessage('Payment was successful!');
      } else {
        setMessage(`Failed to make payment: ${response.data.message || 'API call failed'}`);
      }
    } catch (error) {
      setMessage(`API call failed: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>Make a Payment</h1>
      <p>Your Balance: ${userData && userData.accounts[0].balance}</p>
      <div>
        <label>
          Amount to Pay:
          <input 
            type="number"
            placeholder="Enter payment amount"
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
          />
        </label>
        <label>
          Recipient Account Number:
          <input 
            type="text"
            placeholder="Enter recipient account number"
            value={recipient} 
            onChange={(e) => setRecipient(e.target.value)} 
          />
        </label>
        <button onClick={handlePayment}>Pay</button>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Payment;
