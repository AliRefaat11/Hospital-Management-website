// DOM Elements
const appointmentTableBody = document.getElementById('appointmentTableBody');
const appointmentSearch = document.getElementById('appointmentSearch');
const departmentFilter = document.getElementById('departmentFilter');
const statusFilter = document.getElementById('statusFilter');
const dateFilter = document.getElementById('dateFilter');
const addAppointmentBtn = document.getElementById('addAppointmentBtn');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeFilters();
    setupEventListeners();
});

function initializeFilters() {
    // Set today's date as default for date filter
    const today = new Date().toISOString().split('T')[0];
    dateFilter.value = today;
}

function setupEventListeners() {
    // Search functionality
    appointmentSearch.addEventListener('input', debounce(handleSearch, 300));

    // Filter functionality
    departmentFilter.addEventListener('change', handleFilters);
    statusFilter.addEventListener('change', handleFilters);
    dateFilter.addEventListener('change', handleFilters);

    // Add appointment button
    addAppointmentBtn.addEventListener('click', () => {
        window.location.href = '/appointments/book';
    });
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search and Filter Functions
function handleSearch() {
    const searchTerm = appointmentSearch.value.toLowerCase();
    const rows = appointmentTableBody.getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function handleFilters() {
    const department = departmentFilter.value;
    const status = statusFilter.value;
    const date = dateFilter.value;

    const rows = appointmentTableBody.getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
        const rowDepartment = row.querySelector('td:nth-child(6)').textContent;
        const rowStatus = row.querySelector('.status-badge').textContent.toLowerCase();
        const rowDate = new Date(row.querySelector('td:nth-child(4)').textContent).toISOString().split('T')[0];

        const departmentMatch = !department || rowDepartment === department;
        const statusMatch = !status || rowStatus === status.toLowerCase();
        const dateMatch = !date || rowDate === date;

        row.style.display = departmentMatch && statusMatch && dateMatch ? '' : 'none';
    });
}

// Appointment Actions
async function viewAppointment(id) {
    try {
        const response = await fetch(`/api/appointments/${id}`);
        if (!response.ok) throw new Error('Failed to fetch appointment details');
        
        const appointment = await response.json();
        showAppointmentDetails(appointment);
    } catch (error) {
        showNotification('Error loading appointment details', 'error');
    }
}

async function editAppointment(id) {
    try {
        const response = await fetch(`/api/appointments/${id}`);
        if (!response.ok) throw new Error('Failed to fetch appointment details');
        
        const appointment = await response.json();
        showEditForm(appointment);
    } catch (error) {
        showNotification('Error loading appointment details', 'error');
    }
}

async function cancelAppointment(id) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
        const response = await fetch(`/api/appointments/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to cancel appointment');

        showNotification('Appointment cancelled successfully', 'success');
        setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
        showNotification('Error cancelling appointment', 'error');
    }
}

// UI Functions
function showAppointmentDetails(appointment) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Appointment Details</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="detail-group">
                    <label>Patient:</label>
                    <p>${appointment.patientID.FName} ${appointment.patientID.LName}</p>
                </div>
                <div class="detail-group">
                    <label>Doctor:</label>
                    <p>Dr. ${appointment.doctorID.userId.FName} ${appointment.doctorID.userId.LName}</p>
                </div>
                <div class="detail-group">
                    <label>Date:</label>
                    <p>${new Date(appointment.date).toLocaleDateString()}</p>
                </div>
                <div class="detail-group">
                    <label>Time:</label>
                    <p>${appointment.startingHour}</p>
                </div>
                <div class="detail-group">
                    <label>Department:</label>
                    <p>${appointment.doctorID.departmentId.departmentName}</p>
                </div>
                <div class="detail-group">
                    <label>Status:</label>
                    <p><span class="status-badge ${appointment.status.toLowerCase().replace(' ', '-')}">${appointment.status}</span></p>
                </div>
                <div class="detail-group">
                    <label>Reason:</label>
                    <p>${appointment.reason}</p>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('.close-btn').onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
}

function showEditForm(appointment) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Appointment</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <form id="editAppointmentForm">
                    <div class="form-group">
                        <label for="editDate">Date:</label>
                        <input type="date" id="editDate" value="${appointment.date.split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label for="editTime">Time:</label>
                        <input type="time" id="editTime" value="${appointment.startingHour}" required>
                    </div>
                    <div class="form-group">
                        <label for="editStatus">Status:</label>
                        <select id="editStatus" required>
                            <option value="scheduled" ${appointment.status === 'scheduled' ? 'selected' : ''}>Scheduled</option>
                            <option value="confirmed" ${appointment.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="in-progress" ${appointment.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                            <option value="completed" ${appointment.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${appointment.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            <option value="no-show" ${appointment.status === 'no-show' ? 'selected' : ''}>No Show</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editReason">Reason:</label>
                        <textarea id="editReason" required>${appointment.reason}</textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('.close-btn').onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };

    modal.querySelector('#editAppointmentForm').onsubmit = async (e) => {
        e.preventDefault();
        await updateAppointment(appointment._id, {
            date: document.getElementById('editDate').value,
            startingHour: document.getElementById('editTime').value,
            status: document.getElementById('editStatus').value,
            reason: document.getElementById('editReason').value
        });
        modal.remove();
    };
}

async function updateAppointment(id, data) {
    try {
        const response = await fetch(`/api/appointments/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Failed to update appointment');

        showNotification('Appointment updated successfully', 'success');
        setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
        showNotification('Error updating appointment', 'error');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }, 100);
} 