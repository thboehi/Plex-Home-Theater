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

// Fonction pour récupérer la valeur de lightControlEnabled depuis le serveur
async function getLightControlStatus() {
    try {
      const response = await fetch('/get-light-control-status');
      const data = await response.json();
      return data.isEnabled;
    } catch (error) {
      console.error('Erreur lors de la récupération du statut de contrôle des lumières :', error);
      return false; // Par défaut, le contrôle est désactivé en cas d'erreur de récupération
    }
  }
  
// Exemple d'utilisation
(async () => {
const lightControlEnabled = await getLightControlStatus();
console.log('Statut du mode Home Theater :', lightControlEnabled);
if (lightControlEnabled) {
    document.querySelector("#lightControlCheckbox").setAttribute("checked", "")
}
// Utilisez la valeur de lightControlEnabled comme vous le souhaitez dans votre script
})();