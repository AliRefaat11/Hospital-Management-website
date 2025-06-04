const LOGIN_CONFIG = {
    mockCredentials: {
        doctor: { username: 'doc123', password: 'pass123' },
        nurse: { username: 'nurse456', password: 'pass456' },
        admin: { username: 'admin789', password: 'pass789' },
        patient: { username: 'patient101', password: 'pass101' }
    },
    storageKey: 'primecare_credentials'
};

// DOM Elements
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('.navbar-links');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const rememberMeCheckbox = document.getElementById('rememberMe');
const errorMessage = document.getElementById('errorMessage');
const loginButton = document.getElementById('loginButton');

// Load Saved Credentials
function loadSavedCredentials() {
    const savedCredentials = localStorage.getItem(LOGIN_CONFIG.storageKey);
    
    if (savedCredentials) {
        try {
            const credentials = JSON.parse(savedCredentials);
            usernameInput.value = credentials.username;
            passwordInput.value = credentials.password;
            rememberMeCheckbox.checked = true;
        } catch (error) {
            console.error('Error loading saved credentials:', error);
        }
    }
}

// Validate Credentials
function validateCredentials(username, password) {
    return Object.values(LOGIN_CONFIG.mockCredentials).some(
        cred => cred.username === username && cred.password === password
    );
}

// Show Error Message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Handle Login
function handleLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const rememberMe = rememberMeCheckbox.checked;

    // Basic validation
    if (!username || !password) {
        showError('Please fill in all fields');
        return;
    }

    // Check credentials
    if (validateCredentials(username, password)) {
        // Clear any previous error
        errorMessage.style.display = 'none';
        
        // Handle "Remember Me"
        if (rememberMe) {
            localStorage.setItem(LOGIN_CONFIG.storageKey, JSON.stringify({
                username: username,
                password: password
            }));
        } else {
            localStorage.removeItem(LOGIN_CONFIG.storageKey);
        }
        
        // Redirect or show success message
        alert('Login successful! Redirecting to dashboard...');
        // You might want to replace this with an actual redirect
        // window.location.href = './dashboard.html';
    } else {
        showError('Invalid credentials');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load saved credentials
    loadSavedCredentials();

    // Login button click
    loginButton.addEventListener('click', handleLogin);

    // Allow login on Enter key press
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
});

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