import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/context';

function Home() {
  const navigate = useNavigate();
  const { user } = useContext(AppContext);

  useEffect(() => {
    if (user) {
      navigate('/balance');
    }
  }, [user, navigate]);

  return (
    <div className="card text-center">
      <div className="card-body">
        <h5 className="card-title">Welcome to the bank</h5>
        <p className="card-text">You can move around using the navigation bar.</p>
        <img src="bank.png" className="img-fluid" alt="Responsive" />
      </div>
      <div className="card-footer text-muted">BadBank</div>
    </div>
  );
}

export default Home;
