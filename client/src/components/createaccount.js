import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { AppContext } from '../context/context';

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
      const response = await fetch(`${backendURL}/users/create-in-db`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firebaseUserId: uid,
            email: email,
            name: displayName
          })        
      });

      const responseData = await response.json();
      if (!response.ok) {
          setError(responseData.error || 'Failed to create user in MongoDB');
      } else {
          setUserData(responseData);
          setSuccess(`Account created successfully with ${displayName ? 'Google' : 'email and password'}!`);
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
        setError(error.message);
    }
  };

  const handleSignUpWithGoogle = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await createUserInDB(userCredential.user.uid, userCredential.user.email, userCredential.user.displayName);
      navigate('/balance');
      setError('');
    } catch (error) {
      setError(error.message || 'Error occurred during signup with Google');
    }
  };

  return (
    <div>
      <h1>Create an account</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
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
        <br />
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
        <br />
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
        <br />
        <button type="submit">Create Account with Email</button>
      </form>
      <button onClick={handleSignUpWithGoogle}>Create Account with Google</button>
    </div>
  );
};

export default CreateAccount;
