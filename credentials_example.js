// 🚧 Please rename this file credentials.js before starting the app

const username = 'token'; // Change by your token for the Hue Bridge (search google how to create a new token, you can use Insomnia, Postman, etc.)
const baseUrl = 'http://192.168.1.123/api' // Change this by the IP of your Hue Bridge. Keep the same format !!

module.exports = {
  username: username,
  baseUrl: baseUrl,
};