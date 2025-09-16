const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const baseUrl = 'https://ctvbe.onrender.com'; // Replace with your backend
const fileName = '07_Softwaresicherheit2.pdf'; // or 'report.pdf', or any other file
const filePath = path.join(__dirname, fileName); // must exist locally

const testUploadFile = async () => {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const response = await axios.post(`${baseUrl}/spb/upload`, form, {
      headers: {
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    console.log('✅ Upload successful!');
    console.log('📂 Supabase Path:', response.data.file.path);
    console.log('🔗 Public URL:', response.data.publicUrl);
  } catch (error) {
    const errRes = error.response;
    console.error('❌ Upload failed');
    if (errRes) {
      console.error('Status:', errRes.status);
      console.error('Response:', errRes.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

testUploadFile();
