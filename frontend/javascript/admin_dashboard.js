// DOM Elements
const sidebarLinks = document.querySelectorAll('.nav-link');
const searchInput = document.querySelector('.search-bar input');
const notificationBtn = document.querySelector('.notification-btn');
const profileBtn = document.querySelector('.profile-btn');
const actionBtns = document.querySelectorAll('.action-btn');
const logoutBtn = document.getElementById('logout-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize Dashboard
function initDashboard() {
    // Show default tab
    showTab('dashboard');
    
    // Update stats with animation
    updateStats();
    
    // Initialize appointment actions
    initAppointmentActions();
    
    // Initialize responsive sidebar
    initResponsiveSidebar();
    
    // Add event listeners
    addEventListeners();
}

// Show Tab Function
function showTab(tabId) {
    // Hide all tab contents
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Update active state in sidebar
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${tabId}`) {
            link.classList.add('active');
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
                stat.textContent = target.toLocaleString();
                clearInterval(counter);
            } else {
                stat.textContent = Math.floor(current).toLocaleString();
            }
        }, interval);
    });
}

// Initialize Appointment Actions
function initAppointmentActions() {
    const appointmentActions = document.querySelectorAll('.appointment-actions button');
    appointmentActions.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.textContent.trim();
            const appointmentItem = e.target.closest('.appointment-item');
            const patientName = appointmentItem.querySelector('.appointment-details p').textContent;
            
            if (action === 'Start Session') {
                showToast('Starting session with ' + patientName, 'info');
                // Add your session start logic here
            } else if (action === 'Reschedule') {
                showToast('Opening reschedule form for ' + patientName, 'info');
                // Add your reschedule logic here
            }
        });
    });
}

// Initialize Responsive Sidebar
function initResponsiveSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    function adjustLayout() {
        if (window.innerWidth <= 768) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        } else {
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('expanded');
        }
    }
    
    // Initial adjustment
    adjustLayout();
    
    // Adjust on window resize
    window.addEventListener('resize', adjustLayout);
}

// Add Event Listeners
function addEventListeners() {
    // Sidebar Links
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.getAttribute('href').substring(1);
            showTab(tabId);
        });
    });
    
    // Search Input
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        // Add your search logic here
        console.log('Searching for:', searchTerm);
    });
    
    // Notification Button
    notificationBtn.addEventListener('click', () => {
        showToast('Notifications panel coming soon!', 'info');
    });
    
    // Profile Button
    profileBtn.addEventListener('click', () => {
        window.location.href = 'user_profile.html';
    });
    
    // Action Buttons
    actionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            handleAction(action);
        });
    });
    
    // Logout Button
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = '../index.html';
        }
    });
}

// Handle Quick Actions
function handleAction(action) {
    switch (action) {
        case 'add-patient':
            showToast('Opening Add Patient form...', 'info');
            // Add your patient form logic here
            break;
        case 'add-doctor':
            showToast('Opening Add Doctor form...', 'info');
            // Add your doctor form logic here
            break;
        case 'schedule-appointment':
            showToast('Opening Appointment Scheduler...', 'info');
            // Add your appointment scheduling logic here
            break;
        case 'add-medical-record':
            showToast('Opening Medical Record form...', 'info');
            // Add your medical record logic here
            break;
    }
}

// Show Toast Notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${getToastIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    const container = document.querySelector('.toast-container');
    container.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

// Get Toast Icon
function getToastIcon(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'error':
            return 'fa-exclamation-circle';
        case 'warning':
            return 'fa-exclamation-triangle';
        default:
            return 'fa-info-circle';
    }
}

// Initialize Dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard); 