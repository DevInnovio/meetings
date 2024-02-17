const axios = require('axios');

async function testEmailEndpoint() {
    const url = 'http://localhost:3141/api/emails/store-emails'; // Replace with your server URL and endpoint
    const testEmail = 'nurielbarporject@gmail.com'; // Replace with the email you want to test

    try {
        const response = await axios.post(url, { email: testEmail });
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testEmailEndpoint();
