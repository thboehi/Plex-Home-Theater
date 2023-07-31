![Logo](https://i.imgur.com/CmxxBLE.png)
# Plex Home Theater
> Version 1.0.2

Plex Home Theater turns off your light as soon as you start a movie and turn on your lights as soon as you stop it.

This is a small app coded in JavaScript that runs on NodeJS.

## Installation

You can install the project using git clone and the follow these steps


- [Get a token/username from your Hue Bridge](https://www.sitebase.be/generate-phillips-hue-api-token/)
- Go to credentials_example.js and edit it with your Bridge Ip and token/username
- Run `npm install` on the root to download node modules
- Run `node app.js` to start the server or `pm2 start app.js` if you use PM2 (recommended)
- Go to [app.plex.tv/webhook](https://app.plex.tv/desktop/#!/settings/webhooks) and add a webhook to your machine, for example (if on the same machine) `http://localhost:3000/webhook`

You can go to [locahost:3000](http://localhost:3000) with your web browser to edit the configs or directly from config.json (needs a restart if changed from file)

## Changelog

See the list of changes that have been made to the project

### [1.0.2] 31.07.2023
- Added console to the website when debug mode is activated.

### [1.0.1] 30.07.2023
 - Added logs file to keep track