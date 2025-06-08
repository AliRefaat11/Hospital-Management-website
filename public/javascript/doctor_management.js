class DoctorManagement {
    constructor() {
        this.doctorData = [];
        this.filteredData = [];
        this.currentEditingId = null;
        this.currentDeleteId = null;

        // DOM Elements
        this.doctorModal = document.getElementById('doctorModal');
        this.doctorDetailsModal = document.getElementById('doctorDetailsModal');
        this.deleteConfirmModal = document.getElementById('deleteConfirmModal');
        this.doctorForm = document.getElementById('doctorForm');
        this.doctorTableBody = document.getElementById('doctorTableBody');
        this.doctorSearch = document.getElementById('doctorSearch');
        this.specializationFilter = document.getElementById('specializationFilter');
        this.statusFilter = document.getElementById('statusFilter');
        this.sidebar = document.getElementById('sidebarNav');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.mainContent = document.querySelector('.main-content');

        // Initialize
        this.initializeEventListeners();
        this.loadDoctorData();
        this.updateStatistics();
        this.initializeSidebar();
    }

    initializeSidebar() {
        // Check if sidebar state is saved in localStorage
        const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isSidebarCollapsed) {
            this.sidebar.classList.add('collapsed');
            this.mainContent.classList.add('sidebar-collapsed');
        }
    }

    initializeEventListeners() {
        // Sidebar toggle
        this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());

        // Add Doctor button
        document.getElementById('addDoctorBtn').addEventListener('click', () => this.showAddDoctorModal());

        // Form submission
        this.doctorForm.addEventListener('submit', (e) => this.handleFormSubmission(e));

        // Search and filters
        this.doctorSearch.addEventListener('input', (e) => this.searchDoctors(e.target.value));
        this.specializationFilter.addEventListener('change', () => this.applyFilters());
        this.statusFilter.addEventListener('change', () => this.applyFilters());

        // Modal close buttons
        document.querySelectorAll('.modal .btn-icon').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal(btn.closest('.modal')));
        });

        // Delete confirmation
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => this.closeModal(this.deleteConfirmModal));
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.confirmDelete());

        // Edit from details
        document.getElementById('editFromDetails').addEventListener('click', () => {
            const id = this.doctorDetailsModal.dataset.doctorId;
            this.closeModal(this.doctorDetailsModal);
            this.editDoctor(id);
        });
    }

    loadDoctorData() {
        // Load from localStorage or use sample data
        const savedData = localStorage.getItem('doctorManagement');
        if (savedData) {
            this.doctorData = JSON.parse(savedData);
        } else {
            this.doctorData = this.getSampleData();
            this.saveDoctorData();
        }
        this.filteredData = [...this.doctorData];
        this.renderDoctorTable();
    }

    saveDoctorData() {
        localStorage.setItem('doctorManagement', JSON.stringify(this.doctorData));
    }

    getSampleData() {
        return [
            {
                id: 'DR001',
                name: 'Dr. Emily Johnson',
                email: 'emily.johnson@primecare.com',
                phone: '+1 (555) 123-4567',
                specialization: 'Cardiologist',
                department: 'Cardiology',
                employmentType: 'Full-Time',
                lastActive: '2024-03-20 09:15',
                status: 'active',
                dateAdded: '2024-01-10'
            },
            {
                id: 'DR002',
                name: 'Dr. Michael Brown',
                email: 'michael.brown@primecare.com',
                phone: '+1 (555) 234-5678',
                specialization: 'Neurologist',
                department: 'Neurology',
                employmentType: 'Full-Time',
                lastActive: '2024-03-20 10:30',
                status: 'active',
                dateAdded: '2024-01-15'
            },
            {
                id: 'DR003',
                name: 'Dr. Sarah Wilson',
                email: 'sarah.wilson@primecare.com',
                phone: '+1 (555) 345-6789',
                specialization: 'General Practitioner',
                department: 'General Medicine',
                employmentType: 'Full-Time',
                lastActive: '2024-03-19 16:45',
                status: 'inactive',
                dateAdded: '2024-02-01'
            },
            {
                id: 'DR004',
                name: 'Dr. David Chen',
                email: 'david.chen@primecare.com',
                phone: '+1 (555) 456-7890',
                specialization: 'Orthopedist',
                department: 'Orthopedics',
                employmentType: 'Part-Time',
                lastActive: '2024-03-20 08:00',
                status: 'active',
                dateAdded: '2024-02-15'
            },
            {
                id: 'DR005',
                name: 'Dr. Lisa Martinez',
                email: 'lisa.martinez@primecare.com',
                phone: '+1 (555) 567-8901',
                specialization: 'Pediatrician',
                department: 'Pediatrics',
                employmentType: 'Full-Time',
                lastActive: '2024-03-20 11:20',
                status: 'on-leave',
                dateAdded: '2024-03-01'
            }
        ];
    }

    updateStatistics() {
        const totalDoctors = this.doctorData.length;
        const activeDoctors = this.doctorData.filter(d => d.status === 'active').length;
        const specialistDoctors = this.doctorData.filter(d => 
            d.specialization !== 'General Practitioner').length;
        const generalDoctors = this.doctorData.filter(d => 
            d.specialization === 'General Practitioner').length;

        document.getElementById('totalDoctors').textContent = totalDoctors;
        document.getElementById('activeDoctors').textContent = activeDoctors;
        document.getElementById('specialistDoctors').textContent = specialistDoctors;
        document.getElementById('generalDoctors').textContent = generalDoctors;
    }

    renderDoctorTable() {
        this.doctorTableBody.innerHTML = '';
        this.filteredData.forEach(doctor => {
            const row = this.createDoctorRow(doctor);
            this.doctorTableBody.appendChild(row);
        });
        this.setupTableEventListeners();
    }

    createDoctorRow(doctor) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${doctor.id}</td>
            <td>${doctor.name}</td>
            <td>${doctor.email}</td>
            <td>${doctor.specialization}</td>
            <td>${doctor.department}</td>
            <td>${this.formatDateTime(doctor.lastActive)}</td>
            <td>
                <span class="status-badge ${doctor.status}">${this.formatStatus(doctor.status)}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon view-btn" data-id="${doctor.id}" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit-btn" data-id="${doctor.id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-btn" data-id="${doctor.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        return row;
    }

    setupTableEventListeners() {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.viewDoctorDetails(id);
            });
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.editDoctor(id);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.deleteDoctor(id);
            });
        });
    }

    searchDoctors(query) {
        let filtered = [...this.doctorData];
        
        if (query) {
            filtered = filtered.filter(doctor => 
                doctor.name.toLowerCase().includes(query.toLowerCase()) ||
                doctor.email.toLowerCase().includes(query.toLowerCase()) ||
                doctor.specialization.toLowerCase().includes(query.toLowerCase()) ||
                doctor.department.toLowerCase().includes(query.toLowerCase()) ||
                doctor.id.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        this.filteredData = filtered;
        this.renderDoctorTable();
    }

    applyFilters() {
        const specializationFilter = this.specializationFilter.value;
        const statusFilter = this.statusFilter.value;
        const searchQuery = this.doctorSearch.value.toLowerCase();

        let filtered = [...this.doctorData];

        if (specializationFilter) {
            filtered = filtered.filter(doctor => doctor.specialization === specializationFilter);
        }
        
        if (statusFilter) {
            filtered = filtered.filter(doctor => doctor.status === statusFilter);
        }

        if (searchQuery) {
            filtered = filtered.filter(doctor => 
                doctor.name.toLowerCase().includes(searchQuery) ||
                doctor.email.toLowerCase().includes(searchQuery) ||
                doctor.specialization.toLowerCase().includes(searchQuery) ||
                doctor.department.toLowerCase().includes(searchQuery) ||
                doctor.id.toLowerCase().includes(searchQuery)
            );
        }

        this.filteredData = filtered;
        this.renderDoctorTable();
    }

    showAddDoctorModal() {
        this.currentEditingId = null;
        document.getElementById('modalTitle').textContent = 'Add New Doctor';
        this.doctorForm.reset();
        this.clearValidationMessages();
        this.showModal(this.doctorModal);
    }

    editDoctor(id) {
        const doctor = this.doctorData.find(d => d.id === id);
        if (!doctor) return;

        this.currentEditingId = id;
        document.getElementById('modalTitle').textContent = 'Edit Doctor';
        
        document.getElementById('doctorId').value = doctor.id;
        document.getElementById('doctorNameInput').value = doctor.name;
        document.getElementById('doctorEmail').value = doctor.email;
        document.getElementById('doctorPhone').value = doctor.phone;
        document.getElementById('doctorRole').value = doctor.specialization;
        document.getElementById('doctorDepartment').value = doctor.department;
        document.getElementById('employmentType').value = doctor.employmentType;

        this.clearValidationMessages();
        this.showModal(this.doctorModal);
    }

    viewDoctorDetails(id) {
        const doctor = this.doctorData.find(d => d.id === id);
        if (!doctor) return;

        document.getElementById('detailName').textContent = doctor.name;
        document.getElementById('detailEmail').textContent = doctor.email;
        document.getElementById('detailSpecialization').textContent = doctor.specialization;
        document.getElementById('detailDepartment').textContent = doctor.department;
        document.getElementById('detailPhone').textContent = doctor.phone;
        document.getElementById('detailEmploymentType').textContent = doctor.employmentType;
        document.getElementById('detailLastActive').textContent = this.formatDateTime(doctor.lastActive);
        document.getElementById('detailStatus').innerHTML = `<span class="status-badge ${doctor.status}">${this.formatStatus(doctor.status)}</span>`;

        this.doctorDetailsModal.dataset.doctorId = id;
        this.showModal(this.doctorDetailsModal);
    }

    deleteDoctor(id) {
        this.currentDeleteId = id;
        const doctor = this.doctorData.find(d => d.id === id);
        
        const modalContent = this.deleteConfirmModal.querySelector('p');
        modalContent.innerHTML = `Are you sure you want to delete Dr. ${doctor.name}'s record?`;
        
        this.showModal(this.deleteConfirmModal);
    }

    confirmDelete() {
        if (!this.currentDeleteId) return;

        const index = this.doctorData.findIndex(d => d.id === this.currentDeleteId);
        if (index !== -1) {
            this.doctorData.splice(index, 1);
            this.saveDoctorData();
            this.applyFilters();
            this.updateStatistics();
            this.showNotification('Doctor deleted successfully!', 'success');
        }

        this.closeModal(this.deleteConfirmModal);
    }

    handleFormSubmission(e) {
        e.preventDefault();
        
        if (!this.validateForm()) return;

        const doctorData = {
            id: document.getElementById('doctorId').value || this.generateDoctorId(),
            name: document.getElementById('doctorNameInput').value,
            email: document.getElementById('doctorEmail').value,
            phone: document.getElementById('doctorPhone').value,
            specialization: document.getElementById('doctorRole').value,
            department: document.getElementById('doctorDepartment').value,
            employmentType: document.getElementById('employmentType').value,
            lastActive: new Date().toLocaleString(),
            status: 'active',
            dateAdded: this.currentEditingId ? 
                this.doctorData.find(d => d.id === this.currentEditingId).dateAdded :
                new Date().toISOString().split('T')[0]
        };

        if (this.currentEditingId) {
            const index = this.doctorData.findIndex(d => d.id === this.currentEditingId);
            this.doctorData[index] = doctorData;
            this.showNotification('Doctor updated successfully!', 'success');
        } else {
            this.doctorData.push(doctorData);
            this.showNotification('Doctor added successfully!', 'success');
        }

        this.saveDoctorData();
        this.applyFilters();
        this.updateStatistics();
        this.closeModal(this.doctorModal);
    }

    validateForm() {
        let isValid = true;
        const form = this.doctorForm;
        form.dataset.hasAttemptedSubmit = 'true';

        // Required fields validation
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showValidationError(field);
                isValid = false;
            } else {
                this.clearValidationError(field);
            }
        });

        // Email validation
        const emailField = document.getElementById('doctorEmail');
        if (emailField.value && !this.isValidEmail(emailField.value)) {
            this.showValidationError(emailField, 'Please enter a valid email address');
            isValid = false;
        }

        // Phone validation
        const phoneField = document.getElementById('doctorPhone');
        if (phoneField.value && !this.isValidPhone(phoneField.value)) {
            this.showValidationError(phoneField, 'Please enter a valid phone number');
            isValid = false;
        }

        return isValid;
    }

    showValidationError(field, message = 'This field is required') {
        const validationMessage = field.nextElementSibling;
        if (validationMessage && validationMessage.classList.contains('validation-message')) {
            validationMessage.textContent = message;
            validationMessage.style.display = 'block';
        }
        field.classList.add('invalid');
    }

    clearValidationError(field) {
        const validationMessage = field.nextElementSibling;
        if (validationMessage && validationMessage.classList.contains('validation-message')) {
            validationMessage.style.display = 'none';
        }
        field.classList.remove('invalid');
    }

    clearValidationMessages() {
        this.doctorForm.querySelectorAll('.validation-message').forEach(msg => {
            msg.style.display = 'none';
        });
        this.doctorForm.querySelectorAll('.invalid').forEach(field => {
            field.classList.remove('invalid');
        });
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPhone(phone) {
        return /^\+?[\d\s-()]{10,}$/.test(phone);
    }

    generateDoctorId() {
        const lastDoctor = this.doctorData[this.doctorData.length - 1];
        const lastId = lastDoctor ? parseInt(lastDoctor.id.replace('DR', '')) : 0;
        return `DR${String(lastId + 1).padStart(3, '0')}`;
    }

    showModal(modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <h4>${type.charAt(0).toUpperCase() + type.slice(1)}</h4>
                <p>${message}</p>
            </div>
            <button class="notification-close">&times;</button>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    formatDateTime(dateTimeStr) {
        const date = new Date(dateTimeStr);
        return date.toLocaleString();
    }

    formatStatus(status) {
        return status.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    toggleSidebar() {
        this.sidebar.classList.toggle('collapsed');
        this.mainContent.classList.toggle('sidebar-collapsed');
        
        // Save sidebar state to localStorage
        const isCollapsed = this.sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }
}

// Initialize the doctor management system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.doctorManager = new DoctorManagement();
});