
// Select the toggle button and navigation links
const navToggle = document.createElement('button');
navToggle.classList.add('nav-toggle');
navToggle.innerHTML = '☰'; // Hamburger menu icon
document.querySelector('.nav-container').prepend(navToggle);

const navLinks = document.querySelector('.nav-links');

// Add event listener to toggle the visibility of navigation links
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Close the navigation menu when a link is clicked (optional for better UX)
navLinks.addEventListener('click', (event) => {
  if (event.target.tagName === 'A') {
    navLinks.classList.remove('active');
  }
});

// Add a class to elements when they are visible in the viewport
const sections = document.querySelectorAll('section');

const revealSection = () => {
  sections.forEach((section) => {
    const sectionTop = section.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    // Add 'visible' class if the section is in the viewport
    if (sectionTop < windowHeight - 100) {
      section.classList.add('visible');
    } else {
      section.classList.remove('visible');
    }
  });
};

// Listen for scroll events
window.addEventListener('scroll', revealSection);

// Trigger the function on page load
revealSection();

