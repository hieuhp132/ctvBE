const axios = require('axios');

const testDeleteUser = async () => {
  const userId = '68c8605bcff1ddfe652f22f3'; // Replace with a valid user ID from your database
  const baseUrl = 'https://ctvbe.onrender.com'; // Replace with your server's base URL

  try {
    const response = await axios.delete(`${baseUrl}/db/user/${userId}/remove`);
    console.log('User removed successfully:', response.data);
  } catch (error) {
    console.error('Error removing user:', error.response?.data || error.message);
  }
};

testDeleteUser();