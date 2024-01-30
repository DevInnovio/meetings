const {OAuth2Client} = require('google-auth-library');
const http = require('http');
const url = require('url');
const destroyer = require('server-destroy');
const express = require('express');
const app = express();
const port = 3141;
const tempport = 3120;
const ConfigParser = require('./models/configParser');
const configParser = new ConfigParser('./auth/credentional.json');
configParser.parse();
const keys = configParser.getConfigData();


async function main() {
  const open = (await import('open')).default;
  const oAuth2Client = await getAuthenticatedClient(open);
 // const url = 'https://people.googleapis.com/v1/people/me?personFields=names';
 // const res = await oAuth2Client.request({url});
  //console.log(res.data);

  const tokenInfo = await oAuth2Client.getTokenInfo(
      oAuth2Client.credentials.access_token
  );
  console.log(tokenInfo);
}

function getAuthenticatedClient(open) {
  return new Promise((resolve, reject) => {

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
        'https://www.googleapis.com/auth/gmail.readonly'

      ],
      prompt: 'select_account'
    });

    const server = http
        .createServer(async (req, res) => {
          try {

              // acquire the code from the querystring, and close the web server.
              const qs = new url.URL(req.url, 'http://localhost:3120')
                  .searchParams;
              const code = qs.get('code');
              console.log(`Code is ${code}`);
              res.end('Authentication successful! Please return to the console.');
              server.destroy();

              const r = await oAuth2Client.getToken(code);
              oAuth2Client.setCredentials(r.tokens);
              console.info('Tokens acquired.');
              resolve(oAuth2Client);

          } catch (e) {
            reject(e);
          }
        })
        .listen(tempport, () => {
          open(authorizeUrl, {wait: false}).then(cp => cp.unref());
        });
    destroyer(server);
  });
}

main().catch(console.error);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
