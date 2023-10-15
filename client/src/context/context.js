import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import axios from 'axios';

export const AppContext = createContext();

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  response => response, 
  async error => {
    const originalRequest = error.config;
    
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Get a new token from Firebase
      const token = await auth.currentUser.getIdToken(true);
      
      localStorage.setItem('userToken', token);
      api.defaults.headers['Authorization'] = `Bearer ${token}`;
      originalRequest.headers['Authorization'] = `Bearer ${token}`;
      
      return api(originalRequest);
    }
    
    return Promise.reject(error);
  }
);

export const AppContextProvider = (props) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
            setUser(firebaseUser);

            if (firebaseUser) {
                const token = await firebaseUser.getIdToken();
                localStorage.setItem('userToken', token);

                const headers = {
                    'Authorization': `Bearer ${token}`,
                };

                try {
                    const response = await api.get(`/users/details-by-firebase-id/${firebaseUser.uid}`, { headers });
                    const responseData = response.data;

                    if (responseData && responseData.accounts) {
                        for (let account of responseData.accounts) {
                            const transactionResponse = await api.get(`/transactions/${responseData._id}/${account._id}`, { headers });
                            const transactionData = transactionResponse.data;
                            account.transactions = transactionData;
                        }

                        setUserData(responseData);
                    }
                } catch (error) {
                    console.error("Error fetching user details: ", error);
                }
            }
        } else {
            setUser(null);
            setUserData(null);
            }
        });

        return unsubscribe;
    }, []);

    const refreshUserData = async () => {
        if (user) {
            const token = localStorage.getItem('userToken');
            const headers = {
                'Authorization': `Bearer ${token}`,
            };

            try {
                const response = await api.get(`/users/details-by-firebase-id/${user.uid}`, { headers });
                const responseData = response.data;

                if (responseData && responseData.accounts) {
                    for (let account of responseData.accounts) {
                        const transactionResponse = await api.get(`/transactions/${responseData._id}/${account._id}`, { headers });
                        const transactionData = transactionResponse.data;
                        account.transactions = transactionData;
                    }

                    setUserData(responseData);
                }
            } catch (error) {
                console.error("Error refreshing user data: ", error);
            }
        }
    };

    return (
        <AppContext.Provider value={{ user, userData, setUserData, refreshUserData }}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;
