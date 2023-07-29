let debugMode = false;

const express = require('express');
const axios = require('axios');
const multer = require('multer');
const credentials = require('./credentials'); 
const fs = require('fs');

const app = express();
const port = 3000;

const baseHueURL = credentials.baseUrl; // Change this in the credentials.js file
const username = credentials.username; // Change by your token for the Hue Bridge (search google how to create a new token, you can use Insomnia, Postman, etc.)

const upload = multer();

//Vars for configs
let playerName, userOneName, userTwoName, homeTheaterMode, lightNumber;

// Charger les valeurs depuis le fichier JSON au démarrage de l'application
const configPath = './config.json';
let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Fonction pour charger les données depuis le fichier JSON
function loadConfig() {
  try {
    const configFileContent = fs.readFileSync(configPath, 'utf8');
    const loadedConfig = JSON.parse(configFileContent);
    config = loadedConfig;
    playerName = loadedConfig.playerName;
    userOneName = loadedConfig.userOneName;
    userTwoName = loadedConfig.userTwoName;
    homeTheaterMode = loadedConfig.homeTheaterMode;
    lightNumber = loadedConfig.lightNumber;
    debugMode = loadedConfig.debugMode;
    logMessage('Configuration loaded from config.json.', true);
  } catch (error) {
    logMessage('Error loading configuration from config.json:', true);
    logMessage(error.message, true);
  }
}

// Charger les données au démarrage de l'application
loadConfig();

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
  res.json({ homeTheaterMode: homeTheaterMode, playerName: playerName, userName1: userOneName, userName2: userTwoName, debugMode: debugMode, lightNumber: lightNumber });
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
  console.log(`${isEnabled ? '✅ Debug mode activated.' : '❌ Debug mode deactivated.'}`)
  res.json({ message });
});

app.post('/update-data', express.json(), (req, res) => {
  const updatedData = req.body;
  playerName = updatedData.playerName
  userOneName = updatedData.userOneName
  userTwoName = updatedData.userTwoName
  lightNumber = updatedData.lightNumber
  const message = "Informations changée vers: " . updatedData

    // Save the config to the config file
    config.playerName = updatedData.playerName;
    config.userOneName = updatedData.userOneName;
    config.userTwoName = updatedData.userTwoName;
    config.lightNumber = updatedData.lightNumber;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');


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

