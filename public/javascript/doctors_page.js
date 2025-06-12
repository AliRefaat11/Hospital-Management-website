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

document.addEventListener("DOMContentLoaded", () => {
  console.log("Footer loaded successfully.");
});

document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('#search');
    const doctorList = document.querySelector('#doctor-list');
    const doctorCards = document.querySelectorAll('.doctor-card');

    // Function to filter doctors
    function filterDoctors(query) {
        query = query.toLowerCase();
        
        doctorCards.forEach(card => {
            const doctorName = card.dataset.name.toLowerCase();
            const specialization = card.dataset.specialization.toLowerCase();
            
            if (doctorName.includes(query) || specialization.includes(query)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });

        // Show/hide "no results" message
        const visibleCards = Array.from(doctorCards).filter(card => card.style.display !== 'none');
        const noResultsMessage = document.querySelector('.no-results-message');
        
        if (visibleCards.length === 0) {
            if (!noResultsMessage) {
                const message = document.createElement('div');
                message.className = 'no-results-message';
                message.textContent = 'No doctors found matching your search.';
                doctorList.appendChild(message);
            }
        } else {
            if (noResultsMessage) {
                noResultsMessage.remove();
            }
        }
    }

    // Handle search input
    searchInput.addEventListener('input', function() {
        filterDoctors(this.value);
    });

    // Handle form submission
    searchForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const query = searchInput.value.trim();
        
        if (!query) {
            // If search is empty, show all doctors
            doctorCards.forEach(card => card.style.display = '');
            const noResultsMessage = document.querySelector('.no-results-message');
            if (noResultsMessage) {
                noResultsMessage.remove();
            }
            return;
        }

        try {
            const response = await fetch(`/doctors/search?query=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (data.status === 'success') {
                // Update the URL with the search query
                const url = new URL(window.location);
                url.searchParams.set('query', query);
                window.history.pushState({}, '', url);

                // Update the doctor list with search results
                doctorList.innerHTML = '';
                
                if (data.data.length === 0) {
                    const message = document.createElement('div');
                    message.className = 'no-results-message';
                    message.textContent = 'No doctors found matching your search.';
                    doctorList.appendChild(message);
                } else {
                    data.data.forEach(doctor => {
                        const card = createDoctorCard(doctor);
                        doctorList.appendChild(card);
                    });
                }
            }
        } catch (error) {
            console.error('Error searching doctors:', error);
        }
    });

    // Function to create doctor card
    function createDoctorCard(doctor) {
        const card = document.createElement('div');
        card.className = 'doctor-card';
        card.dataset.name = `${doctor.userId.FName} ${doctor.userId.LName}`;
        card.dataset.specialization = doctor.specialization;

        card.innerHTML = `
            <div class="doctor-img-container">
                <img src="${doctor.profileImage || '/images/account-icon-33.png'}" 
                     alt="${doctor.userId.FName} ${doctor.userId.LName}" 
                     class="doctor-img">
            </div>
            <h3>
                <a href="/doctors/${doctor._id}">Dr. ${doctor.userId.FName} ${doctor.userId.LName}</a>
            </h3>
            <p>${doctor.specialization}</p>
            ${doctor.departmentId ? `<p class="department">${doctor.departmentId.name}</p>` : ''}
            <div class="doctor-info">
                <p><i class="fas fa-phone"></i> ${doctor.userId.PhoneNumber}</p>
                <p><i class="fas fa-envelope"></i> ${doctor.userId.Email}</p>
            </div>
            <div class="card-actions">
                <a class="btn book-btn" href="/appointments/book?doctor=${doctor._id}">Book Appointment</a>
            </div>
        `;

        return card;
    }
});