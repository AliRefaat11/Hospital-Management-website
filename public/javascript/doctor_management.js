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

        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal(this.doctorModal));
        document.getElementById('addScheduleSlot').addEventListener('click', () => this.addScheduleSlot());
    }

    async loadDoctorData() {
        try {
            const response = await fetch('/api/doctors');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            this.doctorData = result.data.map(doc => ({
                _id: doc._id,
                id: doc._id, // Keep for compatibility if frontend uses 'id'
                name: `${doc.userId.FName} ${doc.userId.LName}`,
                email: doc.userId.Email,
                phone: doc.userId.PhoneNumber,
                specialization: doc.specialization,
                department: doc.departmentId.name,
                employmentType: 'Full-time', // Default or fetch if available
                lastActive: new Date().toLocaleString(),
                status: 'active',
                dateAdded: new Date(doc.createdAt).toISOString().split('T')[0],
                schedule: doc.schedule || [] // Ensure schedule is an array
            }));
            this.applyFilters();
            this.updateStatistics();
        } catch (error) {
            console.error('Error loading doctor data:', error);
            this.showNotification('Failed to load doctor data.', 'error');
        }
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
        this.clearForm();
        this.clearValidationMessages();
        // Clear existing schedule inputs
        const scheduleInputsContainer = document.getElementById('scheduleInputs');
        scheduleInputsContainer.innerHTML = '';
        this.addScheduleSlot(); // Add at least one empty slot for new doctors
        this.showModal(this.doctorModal);
    }

    editDoctor(id) {
        this.currentEditingId = id;
        document.getElementById('modalTitle').textContent = 'Edit Doctor';
        const doctor = this.doctorData.find(d => d._id === id); // Use _id for backend data
        if (!doctor) {
            console.error('Doctor not found for editing:', id);
            this.showNotification('Doctor not found!', 'error');
            return;
        }
        this.populateForm(doctor);
        this.clearValidationMessages();
        // Populate schedule inputs
        const scheduleInputsContainer = document.getElementById('scheduleInputs');
        scheduleInputsContainer.innerHTML = ''; // Clear existing
        if (doctor.schedule && doctor.schedule.length > 0) {
            doctor.schedule.forEach(slot => {
                this.addScheduleSlot(slot.day, slot.startTime, slot.endTime);
            });
        } else {
            this.addScheduleSlot(); // Add a default empty slot if no schedule exists
        }
        this.showModal(this.doctorModal);
    }

    populateForm(doctor) {
        document.getElementById('doctorId').value = doctor._id || ''; // Use _id
        document.getElementById('doctorNameInput').value = doctor.userId.FName + " " + doctor.userId.LName || '';
        document.getElementById('doctorEmail').value = doctor.userId.Email || '';
        document.getElementById('doctorPhone').value = doctor.userId.PhoneNumber || '';
        document.getElementById('doctorRole').value = doctor.specialization || '';
        document.getElementById('doctorDepartment').value = doctor.departmentId.departmentName || '';
        // employmentType is not in the model, so we skip it.
    }

    clearForm() {
        document.getElementById('doctorId').value = '';
        document.getElementById('doctorNameInput').value = '';
        document.getElementById('doctorEmail').value = '';
        document.getElementById('doctorPhone').value = '';
        document.getElementById('doctorRole').value = '';
        document.getElementById('doctorDepartment').value = '';
        // Clear employmentType if it exists in the form, even if not in model
        const employmentTypeElement = document.getElementById('employmentType');
        if (employmentTypeElement) {
            employmentTypeElement.value = '';
        }
        // Schedule inputs are cleared and re-added in showAddDoctorModal
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

    async handleFormSubmission(e) {
        e.preventDefault();
        
        if (!this.validateForm()) return;

        const schedule = [];
        document.querySelectorAll('.schedule-slot').forEach(slotDiv => {
            const day = slotDiv.querySelector('.schedule-day').value;
            const startTime = slotDiv.querySelector('.schedule-start-time').value;
            const endTime = slotDiv.querySelector('.schedule-end-time').value;
            const bufferTime = parseInt(slotDiv.querySelector('.schedule-buffer-time').value) || 15;
            const slotDuration = parseInt(slotDiv.querySelector('.schedule-duration').value) || 30;
            
            if (day && startTime && endTime) {
                schedule.push({ day, startTime, endTime, bufferTime, slotDuration });
            }
        });

        const FName = document.getElementById('doctorNameInput').value.split(' ')[0];
        const LName = document.getElementById('doctorNameInput').value.split(' ').slice(1).join(' ');
        const Email = document.getElementById('doctorEmail').value;
        const PhoneNumber = document.getElementById('doctorPhone').value;
        const specialization = document.getElementById('doctorRole').value;
        const departmentName = document.getElementById('doctorDepartment').value;

        // Fetch the departmentId based on departmentName
        let departmentId = null;
        try {
            const response = await fetch(`/api/departments/name/${departmentName}`);
            const data = await response.json();
            if (data.success && data.department) {
                departmentId = data.department._id;
            } else {
                this.showNotification(`Department ${departmentName} not found.`, 'error');
                return;
            }
        } catch (error) {
            console.error('Error fetching department ID:', error);
            this.showNotification('Error fetching department information.', 'error');
            return;
        }

        const formData = {
            FName,
            LName,
            Email,
            PhoneNumber,
            specialization,
            departmentId,
            schedule
        };

        try {
            const url = this.currentEditingId 
                ? `/api/doctors/${this.currentEditingId}`
                : '/api/doctors';
            
            const method = this.currentEditingId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                this.showNotification(
                    this.currentEditingId 
                        ? 'Doctor updated successfully!' 
                        : 'Doctor added successfully!',
                    'success'
                );
                this.hideModal(this.doctorModal);
                await this.loadDoctorData();
            } else {
                throw new Error(result.message || 'Failed to save doctor');
            }
        } catch (error) {
            console.error('Error saving doctor:', error);
            this.showNotification(error.message, 'error');
        }
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

        // Schedule validation
        const scheduleSlots = document.querySelectorAll('.schedule-slot');
        let validScheduleSlotsCount = 0;
        scheduleSlots.forEach(slotDiv => {
            const day = slotDiv.querySelector('.schedule-day').value;
            const startTime = slotDiv.querySelector('.schedule-start-time').value;
            const endTime = slotDiv.querySelector('.schedule-end-time').value;
            const bufferTime = parseInt(slotDiv.querySelector('.schedule-buffer-time').value) || 15;
            const slotDuration = parseInt(slotDiv.querySelector('.schedule-duration').value) || 30;

            if (day && startTime && endTime) {
                // Validate time range
                const start = new Date(`2000-01-01T${startTime}`);
                const end = new Date(`2000-01-01T${endTime}`);
                
                if (end <= start) {
                    this.showValidationError(slotDiv.querySelector('.schedule-end-time'), 
                        'End time must be after start time');
                    isValid = false;
                }

                // Validate buffer time and slot duration
                if (bufferTime < 0 || bufferTime > 60) {
                    this.showValidationError(slotDiv.querySelector('.schedule-buffer-time'),
                        'Buffer time must be between 0 and 60 minutes');
                    isValid = false;
                }

                if (slotDuration < 15 || slotDuration > 120) {
                    this.showValidationError(slotDiv.querySelector('.schedule-duration'),
                        'Slot duration must be between 15 and 120 minutes');
                    isValid = false;
                }

                validScheduleSlotsCount++;
            }
        });

        const scheduleErrorElement = document.getElementById('scheduleErrorMessage');
        if (validScheduleSlotsCount < 2) {
            if (scheduleErrorElement) {
                scheduleErrorElement.textContent = 'Please add at least two complete schedule entries (day, start time, end time).';
                scheduleErrorElement.style.display = 'block';
            }
            isValid = false;
        } else {
            if (scheduleErrorElement) {
                scheduleErrorElement.style.display = 'none';
            }
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

    addScheduleSlot(day = '', startTime = '', endTime = '', bufferTime = 15, slotDuration = 30) {
        const scheduleInputs = document.getElementById('scheduleInputs');
        const slotDiv = document.createElement('div');
        slotDiv.classList.add('schedule-slot');
        slotDiv.innerHTML = `
            <div class="form-group-inline">
                <select class="schedule-day" required>
                    <option value="">Select Day</option>
                    <option value="saturday" ${day === 'saturday' ? 'selected' : ''}>Saturday</option>
                    <option value="sunday" ${day === 'sunday' ? 'selected' : ''}>Sunday</option>
                    <option value="monday" ${day === 'monday' ? 'selected' : ''}>Monday</option>
                    <option value="tuesday" ${day === 'tuesday' ? 'selected' : ''}>Tuesday</option>
                    <option value="wednesday" ${day === 'wednesday' ? 'selected' : ''}>Wednesday</option>
                    <option value="thursday" ${day === 'thursday' ? 'selected' : ''}>Thursday</option>
                    <option value="friday" ${day === 'friday' ? 'selected' : ''}>Friday</option>
                </select>
                <input type="time" class="schedule-start-time" value="${startTime}" required>
                <input type="time" class="schedule-end-time" value="${endTime}" required>
                <input type="number" class="schedule-buffer-time" value="${bufferTime}" min="0" max="60" 
                       title="Buffer time between appointments (minutes)" placeholder="Buffer (min)">
                <input type="number" class="schedule-duration" value="${slotDuration}" min="15" max="120" 
                       title="Duration of each appointment (minutes)" placeholder="Duration (min)">
                <button type="button" class="btn btn-danger remove-schedule-slot">Remove</button>
            </div>
        `;
        scheduleInputs.appendChild(slotDiv);

        slotDiv.querySelector('.remove-schedule-slot').addEventListener('click', () => {
            slotDiv.remove();
        });
    }
}

// Initialize the doctor management system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Ensure the script runs after the DOM is fully loaded
    if (window.doctorManager) {
        window.doctorManager.loadDoctorData();
    } else {
        window.doctorManager = new DoctorManagement();
    }
});