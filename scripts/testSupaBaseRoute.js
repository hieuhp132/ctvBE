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

const testDeleteFile = async (filename) => {
    try {
      const response = await axios.delete(`${baseUrl}/spb/delete/${filename}`);
      console.log('✅ Delete successful:', response.data);
    } catch (error) {
      if (error.response) {
        console.error('❌ Delete failed:', error.response.status, error.response.data);
      } else {
        console.error('❌ Delete error:', error.message);
      }
    }
};

console.log(fileName);
testDeleteFile(fileName);

const testDownloadFile = async (fileName, saveAs) => {
    try {
      const response = await axios.get(`${baseUrl}/spb/download/${encodeURIComponent(fileName)}`, {
        responseType: 'stream',
      });
  
      const filePath = path.resolve(__dirname, saveAs);
      const writer = fs.createWriteStream(filePath);
  
      response.data.pipe(writer);
  
      writer.on('finish', () => {
        console.log(`✅ Downloaded and saved file as ${saveAs}`);
      });
  
      writer.on('error', (err) => {
        console.error('❌ Error writing file:', err);
      });
    } catch (error) {
      if (error.response) {
        console.error('❌ Download failed:', error.response.status, error.response.data);
      } else {
        console.error('❌ Download error:', error.message);
      }
    }
};

const testListFiles = async () => {
    try {
      const response = await axios.get(`${baseUrl}/spb/list`);
      console.log('✅ List of files:', response.data.files);
    } catch (error) {
      if (error.response) {
        console.error('❌ List files failed:', error.response.status, error.response.data);
      } else {
        console.error('❌ List files error:', error.message);
      }
    }
  };
  
//testListFiles();
//testUploadFile();
