import React, { useContext } from 'react';
import { AppContext } from '../context/context';
import '../App.css';

const Balance = () => {
    const { userData } = useContext(AppContext);

    return (
        <div className='main-content'>
        <h1>Balance</h1>       
        {
          userData && userData.accounts && userData.accounts.length > 0 &&
        <div>
          <ul>
          {userData.accounts.map(account => (
            <li key={account._id}>
            <p>Account Number: {account.accountNumber} - Balance: ${account.balance}</p>
            {
              account.transactions && account.transactions.length > 0 &&
            <div>
                <h2>Movements</h2>
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Balance After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {account.transactions
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map(transaction => (
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

export default Balance;
