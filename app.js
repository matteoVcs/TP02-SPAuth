const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const songRoutes = require('./routes/songRoutes');

const app = express();
app.use(cors());

app.use('/auth', authRoutes);
app.use('/songs', songRoutes);

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

module.exports = app;