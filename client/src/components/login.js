import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import '../styles/login.css'

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const getFriendlyErrorMessage = (firebaseErrorCode) => {
    switch (firebaseErrorCode) {
        case 'auth/user-not-found':
            return 'User not found';
        case 'auth/wrong-password':
            return 'Incorrect password';

        default:
            return 'An unexpected error occurred';
    }
};

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/balance');
    } catch (error) {
      const friendlyMessage = getFriendlyErrorMessage(error.code);
      setError(friendlyMessage);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/balance');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h3>Rob's Bank</h3>
        <h2>Welcome back! 👋 </h2>
        <div className="divider">
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={!email || !password}>Login</button>
        </form>
        </div>
        <p>or</p>
        <button className="google-login"  onClick={handleGoogleLogin}>Login with Google</button>
        <div className="divider">
        {error && <p className="error">{error}</p>}
        <p>Don't have an account? <a href="/create-account">Create one</a></p>
        </div> 
      </div>
    </div>
  );
};

export default Login;
