const axios = require('axios');
const { SPOTIFY_SONG_URL } = process.env;
const { formatSpotifyJsonToHtml } = require('../utils/spotifyUtils');

exports.getRecentlyPlayed = async (req, res) => {
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
};