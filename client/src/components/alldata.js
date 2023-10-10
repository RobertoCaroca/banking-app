import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AllData = () => {
  const [data, setData] = useState([]);
  const [message, setMessage] = useState('');
  const backendURL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${backendURL}/all-data`);
        if (response.data) {
          setData(response.data);
        } else {
          setMessage('Failed to fetch data.');
        }
      } catch (error) {
        setMessage(`API call failed: ${error.message}`);
      }
    };
    fetchData();
  }, [backendURL]);

  return (
    <div>
      <h1>All Data</h1>
      <ul>
      {data.map((item, index) => (
        <li key={index}>{JSON.stringify(item)}</li>
      ))}
      </ul>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AllData;
