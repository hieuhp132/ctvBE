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
testResetPassword();