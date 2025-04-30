const navToggle = document.createElement('button');
navToggle.classList.add('nav-toggle');
navToggle.innerHTML = '☰';
document.querySelector('.nav-container').prepend(navToggle);

const navLinksContainer = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinksContainer.classList.toggle('active');
});

navLinksContainer.addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
        navLinksContainer.classList.remove('active');
    }
});

const navLinksi = document.querySelectorAll('.nav-links a');

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.forEach(nav => nav.classList.remove('active'));
        link.classList.add('active');
    });
});

const currentPath = window.location.href;
navLinks.forEach(link => {
    if (link.href === currentPath) {
        link.classList.add('active');
    }
});

document.addEventListener('DOMContentLoaded', function() {    
    const savedCredentials = localStorage.getItem('primecare_credentials');
    
    if (savedCredentials) {
        const credentials = JSON.parse(savedCredentials);
        document.getElementById('username').value = credentials.username;
        document.getElementById('password').value = credentials.password;
        document.getElementById('rememberMe').checked = true;
    }
});

// Login
function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const errorMessage = document.getElementById('errorMessage');

    
    if (!username || !password) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Please fill in all fields';
        return;
    }
    
    const mockCredentials = {
        doctor: { username: 'doc123', password: 'pass123' },
        nurse: { username: 'nurse456', password: 'pass456' },
        admin: { username: 'admin789', password: 'pass789' },
        patient: { username: 'patient101', password: 'pass101' }
    };

    const valid = Object.values(mockCredentials).some(cred => 
        username === cred.username && password === cred.password
    );

    if (valid) {
        errorMessage.style.display = 'none';
        
        //remember me
        if (rememberMe) {
         
            localStorage.setItem('primecare_credentials', JSON.stringify({
                username: username,
                password: password
            }));
        } else {
        
            localStorage.removeItem('primecare_credentials');
        }
        
        alert('Login successful! Redirecting to dashboard...');
    } else {
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Invalid credentials';
    }
}

document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleLogin();
    }
});

const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('.nav-links');

// Toggle the visibility of the navigation links
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Close the navigation menu when a link is clicked
navLinks.addEventListener('click', (event) => {
  if (event.target.tagName === 'A') {
    navLinks.classList.remove('active');
  }
});