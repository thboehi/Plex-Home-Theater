![Logo](https://i.imgur.com/QLRJgEn.png)
# Plex Home Theater

Plex Home Theater is a small app coded in JavaScript that runs on NodeJS.

With it, you can setup via a webpage what you want and then let it turn off your light as soon as you play a movie/tv show on Plex. When you stop your playback, the light will turn on again.

## Installation

You can install the project using git clone and the follow these steps


- [Get a token/username from your Hue Bridge](https://www.sitebase.be/generate-phillips-hue-api-token/)
- Go to credentials_example.js and edit it with your Bridge Ip and token/username
- Run `npm install` on the root to download node modules
- Run `node app.js` to start the server or `pm2 start app.js` if you use PM2 (recommended)

You can go to [locahost:3000](http://localhost:3000) to edit the configs or directly from config.json (needs a restart if changed from file)