// DOM Elements
const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
const tabPanes = document.querySelectorAll('.tab-pane');
const searchInput = document.querySelector('.search-bar input');
const notificationBtn = document.querySelector('.notification-btn');
const profileBtn = document.querySelector('.profile-btn');
const actionButtons = document.querySelectorAll('.action-btn');
const addDoctorBtn = document.getElementById('addDoctorBtn');
const addPatientBtn = document.getElementById('addPatientBtn');
const newAppointmentBtn = document.getElementById('newAppointmentBtn');
const addDepartmentBtn = document.getElementById('addDepartmentBtn');
const addStaffBtn = document.getElementById('addStaffBtn');
const generateReportBtn = document.getElementById('generateReportBtn');
const generalSettingsForm = document.getElementById('generalSettingsForm');

// Initialize Dashboard
function initDashboard() {
    // Show dashboard tab by default
    showTab('dashboard');
    
    // Update stats with animation
    updateStats();
    
    // Initialize appointment action handlers
    initAppointmentActions();
    
    // Initialize responsive sidebar
    initResponsiveSidebar();
    
    // Initialize modals
    initModals();
    
    // Initialize form handlers
    initFormHandlers();
}

// Show Tab Function
function showTab(tabId) {
    // Hide all tab panes
    tabPanes.forEach(pane => {
        pane.style.display = 'none';
    });
    
    // Show selected tab pane
    const selectedPane = document.getElementById(tabId);
    if (selectedPane) {
        selectedPane.style.display = 'block';
    }
    
    // Update active state in sidebar
    sidebarLinks.forEach(link => {
        link.parentElement.classList.remove('active');
        if (link.getAttribute('href') === `#${tabId}`) {
            link.parentElement.classList.add('active');
        }
    });
}

// Update Stats with Animation
function updateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const target = parseInt(stat.textContent);
        let current = 0;
        const increment = target / 50;
        const duration = 1000;
        const interval = duration / 50;
        
        const counter = setInterval(() => {
            current += increment;
            if (current >= target) {
                stat.textContent = target;
                clearInterval(counter);
            } else {
                stat.textContent = Math.floor(current);
            }
        }, interval);
    });
}

// Initialize Appointment Actions
function initAppointmentActions() {
    const appointmentActions = document.querySelectorAll('.appointment-actions button');
    appointmentActions.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.textContent.toLowerCase();
            const appointmentItem = this.closest('.appointment-item');
            const patientName = appointmentItem.querySelector('.patient-name').textContent;
            
            if (action === 'start') {
                showToast(`Starting appointment for ${patientName}`, 'success');
            } else if (action === 'reschedule') {
                showModal('rescheduleAppointmentModal');
            }
        });
    });
}

// Initialize Responsive Sidebar
function initResponsiveSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    function adjustLayout() {
        if (window.innerWidth <= 992) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        } else {
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('expanded');
        }
    }
    
    window.addEventListener('resize', adjustLayout);
    adjustLayout();
}

// Initialize Modals
function initModals() {
    const modals = document.querySelectorAll('.modal');
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    
    // Close modal function
    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // Close button click handler
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Click outside modal to close
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
}

// Show Modal Function
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Initialize Form Handlers
function initFormHandlers() {
    // General Settings Form
    if (generalSettingsForm) {
        generalSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            // Simulate form submission
            showLoading(this);
            setTimeout(() => {
                hideLoading(this);
                showToast('Settings saved successfully', 'success');
            }, 1000);
        });
    }
}

// Show Loading State
function showLoading(element) {
    element.classList.add('loading');
}

// Hide Loading State
function hideLoading(element) {
    element.classList.remove('loading');
}

// Show Toast Notification
function showToast(message, type = 'success') {
    const toastContainer = document.querySelector('.toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Create Toast Container
function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', initDashboard);

// Sidebar Navigation
sidebarLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const tabId = this.getAttribute('href').substring(1);
        showTab(tabId);
    });
});

// Search Functionality
searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    // Implement search functionality based on current tab
    const currentTab = document.querySelector('.tab-pane[style*="display: block"]');
    if (currentTab) {
        // Add search logic for different tabs
    }
});

// Notification Button
notificationBtn.addEventListener('click', function() {
    // Implement notification panel
    showToast('Notifications panel coming soon', 'warning');
});

// Quick Action Buttons
actionButtons.forEach(button => {
    button.addEventListener('click', function() {
        const action = this.dataset.action;
        switch(action) {
            case 'add-patient':
                showModal('addPatientModal');
                break;
            case 'add-doctor':
                showModal('addDoctorModal');
                break;
            case 'schedule-appointment':
                showModal('addAppointmentModal');
                break;
            case 'add-medical-record':
                showToast('Medical record feature coming soon', 'info');
                break;
        }
    });
});

// Add Doctor Button
if (addDoctorBtn) {
    addDoctorBtn.addEventListener('click', () => showModal('addDoctorModal'));
}

// Add Patient Button
if (addPatientBtn) {
    addPatientBtn.addEventListener('click', () => showModal('addPatientModal'));
}

// New Appointment Button
if (newAppointmentBtn) {
    newAppointmentBtn.addEventListener('click', () => showModal('addAppointmentModal'));
}

// Add Department Button
if (addDepartmentBtn) {
    addDepartmentBtn.addEventListener('click', () => {
        showToast('Add department feature coming soon', 'info');
    });
}

// Add Staff Button
if (addStaffBtn) {
    addStaffBtn.addEventListener('click', () => {
        showToast('Add staff feature coming soon', 'info');
    });
}

// Generate Report Button
if (generateReportBtn) {
    generateReportBtn.addEventListener('click', () => {
        showToast('Report generation feature coming soon', 'info');
    });
}

// View Functions
function viewPatient(id) {
    showToast(`Viewing patient #${id}`, 'info');
}

function editPatient(id) {
    showToast(`Editing patient #${id}`, 'info');
}

function viewDoctor(id) {
    showToast(`Viewing doctor #${id}`, 'info');
}

function editDoctor(id) {
    showToast(`Editing doctor #${id}`, 'info');
}

function viewSchedule(id) {
    showToast(`Viewing schedule #${id}`, 'info');
}

function viewDepartment(id) {
    showToast(`Viewing department #${id}`, 'info');
}

function editStaff(id) {
    showToast(`Editing staff #${id}`, 'info');
}

function viewReport(type) {
    showToast(`Viewing ${type} report`, 'info');
} 