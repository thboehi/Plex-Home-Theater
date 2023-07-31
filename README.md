![Logo](https://i.imgur.com/CmxxBLE.png)
# Plex Home Theater
> Version 1.0.2

Plex Home Theater turns off your light as soon as you start a movie and turn on your lights as soon as you stop it.

This is a small app coded in JavaScript that runs on NodeJS.

## Installation

You can install the project using git clone and the follow these steps


1. [Get a token/username from your Hue Bridge](https://www.sitebase.be/generate-phillips-hue-api-token/)
2. Go to credentials_example.js and edit it with your Bridge Ip and token/username
3. Run `npm install` on the root to download node modules
4. Run `node app.js` to start the server or `pm2 start app.js` if you use PM2 (recommended)
5.  Go to [app.plex.tv/webhook](https://app.plex.tv/desktop/#!/settings/webhooks) and add a webhook to your machine, for example (if on the same machine) `http://localhost:3000/webhook`

You can go to [yourmachineip:3000](http://localhost:3000) with your web browser to edit the configs or directly from config.json (needs a restart if changed from file)

## Configs

_**Player Name**_ will be the name of your TV. If you don't know it, just activate the debug mode and it will show when you play, pause or resume a movie.

**_Users_** The actions will be performed if the user is one of the two that are configured. Like for the player, just try with debug mode to see your username. If you live alone, just leave the second user empty or put your username twice.

**_Light number_** will be the ID number of your Philips Hue light. For the moment, only one can be controlled.

**_Debug mode_** will turn on console logs and in the web interface, a console will be shown.

## Screenshots

![App on Homescreen](https://i.imgur.com/7z84OZ0.png)
![Web page default mode](https://i.imgur.com/ZhZAaD4.png)
![Webpage with debug mode activated](https://i.imgur.com/Xcj91DY.png)



## Changelog

See the list of changes that have been made to the project

### [1.0.2] 31.07.2023
- Added console to the website when debug mode is activated.

### [1.0.1] 30.07.2023
 - Added logs file to keep track