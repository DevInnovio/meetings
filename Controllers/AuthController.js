const { OAuth2Client } = require('google-auth-library');
const tempport = 3120;
const port = 3141;
const http = require('http');
const url = require('url');
const destroyer = require('server-destroy'); // Make sure to install 'server-destroy' package if not already installed
const ConfigParser = require('../utils/ConfigParser');
const configParser = new ConfigParser('./auth/credentional.json')
const { google } = require('googleapis');
const User = require('../models/Users'); // Assuming you have a User model




const open = async (url) => {
    const { default: open } = await import('open');
    return open(url);
};

configParser.parse();
const keys = configParser.getConfigData();

class AuthController {
    static async authenticate(req, res) {
        const oAuth2Client = new OAuth2Client(
            keys.client_id,
            keys.client_secret,
            keys.redirect_uris[0]
        );

        const authorizeUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/calendar',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/gmail.readonly'


            ],
            prompt: 'select_account'
        });

        const server = http.createServer(async (req, res) => {

                const qs = new url.URL(req.url, `http://localhost:${tempport}`).searchParams;
                const code = qs.get('code');
                console.log(`Code is ${code}`);
                res.end('Authentication successful! Please return to the console.');
                server.destroy();

                const { tokens } = await oAuth2Client.getToken(code);
                oAuth2Client.setCredentials(tokens);
                const oauth2 = google.oauth2({
                auth: oAuth2Client,
                version: 'v2'
                });
                const userInfo = await oauth2.userinfo.get();
                const userEmail = userInfo.data.email;

            console.log('User Email:', userEmail);


                const existingUser = await User.findOne({ email:userEmail });
                if (existingUser) {
                    existingUser.id_token = tokens.id_token;
                    existingUser.accessToken = tokens.access_token;
                    existingUser.refreshToken = tokens.refresh_token || existingUser.refreshToken;
                    existingUser.tokenExpiryDate = new Date(Date.now() + tokens.expires_in * 1000);
                    await existingUser.save();
                } else {
                    const newUser = new User({
                        email:userEmail,
                        id_token: tokens.id_token,
                        accessToken: tokens.access_token,
                        refreshToken: tokens.refresh_token,
                        ...(typeof tokens.expires_in === 'number' && {
                            tokenExpiryDate: new Date(Date.now() + tokens.expires_in * 1000),
                        }),

                    });
                    await newUser.save();
                }
                //res.redirect('/');

        }).listen(tempport, () => {
            open(authorizeUrl, { wait: false }).then(cp => cp.unref());
        });

        destroyer(server);
        res.status(200).json({ message: 'User is authentacting' });

    }


}

module.exports = AuthController;
