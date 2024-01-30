const fs = require('fs');
const port = ":3120" ;
class ConfigParser {
    constructor(filePath) {
        this.filePath = filePath;
        this.data = null;
    }

    parse() {
        const rawData = fs.readFileSync(this.filePath);
        const jsonData = JSON.parse(rawData);

        this.data = {
            client_id: jsonData.installed.client_id,
            project_id: jsonData.installed.project_id,
            auth_uri: jsonData.installed.auth_uri,
            token_uri: jsonData.installed.token_uri,
            auth_provider_x509_cert_url: jsonData.installed.auth_provider_x509_cert_url,
            client_secret: jsonData.installed.client_secret,
            redirect_uris: jsonData.installed.redirect_uris


        };
        this.data.redirect_uris[0]+= port;
    }

    getConfigData() {
        if (this.data === null) {
            throw new Error("Config not parsed yet. Call parse() first.");
        }
        return this.data;
    }
}

module.exports = ConfigParser;
