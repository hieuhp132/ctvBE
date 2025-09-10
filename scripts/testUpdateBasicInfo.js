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


async function testResetPassword() {
  console.log('Testing resetPassword API...');
  const userId = '68bdcf22131c403154a093ea'; // Replace with a valid user ID
  const newPassword = '123456'; // Replace with the desired new password
  try {
    const response = await axios.post(`${BASE_URL}/db/users/resetPassword`, { userId, newPassword }, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('Reset password response:', response.data);
  } catch (error) {
    console.error('Error during API testing:', error.response?.data || error.message);
  }
}

const RECRUITER_CREDENTIALS = { email: 'ctv1@example.com', password: '123456789' }; // Replace with valid recruiter credentials
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

async function testUpdateBasicInfoRecruiter(params) {
    console.log('Testing updateBasicInfo API...');
    
    const updates = {
        name: 'Me As Rcr',
        email: 'ctv1@example.com',
        password: '123456',
      };

    try {
        const recruiterToken = await getRecruiterToken();
        const response = await axios.put(`${BASE_URL}/api/auth/user/updateBasicInfo`, updates, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${recruiterToken}`,
            },
        });
        console.log('Update basic info response:', response.data);
    } catch (error) {
        console.error('Error during API testing:', error.response?.data || error.message);
    }
}


async function testUpdateBasicInfoAdmin() {
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

//testUpdateBasicInfoAdmin();
testResetPassword();
//testUpdateBasicInfoRecruiter();