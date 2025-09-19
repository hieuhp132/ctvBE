const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BASE_URL = 'https://ctvbe.onrender.com'; // Updated to include /api prefix
const recruiterCredit = { email: 'ctv1@example.com', password: '123456' }; // Replace with valid recruiter credentials

const adminCredit = { email: 'admin@ant-tech.asia', password:'admin123'};

async function getToken(isAdmin) {
  console.log('Fetching token...');
  
  try {
    const response = await axios.post(`${BASE_URL}/db/users/login`, isAdmin? adminCredit : recruiterCredit, {
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

//router.get("/mine", auth, role(["recruiter"]), referralCtrl.getMyReferrals);
const testGetReferralRecruiter = async () => {

    const token = await getToken(false);

    try {
        const response = await axios.get(`${BASE_URL}/api/referrals/mine`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },           
        });
        console.log('Recruiter referrals fetched successfully:', response.data);

    } catch (error) {
        console.error('Error fetching recruiter referrals:', error.response?.data || error.message);
    }
}
//testGetReferralRecruiter();


const testReferralRoute = async () => {
  const filePath = path.join(__dirname, '07_Softwaresicherheit2.pdf');

  const token = await getToken(false);  

  const formData = new FormData();
  formData.append('jobId', '68cc407e3bf5f4ed8c6fb09f'); // Replace with a valid job ID
  formData.append('candidateName', 'Last Candidate Tested');
  formData.append('email', 'test@example.com');
  formData.append('phone', '123456789');
  formData.append('linkedin', 'https://linkedin.com/in/test');
  formData.append('portfolio', 'https://portfolio.com/test');
  formData.append('suitability', 'Highly suitable for the role');
  formData.append('bonus', '500');
  formData.append('message', 'This is a test referral');
  formData.append('cv', fs.createReadStream(filePath));

  try {
    const response = await axios.post(`${BASE_URL}/api/referrals`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Referral route test successful:', response.data);
  } catch (error) {
    console.error('Referral route test failed:', error.response?.data || error.message);
  } 
};

testReferralRoute();