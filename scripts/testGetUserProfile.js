const axios = require('axios');
const BASE_URL = 'https://ctvbe.onrender.com'; // Replace with your backend URL
const RECRUITER_CREDENTIALS = { email: 'ctv1@example.com', password: '123456' }; // Replace with valid recruiter credentials
async function getRecruiterToken() {
  console.log('Fetching recruiter token...');
  
  try {
    const response = await axios.post(`${BASE_URL}/db/users/login`, RECRUITER_CREDENTIALS, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('Login response:', response.data);
    const token = response.data.user?.token; 
    if (!token) {
      throw new Error('Token not returned from login endpoint');
    }
    console.log('Recruiter token fetched successfully:', token);
    return token;
  } catch (error) {
    console.error('Error fetching recruiter token:', error.response?.data || error.message);
    throw new Error('Failed to fetch recruiter token');
  } 
}
async function testGetUserInfoById() {

    console.log('Testing getProfile API...');
    const token = await getRecruiterToken();
    try {
        const response = await axios.get(`${BASE_URL}/db/users/profile`, {
            headers: { 
                'Content-Type': 'application/json',
            },
        });
        console.log('Get profile response:', response.data);
    } catch (error) {
        console.error('Error during API testing:', error.response?.data || error.message);
    } 
        
}

testGetUserInfoById