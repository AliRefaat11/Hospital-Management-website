const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('.navbar-links');

// Navigation Toggle for Responsive Design
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Close navigation menu when a link is clicked
navLinks.addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
        navLinks.classList.remove('active');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form');
    const errorMessage = document.getElementById('errorMessage');
    const emailInput = document.getElementById('Email');
    const passwordInput = document.getElementById('Password');
    const rememberMeCheckbox = document.getElementById('rememberMe');

    // Load saved email if remember me was checked
    const savedCredentials = localStorage.getItem('rememberMe');
    if (savedCredentials) {
        try {
            const { email } = JSON.parse(savedCredentials);
            emailInput.value = email;
            rememberMeCheckbox.checked = true;
        } catch (error) {
            console.error('Error loading saved credentials:', error);
            localStorage.removeItem('rememberMe');
        }
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const rememberMe = rememberMeCheckbox.checked;

        // Basic validation
        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }

        // Disable the submit button to prevent double submission
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';

        try {
            console.log('Attempting login with:', { Email: email });
            const response = await fetch('/User/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ Email: email, Password: password })
            });

            console.log('Login response status:', response.status);
            const data = await response.json();
            console.log('Login response data:', data);

            if (response.ok) {
                // Handle successful login
                if (rememberMe) {
                    localStorage.setItem('rememberMe', JSON.stringify({ email }));
                } else {
                    localStorage.removeItem('rememberMe');
                }

                // Store the token
                localStorage.setItem('token', data.token);
                console.log('Login successful, redirecting...');

                // Redirect to home page or dashboard
                window.location.href = '/';
            } else {
                // Show error message from server
                showError(data.message || 'Login failed. Please try again.');
                console.error('Login failed:', data);
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('An error occurred. Please try again later.');
        } finally {
            // Re-enable the submit button
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        // Scroll to error message
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});