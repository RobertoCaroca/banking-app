import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth, googleProvider } from '../firebase';
import CustomFirebaseError from '../utils/firebaseErrors';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { AppContext } from '../context/context';
import '../styles/createaccount.css';

const CreateAccount = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const backendURL = process.env.REACT_APP_BACKEND_URL;
  const { setUserData } = useContext(AppContext);

  const createUserInDB = async (uid, email, displayName) => {
    try {
      const response = await axios.post(`${backendURL}/users/create-in-db`, {
        firebaseUserId: uid,
        email: email,
        name: displayName
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
  
      const responseData = response.data;
      if (response.status >= 200 && response.status < 300) {
        setUserData(responseData);
        setSuccess(`Account created successfully with ${displayName ? 'Google' : 'email and password'}!`);
      } else {
        setError(responseData.error || 'User was not created, try again later.');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSignUpWithEmail = async (e) => {
    e.preventDefault();
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserInDB(userCredential.user.uid, email, name);
        navigate('/balance');
        setError(''); 
    } catch (error) {
      const customErrorMessage = CustomFirebaseError(error.code);
      setError(customErrorMessage); 
    }
  };

  const handleSignUpWithGoogle = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await createUserInDB(userCredential.user.uid, userCredential.user.email, userCredential.user.displayName);
      navigate('/balance');
      setError('');
    } catch (error) {
      const customErrorMessage = CustomFirebaseError(error.code);
      setError(customErrorMessage); 
    }
  };

  return (
    <div className="create-account-container">
      <div className="create-account-form-wrapper">
        <h3>Create account</h3>
        <h2>Wellcome to Rob's Bank 👋 </h2>
      <div className="email-form">
        <form onSubmit={handleSignUpWithEmail}>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={!name || !email || !password}>Create Account with Email</button>
        </form>
        </div>
        <div className="google-btn">
          <p>or</p>
          <button className="google-login" onClick={handleSignUpWithGoogle}>Create Account with Google</button>
          {error && <p className="error">{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}
          <div className="login-link">
            <p>Do you have an account? <a href="/login">Login</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default CreateAccount;
