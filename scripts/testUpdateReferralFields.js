const axios = require('axios');

const BASE_URL = 'https://ctvbe.onrender.com'; // Replace with your backend URL
const ADMIN_CREDENTIALS = { email: 'admin@ant-tech.asia', password: 'admin123' }; // Replace with valid admin credentials
const REFERRAL_ID = '68bedfb70be3e119f1d72f3d'; // Replace with a valid referral ID

async function getAdminToken() {
  console.log('Fetching admin token...');
  try {
    const response = await axios.post(`${BASE_URL}/db/users/login`, ADMIN_CREDENTIALS, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('Login response:', response.data); // Debug log for the response
    const token = response.data.user?.token; // Extract token from user.token
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

async function testGetAdminReferrals() {
  console.log('Testing getAdminReferrals API...');
  try {
    const adminToken = await getAdminToken();
    const response = await axios.get(`${BASE_URL}/api/referrals`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });
    console.log('Get admin referrals response:', response.data);
  } catch (error) {
    console.error('Error during API testing:', error.response?.data || error.message);
  } finally {
    console.log('Finished testing getAdminReferrals API');
  }
}

async function testDeleteReferralById(id) {
  console.log('Testing deleteReferral API...');

  try {
    const adminToken = await getAdminToken();
    const response = await axios.delete(`${BASE_URL}/api/referrals/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });
    console.log('Delete referral response:', response.data);
  } catch (error) {
    console.error('Error during API testing:', error.response?.data || error.message);
  }
}


async function testUpdateReferralFields() {
  console.log('Testing updateReferralFields API...');

  const rId = '68bdcf23131c403154a093f4'; // Replace with a valid referral ID
  const updates = {
    candidateEmail: 'anything@example.com',
    candidatePhone: '+12345671890',
  };

  try {
    const adminToken = await getAdminToken();

    const response = await axios.put(`${BASE_URL}/api/referrals/${rId}/fields`, updates, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });
    console.log('Update referral fields response:', response.data);
  } catch (error) {
    console.error('Error during API testing:', error.response?.data || error.message);
  }
}

//testDeleteReferral();
//testUpdateReferralFields();
testDeleteReferralById('68bdcf23131c403154a093f4');
testGetAdminReferrals();