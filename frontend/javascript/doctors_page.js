// Select the toggle button and nav links
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

// Add click event listener to toggle button
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('show'); // Toggle the "show" class
});

const navLinksContainer = document.querySelector('.nav-links');

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

const navLinksElements = document.querySelectorAll('.nav-links a');

navLinksElements.forEach(link => {
  link.addEventListener('click', () => {
    navLinksElements.forEach(nav => nav.classList.remove('active'));
    link.classList.add('active');
  });
});

const currentPath = window.location.href;
navLinksElements.forEach(link => {
  if (link.href === currentPath) {
    link.classList.add('active');
  }
});

const logo = document.querySelector('.logo');

logo.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});