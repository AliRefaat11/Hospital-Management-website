document.getElementById('settingsForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Just for simulation, show alert (in real case you'd save settings in backend)
    alert('Settings saved successfully!');
    window.location.href = 'user_profile.html';  // Redirect back to profile
});
// Load existing settings
document.addEventListener('DOMContentLoaded', function() {
    // Try to get saved settings
    const savedSettings = localStorage.getItem('primecare_user_settings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        // Set checkboxes
        document.getElementById('emailNotif').checked = settings.emailNotifications;
        document.getElementById('smsNotif').checked = settings.smsNotifications;
        document.getElementById('privacySetting').checked = settings.privacyRestricted;
    }
});

// Save settings
document.getElementById('settingsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get current settings
    const emailNotifications = document.getElementById('emailNotif').checked;
    const smsNotifications = document.getElementById('smsNotif').checked;
    const privacyRestricted = document.getElementById('privacySetting').checked;
    
    // Get password fields
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate passwords if the user is trying to change them
    if (currentPassword || newPassword || confirmPassword) {
        if (!currentPassword) {
            alert('Please enter your current password');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        
        if (newPassword.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }
        
        // In a real app, you'd verify the current password and update it on the server
        // Here we'll just show a confirmation
        alert('Password updated successfully');
    }
    
    // Save settings to localStorage
    const settings = {
        emailNotifications,
        smsNotifications,
        privacyRestricted
    };
    
    localStorage.setItem('primecare_user_settings', JSON.stringify(settings));
    
    // Show success message and redirect
    alert('Settings saved successfully!');
    window.location.href = 'user_profile.html';
});