import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/context';
import '../App.css';

const UserBalance = () => {
    const [requesterData, setRequesterData] = useState(null);
    const [targetData, setTargetData] = useState(null);
    const { userData } = useContext(AppContext);
    const backendURL = process.env.REACT_APP_BACKEND_URL;
    const { userId } = useParams();

    console.log("Target User Data:", targetData);

    useEffect(() => {
        const fetchUserData = async () => {
            if (userId) {
                const token = localStorage.getItem('userToken');
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                try {
                    const response = await axios.get(`${backendURL}/users/details/${userId}`, { headers: headers });
                    const data = response.data;

                    if (data && typeof data === 'object' && data.target && data.requester) {
                        setRequesterData(data.requester);
                        setTargetData(data.target);
                    } else {
                        console.error("Unexpected data format:", data);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        }

        fetchUserData();
    }, [backendURL, userId]);

    const totalBalance = targetData && targetData.accounts 
        ? targetData.accounts.reduce((acc, account) => acc + account.balance, 0) 
        : 0;

    // Immediately check if userData is available
    if (!userData) {
        return <p>Permission Denied</p>;
    }

    // Check if the requester's role is admin before rendering the main content.
    if (requesterData && requesterData.role !== 'admin') {
        return <p>Permission Denied</p>;
    }

    return (
        <div className='main-content'>
            <h1>Balance</h1>
            <p>Total balance is ${totalBalance}</p>
            {
                targetData && targetData.accounts && targetData.accounts.length > 0 &&
                <div>
                    <h2>Accounts</h2>
                    <ul>
                        {targetData.accounts.map(account => (
                            <li key={account._id}>
                                Account Number: {account.accountNumber} - Balance: ${account.balance}
                                {
                                    account.transactions && account.transactions.length > 0 &&
                                    <div>
                                        <h3>Transaction History:</h3>
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

export default UserBalance;
