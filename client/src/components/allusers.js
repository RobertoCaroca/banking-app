import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AllUsers = () => {
    const [users, setUsers] = useState([]);
    const backendURL = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await fetch(`${backendURL}/users/all`);
            const data = await response.json();
            setUsers(data);
        }

        fetchUsers();
    }, [backendURL]);

    return (
        <div>
            <h1>All Users</h1>
            <table>
                <thead>
                    <tr>
                        <th>Role</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Savings Account Number</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => {
                        const savingsAccount = user.accounts.find(account => account.accountType === 'savings');
                        return (
                            <tr key={user._id}>
                                <td>{user.role}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{savingsAccount?.accountNumber || 'N/A'}</td>
                                <td>{savingsAccount?.balance || 0}</td>
                                <td>
                                    <Link to={`/userbalance/${user._id}`}>Show Balance</Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default AllUsers;
