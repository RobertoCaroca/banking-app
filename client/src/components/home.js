import React from 'react';

function Home() {
  return (
    <div className="card text-center">
      <div className="card-header">BadBank Landing Module</div>
      <div className="card-body">
        <h5 className="card-title">Welcome to the bank</h5>
        <p className="card-text">You can move around using the navigation bar.</p>
        <img src="bank.png" className="img-fluid" alt="Responsive image" />
      </div>
      <div className="card-footer text-muted">BadBank</div>
    </div>
  );
}

export default Home;
