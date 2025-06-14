class DoctorManagement {
    constructor(serverData) {
        this.allDoctors = serverData.doctors || [];
        this.allDepartments = serverData.departments || [];
        this.specializations = serverData.specializations || [];
        this.employmentTypes = serverData.employmentTypes || [];
        this.adminUser = serverData.admin || {};
        this.statsData = serverData.stats || {};
        this.activitiesData = serverData.activities || [];

        this.filteredData = [...this.allDoctors];
        this.currentEditingId = null;
        this.currentDeleteId = null;

        // DOM Elements - moved here from outside the class
        this.doctorModal = document.getElementById('doctorModal');
        this.doctorDetailsModal = document.getElementById('doctorDetailsModal');
        this.deleteConfirmModal = document.getElementById('deleteConfirmModal');
        this.doctorForm = document.getElementById('doctorForm');
        this.doctorTableBody = document.getElementById('doctorTableBody');
        this.doctorSearch = document.getElementById('doctorSearch');
        this.departmentFilter = document.getElementById('departmentFilter');
        this.specializationFilter = document.getElementById('specializationFilter');
        this.statusFilter = document.getElementById('statusFilter');
        this.sidebar = document.getElementById('sidebarNav');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.mainContent = document.querySelector('.main-content');
        this.modalTitle = document.getElementById('modalTitle');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.closeDetailsModal = document.getElementById('closeDetailsModal');
        this.editFromDetails = document.getElementById('editFromDetails');
        this.cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        this.confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

        // Form inputs
        this.doctorFNameInput = document.getElementById('doctorFNameInput');
        this.doctorLNameInput = document.getElementById('doctorLNameInput');
        this.doctorEmailInput = document.getElementById('doctorEmail');
        this.doctorPhoneInput = document.getElementById('doctorPhone');
        this.doctorGenderInput = document.getElementById('doctorGenderInput');
        this.doctorAgeInput = document.getElementById('doctorAgeInput');
        this.doctorDepartmentInput = document.getElementById('doctorDepartment');
        this.doctorSpecializationInput = document.getElementById('doctorRole'); // Maps to specialization in EJS
        this.doctorRatingInput = document.getElementById('doctorRatingInput');
        this.employmentTypeInput = document.getElementById('employmentType');

        this.detailName = document.getElementById('detailName');
        this.detailEmail = document.getElementById('detailEmail');
        this.detailSpecialization = document.getElementById('detailSpecialization');
        this.detailDepartment = document.getElementById('detailDepartment');
        this.detailPhone = document.getElementById('detailPhone');
        this.detailEmploymentType = document.getElementById('detailEmploymentType');
        this.detailLastActive = document.getElementById('detailLastActive');
        this.detailStatus = document.getElementById('detailStatus');


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
        this.renderAll(); // Renders table, filters, and stats based on initial data
        this.initializeSidebar();
    }

    initializeSidebar() {
        const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isSidebarCollapsed) {
            this.sidebar.classList.add('collapsed');
            this.mainContent.classList.add('sidebar-collapsed');
        }
    }

    initializeEventListeners() {
        this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        this.addDoctorBtn.addEventListener('click', () => this.showAddDoctorModal());
        this.doctorForm.addEventListener('submit', (e) => this.handleFormSubmission(e));
        this.doctorSearch.addEventListener('input', () => this.applyFilters());
        this.departmentFilter.addEventListener('change', () => this.applyFilters());
        this.specializationFilter.addEventListener('change', () => this.applyFilters());
        this.statusFilter.addEventListener('change', () => this.applyFilters()); // Assuming status filter exists

        this.cancelBtn.addEventListener('click', () => this.closeModal(this.doctorModal));
        this.closeDetailsModal.addEventListener('click', () => this.closeModal(this.doctorDetailsModal));
        this.cancelDeleteBtn.addEventListener('click', () => this.closeModal(this.deleteConfirmModal));
        this.confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
        this.editFromDetails.addEventListener('click', (e) => this.editDoctor(e.target.dataset.id));

        // Event delegation for view, edit, delete buttons in table
        this.doctorTableBody.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            const id = target.dataset.id;
            if (target.classList.contains('view-doctor')) {
                this.viewDoctorDetails(id);
            } else if (target.classList.contains('edit-doctor')) {
                this.editDoctor(id);
            } else if (target.classList.contains('delete-doctor')) {
                this.deleteDoctor(id);
            }
        });

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

    renderAll() {
        this.populateDepartmentFilter();
        this.populateSpecializationFilter();
        this.populateEmploymentTypeDropdown('employmentType');
        this.renderDoctorTable(this.allDoctors);
        this.updateStatistics();
    }

    renderDoctorTable(doctorsToRender) {
        this.doctorTableBody.innerHTML = '';
        if (doctorsToRender.length === 0) {
            this.doctorTableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No doctors found.</td></tr>';
            return;
        }

        doctorsToRender.forEach(doctor => {
            const row = document.createElement('tr');
            row.setAttribute('data-doctor-id', doctor._id);
            row.innerHTML = `
                <td>${doctor._id || 'N/A'}</td>
                <td>${doctor.userId ? `${doctor.userId.FName || ''} ${doctor.userId.LName || ''}` : 'N/A'}</td>
                <td>${doctor.userId ? (doctor.userId.Email || 'N/A') : 'N/A'}</td>
                <td>${doctor.specialization || 'N/A'}</td>
                <td>${doctor.departmentId ? (doctor.departmentId.departmentName || 'N/A') : 'N/A'}</td>
                <td>${doctor.lastActive ? new Date(doctor.lastActive).toLocaleString() : 'N/A'}</td>
                <td><span class="status-badge ${doctor.status ? doctor.status.toLowerCase() : 'unknown'}">${doctor.status || 'Unknown'}</span></td>
                <td class="actions-cell">
                    <button class="btn-icon view-doctor" title="View Details" data-id="${doctor._id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit-doctor" title="Edit Doctor" data-id="${doctor._id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-doctor" title="Delete Doctor" data-id="${doctor._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            this.doctorTableBody.appendChild(row);
        });
    }

    updateStatistics() {
        document.getElementById('totalDoctors').textContent = this.statsData.totalDoctors || 0;
        document.getElementById('totalDoctorsChange').textContent = `${this.statsData.doctorsChange || 0}% from last month`;
        document.getElementById('activeDoctors').textContent = this.statsData.activeDoctors || 0;
        document.getElementById('specialistDoctors').textContent = this.statsData.specialistDoctors || 0;
        document.getElementById('generalDoctors').textContent = this.statsData.generalDoctors || 0;

        const activityList = document.getElementById('activityList');
        activityList.innerHTML = '';
        this.activitiesData.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.classList.add('activity-item');
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="activity-details">
                    <p class="activity-text">${activity.description}</p>
                    <span class="activity-time">${new Date(activity.timestamp).toLocaleString()}</span>
                </div>
            `;
            activityList.appendChild(activityItem);
        });
    }

    applyFilters() {
        const searchTerm = this.doctorSearch.value.toLowerCase();
        const selectedDepartment = this.departmentFilter.value;
        const selectedSpecialization = this.specializationFilter.value;
        const selectedStatus = this.statusFilter.value;

        this.filteredData = this.allDoctors.filter(doctor => {
            const matchesSearch =
                (doctor.userId && doctor.userId.FName && doctor.userId.FName.toLowerCase().includes(searchTerm)) ||
                (doctor.userId && doctor.userId.LName && doctor.userId.LName.toLowerCase().includes(searchTerm)) ||
                (doctor.userId && doctor.userId.Email && doctor.userId.Email.toLowerCase().includes(searchTerm)) ||
                (doctor.specialization && doctor.specialization.toLowerCase().includes(searchTerm)) ||
                (doctor.departmentId && doctor.departmentId.departmentName && doctor.departmentId.departmentName.toLowerCase().includes(searchTerm)) ||
                (doctor._id && doctor._id.toLowerCase().includes(searchTerm)); // Include ID search

            const matchesDepartment = selectedDepartment ? (doctor.departmentId && doctor.departmentId._id === selectedDepartment) : true;
            const matchesSpecialization = selectedSpecialization ? (doctor.specialization && doctor.specialization.toLowerCase() === selectedSpecialization.toLowerCase()) : true;
            const matchesStatus = selectedStatus ? (doctor.status && doctor.status.toLowerCase() === selectedStatus.toLowerCase()) : true;

            return matchesSearch && matchesDepartment && matchesSpecialization && matchesStatus;
        });
        this.renderDoctorTable(this.filteredData);
    }

    populateDepartmentFilter() {
        this.departmentFilter.innerHTML = '<option value="">All Departments</option>';
        this.allDepartments.forEach(department => {
            const option = document.createElement('option');
            option.value = department._id;
            option.textContent = department.departmentName;
            this.departmentFilter.appendChild(option);
        });
    }

    populateSpecializationFilter() {
        this.specializationFilter.innerHTML = '<option value="">All Specializations</option>';
        this.specializations.forEach(specialization => {
            const option = document.createElement('option');
            option.value = specialization;
            option.textContent = specialization;
            this.specializationFilter.appendChild(option);
        });
    }

    populateEmploymentTypeDropdown(selectElementId) {
        const selectElement = document.getElementById(selectElementId);
        if (selectElement) {
            selectElement.innerHTML = '<option value="">Select Employment Type</option>';
            this.employmentTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                selectElement.appendChild(option);
            });
        }
    }

    openModal(modal) {
        modal.style.display = 'block';
    }

    closeModal(modal) {
        modal.style.display = 'none';
        this.doctorForm.reset();
        this.currentEditingId = null;
        this.modalTitle.textContent = 'Add New Doctor';
        this.clearValidationMessages();
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
        this.openModal(this.deleteConfirmModal);
    }

    async confirmDelete() {
        try {
            const response = await fetch(`/doctors/${this.currentDeleteId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    // 'CSRF-Token': serverData.csrfToken // Uncomment if CSRF is implemented
                }
            });

            if (response.ok) {
                alert('Doctor deleted successfully!');
                this.closeModal(this.deleteConfirmModal);
                this.allDoctors = this.allDoctors.filter(doc => doc._id !== this.currentDeleteId);
                this.applyFilters(); // Re-render table with updated data
                this.updateStatistics();
            } else {
                const errorData = await response.json();
                alert(`Error deleting doctor: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error deleting doctor:', error);
            alert('An error occurred while deleting the doctor.');
        }
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
        this.clearValidationMessages();

        const fieldsToValidate = [
            { element: this.doctorFNameInput, message: 'First name is required' },
            { element: this.doctorLNameInput, message: 'Last name is required' },
            { element: this.doctorEmailInput, message: 'Please enter a valid email address', validator: this.isValidEmail },
            { element: this.doctorPhoneInput, message: 'Please enter a valid phone number', validator: this.isValidPhone },
            { element: this.doctorGenderInput, message: 'Please select a gender' },
            { element: this.doctorAgeInput, message: 'Please enter a valid age', condition: val => !val || val <= 0 },
            { element: this.doctorDepartmentInput, message: 'Please select a department' },
            { element: this.doctorSpecializationInput, message: 'Please select a specialization' },
            { element: this.doctorRatingInput, message: 'Please enter a rating between 1 and 5', condition: val => !val || val < 1 || val > 5 },
            { element: this.employmentTypeInput, message: 'Please select an employment type' }
        ];

        fieldsToValidate.forEach(field => {
            const value = field.element.value.trim();
            if (field.validator) {
                if (!field.validator(value)) {
                    this.showValidationError(field.element, field.message);
                    isValid = false;
                }
            } else if (field.condition) {
                if (field.condition(value)) {
                    this.showValidationError(field.element, field.message);
                    isValid = false;
                }
            } else if (!value) {
                this.showValidationError(field.element, field.message);
                isValid = false;
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

    showValidationError(element, message) {
        const errorMessageSpan = element.nextElementSibling;
        if (errorMessageSpan && errorMessageSpan.classList.contains('validation-message')) {
            errorMessageSpan.textContent = message;
        } else {
            const span = document.createElement('span');
            span.classList.add('validation-message');
            span.textContent = message;
            element.parentNode.insertBefore(span, element.nextSibling);
        }
    }

    clearValidationMessages() {
        document.querySelectorAll('.validation-message').forEach(span => {
            span.textContent = '';
        });
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPhone(phone) {
        return /^\+?[0-9]{10,14}$/.test(phone); // Basic phone validation
    }

    formatDateTime(dateTimeStr) {
        if (!dateTimeStr) return 'N/A';
        try {
            return new Date(dateTimeStr).toLocaleString();
        } catch (e) {
            return 'Invalid Date';
        }
    }

    formatStatus(status) {
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    }

    toggleSidebar() {
        this.sidebar.classList.toggle('collapsed');
        this.mainContent.classList.toggle('sidebar-collapsed');
        localStorage.setItem('sidebarCollapsed', this.sidebar.classList.contains('collapsed'));
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