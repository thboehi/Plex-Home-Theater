let debugMode = false;

const express = require('express');
const axios = require('axios');
const multer = require('multer');
const credentials = require('./credentials'); 
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3001 });

const app = express();
const port = 3000;

const baseHueURL = credentials.baseUrl; // Change this in the credentials.js file
const username = credentials.username; // Change by your token for the Hue Bridge (search google how to create a new token, you can use Insomnia, Postman, etc.)

const upload = multer();

//Vars for configs
let playerName, userOneName, userTwoName, homeTheaterMode, lightNumber;

// Vérifier si le dossier "logs" existe
const logsDirectory = path.join(__dirname, 'logs');

if (!fs.existsSync(logsDirectory)) {
  // If folder do not exists, create one
  fs.mkdirSync(logsDirectory);
}


//Log file path
const logFilePath = path.join(__dirname, 'logs', `log_${getCurrentDate()}.txt`);

const configPath = './config.json';
let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

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

// Load configs at startup
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
    logMessage(message)
    res.json({ message });
});

app.post('/toggle-debug', express.json(), (req, res) => {
  const { isEnabled } = req.body;
  debugMode = isEnabled;
  const message = isEnabled ? '✅ Debug mode activated.' : '❌ Debug mode deactivated.';
  logMessage(`${isEnabled ? '✅ Debug mode activated.' : '❌ Debug mode deactivated.'}`, true)
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

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

fs.writeFileSync(logFilePath, '', { flag: 'a' });

// Custom logging function
function logMessage(message, important = false) {
  if (debugMode || important) {
    console.log(message);
  }
  // Enregistrement dans le fichier log
  fs.writeFileSync(logFilePath, `${new Date().toISOString()} - ${message}\n`, {
    flag: 'a'
  });

    // Envoi du message à tous les clients WebSocket connectés
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

app.listen(port, () => {
  logMessage(`Server is ready listening to port ${port}.`, true);
});

