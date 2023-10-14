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

            if (firebaseUser) {
                const token = await firebaseUser.getIdToken();
                localStorage.setItem('userToken', token);

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                const response = await fetch(`${backendURL}/users/details-by-firebase-id/${firebaseUser.uid}`, { headers: headers });
                let responseData = await response.json();

                // Handle refreshed token due to role change
                if (responseData && responseData.newToken) {
                    localStorage.setItem('userToken', responseData.newToken);
                    const updatedResponse = await fetch(`${backendURL}/users/details-by-firebase-id/${firebaseUser.uid}`, {
                        headers: {
                            'Authorization': `Bearer ${responseData.newToken}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    responseData = await updatedResponse.json();
                }

                if (responseData && responseData.accounts) {
                    for (let account of responseData.accounts) {
                        const transactionResponse = await fetch(`${backendURL}/transactions/${responseData._id}/${account._id}`, { headers: headers });
                        let transactionData = await transactionResponse.json();

                        if (transactionData && transactionData.newToken) {
                            localStorage.setItem('userToken', transactionData.newToken);
                            const updatedTransactionResponse = await fetch(`${backendURL}/transactions/${responseData._id}/${account._id}`, {
                                headers: {
                                    'Authorization': `Bearer ${transactionData.newToken}`,
                                    'Content-Type': 'application/json'
                                }
                            });
                            transactionData = await updatedTransactionResponse.json();
                        }

                        account.transactions = transactionData;
                    }

                    setUserData(responseData);
                }
            }
        });

        return unsubscribe;
    }, [backendURL]);

    const refreshUserData = async () => {
        if (user) {
            const token = localStorage.getItem('userToken');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const response = await fetch(`${backendURL}/users/details-by-firebase-id/${user.uid}`, { headers: headers });
            let responseData = await response.json();

            // Handle refreshed token due to role change
            if (responseData && responseData.newToken) {
                localStorage.setItem('userToken', responseData.newToken);
                const updatedResponse = await fetch(`${backendURL}/users/details-by-firebase-id/${user.uid}`, {
                    headers: {
                        'Authorization': `Bearer ${responseData.newToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                responseData = await updatedResponse.json();
            }

            if (responseData && responseData.accounts) {
                for (let account of responseData.accounts) {
                    const transactionResponse = await fetch(`${backendURL}/transactions/${responseData._id}/${account._id}`, { headers: headers });
                    let transactionData = await transactionResponse.json();

                    if (transactionData && transactionData.newToken) {
                        localStorage.setItem('userToken', transactionData.newToken);
                        const updatedTransactionResponse = await fetch(`${backendURL}/transactions/${responseData._id}/${account._id}`, {
                            headers: {
                                'Authorization': `Bearer ${transactionData.newToken}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        transactionData = await updatedTransactionResponse.json();
                    }

                    account.transactions = transactionData;
                }

                setUserData(responseData);
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
