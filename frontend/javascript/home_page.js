window.addEventListener('DOMContentLoaded', () => {
    console.log("Welcome to HealthyCare's profile page!");
  });
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('.nav-links');

// Toggle the visibility of the navigation links
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active'); // Add or remove the 'active' class
});

// Close the navigation menu when a link is clicked
navLinks.addEventListener('click', (event) => {
  if (event.target.tagName === 'A') {
    navLinks.classList.remove('active'); // Remove the 'active' class
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

const searchBar = document.querySelector('.search-bar');
const searchContainer = document.querySelector('.search-container');

// Handle "Enter" key press
searchBar.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevent default form submission
    const searchQuery = searchBar.value.trim(); // Store the search input in a variable
    console.log('Search Query:', searchQuery); // Log the search query (for testing)
    searchBar.value = ''; // Clear the search bar
  }
});

// Hide the search bar when clicking outside
document.addEventListener('click', (event) => {
  if (!searchContainer.contains(event.target)) {
    searchBar.style.width = '0'; // Collapse the search bar
    searchBar.style.opacity = '0'; // Hide the search bar
  }
});

// Prevent the search bar from collapsing when clicked
searchBar.addEventListener('click', (event) => {
  event.stopPropagation(); // Prevent the click from propagating to the document
});

