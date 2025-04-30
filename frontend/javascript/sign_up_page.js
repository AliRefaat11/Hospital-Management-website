// Navbar JavaScript
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

const sections = document.querySelectorAll('section');

const revealSection = () => {
  sections.forEach((section) => {
    const sectionTop = section.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (sectionTop < windowHeight - 100) {
      section.classList.add('visible');
    } else {
      section.classList.remove('visible');
    }
  });
};

window.addEventListener('scroll', revealSection);

revealSection();

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

// Sign Up Form JavaScript
function handleSignUp() {
  const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorMessage = document.getElementById('errorMessage');

    // Basic validation
    if (!firstName || !lastName || !phoneNumber ||!username || !email || !password || !confirmPassword) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Please fill in all fields';
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Please enter a valid email address';
        return;
    }

    // Password match validation
    if (password !== confirmPassword) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Passwords do not match';
        return;
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,12}$/;
    if (!passwordRegex.test(password)) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Password must be 8-12 characters, include uppercase, lowercase, and number';
        return;
    }

    // Simulated signup (replace with actual backend API call)
    // In a real application, this would send data to a server
    const mockUserDatabase = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (mockUserDatabase[username]) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Username already exists';
        return;
    }

    // Store user data (for demo purposes only - not secure for production)
    mockUserDatabase[username] = {
        username,
        email,
        password // In production, password should be hashed
    };
    
    localStorage.setItem('users', JSON.stringify(mockUserDatabase));
    
    errorMessage.style.display = 'none';
    alert('Sign up successful! Redirecting to login...');
    window.location.href = 'login.html';
}

// Handle Enter key press for signup
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleSignUp();
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