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
let lightControlEnabled = true; // By default, Home Theater is activated.
let playerName = "LG OLED55A19LA";  // Change this to the name of your TV, you can change that later, after testing. THe name of your TV will be shown in the console.
let userOneName = "thboehi"; // Like before
let userTwoName = "oliveira.18"; // Like before

app.post('/webhook', upload.any(), (req, res) => {
    const reqBody = JSON.parse(req.body.payload);
    const player = reqBody.Player.title;
    console.log("------------------");
    console.log('Player: ', player);
    const user = reqBody.Account.title;
    console.log('User: ', user);
    const event = reqBody.event;
    console.log('Event: ', event);
    console.log("------------------");

    if (player === playerName && (user === userOneName || user === userTwoName)){
        console.log("Correct environment, continuing...");
        console.log("------------------");
        switch (event){
            case "media.play":
                console.log("Movie started, shut down the light.");
                controlHueLight(false);
                console.log("------------------");
                break;
            case "media.resume":
                console.log("Movie resumed, shut down the light.");
                controlHueLight(false);
                console.log("------------------");
                break;
            case "media.pause":
                console.log("Movie paused, turn on the light.");
                controlHueLight(true);
                console.log("------------------");
                break;
            case "media.stop":
                console.log("Movie stopped, turn on the light.");
                controlHueLight(true);
                console.log("------------------");
                break;
        }

    } else {
        console.log("Not the right environment, noting to do more.")
        console.log("------------------");
    }

    res.sendStatus(200);
});

// Static page to control the lights
app.use(express.static('public'));

// Route to get current setup
app.get('/get-light-control-status', (req, res) => {
  res.json({ isEnabled: lightControlEnabled});
});

app.post('/toggle-light-control', express.json(), (req, res) => {
    const { isEnabled } = req.body;
    lightControlEnabled = isEnabled;
    const message = isEnabled ? '✅ Home Theater Mode activated.' : '❌ Home Theater Mode deactivated.';
    res.json({ message });
});

async function controlHueLight(on) {
  if (!lightControlEnabled) {
    console.log('Theater Mode deactivated, nothing to do more.');
    return;
}
  try {
    const url = `${baseHueURL}/${username}/lights/${lightNumber}/state`;
    const body = { on: on };
    await axios.put(url, body);
    console.log(`The light ${lightNumber} is now ${on ? 'ON' : 'OFF'}.`);
  } catch (error) {
    console.error('Error with Hue communication :', error.message);
  }
}

app.listen(port, () => {
  console.log(`Server is ready listening to port ${port}.`);
});
