let userData = {
    name: 'John Smith',
    email: 'john.smith@example.com',
    dob: 'February 10, 1990',
    gender: 'Male',
    phone: '(128) 456-7890',
    address: '123 Elm St, Springfield, IL 62701',
    doctor: 'Dr. Emily Johnson',
    insurance: 'BlueCross HealthPlus',
    profileImage: 'images/download (1).jpeg'
};

// Load user data from localStorage if available
document.addEventListener('DOMContentLoaded', function() {
    // Try to get saved user data
    const savedUserData = localStorage.getItem('primecare_user_data');
    if (savedUserData) {
        userData = JSON.parse(savedUserData);
        updateProfileUI();
    }

    // Load appointments
    loadAppointments();
    
    // Load medical records
    loadMedicalRecords();
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }
});

// Update all UI elements with user data
function updateProfileUI() {
    // Update profile header
    document.getElementById('userName').textContent = userData.name;
    document.getElementById('userEmail').textContent = userData.email;
    
    // Update profile image if exists
    const profileImageEl = document.getElementById('profileImage');
    if (profileImageEl && userData.profileImage) {
        profileImageEl.src = userData.profileImage;
    }
    
    // Update profile information
    document.getElementById('userDob').textContent = userData.dob;
    document.getElementById('userGender').textContent = userData.gender;
    document.getElementById('userPhone').textContent = userData.phone;
    document.getElementById('userAddress').textContent = userData.address;
    document.getElementById('userDoctor').textContent = userData.doctor;
    document.getElementById('userInsurance').textContent = userData.insurance;
}

// Sample appointment data - in a real app, this would come from an API
const appointments = [
    {
        title: 'Annual Physical Checkup',
        doctor: 'Dr. Emily Johnson',
        date: 'May 15, 2025',
        time: '10:00 AM',
        location: 'PrimeCare Main Center, Room 204'
    },
    {
        title: 'Cardiology Followup',
        doctor: 'Dr. Michael Chen',
        date: 'May 22, 2025',
        time: '2:30 PM',
        location: 'PrimeCare Cardiology Dept, Room 115'
    },
    {
        title: 'Lab Work',
        doctor: 'Lab Services',
        date: 'June 5, 2025',
        time: '8:00 AM',
        location: 'PrimeCare Lab, Floor 1'
    }
];

// Load appointments to UI
function loadAppointments() {
    const appointmentsList = document.getElementById('appointmentsList');
    if (!appointmentsList) return;
    
    let html = '';
    if (appointments.length === 0) {
        html = '<p>No upcoming appointments.</p>';
    } else {
        appointments.forEach(appointment => {
            html += `
                <div class="appointment-item">
                    <div class="appointment-icon">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <div class="appointment-details">
                        <h3>${appointment.title}</h3>
                        <p>${appointment.doctor} - ${appointment.date} at ${appointment.time}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${appointment.location}</p>
                        <div class="appointment-actions">
                            <button class="btn btn-sm btn-outline">Reschedule</button>
                            <button class="btn btn-sm btn-outline">Cancel</button>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    appointmentsList.innerHTML = html;
}

// Sample medical records data - in a real app, this would come from an API
const medicalRecords = [
    { title: 'Blood Test Results', date: 'April 10, 2025', icon: 'fas fa-vial' },
    { title: 'X-Ray Report', date: 'March 22, 2025', icon: 'fas fa-x-ray' },
    { title: 'Annual Physical', date: 'February 15, 2025', icon: 'fas fa-notes-medical' },
    { title: 'Vaccination Record', date: 'January 8, 2025', icon: 'fas fa-syringe' },
    { title: 'Allergy Test', date: 'December 5, 2024', icon: 'fas fa-allergies' },
    { title: 'Cardiology Report', date: 'November 18, 2024', icon: 'fas fa-heartbeat' }
];

// Load medical records to UI
function loadMedicalRecords() {
    const recordsList = document.getElementById('medicalRecordsList');
    if (!recordsList) return;
    
    let html = '';
    if (medicalRecords.length === 0) {
        html = '<p>No medical records available.</p>';
    } else {
        medicalRecords.forEach(record => {
            html += `
                <div class="record-item">
                    <div class="record-icon">
                        <i class="${record.icon}"></i>
                    </div>
                    <div class="record-title">${record.title}</div>
                    <div class="record-date">${record.date}</div>
                </div>
            `;
        });
    }
    recordsList.innerHTML = html;
}

// Toggle mobile menu
function toggleMobileMenu() {
    const mobileNav = document.querySelector('.mobile-nav');
    if (mobileNav) {
        mobileNav.classList.toggle('active');
    } else {
        // Create mobile nav if it doesn't exist
        const nav = document.createElement('nav');
        nav.className = 'mobile-nav';
        nav.innerHTML = `
            <ul>
                <li><a href="#">Home</a></li>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Departments</a></li>
                <li><a href="#">Doctors</a></li>
                <li><a href="#">Book Now</a></li>
            </ul>
            <div class="auth-buttons">
                <button class="btn btn-outline">Log In</button>
                <button class="btn btn-primary">Sign Up</button>
            </div>
        `;
        document.body.appendChild(nav);
        nav.classList.add('active');
    }
}