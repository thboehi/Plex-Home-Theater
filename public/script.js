async function toggleLightControl() {
    const isChecked = document.getElementById('lightControlCheckbox').checked;
    try {
        const response = await fetch('/toggle-light-control', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isEnabled: isChecked })
        });
        const data = await response.json();
        console.log(data.message);
    } catch (error) {
        console.error('Erreur lors de la communication avec le serveur :', error);
    }
}

async function toggleDebugMode() {
    const isChecked = document.getElementById('debugMode').checked;
    try {
        const response = await fetch('/toggle-debug', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isEnabled: isChecked })
        });
        const data = await response.json();
        console.log(data.message);
    } catch (error) {
        console.error('Erreur lors de la communication avec le serveur :', error);
    }
}

async function updateData() {
    const playerName = document.getElementById('playerName').value;
    const userName1 = document.getElementById('userName1').value;
    const userName2 = document.getElementById('userName2').value;
    const lightNumber = document.getElementById('lightNumber').value;
    try {
        const response = await fetch('/update-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ playerName: playerName, userOneName: userName1, userTwoName: userName2, lightNumber: lightNumber })
        });
        const data = await response.json();
        console.log(data.message);
    } catch (error) {
        console.error('Erreur lors de la communication avec le serveur :', error);
    }
}


// Fonction pour récupérer la valeur de lightControlEnabled depuis le serveur
async function getLightControlStatus() {
    try {
      const response = await fetch('/get-light-control-status');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting the status :', error);
      return false; // by default, the control is deactivated in case of an error
    }
  }
  
(async () => {
const data = await getLightControlStatus();
console.log('Home Theater Mode enabled :', data.homeTheaterMode);
if (data.homeTheaterMode) {
    document.querySelector("#lightControlCheckbox").setAttribute("checked", "")
}
if (data.debugMode) {
    document.querySelector("#debugMode").setAttribute("checked", "")
}
document.querySelector("#playerName").setAttribute("value", data.playerName)
document.querySelector("#userName1").setAttribute("value", data.userName1)
document.querySelector("#userName2").setAttribute("value", data.userName2)
document.querySelector("#lightNumber").setAttribute("value", data.lightNumber)
})();