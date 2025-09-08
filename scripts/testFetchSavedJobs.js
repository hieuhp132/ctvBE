const axios = require('axios');

const BASE_URL = 'https://ctvbe.onrender.com//api/jobs'; // Replace with your backend URL
const USER_ID = '68bdcf22131c403154a093e8'; // Replace with a valid user ID

async function testFetchSavedJobs() {
  try {
    console.log('Testing fetchSavedJobs API...');
    const response = await axios.get(`${BASE_URL}?savedBy=${USER_ID}`);
    console.log('Fetch saved jobs response:', response.data);
  } catch (error) {
    console.error('Error during API testing:', error.response?.data || error.message);
  }
}

testFetchSavedJobs();
