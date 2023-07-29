![Logo](https://i.imgur.com/QLRJgEn.png)
# Plex Home Theater


Plex Home Theater turns off your light as soon as you start a movie and turn on your lights as soon as you stop it.

This is a small app coded in JavaScript that runs on NodeJS.

## Installation

You can install the project using git clone and the follow these steps


- [Get a token/username from your Hue Bridge](https://www.sitebase.be/generate-phillips-hue-api-token/)
- Go to credentials_example.js and edit it with your Bridge Ip and token/username
- Run `npm install` on the root to download node modules
- Run `node app.js` to start the server or `pm2 start app.js` if you use PM2 (recommended)
- Go to app.plex.tv and add a webhook to your machine, for example (if on the same machine) `http://localhost:3000/webhook`

You can go to [locahost:3000](http://localhost:3000) to edit the configs or directly from config.json (needs a restart if changed from file)