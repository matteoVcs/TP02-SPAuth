const express = require('express');
const cors = require('cors');
const axios = require('axios');
const querystring = require('querystring');
require('dotenv').config();

const app = express();
app.use(cors());

const { CLIENT_ID, CLIENT_SECRET } = process.env;

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_SONG_URL = 'https://api.spotify.com/v1/me/player/recently-played';

const REDIRECT_URI = 'http://localhost:3000/callback';

function formatSpotifyJsonToHtml(data) {
  if (!data || !data.items || !Array.isArray(data.items)) {
    return "<p>No tracks found in the JSON data.</p>";
  }

  return `
    <div>
      ${data.items
      .map((item) => {
        const track = item.track;
        if (!track) return '';

        const album = track.album || {};
        const artists = track.artists || [];
        const albumImage = album.images?.[0]?.url || null;

        return `
            <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 5px; display: flex; gap: 15px; align-items: flex-start; background: white;">
              ${
            albumImage
                ? `<img src="${albumImage}" alt="${album.name}" style="width: 100px; height: 100px; border-radius: 5px; object-fit: cover;">`
                : ''
        }
              <div>
                <h2 style="margin: 0;">${track.name}</h2>
                <p style="margin: 5px 0; color: #555;"><strong>Album:</strong> ${album.name || 'Unknown'} (${album.album_type || 'Unknown'})</p>
                <p style="margin: 5px 0; color: #555;"><strong>Release Date:</strong> ${album.release_date || 'Unknown'}</p>
                <p style="margin: 5px 0; color: #555;"><strong>Artists:</strong></p>
                <ul>
                  ${artists
            .map(
                (artist) => `
                        <li>
                          ${artist.name} (<a href="${artist.external_urls?.spotify}" target="_blank">Spotify</a>)
                        </li>
                      `
            )
            .join('')}
                </ul>
                <p style="margin: 5px 0; color: #555;"><strong>Available Markets:</strong> ${
            album.available_markets?.slice(0, 5).join(', ') || 'N/A'
        }${album.available_markets?.length > 5 ? '...' : ''}</p>
                <a href="${track.external_urls?.spotify}" target="_blank" style="display: inline-block; margin-top: 10px; padding: 10px 15px; background-color: #1DB954; color: white; text-decoration: none; border-radius: 5px;">Listen on Spotify</a>
              </div>
            </div>
          `;
      })
      .join('')}
    </div>
  `;
}

// Root Endpoint with Buttons
app.get('/', (req, res) => {
  const authCodeUrl = `/auth/authorization-code`;
  const implicitGrantUrl = `/auth/implicit-grant`;

  res.send(`
    <html>
      <head>
        <title>Spotify Authentication</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background-color: #f4f4f4;
          }
          button {
            padding: 15px 30px;
            margin: 10px;
            font-size: 16px;
            color: white;
            background-color: #1DB954;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
          button:hover {
            background-color: #14833b;
          }
        </style>
      </head>
      <body>
        <h1>Welcome to Spotify Authentication</h1>
        <p>Choose an authentication method:</p>
        <button onclick="window.location.href='${authCodeUrl}'">Authorization Code Flow</button>
        <button onclick="window.location.href='${implicitGrantUrl}'">Implicit Grant Flow</button>
      </body>
    </html>
  `);
});

app.get('/auth/authorization-code', (req, res) => {
  const scope = 'user-read-recently-played';
  const queryParams = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope,
  });

  res.redirect(`${SPOTIFY_AUTH_URL}?${queryParams}`);
});

app.get('/auth/implicit-grant', (req, res) => {
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
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;

  if (code) {
    // Authorization Code Flow
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

      // Redirect to songs with access token
      return res.redirect(`/songs?token=${access_token}`);
    } catch (error) {
      console.error('Error during token exchange:', error.message);
      return res.status(500).send("<p>Failed to fetch token from Spotify using Authorization Code Flow.</p>");
    }
  } else {
    // Implicit Grant Flow fallback
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
          <script>
            // Extract access_token from URL fragment
            function handleRedirect() {
              const hash = window.location.hash;
              const params = new URLSearchParams(hash.substring(1)); // Remove #
              const token = params.get('access_token');
              
              if (token) {
                // Redirect to /songs with token as query param
                window.location.href = '/songs?token=' + token;
              } else {
                document.getElementById('error').innerText = 'Access token is missing. Please try again.';
              }
            }
            window.onload = handleRedirect;
          </script>
        </head>
        <body>
          <p id="error">Redirecting...</p>
          <p>If the redirection does not work, <a href="${implicitGrantUrl}" target="_blank">click here</a>.</p>
        </body>
      </html>
    `);
  }
});

app.get('/songs', async (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).send("<p>Access token is missing.</p>");
  }

  try {
    const response = await axios.get(SPOTIFY_SONG_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const formattedHtml = formatSpotifyJsonToHtml(response.data);
    res.send(formattedHtml);
  } catch (error) {
    console.error('Error fetching songs:', error.message);

    const status = error.response?.status || 500;
    const message =
        status === 401
            ? 'Unauthorized access. Please try re-authenticating.'
            : 'Failed to fetch songs from Spotify.';

    res.status(status).send(`<p>${message}</p>`);
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});