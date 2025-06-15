document.addEventListener('DOMContentLoaded', async () => {
    const tabsNav = document.querySelector('.tabs-nav');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Function to fetch and display tab content
    const loadTabContent = async (tabName) => {
        const contentDiv = document.getElementById(`${tabName}-content`);
        const loadingDiv = document.getElementById(`${tabName}-loading`);

        if (!contentDiv || !loadingDiv) {
            console.error(`Content or loading div not found for tab: ${tabName}`);
            return;
        }

        loadingDiv.style.display = 'block'; // Show loading message
        contentDiv.style.display = 'none';  // Hide previous content
        contentDiv.innerHTML = '';          // Clear previous content

        try {
            let url = '';
            if (tabName === 'statistics') {
                url = '/admin/tabs/statistics';
            } else if (tabName === 'doctors') {
                url = '/admin/doctor-management';
            } else if (tabName === 'patients') {
                url = '/admin/patient-management';
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            contentDiv.innerHTML = html;

            // Only fetch and render statistics if it's the statistics tab
            if (tabName === 'statistics') {
                const stats = await fetchAllStats();
                populateStatistics(stats); // Call a new function to populate stats and charts
            } else if (tabName === 'doctors') {
                attachDoctorManagementEventListeners();
                loadDoctorsAndRender(); // Load doctors when the tab is activated
            } else if (tabName === 'patients') {
                // Initialize patient management if it's the patients tab
                // No specific initialization function needed here as functions are global
                // Re-attach event listeners for dynamically loaded content
                attachPatientManagementEventListeners();
            }

        } catch (error) {
            console.error(`Error loading ${tabName} content:`, error);
            contentDiv.innerHTML = `<div class="error">Error loading ${tabName} content. Please try again.</div>`;
        } finally {
            loadingDiv.style.display = 'none'; // Hide loading message
            contentDiv.style.display = 'block';  // Show loaded content
        }
    };

    // Function to fetch all dashboard statistics in one go
    const fetchAllStats = async () => {
        try {
            const res = await fetch('/api/admin/stats/all');
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP error! status: ${res.status}, body: ${errorText}`);
            }
            const { data } = await res.json();
            return data; // This will contain all the stats (totals, bloodTypes, departments, etc.)
        } catch (error) {
            console.error("Error fetching all dashboard stats:", error);
            // Return default/empty data structure in case of error
            return {
                totalDoctors: 0,
                totalPatients: 0,
                totalAppointments: 0,
                totalDepartments: 0,
                patientsByBloodType: [],
                doctorsByDepartment: [],
                appointmentsByStatus: [],
                doctorAppointmentCounts: [],
                monthlyAppointments: []
            };
        }
    };

    // New function to populate statistics and create charts
    const populateStatistics = (stats) => {
        // Populate totals
        document.getElementById('totalDoctors').textContent = stats.totalDoctors || 0;
        document.getElementById('totalPatients').textContent = stats.totalPatients || 0;
        document.getElementById('totalAppointments').textContent = stats.totalAppointments || 0;
        document.getElementById('totalDepartments').textContent = stats.totalDepartments || 0;

        // Chart helpers
        const createChart = (id, type, labels, data, label) => {
            const ctx = document.getElementById(id);
            if (ctx) {
                // Destroy existing chart if it exists to prevent re-rendering issues
                if (Chart.getChart(id)) {
                    Chart.getChart(id).destroy();
                }
                new Chart(ctx, {
                    type,
                    data: {
                        labels,
                        datasets: [{
                            label,
                            data,
                            backgroundColor: [
                                '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
                                '#ADD8E6', '#90EE90', '#FFB6C1', '#DDA0DD', '#FFE4B5', '#87CEEB'
                            ],
                            borderColor: [
                                '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
                                '#ADD8E6', '#90EE90', '#FFB6C1', '#DDA0DD', '#FFE4B5', '#87CEEB'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: label
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        };

        // Convert data formats for charts
        const extract = (list, key1, key2) => [list.map(i => i[key1]), list.map(i => i[key2])];

        createChart('bloodTypeChart', 'doughnut', ...extract(stats.patientsByBloodType || [], 'bloodType', 'count'), 'Patients by Blood Type');
        createChart('departmentChart', 'pie', ...extract(stats.doctorsByDepartment || [], 'department', 'count'), 'Doctors per Department');
        createChart('appointmentStatusChart', 'bar', ...extract(stats.appointmentsByStatus || [], 'status', 'count'), 'Appointments by Status');
        createChart('doctorAppointmentsChart', 'bar', ...extract(stats.doctorAppointmentCounts || [], 'doctorName', 'appointmentCount'), 'Appointments per Doctor');
        createChart('monthlyAppointmentsChart', 'line', ...extract(stats.monthlyAppointments || [], 'month', 'count'), 'Monthly Appointments');
    };

    // Event listeners for tab buttons
    tabsNav.addEventListener('click', (event) => {
        const clickedButton = event.target.closest('.tab-btn');
        if (clickedButton) {
            const targetTab = clickedButton.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            clickedButton.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            loadTabContent(targetTab);
        }
    });

    const initialActiveTab = document.querySelector('.tab-btn.active');
    if (initialActiveTab) {
        loadTabContent(initialActiveTab.dataset.tab);
    } else if (document.body.classList.contains('doctors-management-page')) {
        // This handles cases where the doctors management page is loaded directly
        loadDoctorsAndRender();
    }
});

function openAddDoctorModal() {
    document.getElementById('doctorModal').style.display = 'block';
    document.getElementById('modalTitle').textContent = 'Add New Doctor';
    document.getElementById('doctorForm').reset();
    document.body.style.overflow = 'hidden';
}

function closeDoctorModal() {
    document.getElementById('doctorModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    clearMessages();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('doctorModal');
    if (event.target == modal) {
        closeDoctorModal();
    }
}

// Message Functions
function showMessage(message, type = 'success') {
    const messageContainer = document.getElementById('messageContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
        ${message}
    `;
    
    messageContainer.innerHTML = '';
    messageContainer.appendChild(messageDiv);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 5000);
}

function clearMessages() {
    document.getElementById('messageContainer').innerHTML = '';
}

// Form Submission (Now called explicitly after tab content loads)
function attachDoctorManagementEventListeners() {
    const doctorForm = document.getElementById('doctorForm');
    if (doctorForm) {
        doctorForm.removeEventListener('submit', handleSubmitDoctorForm); // Remove existing listener to prevent duplicates
        doctorForm.addEventListener('submit', handleSubmitDoctorForm);
    } else {
        console.error("Doctor form not found on tab load. Cannot attach event listener.");
    }

    // Event listener for specialization filter
    const specializationFilter = document.getElementById('specializationFilter');
    if (specializationFilter) {
        specializationFilter.removeEventListener('change', filterDoctors); // Prevent duplicates
        specializationFilter.addEventListener('change', filterDoctors);
    }

    // Event listener for status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.removeEventListener('change', filterDoctors); // Prevent duplicates
        statusFilter.addEventListener('change', filterDoctors);
    }

    // Event listener for search input
    const doctorSearch = document.getElementById('doctorSearch');
    if (doctorSearch) {
        doctorSearch.removeEventListener('keyup', filterDoctors); // Prevent duplicates
        doctorSearch.addEventListener('keyup', filterDoctors);
    }

    // Initial load of doctors (if needed for the tab itself)
    // loadDoctors(); // Uncomment if you have a loadDoctors function and want to load on tab load
}

// New function for handling doctor form submission
async function handleSubmitDoctorForm(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    // Disable submit button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    
    try {
        // Get form data
        const formData = new FormData(this);
        
        // Prepare data object matching the required structure
        const doctorData = {
            FName: formData.get('FName').trim(),
            LName: formData.get('LName').trim(),
            Email: formData.get('Email').trim(),
            PhoneNumber: formData.get('PhoneNumber').trim(),
            Gender: formData.get('Gender'),
            Age: parseInt(formData.get('Age')),
            Password: 'defaultPassword123', // Default password as specified
            Role: 'doctor',
            specialization: formData.get('specialization'),
            rating: parseInt(formData.get('rating')) || 5,
            status: 'active',
            schedule: formData.get('schedule') ? [formData.get('schedule').trim()] : [],
            DateOfBirth: formData.get('DateOfBirth'),
            Address: formData.get('Address').trim()
        };
        
        // Validate required fields
        if (!doctorData.FName || !doctorData.LName || !doctorData.Email || 
            !doctorData.PhoneNumber || !doctorData.Gender || !doctorData.Age || 
            !doctorData.specialization || !doctorData.DateOfBirth || !doctorData.Address) {
            throw new Error('Please fill in all required fields');
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(doctorData.Email)) {
            throw new Error('Please enter a valid email address');
        }
        
        // Validate phone number (basic validation)
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(doctorData.PhoneNumber)) {
            throw new Error('Please enter a valid phone number');
        }
        
        // Validate age
        if (doctorData.Age < 25 || doctorData.Age > 80) {
            throw new Error('Age must be between 25 and 80 years');
        }
        
        console.log('Sending doctor data:', doctorData);
        
        // Send POST request to the server
        const response = await fetch('/doctors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(doctorData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('Doctor created successfully!', 'success');
            closeDoctorModal();
        } else {
            throw new Error(result.message || 'Failed to create doctor');
        }
        
    } catch (error) {
        console.error('Error creating doctor:', error);
        showMessage(error.message || 'An error occurred while creating the doctor', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

function filterDoctors() {
    console.log('Filtering doctors...');
}

function loadDoctors() {
    console.log('Loading doctors...');
}

// Expose functions globally if needed for EJS onclick attributes
window.openAddDoctorModal = openAddDoctorModal;
window.closeDoctorModal = closeDoctorModal;
window.showMessage = showMessage;
window.clearMessages = clearMessages;
window.filterDoctors = filterDoctors;
window.loadDoctors = loadDoctors;

// New function to load and render doctors
async function loadDoctorsAndRender() {
    const doctorsGrid = document.getElementById('doctorsGrid');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const noResults = document.getElementById('noResults');
    const doctorsError = document.getElementById('doctors-error');

    if (!doctorsGrid || !loadingSpinner || !noResults || !doctorsError) {
        console.error("One or more essential DOM elements for doctors management not found.");
        return;
    }

    doctorsGrid.innerHTML = ''; // Clear previous results
    doctorsGrid.style.display = 'none';
    noResults.style.display = 'none';
    doctorsError.style.display = 'none';
    loadingSpinner.style.display = 'flex'; // Show loading spinner

    try {
        const response = await fetch('/api/doctors');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        const doctors = result.data; // Assuming your API returns { data: [...] }

        if (doctors && doctors.length > 0) {
            renderDoctors(doctors);
            doctorsGrid.style.display = 'grid';
        } else {
            noResults.style.display = 'block';
        }

    } catch (error) {
        console.error('Error loading doctors:', error);
        doctorsError.textContent = `Failed to load doctors: ${error.message}`; 
        doctorsError.style.display = 'block';
    } finally {
        loadingSpinner.style.display = 'none'; // Hide loading spinner
    }
}

// Function to render doctors into the grid
function renderDoctors(doctors) {
    const doctorsGrid = document.getElementById('doctorsGrid');
    doctorsGrid.innerHTML = ''; // Clear existing content

    doctors.forEach(doctor => {
        const doctorCard = document.createElement('div');
        doctorCard.className = 'doctor-card';
        
        const initials = (doctor.userId.FName ? doctor.userId.FName.charAt(0) : '') + (doctor.userId.LName ? doctor.userId.LName.charAt(0) : '');
        
        let scheduleText = 'Not specified';
        if (Array.isArray(doctor.schedule) && doctor.schedule.length > 0) {
            scheduleText = doctor.schedule.join(', ');
        } else if (typeof doctor.schedule === 'string' && doctor.schedule.trim() !== '') {
            scheduleText = doctor.schedule.trim();
        }

        const statusClass = doctor.status === 'active' ? 'status-active' : 'status-inactive';

        doctorCard.innerHTML = `
            <div class="doctor-avatar">${initials}</div>
            <div class="doctor-info">
                <h3>Dr. ${doctor.userId.FName} ${doctor.userId.LName}</h3>
                <p><i class="fas fa-envelope"></i> ${doctor.userId.Email}</p>
                <p><i class="fas fa-phone"></i> ${doctor.userId.PhoneNumber}</p>
                <p><i class="fas fa-venus-mars"></i> ${doctor.userId.Gender}</p>
                <p><i class="fas fa-user"></i> ${doctor.userId.Age} years old</p>
                <p><i class="fas fa-stethoscope"></i> ${doctor.specialization}</p>
                <p><i class="fas fa-star"></i> Rating: ${doctor.rating}/5</p>
                <p><i class="fas fa-calendar-alt"></i> Schedule: ${scheduleText}</p>
            </div>
            <span class="doctor-status ${statusClass}">${doctor.status}</span>
            <div class="doctor-actions">
                <button class="action-btn btn-edit" onclick="openEditDoctorModal('${doctor._id}')"><i class="fas fa-edit"></i> Edit</button>
                <button class="action-btn btn-delete" onclick="confirmDeleteDoctor('${doctor._id}')"><i class="fas fa-trash"></i> Delete</button>
            </div>
        `;
        doctorsGrid.appendChild(doctorCard);
    });
}
