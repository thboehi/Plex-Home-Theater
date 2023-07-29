let debugMode = false;

const express = require('express');
const axios = require('axios');
const multer = require('multer');
const credentials = require('./credentials'); 

const app = express();
const port = 3000;

const baseHueURL = credentials.baseUrl; // Change this in the credentials.js file
const username = credentials.username; // Change by your token for the Hue Bridge (search google how to create a new token, you can use Insomnia, Postman, etc.)
const lightNumber = 4; // The number of the light you wish to control

const upload = multer();

// Variable to check that your player is the right one
let homeTheaterMode = true; // By default, Home Theater is activated.
let playerName = "LG OLED55A19LA";  // Change this to the name of your TV, you can change that later, after testing. THe name of your TV will be shown in the console.
let userOneName = "thboehi"; // Like before
let userTwoName = "oliveira.18"; // Like before

app.post('/webhook', upload.any(), (req, res) => {
    const reqBody = JSON.parse(req.body.payload);
    const player = reqBody.Player.title;
    logMessage("------------------");
    logMessage('Player: ' + player);
    const user = reqBody.Account.title;
    logMessage('User: ' + user);
    const event = reqBody.event;
    logMessage('Event: ' + event);
    logMessage("------------------");

    if (player === playerName && (user === userOneName || user === userTwoName)){
        logMessage("Correct environment, continuing...");
        logMessage("------------------");
        switch (event){
            case "media.play":
                logMessage("Movie started, shut down the light.");
                controlHueLight(false);
                logMessage("------------------");
                break;
            case "media.resume":
                logMessage("Movie resumed, shut down the light.");
                controlHueLight(false);
                logMessage("------------------");
                break;
            case "media.pause":
                logMessage("Movie paused, turn on the light.");
                controlHueLight(true);
                logMessage("------------------");
                break;
            case "media.stop":
                logMessage("Movie stopped, turn on the light.");
                controlHueLight(true);
                logMessage("------------------");
                break;
        }

    } else {
        logMessage("Not the right environment, noting to do more.")
        logMessage("------------------");
    }

    res.sendStatus(200);
});

// Static page to control the lights
app.use(express.static('public'));

// Route to get current setup
app.get('/get-light-control-status', (req, res) => {
  res.json({ homeTheaterMode: homeTheaterMode, playerName: playerName, userName1: userOneName, userName2: userTwoName, debugMode: debugMode });
});

app.post('/toggle-light-control', express.json(), (req, res) => {
    const { isEnabled } = req.body;
    homeTheaterMode = isEnabled;
    const message = isEnabled ? '✅ Home Theater Mode activated.' : '❌ Home Theater Mode deactivated.';
    res.json({ message });
});

app.post('/toggle-debug', express.json(), (req, res) => {
  const { isEnabled } = req.body;
  debugMode = isEnabled;
  const message = isEnabled ? '✅ Debug mode activated.' : '❌ Debug mode deactivated.';
  res.json({ message });
});

app.post('/update-data', express.json(), (req, res) => {
  const updatedData = req.body;
  playerName = updatedData.playerName
  userOneName = updatedData.userOneName
  userTwoName = updatedData.userTwoName
  const message = "Informations changée vers: " . updatedData
  res.json({ message });
});

async function controlHueLight(on) {
  if (!homeTheaterMode) {
    logMessage('Theater Mode deactivated, nothing to do more.');
    return;
}
  try {
    const url = `${baseHueURL}/${username}/lights/${lightNumber}/state`;
    const body = { on: on };
    await axios.put(url, body);
    logMessage(`The light ${lightNumber} is now ${on ? 'ON' : 'OFF'}.`);
  } catch (error) {
    console.error('Error with Hue communication :', error.message);
  }
}

// Custom logging function
function logMessage(message, important = false) {
  if (debugMode || important) {
    console.log(message);
  }
}

app.listen(port, () => {
  logMessage(`Server is ready listening to port ${port}.`, true);
});

