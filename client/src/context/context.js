import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../firebase';

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const backendURL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if(firebaseUser) {
        const response = await fetch(`${backendURL}/users/details-by-firebase-id/${firebaseUser.uid}`);
        const data = await response.json();
      
        if (data && data.accounts) {
          for (let account of data.accounts) {
            const transactionResponse = await fetch(`${backendURL}/transactions/${data._id}/${account._id}`);
            account.transactions = await transactionResponse.json();
          }
      
          setUserData(data);
        }
      }
    
    });

    return unsubscribe;
  }, [backendURL]);

  const refreshUserData = async () => {
    if(user) {
        const response = await fetch(`${backendURL}/users/details-by-firebase-id/${user.uid}`);
        const data = await response.json();
    
        if (data && data.accounts) {
            for (let account of data.accounts) {
                const transactionResponse = await fetch(`${backendURL}/transactions/${data._id}/${account._id}`);
                account.transactions = await transactionResponse.json();
            }
    
            setUserData(data);
        }
      }
  };

  return (
      <AppContext.Provider value={{ user, userData, setUserData, refreshUserData }}>
          {props.children}
      </AppContext.Provider>
  );
};
