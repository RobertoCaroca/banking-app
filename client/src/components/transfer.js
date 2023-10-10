import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/context';

const Transfer = () => {
    const { userData, setUserData, refreshUserData} = useContext(AppContext);
    const [transferAmount, setTransferAmount] = useState('');
    const [searchTerm, setSearchTerm] = useState("");
    const [usersList, setUsersList] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const backendURL = process.env.REACT_APP_BACKEND_URL;

    const handleTransfer = async () => {
        console.log('Debug selectedUser:', selectedUser);

        if (!parseFloat(transferAmount) || parseFloat(transferAmount) <= 0) {
            setMessage('Please enter a valid transfer amount.');
            return;
        }
        if (parseFloat(transferAmount) > userData.accounts[0].balance) {
            setMessage('The amount to transfer exceeds the available balance!');
            return;
        }
        if (!selectedUser || !selectedUser._id || !selectedUser.savingsAccountNumber) {
            setMessage('Please select a valid user to transfer to.');
            return;
        }
        setShowModal(true);
    };

  const confirmTransfer = async () => {
    try {
        const response = await axios.post(`${backendURL}/transactions/transfer/${userData._id}/${userData.accounts[0]._id}`, {
            toAccountNumber: selectedUser.savingsAccountNumber,  // Changed this line
            amount: parseFloat(transferAmount)
        });

      if (response.status >= 200 && response.status < 300) {
        await refreshUserData();
        const updatedBalance = userData.accounts[0].balance - parseFloat(transferAmount);
        setUserData(prevData => ({
          ...prevData,
          accounts: [{
            ...prevData.accounts[0],
            balance: updatedBalance
          }]
        }));
        setMessage('Transfer was successful!');
      } else {
        setMessage(`Failed to transfer: ${response.data.message || 'API call failed'}`);
      }
    } catch (error) {
      setMessage(`API call failed: ${error.message}`);
    }
  };

  const searchUsers = async () => {
    setLoading(true);
    try {
        const response = await axios.get(`${backendURL}/users/search-users?term=${searchTerm}`);
        if (response.data.length === 0) {
            setMessage('No users found.');
        } else {
            setUsersList(response.data);
            if (response.data.length === 1) {
                setSelectedUser(response.data[0]);
            } else {
                setMessage('Multiple users found. Please select one.');
            }
        }
    } catch (error) {
        setMessage("Failed to fetch users. Try again.");
        console.error("API call failed:", error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div>
        <h1>Transfer</h1>
        <p>Your Balance: ${userData.accounts[0].balance}</p>
        <div>
            <label>
                Transfer Amount:
                <input 
                    type="number"
                    placeholder="Enter amount to transfer"
                    value={transferAmount} 
                    onChange={(e) => setTransferAmount(e.target.value)} 
                />
            </label>
        </div>
        <div>
            <input 
                type="text"
                placeholder="Search user by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <button onClick={searchUsers}>Search</button>
            {loading && <span>Loading...</span>}
        </div>
        {usersList.length > 0 && 
            <div>
                <h2>Select a user to transfer to:</h2>
                <ul>
                {usersList.map(user => (
                    <li key={user._id} onClick={() => {
                        console.log("Selected User: ", user);
                        setSelectedUser(user);
                    }}>
                        {user.name} ({user.email})
                    </li>
                ))}
                </ul>
            </div>
        }
        <button onClick={handleTransfer}>Transfer</button>
        {showModal && 
            <div>
                <p>Confirm transfer of ${transferAmount} to {selectedUser.name}?</p>
                <button onClick={confirmTransfer}>Yes, Transfer</button>
                <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
        }
        {message && <p>{message}</p>}
    </div>
);
};

export default Transfer;