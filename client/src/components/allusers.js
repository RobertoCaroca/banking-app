import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/context';
import { Link } from 'react-router-dom';
import '../App.css';

const AllUsers = () => {
    const [users, setUsers] = useState([]);
    const { user, userData } = useContext(AppContext);
    const backendURL = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
      const fetchAllUsers = async () => {
        const token = localStorage.getItem('userToken');
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
      
        const response = await fetch(`${backendURL}/users/all`, { headers: headers }); 
        const data = await response.json();
        setUsers(data);
      }
  
      if (userData && userData.role === 'admin') {
        fetchAllUsers();
      }
    }, [backendURL, userData]);

    if (!userData || userData.role !== 'admin') {
        return <p>Permission Denied</p>;
    }

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
