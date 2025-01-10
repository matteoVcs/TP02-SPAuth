const querystring = require('querystring');
const axios = require('axios');
const { CLIENT_ID, CLIENT_SECRET } = process.env;
const REDIRECT_URI="http://localhost:3000/callback";
const SPOTIFY_AUTH_URL="https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL="https://accounts.spotify.com/api/token";

exports.authorizationCodeFlow = (req, res) => {
    const scope = 'user-read-recently-played';
    const queryParams = querystring.stringify({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        scope,
    });

    res.redirect(`${SPOTIFY_AUTH_URL}?${queryParams}`);
};

exports.implicitGrantFlow = (req, res) => {
    const scope = 'user-read-recently-played';
    const queryParams = querystring.stringify({
        client_id: CLIENT_ID,
        response_type: 'token',
        redirect_uri: REDIRECT_URI,
        scope,
    });

    const implicitGrantUrl = `${SPOTIFY_AUTH_URL}?${queryParams}`;
    res.send(`
    <html>
      <head>
        <title>Implicit Grant Flow</title>
      </head>
      <body>
        <p>Click the link below to authenticate using the Implicit Grant Flow:</p>
        <a href="${implicitGrantUrl}" target="_blank">${implicitGrantUrl}</a>
      </body>
    </html>
  `);
};

exports.callback = async (req, res) => {
    const code = req.query.code;

    if (code) {
        try {
            const response = await axios.post(
                SPOTIFY_TOKEN_URL,
                querystring.stringify({
                    code,
                    redirect_uri: REDIRECT_URI,
                    grant_type: 'authorization_code',
                }),
                {
                    headers: {
                        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            const { access_token } = response.data;

            if (!access_token) {
                throw new Error('Access token is missing in response.');
            }

            return res.redirect(`/songs?token=${access_token}`);
        } catch (error) {
            console.error('Error during token exchange:', error.message);
            return res.status(500).send("<p>Failed to fetch token from Spotify using Authorization Code Flow.</p>");
        }
    }
};