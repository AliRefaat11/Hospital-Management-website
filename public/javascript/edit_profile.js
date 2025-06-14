document.getElementById('editProfileForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const dob = document.getElementById('dob').value;
    const gender = document.getElementById('gender').value;
    const phone = document.getElementById('phone').value.replace(/\D/g, '');
    const address = document.getElementById('address').value;
    const doctor = document.getElementById('doctor').value;
    const insurance = document.getElementById('insurance').value;

    if (!name) {
        showFormError('Please enter your full name');
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
    if (!phone) {
        showFormError('Please enter your phone number');
        return;
    }
    if (!address) {
        showFormError('Please enter your address');
        return;
    }

    const formData = {
        name: name,
        email: email,
        dob: dob, // Send raw DOB for now
        gender: gender,
        phone: phone,
        address: address,
        doctor: doctor,
        insurance: insurance
    };

    try {
        const response = await fetch('/User/profile', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            showSuccessMessage(data.message || 'Profile updated successfully!');
            setTimeout(() => {
                window.location.href = '/User/profile';
            }, 1500);
        } else {
            showFormError(data.message || 'Failed to update profile.');
        }
    } catch (error) {
        console.error('Error during profile update:', error);
        showFormError('An error occurred. Please try again.');
    }
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

// Show form error message
function showFormError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Remove any existing messages (success or error)
    const existingMsg = document.querySelector('.success-message, .error-message');
    if (existingMsg) existingMsg.remove();
    
    // Add new error before the form actions
    const formActions = document.querySelector('.form-actions');
    formActions.parentNode.insertBefore(errorDiv, formActions);
}

// Show success message
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    // Remove any existing messages (success or error)
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
