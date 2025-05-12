// Highlight Active Navigation Link
const navLinks = document.querySelectorAll('.nav-links a');
const currentPath = window.location.href;

navLinks.forEach(link => {
  if (link.href === currentPath) {
    link.classList.add('active');
  }

  link.addEventListener('click', () => {
    navLinks.forEach(nav => nav.classList.remove('active'));
    link.classList.add('active');
  });
});

// Toggle Navigation Menu for Small Screens
const navToggle = document.querySelector('#nav-toggle');
const navLinksContainer = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navLinksContainer.classList.toggle('active');
});

// Reveal Sections on Scroll
const sections = document.querySelectorAll('section');
const revealSection = () => {
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop < window.innerHeight - 100) {
            section.classList.add('visible');
        } else {
            section.classList.remove('visible');
        }
    });
};

window.addEventListener('scroll', revealSection);
revealSection();
