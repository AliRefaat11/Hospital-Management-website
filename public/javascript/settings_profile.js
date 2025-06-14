document.getElementById('settingsForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const emailNotifications = document.getElementById('emailNotif').checked;
    const smsNotifications = document.getElementById('smsNotif').checked;
    const privateProfile = document.getElementById('privacySetting').checked; // Corrected variable name

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Handle password change if fields are filled
    if (currentPassword || newPassword || confirmPassword) {
        if (!currentPassword) {
            showFormError('Please enter your current password.');
            return;
        }
        if (newPassword !== confirmPassword) {
            showFormError('New passwords do not match.');
            return;
        }
        if (newPassword.length < 8) {
            showFormError('New password must be at least 8 characters long.');
            return;
        }

        try {
            const response = await fetch('/User/profile/password', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                showSuccessMessage(data.message || 'Password updated successfully!');
                // Redirect to login after successful password change
                setTimeout(() => {
                    window.location.href = '/User/login';
                }, 1500);
            } else {
                showFormError(data.message || 'Failed to update password.');
            }
        } catch (error) {
            console.error('Error during password update:', error);
            showFormError('An error occurred. Please try again.');
        }
    }

    // Handle other settings (notification preferences) submission
    // This part assumes these settings are saved in a separate API or handled by this same endpoint if your backend supports it.
    // For now, if only password is changed, other settings are not implicitly saved via this specific form submission.
    // If you have a separate API for notification preferences, you would make another fetch request here.

    // If no password change was attempted, and no other settings API, just show success and redirect.
    // For a real app, this should only happen if there are no password fields and other settings were handled.
    if (!(currentPassword || newPassword || confirmPassword)) {
         showSuccessMessage('Settings saved successfully!');
         setTimeout(() => {
             window.location.href = '/User/profile';
         }, 1500);
    }
});

// Show form error message
function showFormError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const existingMsg = document.querySelector('.success-message, .error-message');
    if (existingMsg) existingMsg.remove();
    
    const formActions = document.querySelector('.form-actions');
    formActions.parentNode.insertBefore(errorDiv, formActions);
}

// Show success message
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const existingMsg = document.querySelector('.success-message, .error-message');
    if (existingMsg) existingMsg.remove();
    
    const formActions = document.querySelector('.form-actions');
    formActions.parentNode.insertBefore(successDiv, formActions);
}

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