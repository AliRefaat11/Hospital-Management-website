document.getElementById('settingsForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('Settings form submitted.');

    const emailNotifications = document.getElementById('emailNotif').checked;
    const smsNotifications = document.getElementById('smsNotif').checked;
    const privateProfile = document.getElementById('privacySetting').checked;

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const updateData = {
        emailNotifications: emailNotifications,
        smsNotifications: smsNotifications,
        privateProfile: privateProfile
    };

    let passwordChangeAttempted = false;

    // Handle password change if fields are filled
    if (currentPassword || newPassword || confirmPassword) {
        passwordChangeAttempted = true;
        console.log('Password change attempted.');
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
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
    }

    console.log('Sending update data:', updateData);
    try {
        const url = passwordChangeAttempted ? '/User/profile/password' : '/User/profile';
        const method = passwordChangeAttempted ? 'PATCH' : 'PATCH'; // Both are PATCH operations
        
        console.log(`Making ${method} request to ${url}`);
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });

        const data = await response.json();
        console.log('Server response data:', data);

        if (response.ok) {
            // Use native alert for password change success as requested
            if (passwordChangeAttempted) {
                alert(data.message || 'Password updated successfully!');
                // No immediate redirect, user can manually navigate or log in again
                // setTimeout(() => {
                //     window.location.href = '/User/login';
                // }, 1500);
            } else {
                showSuccessMessage(data.message || 'Settings saved successfully!');
                // Otherwise, reload page to reflect settings
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } else {
            showFormError(data.message || 'Failed to save settings.');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        showFormError('An error occurred. Please try again.');
    }
});

// Show form error message
function showFormError(message) {
    alert(message); // Using alert for error messages as well
    const existingMsg = document.querySelector('.success-message, .error-message');
    if (existingMsg) existingMsg.remove();
    
    // Removed insertion of custom error div as alert is used
    // const formActions = document.querySelector('.form-actions');
    // formActions.parentNode.insertBefore(errorDiv, formActions);
}

// Show success message
function showSuccessMessage(message) {
    // This function will now only be used for non-password related settings updates
    // For password updates, native alert is used above
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
    // Load existing settings if available from server-side user object
    if (typeof user !== 'undefined' && user) {
        document.getElementById('emailNotif').checked = user.emailNotifications || false;
        document.getElementById('smsNotif').checked = user.smsNotifications || false;
        document.getElementById('privacySetting').checked = user.privateProfile || false;
    }
    
    // Also consider old localStorage fallback if user object isn't fully populating
    const savedSettings = localStorage.getItem('primecare_user_settings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        // Only apply if server data didn't already set it
        if (typeof user === 'undefined' || !user.emailNotifications) {
            document.getElementById('emailNotif').checked = settings.emailNotifications || false;
        }
        if (typeof user === 'undefined' || !user.smsNotifications) {
            document.getElementById('smsNotif').checked = settings.smsNotifications || false;
        }
        if (typeof user === 'undefined' || !user.privateProfile) { // Corrected name
            document.getElementById('privacySetting').checked = settings.privacyRestricted || false; // Keep privacyRestricted for old data
        }
    }
});