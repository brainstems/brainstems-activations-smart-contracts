const axios = require('axios');
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb25iOnsiaWQiOiIwZTAzMzcwOS01ZDAxLTQ4ZjAtOGQ5ZC1hYTIyMjBiZDg5YmYiLCJlbWFpbCI6Im9tYXIuc2FhZG91bkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMGFlNWViMjY4ZjU0YTFhYTg0MTQiLCJzY29wZWRLZXlTZWNyZXQiOiIyNWIyY2Q2Y2JkYjIxZjVkNGJkNzIyZjY3MDU0ZWRkYTg2ZWJlZDY3NmJkNDhmYTRmMDgwNDJlMjVjNmNmZGNmIiwiaWF0IjoxNzE1NzI0OTYzfQ.spiNQQxUELV8ADJ0noQjtLd9dQxd8wAxEVIQyzKCjow';

const projectId = 'c88c1bb460144e65a46e68b58e3aaca5';
const projectSecret = '0d8290db58474dd593eb30f61f1633b9';
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

async function uploadToInfura(metadata) {
  const url = 'https://ipfs.infura.io:5001/api/v0/add';
  const options = {
    headers: {
      Authorization: auth
    }
  };
  try {
    const response = await axios.post(url, JSON.stringify(metadata), options);
    return response.data.Hash;
  } catch (error) {
    if (error.response) {
      console.error('Error response from Infura:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received from Infura:', error.request);
    } else {
      console.error('Error setting up request to Infura:', error.message);
    }
    throw error;
  }
}


module.exports = { uploadToInfura };