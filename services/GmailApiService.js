const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const ConfigParser = require('../utils/ConfigParser');
const configParser = new ConfigParser('./auth/credentional.json')
configParser.parse();
const keys = configParser.getConfigData();
class GmailApiService {
    constructor(userID, token) {
        this.userID = userID;
        this.token = token;
        this.client = this.initializeClient();
        this.emailService = google.gmail({ version: 'v1', auth: this.client });
        // this.calendarService = google.calendar({ version: 'v3', auth: this.client });
    }

    initializeClient() {
        const oAuth2Client = new OAuth2(
            keys.client_id,
            keys.client_secret,
            keys.redirect_uris[0]
        );
        oAuth2Client.setCredentials({ access_token: this.token });
        return oAuth2Client;
    }

    async fetchEmailsSince(lastTimestamp) {
        try {
            let query = '';

            if (lastTimestamp) {
                const afterDate = new Date(lastTimestamp).toISOString().split('T')[0];
                query = `after:${afterDate}`;
            }

            let pageToken = null;
            const emails = [];

            do {
                const response = await this.emailService.users.messages.list({
                    userId: 'me',
                    q: query,
                    pageToken: pageToken,
                    maxResults: 1000,
                });

                pageToken = response.data.nextPageToken;

                for (const message of response.data.messages || []) {
                    const emailData = await this.emailService.users.messages.get({
                        userId: 'me',
                        id: message.id,
                        format: 'full',
                    });


                    const parsedEmail = this.parseEmailData(emailData.data);
                    emails.push(parsedEmail);
                }
            } while (pageToken);

            return emails;
        } catch (error) {
            console.error('Error fetching emails:', error);
            throw error;
        }
    }

    parseEmailData(rawEmailData) {
        // Initialize an object to store the parsed email data
        const email = {
            id: rawEmailData.id,
            threadId: rawEmailData.threadId,
            labelIds: rawEmailData.labelIds,
            snippet: rawEmailData.snippet,
            from: '',
            to: '',
            subject: '',
            content: '',
            receivedAt: ''
        };

        // Extract headers
        const headers = rawEmailData.payload.headers;
        headers.forEach(header => {
            if (header.name === 'From') {
                email.from = header.value;
            } else if (header.name === 'To') {
                email.to = header.value;
            } else if (header.name === 'Subject') {
                email.subject = header.value;
            } else if (header.name === 'Date') {
                email.receivedAt = header.value;
            }
        });


        email.content = this.getBodyContent(rawEmailData.payload);

        return email;
    }

    getBodyContent(payload) {
        let bodyContent = '';

        if (payload.body && payload.body.data) {

            bodyContent = Buffer.from(payload.body.data, 'base64').toString('utf-8');
        } else if (payload.parts) {
            payload.parts.forEach(part => {
                if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
                    const partContent = Buffer.from(part.body.data, 'base64').toString('utf-8');
                    bodyContent += partContent + '\n';
                }
                if (part.parts) {
                    bodyContent += this.getBodyContent(part) + '\n';
                }
            });
        }

        return bodyContent;
    }
}

module.exports = GmailApiService;
