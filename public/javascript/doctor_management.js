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
        this.openModal(this.doctorModal);
        this.modalTitle.textContent = 'Add New Doctor';
        this.populateEmploymentTypeDropdown('employmentType');

        this.doctorDepartmentInput.innerHTML = '<option value="">Select Department</option>';
        this.allDepartments.forEach(department => {
            const option = document.createElement('option');
            option.value = department._id;
            option.textContent = department.departmentName;
            this.doctorDepartmentInput.appendChild(option);
        });

        this.doctorSpecializationInput.innerHTML = '<option value="">Select Specialization</option>';
        this.specializations.forEach(specialization => {
            const option = document.createElement('option');
            option.value = specialization;
            option.textContent = specialization;
            this.doctorSpecializationInput.appendChild(option);
        });
    }

    editDoctor(id) {
        this.currentEditingId = id;
        const doctor = this.allDoctors.find(d => d._id === id);

        if (doctor) {
            this.modalTitle.textContent = 'Edit Doctor';
            this.doctorFNameInput.value = doctor.userId.FName || '';
            this.doctorLNameInput.value = doctor.userId.LName || '';
            this.doctorEmailInput.value = doctor.userId.Email || '';
            this.doctorPhoneInput.value = doctor.userId.PhoneNumber || '';
            this.doctorGenderInput.value = doctor.userId.Gender || '';
            this.doctorAgeInput.value = doctor.userId.Age || '';
            this.doctorDepartmentInput.value = doctor.departmentId ? doctor.departmentId._id : '';
            this.doctorSpecializationInput.value = doctor.specialization || '';
            this.doctorRatingInput.value = doctor.rating || '';
            this.employmentTypeInput.value = doctor.employmentType || '';

            this.openModal(this.doctorModal);
        }
    }

    viewDoctorDetails(id) {
        const doctor = this.allDoctors.find(d => d._id === id);
        if (doctor) {
            this.detailName.textContent = `${doctor.userId.FName || ''} ${doctor.userId.LName || ''}`;
            this.detailEmail.textContent = doctor.userId.Email || 'N/A';
            this.detailSpecialization.textContent = doctor.specialization || 'N/A';
            this.detailDepartment.textContent = doctor.departmentId ? doctor.departmentId.departmentName : 'N/A';
            this.detailPhone.textContent = doctor.userId.PhoneNumber || 'N/A';
            this.detailEmploymentType.textContent = doctor.employmentType || 'N/A';
            this.detailLastActive.textContent = doctor.lastActive ? new Date(doctor.lastActive).toLocaleString() : 'N/A';
            this.detailStatus.textContent = doctor.status || 'N/A';
            this.openModal(this.doctorDetailsModal);
            this.editFromDetails.dataset.id = id;
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

        const formData = {
            userId: {
                FName: this.doctorFNameInput.value,
                LName: this.doctorLNameInput.value,
                Email: this.doctorEmailInput.value,
                PhoneNumber: this.doctorPhoneInput.value,
                Gender: this.doctorGenderInput.value,
                Age: this.doctorAgeInput.value,
            },
            departmentId: this.doctorDepartmentInput.value,
            specialization: this.doctorSpecializationInput.value,
            rating: this.doctorRatingInput.value,
            employmentType: this.employmentTypeInput.value, // Added employmentType
            // status and lastActive are typically handled by backend or default on creation/update
        };

        try {
            let response;
            if (this.currentEditingId) {
                // Edit Doctor (PATCH request)
                response = await fetch(`/doctors/${this.currentEditingId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        // 'CSRF-Token': serverData.csrfToken // Uncomment if CSRF is implemented
                    },
                    body: JSON.stringify(formData),
                });
            } else {
                // Add New Doctor (POST request)
                response = await fetch('/doctors', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // 'CSRF-Token': serverData.csrfToken // Uncomment if CSRF is implemented
                    },
                    body: JSON.stringify(formData),
                });
            }

            if (response.ok) {
                const result = await response.json();
                console.log('Operation successful:', result);
                // Assuming the API returns the updated list or the new/updated doctor object
                // If it returns the updated list directly
                if (result.data && Array.isArray(result.data)) {
                    this.allDoctors = result.data;
                } else if (result.doctor) { // If it returns a single doctor object (for add/edit)
                    const updatedDoctor = result.doctor;
                    const index = this.allDoctors.findIndex(d => d._id === updatedDoctor._id);
                    if (index > -1) {
                        this.allDoctors[index] = updatedDoctor;
                    } else {
                        this.allDoctors.push(updatedDoctor);
                    }
                }
                this.applyFilters(); // Re-render table with updated data
                this.updateStatistics(); // Update stats after data changes
                this.closeModal(this.doctorModal);
                alert('Doctor saved successfully!');
            } else {
                const errorData = await response.json();
                alert(`Error saving doctor: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error saving doctor:', error);
            alert('An error occurred while saving the doctor.');
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
}

// Initialize the doctor management system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Ensure serverData is available globally from the EJS template
    if (typeof serverData !== 'undefined') {
        window.doctorManager = new DoctorManagement(serverData);
    } else {
        console.error('serverData is not defined. Please ensure it is passed from the EJS template.');
        // Fallback for development if serverData is not yet integrated
        // window.doctorManager = new DoctorManagement({ doctors: [], departments: [], specializations: [], employmentTypes: [], admin: {}, stats: {}, activities: [] });
    }
});