const express = require('express');
const cors = require('cors');
const axios = require('axios');
const querystring = require('querystring');
require('dotenv').config();

const app = express();
app.use(cors());

const {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
} = process.env;

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_SONG_URL = 'https://api.spotify.com/v1/me/player/recently-played';

app.get('/', (req, res) => {
  const scope = 'user-read-recently-played';
  const queryParams = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope,
  });

  res.redirect(`${SPOTIFY_AUTH_URL}?${queryParams}`);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code || null;

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
      });
  
      const { access_token, refresh_token } = response.data;
      res.redirect('http://localhost:3000/songs?token=' + access_token);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch token' });
    }});

app.get('/songs', async (req, res) => {
  const token = req.query.token;

  try {
    const response = await axios.get(SPOTIFY_SONG_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

app.listen(3000, () => {
  console.log('Serveur démarré sur http://localhost:3000');
});