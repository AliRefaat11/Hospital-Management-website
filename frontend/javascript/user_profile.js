// Patient data - in a real application, this would come from an API
const patientData = {
    id: "P12345",
    name: "John Smith",
    email: "john.smith@example.com",
    photo: "https://via.placeholder.com/150",
    dateOfBirth: "February 10, 1990",
    gender: "Male",
    phone: "(128) 456-7890",
    address: "123 Elm St, Springfield, IL 62701",
    primaryDoctor: "Dr. Emily Johnson",
    insurance: "BlueCross HealthPlus",
    appointments: [
        {
            id: "A001",
            date: "March 25, 2024",
            time: "10:00 AM",
            doctor: "Dr. Emily Johnson",
            service: "Dental Cleaning",
            status: "upcoming"
        },
        {
            id: "A002",
            date: "April 15, 2024",
            time: "2:30 PM",
            doctor: "Dr. Robert Chen",
            service: "Annual Physical",
            status: "upcoming"
        }
    ],
    medicalRecords: [
        {
            id: "MR001",
            title: "Blood Test Results",
            date: "January 15, 2024",
            type: "lab"
        },
        {
            id: "MR002",
            title: "X-Ray Report",
            date: "December 10, 2023",
            type: "imaging"
        },
        {
            id: "MR003",
            title: "Vaccination Record",
            date: "November 5, 2023",
            type: "record"
        },
        {
            id: "MR004",
            title: "Prescription History",
            date: "January 30, 2024",
            type: "medication"
        }
    ]
};

// DOM Elements
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const appointmentsList = document.getElementById('appointmentsList');
const medicalRecordsList = document.getElementById('medicalRecordsList');

// User profile elements
const profileImage = document.getElementById('profileImage');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const userDob = document.getElementById('userDob');
const userGender = document.getElementById('userGender');
const userPhone = document.getElementById('userPhone');
const userAddress = document.getElementById('userAddress');
const userDoctor = document.getElementById('userDoctor');
const userInsurance = document.getElementById('userInsurance');

// Mobile menu toggle
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        const mobileNav = document.querySelector('.mobile-nav') || createMobileNav();
        mobileNav.classList.toggle('active');
    });
}

// Create mobile navigation if it doesn't exist
function createMobileNav() {
    const mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav';
    
    // Clone navigation from desktop
    const mainNav = document.querySelector('.main-nav');
    const authButtons = document.querySelector('.auth-buttons');
    
    if (mainNav) {
        const navClone = mainNav.cloneNode(true);
        mobileNav.appendChild(navClone);
    }
    
    if (authButtons) {
        const authClone = authButtons.cloneNode(true);
        mobileNav.appendChild(authClone);
    }
    
    document.body.appendChild(mobileNav);
    return mobileNav;
}

// Load user profile data
function loadUserProfile() {
    if (profileImage) profileImage.src = patientData.photo;
    if (userName) userName.textContent = patientData.name;
    if (userEmail) userEmail.textContent = patientData.email;
    if (userDob) userDob.textContent = patientData.dateOfBirth;
    if (userGender) userGender.textContent = patientData.gender;
    if (userPhone) userPhone.textContent = patientData.phone;
    if (userAddress) userAddress.textContent = patientData.address;
    if (userDoctor) userDoctor.textContent = patientData.primaryDoctor;
    if (userInsurance) userInsurance.textContent = patientData.insurance;
}

// Render appointments list
function renderAppointments() {
    if (!appointmentsList) return;
    
    if (patientData.appointments.length === 0) {
        appointmentsList.innerHTML = '<div class="empty-state">No upcoming appointments</div>';
        return;
    }
    
    appointmentsList.innerHTML = '';
    
    patientData.appointments.forEach(appointment => {
        const appointmentEl = document.createElement('div');
        appointmentEl.className = 'appointment-item';
        
        appointmentEl.innerHTML = `
            <div class="appointment-icon">
                <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="appointment-details">
                <h3>${appointment.date} - ${appointment.time}</h3>
                <p>${appointment.doctor}</p>
                <p>${appointment.service}</p>
                <div class="appointment-actions">
                    <button class="btn btn-sm btn-outline">
                        <i class="fas fa-edit"></i> Reschedule
                    </button>
                    <button class="btn btn-sm btn-outline">
                        <i class="fas fa-video"></i> Virtual Visit
                    </button>
                </div>
            </div>
        `;
        
        appointmentsList.appendChild(appointmentEl);
    });
}

// Render medical records
function renderMedicalRecords() {
    if (!medicalRecordsList) return;
    
    if (patientData.medicalRecords.length === 0) {
        medicalRecordsList.innerHTML = '<div class="empty-state">No medical records available</div>';
        return;
    }
    
    medicalRecordsList.innerHTML = '';
    
    patientData.medicalRecords.forEach(record => {
        const recordEl = document.createElement('div');
        recordEl.className = 'record-item';
        
        // Choose icon based on record type
        let icon = 'fa-file-medical';
        if (record.type === 'lab') icon = 'fa-flask';
        if (record.type === 'imaging') icon = 'fa-x-ray';
        if (record.type === 'medication') icon = 'fa-pills';
        
        recordEl.innerHTML = `
            <div class="record-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="record-title">${record.title}</div>
            <div class="record-date">${record.date}</div>
        `;
        
        recordEl.addEventListener('click', () => {
            alert(`Viewing ${record.title}`);
            // In a real application, this would open the record details
        });
        
        medicalRecordsList.appendChild(recordEl);
    });
}

// Initialize page
function initPage() {
    loadUserProfile();
    renderAppointments();
    renderMedicalRecords();
    
    // Add event listeners for buttons
    document.querySelectorAll('.btn-action').forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.currentTarget.textContent.trim();
            if (action.includes('Appointments')) {
                alert('Viewing all appointments');
                // In a real app, this would navigate to appointments page
            } else if (action.includes('Edit Profile')) {
                alert('Editing profile');
                // In a real app, this would open edit profile form
            } else if (action.includes('Settings')) {
                alert('Opening settings');
                // In a real app, this would navigate to settings page
            }
        });
    });
}

// Run initialization when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initPage);