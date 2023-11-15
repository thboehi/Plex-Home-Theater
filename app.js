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
const port = 80;

const baseHueURL = credentials.baseUrl; // Change this in the credentials.js file
const username = credentials.username; // Change by your token for the Hue Bridge (search google how to create a new token, you can use Insomnia, Postman, etc.)

const upload = multer();

//Vars for configs
let playerName, userOneName, userTwoName, homeTheaterMode, lightNumber, notBefore, notAfter;

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
    notBefore = loadedConfig.notBefore;
    notAfter = loadedConfig.notAfter
    logMessage('Configuration loaded from config.json.', true);
  } catch (error) {
    logMessage('Error loading configuration from config.json:', true);
    logMessage(error.message, true);
  }
}

// Load configs at startup
loadConfig();

app.post('/webhook', upload.any(), (req, res) => {
  if (isItTime()) {
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
  } else {
    if (notAfter === "" || notBefore === "") {
      logMessage("------------------");
      logMessage('Time activation has not been defined now, please define it before using this app.');
    } else {
      logMessage("------------------");
      logMessage('Not right now\nOnly between ' + notBefore + ' and ' + notAfter);
    }
  }
    

    res.sendStatus(200);
});

// Static page to control the lights
app.use(express.static('public'));

// Route to get current setup
app.get('/get-light-control-status', (req, res) => {
  res.json({ homeTheaterMode: homeTheaterMode, playerName: playerName, userName1: userOneName, userName2: userTwoName, debugMode: debugMode, lightNumber: lightNumber, notBefore: notBefore, notAfter: notAfter });
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
  notBefore = updatedData.notBefore
  notAfter = updatedData.notAfter
  const message = "Informations changée vers: " . updatedData

    // Save the config to the config file
    config.playerName = updatedData.playerName;
    config.userOneName = updatedData.userOneName;
    config.userTwoName = updatedData.userTwoName;
    config.lightNumber = updatedData.lightNumber;
    config.notBefore = updatedData.notBefore
    config.notAfter = updatedData.notAfter
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
    console.error('Error with Hue communication :\n', error.message);
  }
}

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const isItTime = () => {
  // Obtenez l'heure actuelle
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  // Convertir les heures notBefore et notAfter en heures numériques
  const [notBeforeHour, notBeforeMinutes] = notBefore.split(':').map(Number);
  const [notAfterHour, notAfterMinutes] = notAfter.split(':').map(Number);

  // Gestion du passage à minuit (notAfter < notBefore)
  let isTimeInRange;
  if (notAfterHour < notBeforeHour) {
      isTimeInRange =
          (currentHour > notBeforeHour || (currentHour === notBeforeHour && currentMinutes >= notBeforeMinutes)) ||
          (currentHour < notAfterHour || (currentHour === notAfterHour && currentMinutes < notAfterMinutes));
  } else {
      isTimeInRange =
          (currentHour > notBeforeHour || (currentHour === notBeforeHour && currentMinutes >= notBeforeMinutes)) &&
          (currentHour < notAfterHour || (currentHour === notAfterHour && currentMinutes < notAfterMinutes));
  }

  return isTimeInRange;
};

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

