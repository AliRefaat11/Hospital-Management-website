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

        // Doctor form specific inputs
        this.doctorIdInput = document.getElementById('doctorId');
        this.doctorNameInput = document.getElementById('doctorNameInput');
        this.doctorEmail = document.getElementById('doctorEmail');
        this.doctorPhone = document.getElementById('doctorPhone');
        this.doctorSpecialization = document.getElementById('doctorSpecialization');
        this.doctorDepartment = document.getElementById('doctorDepartment');
        this.doctorRating = document.getElementById('doctorRating');
        this.doctorExperience = document.getElementById('doctorExperience');
        this.doctorProfileImage = document.getElementById('doctorProfileImage');

        // Weekly schedule elements
        this.weeklyScheduleContainer = document.getElementById('weeklyScheduleContainer');
        this.scheduleDayCheckboxes = this.weeklyScheduleContainer.querySelectorAll('input[type="checkbox"]');
        this.timeSlotsInputs = this.weeklyScheduleContainer.querySelectorAll('.time-slots-input');

        // Notification element
        this.notificationContainer = document.getElementById('notificationContainer');

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

        // Event listeners for weekly schedule checkboxes
        this.scheduleDayCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.toggleTimeSlotsInput(e.target));
        });
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
                departmentId: doc.departmentId._id, // Store department ID for form
                rating: doc.rating,
                experience: doc.experience,
                profileImage: doc.profileImage,
                lastActive: new Date().toLocaleString(),
                status: 'active', // Assuming status is active by default or fetched from user model
                dateAdded: new Date(doc.createdAt).toISOString().split('T')[0],
                weeklySchedule: doc.weeklySchedule || [] // Ensure weeklySchedule is an array
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
        this.doctorModal.querySelector('#modalTitle').textContent = 'Add New Doctor';
        this.clearForm();
        this.showModal(this.doctorModal);
    }

    editDoctor(id) {
        this.currentEditingId = id;
        this.doctorModal.querySelector('#modalTitle').textContent = 'Edit Doctor';
        const doctor = this.doctorData.find(d => d.id === id);
        if (doctor) {
            this.populateForm(doctor);
            this.showModal(this.doctorModal);
        } else {
            this.showNotification('Doctor not found for editing.', 'error');
        }
    }

    populateForm(doctor) {
        this.doctorIdInput.value = doctor.id || '';
        this.doctorNameInput.value = doctor.name.split(' ').slice(0, -1).join(' ') || ''; // Assuming first name is part of name
        this.doctorEmail.value = doctor.email || '';
        this.doctorPhone.value = doctor.phone || '';
        this.doctorSpecialization.value = doctor.specialization || '';
        this.doctorDepartment.value = doctor.departmentId || ''; // Use departmentId
        this.doctorRating.value = doctor.rating || '';
        this.doctorExperience.value = doctor.experience || '';
        this.doctorProfileImage.value = doctor.profileImage || '';

        // Populate weekly schedule
        this.clearWeeklyScheduleInputs();
        if (doctor.weeklySchedule && doctor.weeklySchedule.length > 0) {
            doctor.weeklySchedule.forEach(schedule => {
                const dayCheckbox = this.weeklyScheduleContainer.querySelector(`input[type="checkbox"][value="${schedule.dayOfWeek}"]`);
                const timeSlotsInput = this.weeklyScheduleContainer.querySelector(`.time-slots-input[data-day="${schedule.dayOfWeek}"]`);
                if (dayCheckbox && timeSlotsInput) {
                    dayCheckbox.checked = true;
                    timeSlotsInput.value = schedule.timeSlots.join(',');
                    timeSlotsInput.disabled = false; // Enable input if day is scheduled
                }
            });
        }

        this.clearValidationMessages();
    }

    clearForm() {
        this.doctorForm.reset();
        this.currentEditingId = null;
        this.doctorIdInput.value = ''; // Clear ID field
        this.clearValidationMessages();
        this.clearWeeklyScheduleInputs(); // Clear schedule inputs
    }

    clearWeeklyScheduleInputs() {
        this.scheduleDayCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        this.timeSlotsInputs.forEach(input => {
            input.value = '';
            input.disabled = true; // Disable by default
        });
    }

    toggleTimeSlotsInput(checkbox) {
        const day = checkbox.value;
        const timeSlotsInput = this.weeklyScheduleContainer.querySelector(`.time-slots-input[data-day="${day}"]`);
        if (timeSlotsInput) {
            timeSlotsInput.disabled = !checkbox.checked;
            if (!checkbox.checked) {
                timeSlotsInput.value = ''; // Clear times if unchecked
            }
        }
    }

    viewDoctorDetails(id) {
        const doctor = this.doctorData.find(d => d.id === id);
        if (doctor) {
            document.getElementById('viewDoctorId').textContent = doctor.id;
            document.getElementById('viewDoctorName').textContent = doctor.name;
            document.getElementById('viewDoctorEmail').textContent = doctor.email;
            document.getElementById('viewDoctorPhone').textContent = doctor.phone;
            document.getElementById('viewDoctorSpecialization').textContent = doctor.specialization;
            document.getElementById('viewDoctorDepartment').textContent = doctor.department;
            document.getElementById('viewDoctorRating').textContent = doctor.rating || 'N/A';
            document.getElementById('viewDoctorExperience').textContent = doctor.experience !== undefined ? `${doctor.experience} years` : 'N/A';
            document.getElementById('viewDoctorProfileImage').src = doctor.profileImage || '/images/account-icon-33.png';
            document.getElementById('editDoctorFromView').dataset.id = doctor.id;
            document.getElementById('deleteDoctorFromView').dataset.id = doctor.id;

            // Populate weekly schedule for viewing
            const viewScheduleContainer = document.getElementById('viewDoctorWeeklySchedule');
            viewScheduleContainer.innerHTML = ''; // Clear previous
            if (doctor.weeklySchedule && doctor.weeklySchedule.length > 0) {
                doctor.weeklySchedule.sort((a, b) => {
                    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                    return days.indexOf(a.dayOfWeek) - days.indexOf(b.dayOfWeek);
                }).forEach(schedule => {
                    const scheduleItem = document.createElement('div');
                    scheduleItem.className = 'detail-item';
                    scheduleItem.innerHTML = `
                        <span class="detail-label">${schedule.dayOfWeek}:</span>
                        <span class="detail-value">${schedule.timeSlots.join(', ') || 'No time slots'}</span>
                    `;
                    viewScheduleContainer.appendChild(scheduleItem);
                });
            } else {
                viewScheduleContainer.innerHTML = '<div class="detail-item full-width"><span class="detail-value">No weekly schedule defined.</span></div>';
            }
            this.showModal(this.doctorDetailsModal);
        } else {
            this.showNotification('Doctor details not found.', 'error');
        }
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

        if (!this.validateForm()) {
            return;
        }

        const userId = this.currentEditingId ? this.doctorData.find(d => d._id === this.currentEditingId)?.userId?._id : undefined;
        const doctorId = this.currentEditingId;

        // Gather weekly schedule data
        const weeklySchedule = [];
        let scheduleValidationPassed = true;
        this.scheduleDayCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const day = checkbox.value;
                const timeSlotsInput = this.weeklyScheduleContainer.querySelector(`.time-slots-input[data-day="${day}"]`);
                const timeSlotsString = timeSlotsInput.value.trim();
                
                if (timeSlotsString) {
                    const timeSlots = timeSlotsString.split(',').map(s => s.trim());
                    // Basic time format validation (HH:MM)
                    const invalidTime = timeSlots.find(time => !/^([01]\d|2[0-3]):([0-5]\d)$/.test(time));
                    if (invalidTime) {
                        this.showNotification(`Invalid time format for ${day}: ${invalidTime}. Use HH:MM.`, 'error');
                        scheduleValidationPassed = false;
                        return;
                    }
                    weeklySchedule.push({ dayOfWeek: day, timeSlots: timeSlots });
                } else {
                    this.showNotification(`Please enter time slots for ${day} or uncheck the day.`, 'error');
                    scheduleValidationPassed = false;
                    return;
                }
            }
        });

        if (!scheduleValidationPassed) {
            return;
        }

        const doctorData = {
            // userId will be included when creating a new user or fetched for existing
            // For simplicity, directly mapping to doctor model fields
            // Assuming userId, FName, LName, Email, PhoneNumber are handled by User model implicitly
            // during doctor creation/update based on email/phone.
            // This part needs careful review with your backend logic.
            specialization: this.doctorSpecialization.value,
            departmentId: this.doctorDepartment.value,
            rating: parseFloat(this.doctorRating.value),
            experience: parseInt(this.doctorExperience.value),
            profileImage: this.doctorProfileImage.value,
            weeklySchedule: weeklySchedule, // Add the collected schedule
        };

        // User data (for User model fields)
        const userData = {
            FName: this.doctorNameInput.value.split(' ')[0], // Assuming first word is FName
            LName: this.doctorNameInput.value.split(' ').slice(1).join(' '), // Rest is LName
            Email: this.doctorEmail.value,
            PhoneNumber: this.doctorPhone.value,
            role: 'Doctor' // Set role as Doctor
        };

        let url = '/api/doctors';
        let method = 'POST';

        if (this.currentEditingId) {
            // For editing, we update the existing doctor and potentially the associated user
            url = `/api/doctors/${this.currentEditingId}`;
            method = 'PUT';
            doctorData.userId = userId; // Ensure userId is sent for update
        } else {
            // For new doctor, send user data for creation first
            const userResponse = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            if (!userResponse.ok) {
                const errorData = await userResponse.json();
                this.showNotification(`Failed to create user: ${errorData.message || userResponse.statusText}`, 'error');
                return;
            }
            const userResult = await userResponse.json();
            doctorData.userId = userResult.data._id; // Link new doctor to newly created user
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(doctorData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save doctor');
            }

            this.showNotification('Doctor saved successfully!', 'success');
            this.closeModal(this.doctorModal);
            this.loadDoctorData(); // Reload data to update the table
        } catch (error) {
            console.error('Error saving doctor:', error);
            this.showNotification(`Error: ${error.message}`, 'error');
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

// Initialize the DoctorManagement class
document.addEventListener('DOMContentLoaded', () => {
    new DoctorManagement();
});