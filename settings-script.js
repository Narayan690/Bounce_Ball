document.addEventListener("DOMContentLoaded", () => {
    const musicCheckbox = document.getElementById('musicCheckbox');
    const vibrationCheckbox = document.getElementById('vibrationCheckbox');

    // Load saved settings from localStorage
    function loadSettings() {
        // Default to 'true' if no setting is saved
        const musicState = localStorage.getItem('music') !== 'false' ? 'true' : 'false';
        const vibrationState = localStorage.getItem('vibration') !== 'false' ? 'true' : 'false';

        // Apply music setting
        musicCheckbox.setAttribute('data-checked', musicState);
        musicCheckbox.textContent = musicState === 'true' ? '✓' : '';

        // Apply vibration setting
        vibrationCheckbox.setAttribute('data-checked', vibrationState);
        vibrationCheckbox.textContent = vibrationState === 'true' ? '✓' : '';
    }

    // Toggle function
    function toggleSetting(element, key) {
        const isChecked = element.getAttribute('data-checked') === 'true';
        const newState = !isChecked;
        const newStateString = newState.toString();
        
        // Update DOM attribute and text
        element.setAttribute('data-checked', newStateString);
        element.textContent = newState ? '✓' : '';
        
        // Save to localStorage
        localStorage.setItem(key, newStateString);
    }

    // Event listeners
    musicCheckbox.addEventListener('click', () => {
        toggleSetting(musicCheckbox, 'music');
    });

    vibrationCheckbox.addEventListener('click', () => {
        // Warn if the device/browser doesn't support vibration
        if (vibrationCheckbox.getAttribute('data-checked') === 'true' && !('vibrate' in navigator)) {
            alert("Warning: Vibration setting has been turned ON, but your browser/device does not support the Vibration API.");
        }
        toggleSetting(vibrationCheckbox, 'vibration');
    });

    // Initial load
    loadSettings();
});