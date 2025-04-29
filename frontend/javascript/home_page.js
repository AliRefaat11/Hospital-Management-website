const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

// Add click event listener to toggle button
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active'); // Toggle the 'active' class
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

const currentPath = window.location.href;
navLinksElements.forEach(link => {
  if (link.href === currentPath) {
    link.classList.add('active');
  }
});

document.addEventListener("DOMContentLoaded", () => {
  console.log("Footer loaded successfully.");
});