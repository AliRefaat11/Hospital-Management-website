document.getElementById('editProfileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Profile changes saved successfully!');
    window.location.href = 'user_profile.html';  // Redirect back to profile
});
// Load existing user data into form fields
document.addEventListener('DOMContentLoaded', function() {
    // Try to get saved user data
    const savedUserData = localStorage.getItem('primecare_user_data');
    if (savedUserData) {
        const userData = JSON.parse(savedUserData);
        
        // Populate form fields with saved data
        document.getElementById('name').value = userData.name || '';
        document.getElementById('email').value = userData.email || '';
        document.getElementById('dob').value = userData.dobRaw || '';
        
        // Set gender dropdown
        const genderSelect = document.getElementById('gender');
        if (genderSelect) {
            for (let i = 0; i < genderSelect.options.length; i++) {
                if (genderSelect.options[i].text === userData.gender) {
                    genderSelect.selectedIndex = i;
                    break;
                }
            }
        }
        
        // Set other fields
        document.getElementById('phone').value = userData.phoneRaw || '';
        document.getElementById('address').value = userData.address || '';
        document.getElementById('doctor').value = userData.doctor || '';
        document.getElementById('insurance').value = userData.insurance || '';
        
        // Show profile image preview if exists
        if (userData.profileImage) {
            const previewContainer = document.createElement('div');
            previewContainer.className = 'image-preview';
            previewContainer.innerHTML = `
                <img src="${userData.profileImage}" alt="Profile Image">
                <p>Current profile image</p>
            `;
            document.getElementById('profileImage').parentNode.appendChild(previewContainer);
        }
    }
    
    // Add image preview functionality
    document.getElementById('profileImage').addEventListener('change', previewImage);
});

// Preview selected image before upload
function previewImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Remove existing preview
    const existingPreview = document.querySelector('.image-preview');
    if (existingPreview) existingPreview.remove();
    
    // Create preview element
    const previewContainer = document.createElement('div');
    previewContainer.className = 'image-preview';
    
    const reader = new FileReader();
    reader.onload = function(event) {
        previewContainer.innerHTML = `
            <img src="${event.target.result}" alt="Profile Image Preview">
            <p>New profile image</p>
        `;
    };
    reader.readAsDataURL(file);
    
    // Add preview to DOM
    e.target.parentNode.appendChild(previewContainer);
}

// Save form data when submitted
document.getElementById('editProfileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Form validation
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    
    if (!name) {
        showFormError('Please enter your name');
        return;
    }
    
    if (!email) {
        showFormError('Please enter your email');
        return;
    }
    
    if (!validateEmail(email)) {
        showFormError('Please enter a valid email address');
        return;
    }
    
    // Get values from form
    const dobInput = document.getElementById('dob').value;
    const gender = document.getElementById('gender').value;
    const phoneInput = document.getElementById('phone').value.replace(/\D/g, '');
    const address = document.getElementById('address').value;
    const doctor = document.getElementById('doctor').value;
    const insurance = document.getElementById('insurance').value;
    
    // Format date nicely for display
    const dobDate = new Date(dobInput);
    const dobFormatted = dobDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Format phone nicely for display
    const phoneFormatted = phoneInput.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    
    // Create user data object
    const userData = {
        name: name,
        email: email,
        dob: dobFormatted,
        dobRaw: dobInput,
        gender: gender,
        phone: phoneFormatted,
        phoneRaw: phoneInput,
        address: address,
        doctor: doctor,
        insurance: insurance
    };
    
    // Handle profile image if it's selected
    const profileImageInput = document.getElementById('profileImage');
    if (profileImageInput.files && profileImageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(event) {
            userData.profileImage = event.target.result;
            saveUserDataAndRedirect(userData);
        };
        reader.readAsDataURL(profileImageInput.files[0]);
    } else {
        // Keep existing profile image if available
        const savedUserData = localStorage.getItem('primecare_user_data');
        if (savedUserData) {
            const oldData = JSON.parse(savedUserData);
            if (oldData.profileImage) {
                userData.profileImage = oldData.profileImage;
            }
        }
        saveUserDataAndRedirect(userData);
    }
});

// Helper function to save data and redirect
function saveUserDataAndRedirect(userData) {
    // Save to localStorage
    localStorage.setItem('primecare_user_data', JSON.stringify(userData));
    
    // Show success message and redirect
    showSuccessMessage('Profile changes saved successfully!');
    setTimeout(() => {
        window.location.href = 'user_profile.html';
    }, 1500);
}

// Show form error message
function showFormError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Remove any existing error
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    // Add new error before the form actions
    const formActions = document.querySelector('.form-actions');
    formActions.parentNode.insertBefore(errorDiv, formActions);
}

// Show success message
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    // Remove any existing messages
    const existingMsg = document.querySelector('.success-message, .error-message');
    if (existingMsg) existingMsg.remove();
    
    // Add success message
    const formActions = document.querySelector('.form-actions');
    formActions.parentNode.insertBefore(successDiv, formActions);
}

// Email validation
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
