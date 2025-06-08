 // Simple Patient Management System
        class SimplePatientManager {
            constructor() {
                this.patients = [
                    { id: 'PT001', name: 'John Doe', email: 'john.doe@email.com', gender: 'Male', age: 35, phone: '+1 (555) 123-4567', status: 'active' },
                    { id: 'PT002', name: 'Jane Smith', email: 'jane.smith@email.com', gender: 'Female', age: 28, phone: '+1 (555) 234-5678', status: 'active' },
                    { id: 'PT003', name: 'Michael Johnson', email: 'michael.j@email.com', gender: 'Male', age: 42, phone: '+1 (555) 345-6789', status: 'inactive' },
                    { id: 'PT004', name: 'Sarah Wilson', email: 'sarah.w@email.com', gender: 'Female', age: 31, phone: '+1 (555) 456-7890', status: 'active' },
                    { id: 'PT005', name: 'David Brown', email: 'david.b@email.com', gender: 'Male', age: 29, phone: '+1 (555) 567-8901', status: 'inactive' }
                ];
                this.currentEditId = null;
                this.patientToDelete = null;
                this.init();
            }

            init() {
                this.setupEventListeners();
                this.renderTable();
                this.updateStatistics();
            }

            setupEventListeners() {
                // Sidebar toggle
                document.getElementById('sidebarToggle').addEventListener('click', () => {
                    document.getElementById('sidebarNav').classList.toggle('collapsed');
                });

                // Search functionality
                document.getElementById('patientSearch').addEventListener('input', (e) => {
                    this.searchPatients(e.target.value);
                });

                // Filter functionality
                document.getElementById('genderFilter').addEventListener('change', () => {
                    this.applyFilters();
                });
                document.getElementById('statusFilter').addEventListener('change', () => {
                    this.applyFilters();
                });

                // Add patient button
                document.getElementById('addPatientBtn').addEventListener('click', () => {
                    this.openAddModal();
                });

                // Modal close buttons
                document.getElementById('closeModal').addEventListener('click', () => {
                    this.closeModal();
                });
                document.getElementById('cancelBtn').addEventListener('click', () => {
                    this.closeModal();
                });

                // View modal close button
                document.getElementById('closeViewModal').addEventListener('click', () => {
                    this.closeViewModal();
                });

                // Delete modal event listeners
                document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
                    this.confirmDelete();
                });

                document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
                    this.closeDeleteModal();
                });

                // Edit from view modal
                document.getElementById('editFromView').addEventListener('click', () => {
                    const patientId = document.getElementById('viewPatientId').textContent;
                    this.closeViewModal();
                    this.editPatient(patientId);
                });

                // Form submission
                document.getElementById('patientForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.savePatient();
                });

                // Close modals on outside click
                document.getElementById('patientModal').addEventListener('click', (e) => {
                    if (e.target.id === 'patientModal') {
                        this.closeModal();
                    }
                });

                document.getElementById('viewPatientModal').addEventListener('click', (e) => {
                    if (e.target.id === 'viewPatientModal') {
                        this.closeViewModal();
                    }
                });

                document.getElementById('deleteConfirmModal').addEventListener('click', (e) => {
                    if (e.target.id === 'deleteConfirmModal') {
                        this.closeDeleteModal();
                    }
                });
            }

            renderTable() {
                const tbody = document.getElementById('patientTableBody');
                tbody.innerHTML = '';

                this.patients.forEach(patient => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${patient.id}</td>
                        <td>${patient.name}</td>
                        <td>${patient.email}</td>
                        <td>${patient.gender}</td>
                        <td>${patient.age}</td>
                        <td>${patient.phone}</td>
                        <td><span class="status-badge ${patient.status}">${patient.status}</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-icon view-btn" onclick="patientManager.viewPatient('${patient.id}')" title="View">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-icon edit-btn" onclick="patientManager.editPatient('${patient.id}')" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon delete-btn" onclick="patientManager.deletePatient('${patient.id}')" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
                
                this.updateStatistics();
            }

            updateStatistics() {
                const total = this.patients.length;
                const active = this.patients.filter(p => p.status === 'active').length;
                const inactive = this.patients.filter(p => p.status === 'inactive').length;
                const males = this.patients.filter(p => p.gender === 'Male').length;
                const females = this.patients.filter(p => p.gender === 'Female').length;
                
                // Create gender distribution string
                const genderDistribution = `${males}M / ${females}F`;
                
                // Update the display
                document.getElementById('totalPatients').textContent = total;
                document.getElementById('activePatients').textContent = active;
                document.getElementById('inactivePatients').textContent = inactive;
                document.getElementById('genderDistribution').textContent = genderDistribution;
            }

            searchPatients(query) {
                const rows = document.querySelectorAll('#patientTableBody tr');
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
                });
            }

            applyFilters() {
                const genderFilter = document.getElementById('genderFilter').value;
                const statusFilter = document.getElementById('statusFilter').value;
                const searchQuery = document.getElementById('patientSearch').value.toLowerCase();

                const rows = document.querySelectorAll('#patientTableBody tr');
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    const gender = cells[3].textContent;
                    const status = cells[6].querySelector('.status-badge').textContent;
                    const text = row.textContent.toLowerCase();

                    let show = true;
                    if (genderFilter && gender !== genderFilter) show = false;
                    if (statusFilter && status !== statusFilter) show = false;
                    if (searchQuery && !text.includes(searchQuery)) show = false;

                    row.style.display = show ? '' : 'none';
                });
            }

            openAddModal() {
                this.currentEditId = null;
                document.getElementById('modalTitle').textContent = 'Add New Patient';
                document.getElementById('patientForm').reset();
                document.getElementById('patientModal').style.display = 'flex';
            }

            editPatient(id) {
                const patient = this.patients.find(p => p.id === id);
                if (!patient) return;

                this.currentEditId = id;
                document.getElementById('modalTitle').textContent = 'Edit Patient';
                document.getElementById('patientName').value = patient.name;
                document.getElementById('patientEmail').value = patient.email;
                document.getElementById('patientPhone').value = patient.phone;
                document.getElementById('patientGender').value = patient.gender;
                document.getElementById('patientAge').value = patient.age;
                document.getElementById('patientStatus').value = patient.status;
                document.getElementById('patientModal').style.display = 'flex';
            }

            viewPatient(id) {
                const patient = this.patients.find(p => p.id === id);
                if (!patient) return;
                
                // Populate view modal
                document.getElementById('viewPatientId').textContent = patient.id;
                document.getElementById('viewPatientName').textContent = patient.name;
                document.getElementById('viewPatientEmail').textContent = patient.email;
                document.getElementById('viewPatientPhone').textContent = patient.phone;
                document.getElementById('viewPatientGender').textContent = patient.gender;
                document.getElementById('viewPatientAge').textContent = patient.age;
                document.getElementById('viewPatientStatus').innerHTML = `<span class="status-badge ${patient.status}">${patient.status}</span>`;
                
                // Show modal
                document.getElementById('viewPatientModal').style.display = 'flex';
            }

            closeViewModal() {
                document.getElementById('viewPatientModal').style.display = 'none';
            }

            deletePatient(id) {
                const patient = this.patients.find(p => p.id === id);
                if (!patient) return;
                
                // Store the patient ID for deletion
                this.patientToDelete = id;
                
                // Update the modal with patient name
                document.getElementById('deletePatientName').textContent = patient.name;
                
                // Show the delete confirmation modal
                document.getElementById('deleteConfirmModal').style.display = 'flex';
            }

            confirmDelete() {
                if (this.patientToDelete) {
                    this.patients = this.patients.filter(p => p.id !== this.patientToDelete);
                    this.renderTable();
                    this.updateStatistics();
                    this.patientToDelete = null;
                }
                this.closeDeleteModal();
            }

            closeDeleteModal() {
                document.getElementById('deleteConfirmModal').style.display = 'none';
                this.patientToDelete = null;
            }

            savePatient() {
                const formData = {
                    name: document.getElementById('patientName').value,
                    email: document.getElementById('patientEmail').value,
                    phone: document.getElementById('patientPhone').value,
                    gender: document.getElementById('patientGender').value,
                    age: parseInt(document.getElementById('patientAge').value),
                    status: document.getElementById('patientStatus').value
                };

                if (this.currentEditId) {
                    // Update existing patient
                    const index = this.patients.findIndex(p => p.id === this.currentEditId);
                    this.patients[index] = { ...this.patients[index], ...formData };
                } else {
                    // Add new patient
                    const newId = 'PT' + String(this.patients.length + 1).padStart(3, '0');
                    this.patients.push({ id: newId, ...formData });
                }

                this.renderTable();
                this.updateStatistics();
                this.closeModal();
            }

            closeModal() {
                document.getElementById('patientModal').style.display = 'none';
            }
        }

        // Initialize the patient manager
        const patientManager = new SimplePatientManager();