class AppointmentManagement {
    constructor() {
        // Core elements
        this.sidebar = document.getElementById('sidebarNav');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.mainContent = document.querySelector('.main-content');
        this.navLinks = document.querySelectorAll('.nav-links a');
        
        // Appointment management data
        this.appointmentData = [];
        this.filteredData = [];
        this.currentEditingId = null;
        this.currentDeleteId = null;
        
        // Modal elements
        this.appointmentModal = document.getElementById('appointmentModal');
        this.appointmentDetailsModal = document.getElementById('appointmentDetailsModal');
        this.deleteConfirmModal = document.getElementById('deleteConfirmModal');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadAppointmentData();
        this.updateStatistics();
        this.updateNextAppointments();
        
        // Check localStorage for sidebar state
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (sidebarCollapsed) {
            this.collapseSidebar();
        }

        // Set minimum date for appointment scheduling (today)
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('appointmentDate').min = today;
        document.getElementById('dateFilter').min = today;
    }

    setupEventListeners() {
        // Sidebar toggle
        this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());

        // Navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e, link));
        });

        // Add appointment button
        document.getElementById('addAppointmentBtn').addEventListener('click', () => {
            this.openAddAppointmentModal();
        });

        // Modal close buttons
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeAppointmentModal());
        document.getElementById('closeDetailsModal').addEventListener('click', () => this.closeDetailsModal());

        // Form submission
        document.getElementById('appointmentForm').addEventListener('submit', (e) => this.handleFormSubmission(e));

        // Filter changes
        document.getElementById('departmentFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('statusFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('dateFilter').addEventListener('change', () => this.applyFilters());

        // Search functionality
        document.getElementById('appointmentSearch').addEventListener('input', (e) => {
            this.searchAppointments(e.target.value);
        });

        // Edit from details modal
        document.getElementById('editFromDetails').addEventListener('click', () => {
            const id = this.appointmentDetailsModal.dataset.appointmentId;
            this.closeDetailsModal();
            this.editAppointment(id);
        });

        // Mark as completed
        document.getElementById('markCompleted').addEventListener('click', () => {
            const id = this.appointmentDetailsModal.dataset.appointmentId;
            this.markAsCompleted(id);
        });

        // Delete confirmation
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.confirmDelete());
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => this.closeDeleteModal());

        // Click outside modal to close
        this.setupModalClickOutside();
    }

    loadAppointmentData() {
        const savedData = localStorage.getItem('appointmentManagement');
        if (savedData) {
            this.appointmentData = JSON.parse(savedData);
        } else {
            this.appointmentData = this.getSampleData();
            this.saveAppointmentData();
        }
        this.filteredData = [...this.appointmentData];
        this.renderAppointmentTable();
    }

    saveAppointmentData() {
        localStorage.setItem('appointmentManagement', JSON.stringify(this.appointmentData));
    }

    getSampleData() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(today);
        dayAfter.setDate(dayAfter.getDate() + 2);

        return [
            {
                id: 'AP001',
                patientName: 'John Doe',
                doctorName: 'Dr. Emily Johnson',
                date: today.toISOString().split('T')[0],
                time: '10:30',
                department: 'Cardiology',
                type: 'Consultation',
                status: 'scheduled',
                notes: 'Regular checkup for heart condition',
                dateCreated: today.toISOString().split('T')[0]
            },
            {
                id: 'AP002',
                patientName: 'Jane Smith',
                doctorName: 'Dr. Michael Brown',
                date: today.toISOString().split('T')[0],
                time: '14:00',
                department: 'Neurology',
                type: 'Follow-up',
                status: 'completed',
                notes: 'Post-treatment evaluation',
                dateCreated: today.toISOString().split('T')[0]
            },
            {
                id: 'AP003',
                patientName: 'Michael Johnson',
                doctorName: 'Dr. Sarah Wilson',
                date: tomorrow.toISOString().split('T')[0],
                time: '09:15',
                department: 'General Medicine',
                type: 'Checkup',
                status: 'scheduled',
                notes: 'Annual health screening',
                dateCreated: today.toISOString().split('T')[0]
            }
        ];
    }

    updateNextAppointments() {
        const today = new Date().toISOString().split('T')[0];
        const nextAppointments = this.appointmentData
            .filter(a => a.date === today && a.status === 'scheduled')
            .sort((a, b) => a.time.localeCompare(b.time))
            .slice(0, 3);

        const nextList = document.getElementById('nextAppointmentsList');
        nextList.innerHTML = '';

        if (nextAppointments.length === 0) {
            nextList.innerHTML = `
                <div class="next-item" style="text-align: center; color: var(--gray-600);">
                    No upcoming appointments for today
                </div>
            `;
            return;
        }

        nextAppointments.forEach(appointment => {
            const item = document.createElement('div');
            item.className = 'next-item';
            item.innerHTML = `
                <div class="next-time">
                    <span class="time">${this.formatTime(appointment.time)}</span>
                    <span class="department">${appointment.department}</span>
                </div>
                <div class="next-info">
                    <span class="patient-name">${appointment.patientName}</span>
                    <span class="doctor-name">${appointment.doctorName}</span>
                </div>
                <div class="next-status">
                    <span class="status-badge ${appointment.status}">${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span>
                </div>
            `;
            nextList.appendChild(item);
        });
    }

    updateStatistics() {
        const totalAppointments = this.appointmentData.length;
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = this.appointmentData.filter(a => a.date === today).length;
        const completedAppointments = this.appointmentData.filter(a => a.status === 'completed').length;
        const pendingAppointments = this.appointmentData.filter(a => a.status === 'scheduled').length;

        document.getElementById('totalAppointments').textContent = totalAppointments;
        document.getElementById('todayAppointments').textContent = todayAppointments;
        document.getElementById('completedAppointments').textContent = completedAppointments;
        document.getElementById('pendingAppointments').textContent = pendingAppointments;

        const totalChange = document.getElementById('totalAppointmentsChange');
        if (totalChange) {
            totalChange.textContent = `${pendingAppointments} Pending`;
            totalChange.className = pendingAppointments > 0 ? 'stat-change' : 'stat-change positive';
        }
    }

    renderAppointmentTable() {
        const tbody = document.getElementById('appointmentTableBody');
        tbody.innerHTML = '';

        if (this.filteredData.length === 0) {
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = `
                <td colspan="9" style="text-align: center; padding: 2rem; color: var(--gray-600);">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <div>No appointments found</div>
                </td>
            `;
            tbody.appendChild(noDataRow);
            return;
        }

        this.filteredData.forEach(appointment => {
            const row = this.createAppointmentRow(appointment);
            tbody.appendChild(row);
        });

        this.setupTableEventListeners();
    }

    createAppointmentRow(appointment) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appointment.id}</td>
            <td>
                <span class="patient-name-link" data-id="${appointment.id}">${appointment.patientName}</span>
            </td>
            <td>${appointment.doctorName}</td>
            <td>${this.formatDate(appointment.date)}</td>
            <td>${this.formatTime(appointment.time)}</td>
            <td>${appointment.department}</td>
            <td>
                <span class="appointment-type-badge ${appointment.type.toLowerCase()}">${appointment.type}</span>
            </td>
            <td>
                <span class="status-badge ${appointment.status}">${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon view-btn" data-id="${appointment.id}" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit-btn" data-id="${appointment.id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-btn" data-id="${appointment.id}" title="Cancel">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </td>
        `;
        return row;
    }

    setupTableEventListeners() {
        document.querySelectorAll('.patient-name-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.viewAppointmentDetails(id);
            });
        });
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.viewAppointmentDetails(id);
            });
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.editAppointment(id);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.deleteAppointment(id);
            });
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    }

    searchAppointments(query) {
        let filtered = [...this.appointmentData];
        
        if (query) {
            filtered = filtered.filter(appointment => 
                appointment.patientName.toLowerCase().includes(query.toLowerCase()) ||
                appointment.doctorName.toLowerCase().includes(query.toLowerCase()) ||
                appointment.department.toLowerCase().includes(query.toLowerCase()) ||
                appointment.type.toLowerCase().includes(query.toLowerCase()) ||
                appointment.id.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        this.filteredData = filtered;
        this.renderAppointmentTable();
    }

    applyFilters() {
        const departmentFilter = document.getElementById('departmentFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;
        const searchQuery = document.getElementById('appointmentSearch').value.toLowerCase();

        let filtered = [...this.appointmentData];

        if (departmentFilter) {
            filtered = filtered.filter(appointment => appointment.department === departmentFilter);
        }
        
        if (statusFilter) {
            filtered = filtered.filter(appointment => appointment.status === statusFilter);
        }

        if (dateFilter) {
            filtered = filtered.filter(appointment => appointment.date === dateFilter);
        }

        if (searchQuery) {
            filtered = filtered.filter(appointment => 
                appointment.patientName.toLowerCase().includes(searchQuery) ||
                appointment.doctorName.toLowerCase().includes(searchQuery) ||
                appointment.department.toLowerCase().includes(searchQuery) ||
                appointment.type.toLowerCase().includes(searchQuery) ||
                appointment.id.toLowerCase().includes(searchQuery)
            );
        }

        this.filteredData = filtered;
        this.renderAppointmentTable();
    }

    toggleSidebar() {
        const isCollapsed = this.sidebar.classList.contains('collapsed');
        if (isCollapsed) {
            this.expandSidebar();
        } else {
            this.collapseSidebar();
        }
        localStorage.setItem('sidebarCollapsed', !isCollapsed);
    }

    collapseSidebar() {
        this.sidebar.classList.add('collapsed');
        this.mainContent.classList.add('sidebar-collapsed');
    }

    expandSidebar() {
        this.sidebar.classList.remove('collapsed');
        this.mainContent.classList.remove('sidebar-collapsed');
    }

    handleNavigation(e, clickedLink) {
        e.preventDefault();
        if (clickedLink.parentElement.classList.contains('active')) return;
        
        document.querySelectorAll('.nav-links li').forEach(li => {
            li.classList.remove('active');
        });
        
        clickedLink.parentElement.classList.add('active');
        window.location.href = clickedLink.getAttribute('href');
    }

    setupModalClickOutside() {
        [this.appointmentModal, this.appointmentDetailsModal, this.deleteConfirmModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    if (modal === this.appointmentModal) {
                        this.closeAppointmentModal();
                    } else if (modal === this.appointmentDetailsModal) {
                        this.closeDetailsModal();
                    } else if (modal === this.deleteConfirmModal) {
                        this.closeDeleteModal();
                    }
                }
            });
        });
    }

    openAddAppointmentModal() {
        this.currentEditingId = null;
        document.getElementById('modalTitle').textContent = 'Schedule New Appointment';
        document.getElementById('appointmentId').value = this.generateAppointmentId();
        document.getElementById('appointmentForm').reset();
        
        const now = new Date();
        const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
        document.getElementById('appointmentTime').value = nextHour.toTimeString().slice(0, 5);
        
        this.showModal(this.appointmentModal);
    }

    editAppointment(id) {
        const appointment = this.appointmentData.find(a => a.id === id);
        if (!appointment) return;

        this.currentEditingId = id;
        document.getElementById('modalTitle').textContent = 'Edit Appointment';
        
        document.getElementById('appointmentId').value = appointment.id;
        document.getElementById('patientName').value = appointment.patientName;
        document.getElementById('doctorName').value = appointment.doctorName;
        document.getElementById('appointmentDate').value = appointment.date;
        document.getElementById('appointmentTime').value = appointment.time;
        document.getElementById('appointmentDepartment').value = appointment.department;
        document.getElementById('appointmentType').value = appointment.type;
        document.getElementById('appointmentNotes').value = appointment.notes || '';

        this.showModal(this.appointmentModal);
    }

    viewAppointmentDetails(id) {
        const appointment = this.appointmentData.find(a => a.id === id);
        if (!appointment) return;

        document.getElementById('detailPatientName').textContent = appointment.patientName;
        document.getElementById('detailDoctorName').textContent = appointment.doctorName;
        document.getElementById('detailDate').textContent = this.formatDate(appointment.date);
        document.getElementById('detailTime').textContent = this.formatTime(appointment.time);
        document.getElementById('detailDepartment').textContent = appointment.department;
        document.getElementById('detailType').textContent = appointment.type;
        document.getElementById('detailStatus').innerHTML = `<span class="status-badge ${appointment.status}">${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span>`;
        document.getElementById('detailNotes').textContent = appointment.notes || 'No notes added';

        this.appointmentDetailsModal.dataset.appointmentId = id;
        
        const markCompletedBtn = document.getElementById('markCompleted');
        if (appointment.status === 'completed' || appointment.status === 'cancelled') {
            markCompletedBtn.style.display = 'none';
        } else {
            markCompletedBtn.style.display = 'inline-flex';
        }
        
        this.showModal(this.appointmentDetailsModal);
    }

    markAsCompleted(id) {
        const appointment = this.appointmentData.find(a => a.id === id);
        if (appointment) {
            appointment.status = 'completed';
            this.saveAppointmentData();
            this.applyFilters();
            this.updateStatistics();
            this.updateNextAppointments();
            this.closeDetailsModal();
            this.showNotification(`Appointment for ${appointment.patientName} marked as completed!`, 'success');
        }
    }

    deleteAppointment(id) {
        this.currentDeleteId = id;
        const appointment = this.appointmentData.find(a => a.id === id);
        
        const modalContent = this.deleteConfirmModal.querySelector('p');
        modalContent.innerHTML = `Are you sure you want to cancel the appointment for <strong>${appointment.patientName}</strong> with <strong>${appointment.doctorName}</strong>?`;
        
        this.showModal(this.deleteConfirmModal);
    }

    confirmDelete() {
        if (!this.currentDeleteId) return;
        
        const appointmentIndex = this.appointmentData.findIndex(a => a.id === this.currentDeleteId);
        if (appointmentIndex !== -1) {
            this.appointmentData.splice(appointmentIndex, 1);
            this.saveAppointmentData();
            this.applyFilters();
            this.updateStatistics();
            this.updateNextAppointments();
            this.showNotification('Appointment cancelled successfully!', 'success');
        }
        
        this.closeDeleteModal();
    }

    showModal(modal) {
        modal.style.display = 'flex';
        modal.style.opacity = '0';
        
        setTimeout(() => {
            modal.style.transition = 'opacity 0.3s ease';
            modal.style.opacity = '1';
        }, 10);
    }

    closeAppointmentModal() {
        this.hideModal(this.appointmentModal);
        document.getElementById('appointmentForm').reset();
    }

    closeDetailsModal() {
        this.hideModal(this.appointmentDetailsModal);
    }

    closeDeleteModal() {
        this.hideModal(this.deleteConfirmModal);
        this.currentDeleteId = null;
    }

    hideModal(modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    handleFormSubmission(e) {
        e.preventDefault();
        
        const appointmentData = {
            id: document.getElementById('appointmentId').value,
            patientName: document.getElementById('patientName').value,
            doctorName: document.getElementById('doctorName').value,
            date: document.getElementById('appointmentDate').value,
            time: document.getElementById('appointmentTime').value,
            department: document.getElementById('appointmentDepartment').value,
            type: document.getElementById('appointmentType').value,
            status: 'scheduled',
            notes: document.getElementById('appointmentNotes').value || '',
            dateCreated: this.currentEditingId ? 
                this.appointmentData.find(a => a.id === this.currentEditingId).dateCreated :
                new Date().toISOString().split('T')[0]
        };

        if (this.currentEditingId) {
            const index = this.appointmentData.findIndex(a => a.id === this.currentEditingId);
            this.appointmentData[index] = appointmentData;
            this.showNotification('Appointment updated successfully!', 'success');
        } else {
            this.appointmentData.push(appointmentData);
            this.showNotification('Appointment scheduled successfully!', 'success');
        }

        this.saveAppointmentData();
        this.applyFilters();
        this.updateStatistics();
        this.updateNextAppointments();
        this.closeAppointmentModal();
    }

    generateAppointmentId() {
        const lastId = this.appointmentData.length > 0 
            ? Math.max(...this.appointmentData.map(a => parseInt(a.id.substring(2))))
            : 0;
        return `AP${String(lastId + 1).padStart(3, '0')}`;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <h4>${this.getNotificationTitle(type)}</h4>
                <p>${message}</p>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        });

        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    getNotificationTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information'
        };
        return titles[type] || 'Notification';
    }
}

// Initialize the appointment management system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.appointmentManager = new AppointmentManagement();
});
