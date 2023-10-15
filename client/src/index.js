// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { AppContextProvider } from './context/context';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
