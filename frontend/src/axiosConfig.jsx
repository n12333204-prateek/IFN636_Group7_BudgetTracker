import axios from 'axios';

const axiosInstance = axios.create({
  //  baseURL: 'http://localhost:5001', // local
  baseURL: 'http://15.135.198.102:5001', //live URL
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
