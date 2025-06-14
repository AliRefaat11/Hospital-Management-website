document.addEventListener("DOMContentLoaded", async function() {
    // Select the toggle button and nav links
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    // Add click event listener to toggle button
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('show'); // Toggle the "show" class
        });
    }

    const navLinksContainer = document.querySelector('.nav-links');

    if (navLinksContainer) {
        navLinksContainer.addEventListener('click', (event) => {
            if (event.target.tagName === 'A') {
                navLinksContainer.classList.remove('active');
            }
        });
    }

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

    if (logo) {
        logo.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
        });
    }

    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('#search');
    const doctorList = document.querySelector('#doctor-list');

    // Function to create a doctor card HTML element
    function createDoctorCard(doctor) {
        const card = document.createElement('div');
        card.className = 'doctor-card';
        card.dataset.name = `${doctor.userId.FName} ${doctor.userId.LName}`;
        card.dataset.specialization = doctor.specialization;

        card.innerHTML = `
            <div class="doctor-img-container">
                <img src="${doctor.profileImage || '/images/account-icon-33.png'}" 
                     alt="Dr. ${doctor.userId.FName} ${doctor.userId.LName}" 
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

    // Function to fetch and display doctors based on a query
    async function fetchAndDisplayDoctors(query = '') {
        try {
            const url = query ? `/doctors/search?query=${encodeURIComponent(query)}` : '/api/doctors';
            const response = await fetch(url);
            const data = await response.json();

            console.log('Fetched doctor data:', data);

            doctorList.innerHTML = ''; // Clear previous results

            if (data.status === 'success' && data.data.length > 0) {
                data.data.forEach(doctor => {
                    const card = createDoctorCard(doctor);
                    doctorList.appendChild(card);
                });
            } else {
                const message = document.createElement('div');
                message.className = 'no-results-message';
                message.innerHTML = `<i class="fa fa-search"></i> No doctors found for "${query}".`;
                doctorList.appendChild(message);
            }
            
            // Update URL without reloading page
            const newUrl = new URL(window.location.origin + window.location.pathname);
            if (query) {
                newUrl.searchParams.set('query', query);
            } else {
                newUrl.searchParams.delete('query');
            }
            window.history.pushState({}, '', newUrl);

        } catch (error) {
            console.error('Error fetching doctors:', error);
            doctorList.innerHTML = '<div class="no-results-message"><i class="fa fa-exclamation-circle"></i> Error loading doctors. Please try again later.</div>';
        }
    }

    // Initial fetch of doctors when the page loads
    // Check if there's a query in the URL on page load
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('query');
    searchInput.value = initialQuery || ''; // Set search input value if query exists
    fetchAndDisplayDoctors(initialQuery || '');


    // Implement live search on input
    searchInput.addEventListener('input', function() {
        fetchAndDisplayDoctors(this.value.trim());
    });

    // Handle form submission (prevents default and uses live search logic)
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        fetchAndDisplayDoctors(searchInput.value.trim());
        return false; // Explicitly prevent default form submission
    });
});