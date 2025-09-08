const axios = require('axios');

const BASE_URL = 'https://ctvbe.onrender.com'; // Replace with your backend URL
const ADMIN_CREDENTIALS = { email: 'admin@example.com', password: 'admin123' }; // Replace with valid admin credentials

async function getAdminToken() {
  console.log('Fetching admin token...');
  try {
    const response = await axios.post(`${BASE_URL}/db/users/login`, ADMIN_CREDENTIALS, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('Login response:', response.data);
    const token = response.data.user?.token;
    if (!token) {
      throw new Error('Token not returned from login endpoint');
    }
    console.log('Admin token fetched successfully:', token);
    return token;
  } catch (error) {
    console.error('Error fetching admin token:', error.response?.data || error.message);
    throw new Error('Failed to fetch admin token');
  }
}

async function testUpdateBasicInfo() {
  console.log('Testing updateBasicInfo API...');

  const updates = {
    name: 'Updated Admin Name',
    email: 'updatedadmin@example.com',
  };

  try {
    const adminToken = await getAdminToken();

    const response = await axios.put(`${BASE_URL}/api/auth/user/updateBasicInfo`, updates, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });
    console.log('Update basic info response:', response.data);
  } catch (error) {
    console.error('Error during API testing:', error.response?.data || error.message);
  }
}

testUpdateBasicInfo();
