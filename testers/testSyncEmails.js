const { syncUserEmails2, } = require('../Controllers/EmailController');
const testEmail = 'nurielbarproject@gmail.com';

syncUserEmails2(testEmail)
    .then(result => {
        console.log(result); // Logs 'Emails synchronized successfully.' on success
    })
    .catch(error => {
        console.error('Error during synchronization:', error.message);
    });
