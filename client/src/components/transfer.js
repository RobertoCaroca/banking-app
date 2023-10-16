import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/context';
import '../styles/transfer.css';

const Transfer = () => {
    const { userData, setUserData, refreshUserData} = useContext(AppContext);
    const [transferAmount, setTransferAmount] = useState('');
    const [searchTerm, setSearchTerm] = useState("");
    const [usersList, setUsersList] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchMessage, setSearchMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const backendURL = process.env.REACT_APP_BACKEND_URL;

    let balance = 0;
    if (userData && userData.accounts && userData.accounts.length > 0) {
        balance = userData.accounts[0].balance;
    }

    const handleTransfer = async () => {

        if (!parseFloat(transferAmount) || parseFloat(transferAmount) <= 0) {
            setErrorMessage('Please enter a valid transfer amount.');
            return;
        }
        if (parseFloat(transferAmount) > userData.accounts[0].balance) {
            setErrorMessage('The amount to transfer exceeds the available balance!');
            return;
        }
        if (!selectedUser || !selectedUser._id || !selectedUser.savingsAccountNumber) {
            setSearchMessage('Please select a valid user to transfer to.');
            return;
        }
        setShowModal(true);
    };

  const confirmTransfer = async () => {
    try {
        const response = await axios.post(`${backendURL}/transactions/transfer/${userData._id}/${userData.accounts[0]._id}`, {
            toAccountNumber: selectedUser.savingsAccountNumber,
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
        setSuccessMessage('Transfer was successful!');
      } else {
        setSuccessMessage(`Failed to transfer: ${response.data.message || 'API call failed'}`);
      }
    } catch (error) {
      setSuccessMessage(`API call failed: ${error.message}`);
    }
  };

  const searchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('userToken');
    try {
      const response = await axios.get(`${backendURL}/users/search-users?term=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const users = response.data;
      const exactMatchUsers = users.filter(user => 
          user.email.toLowerCase() === searchTerm.toLowerCase() || 
          user.name.toLowerCase() === searchTerm.toLowerCase());
      if (exactMatchUsers.length === 0) {
        setSearchMessage('No exact match found. Showing closest matches.');
        setUsersList(users);
      } else {
        setUsersList(exactMatchUsers);
        if (exactMatchUsers.length === 1) {
          setSelectedUser(exactMatchUsers[0]);
        } else {
          setSearchMessage('Multiple users found. Please select one.');
        }
      }
    } catch (error) {
      setSearchMessage("Failed to fetch users. Try again.");
      console.error("API call failed:", error.message);
    } finally {
      setLoading(false);
    }
  }; 

  return (
      <div className='main-content'>
        <h1>Transfer</h1>
        <p>Your Balance: ${balance}</p>
          <div className='search-user'>
          <h3>Search a user to transfer to: </h3>
            <input 
                type="text"
                placeholder="Search user by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <div>
              <button onClick={searchUsers} disabled={!searchTerm.trim()}>Search</button>
              {loading && <span>Loading...</span>}
            </div>
          </div>
          {usersList.length > 0 && 
            <div className='select-user'>
                <h3>Select a user to transfer to:</h3>
                {searchMessage && <p>{searchMessage}</p>}
                <ul>
                    {usersList.map(user => (
                        <li key={user._id}>
                            <input 
                                type="radio" 
                                name="selectedUser" 
                                className='radio-button'
                                value={user._id}
                                onChange={() => {
                                    console.log("Selected User: ", user);
                                    setSelectedUser(user);
                                }}
                            />
                            {user.name} ({user.email})
                        </li>
                    ))}
                </ul>
            </div>
            }
          < div className='transfer'>
            <h3>Transfer Amount: </h3>
              <div>
                <input 
                  type="number"
                  placeholder="Enter amount to transfer"
                  value={transferAmount} 
                  onChange={(e) => setTransferAmount(e.target.value)} 
                />
              </div>
          <div>
             <button onClick={handleTransfer} disabled={!transferAmount || parseFloat(transferAmount) <= 0 || parseFloat(transferAmount) > userData.accounts[0].balance || !selectedUser}>Transfer</button>
              {showModal && 
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <p>Confirm transfer of ${transferAmount} to {selectedUser.name}?</p>
                        <div className='modal-buttons'>
                          <button className='success' onClick={confirmTransfer}>Yes, Transfer</button>
                          <button className='danger' onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        {successMessage && <p className="success-message">{successMessage}</p>}
                    </div>
                </div>
              }
          </div>
        </div>
      </div>
  );
};

export default Transfer;