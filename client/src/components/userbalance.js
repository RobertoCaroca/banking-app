import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../App.css';

const UserBalance = () => {
    const [userData, setUserData] = useState(null);
    const backendURL = process.env.REACT_APP_BACKEND_URL;
    const { userId } = useParams();
    console.log("UserId from useParams:", userId);

    useEffect(() => {
      console.log("Fetching user data for userId:", userId);

      const fetchUserData = async () => {
        if (userId) {  // Check if userId is available before making the fetch call
            const response = await fetch(`${backendURL}/users/details-by-id/${userId}`);
            const data = await response.json();
            setUserData(data);
        }
    }
  
      fetchUserData();
  }, [backendURL, userId]);

    const totalBalance = userData && userData.accounts 
      ? userData.accounts.reduce((acc, account) => acc + account.balance, 0) 
      : 0;

    return (
      <div>
        <h1>Balance</h1>
        <p>Total balance is ${totalBalance}</p>
        {
          userData && userData.accounts && userData.accounts.length > 0 &&
        <div>
          <h2>Accounts</h2>
          <ul>
          {userData.accounts.map(account => (
            <li key={account._id}>
            Account Number: {account.accountNumber} - Balance: ${account.balance}
            {
              account.transactions && account.transactions.length > 0 &&
              <div>
                <h3>Transaction History:</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Balance After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {account.transactions.map(transaction => (
                      <tr key={transaction._id}>
                        <td>{transaction.type}</td>
                        <td>{new Date(transaction.date).toLocaleDateString()}</td>
                        <td className={transaction.type === 'withdraw' || transaction.type === 'transfer-out' ? 'negative' : ''}>
                          {(transaction.type === 'withdraw' || transaction.type === 'transfer-out') ? `- $${transaction.amount}` : `$${transaction.amount}`}
                        </td>
                        <td>${transaction.balanceAfter}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
            </li>
          ))}
          </ul>
        </div>
        }
      </div>
    );
}

export default UserBalance;
