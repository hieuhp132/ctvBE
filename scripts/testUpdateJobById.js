const axios = require('axios');

const BASE_URL = 'https://ctvbe.onrender.com'; // Replace with your backend URL
const ADMIN_CREDENTIALS = { email: 'updatedadmin@example.com', password: 'admin123' }; // Replace with valid admin credentials

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

async function testUpdateJobsById() {
    console.log('Testing updateBasicInfo API...');
    const jobId = '64f1c4e2b4dcbf001c8e4a2b'; // Replace with a valid job ID

    const updates = {
        keywords: ['Future Leader', 'Operating System', 'Team Management'],
    };

    try {        const adminToken = await getAdminToken();

        const response = await axios.put(`${BASE_URL}/api/jobs/${jobId}`, updates, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${adminToken}`,
            },
        });
        console.log('Update job by ID response:', response.data);
    } catch (e) {
        
    }

}