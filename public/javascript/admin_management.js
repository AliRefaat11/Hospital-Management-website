// Initialize admin data
let admins = [];
const currentAdminEmail = 'john.smith@example.com'; // Set the current admin email

// Load admins from local storage or use default if none exist
function loadAdminsFromLocalStorage() {
    const storedAdmins = localStorage.getItem('admins');
    if (storedAdmins) {
        admins = JSON.parse(storedAdmins);
    } else {
        // Default demo data if no data in local storage
        admins = [
            {
                id: 1,
                name: 'John Smith',
                email: 'john.smith@example.com',
                status: 'Active'
            },
            {
                id: 2,
                name: 'Emily Johnson',
                email: 'emily.johnson@example.com',
                status: 'Inactive'
            }
        ];
    }
    saveAdminsToLocalStorage();
}

// Save admins to local storage
function saveAdminsToLocalStorage() {
    localStorage.setItem('admins', JSON.stringify(admins));
}

// DOM Elements
const sidebarNav = document.getElementById('sidebarNav');
const sidebarToggle = document.getElementById('sidebarToggle');
const mainContent = document.getElementById('mainContent');

const adminTable = document.getElementById('adminTable');
const searchInput = document.getElementById('searchInput');
const addAdminBtn = document.getElementById('addAdminBtn');

const adminDetailsModal = document.getElementById('adminDetailsModal');
const closeDetailsModalBtn = document.getElementById('closeDetailsModal');

const adminModal = document.getElementById('adminModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const adminForm = document.getElementById('adminForm');
const modalTitle = document.getElementById('modalTitle');

const deleteModal = document.getElementById('deleteModal');
const closeDeleteModalBtn = document.getElementById('closeDeleteModal');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Helper to close all modals
function closeAllModals() {
    adminDetailsModal.classList.remove('show');
    adminModal.classList.remove('show');
    deleteModal.classList.remove('show');
}

// Initialize the admin table
function initAdminTable() {
    renderAdminData(admins);
    updateStats();
}

// Render admin data in the table
function renderAdminData(data) {
    const tbody = adminTable.querySelector('tbody');
    tbody.innerHTML = '';

    data.forEach((admin, index) => {
        // First admin is always active, others are inactive
        const status = index === 0 ? 'Active' : 'Inactive';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${admin.name}</td>
            <td>${admin.email}</td>
            <td><span class="status-badge ${status.toLowerCase()}">${status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon view-btn" onclick="viewAdminDetails(${admin.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit-btn" onclick="editAdmin(${admin.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-btn" onclick="deleteAdmin(${admin.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Update statistics
function updateStats() {
    // Force the first admin to be active and others inactive
    admins[0].status = 'Active';
    for (let i = 1; i < admins.length; i++) {
        admins[i].status = 'Inactive';
    }
    
    document.getElementById('totalAdmins').textContent = admins.length;
    document.getElementById('activeAdmins').textContent = 1; // Always 1 active admin
    document.getElementById('systemAdmins').textContent = admins.length - 1; // Total minus active
}

// Search functionality
function searchAdmins() {
    const query = searchInput.value.toLowerCase();
    const filteredAdmins = admins.filter(admin => 
        admin.name.toLowerCase().includes(query) ||
        admin.email.toLowerCase().includes(query)
    );
    renderAdminData(filteredAdmins);
}

// View admin details
function viewAdminDetails(adminId) {
    const admin = admins.find(a => a.id === adminId);
    if (admin) {
        const status = admin.id === admins[0].id ? 'Active' : 'Inactive';
        document.getElementById('adminName').textContent = admin.name;
        document.getElementById('adminEmail').textContent = admin.email;
        document.getElementById('adminStatus').textContent = status;
        adminDetailsModal.classList.add('show');
    }
}

// Edit admin
function editAdmin(adminId) {
    const admin = admins.find(a => a.id === adminId);
    if (admin) {
        modalTitle.textContent = 'Edit Admin';
        adminForm.dataset.adminId = admin.id;
        document.getElementById('adminNameInput').value = admin.name;
        document.getElementById('adminEmailInput').value = admin.email;
        adminModal.classList.add('show');
    }
}

// Delete admin
function deleteAdmin(adminId) {
    deleteModal.classList.add('show');
    confirmDeleteBtn.onclick = () => {
        admins = admins.filter(admin => admin.id !== adminId);
        renderAdminData(admins);
        updateStats();
        saveAdminsToLocalStorage(); // Save after deletion
        closeAllModals();
    };
}

// Handle form submission for Add/Edit Admin
adminForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const adminId = adminForm.dataset.adminId;
    const name = document.getElementById('adminNameInput').value;
    const email = document.getElementById('adminEmailInput').value;
    const status = 'Inactive'; // New admins are always inactive

    if (adminId) {
        // Edit existing admin
        const index = admins.findIndex(a => a.id === parseInt(adminId));
        if (index !== -1) {
            admins[index] = { ...admins[index], name, email, status };
        }
    } else {
        // Add new admin
        const newId = admins.length > 0 ? Math.max(...admins.map(a => a.id)) + 1 : 1;
        admins.push({
            id: newId,
            name,
            email,
            status
        });
    }

    renderAdminData(admins);
    updateStats();
    saveAdminsToLocalStorage();
    closeAllModals();
});

// Set current admin
function setCurrentAdmin(email) {
    localStorage.setItem('currentAdminEmail', email);
    // Update all admin statuses
    admins.forEach(admin => {
        admin.status = admin.email === email ? 'Active' : 'Inactive';
    });
    saveAdminsToLocalStorage();
    renderAdminData(admins);
    updateStats();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadAdminsFromLocalStorage(); // Load admins on page load
    initAdminTable();
    updateStats(); // Update stats after loading

    // Set current admin (this should be called when admin logs in)
    setCurrentAdmin(currentAdminEmail);

    // Sidebar toggle
    sidebarToggle.addEventListener('click', () => {
        sidebarNav.classList.toggle('collapsed');
        mainContent.classList.toggle('sidebar-collapsed');
    });

    // Search input
    searchInput.addEventListener('input', searchAdmins);

    // Add admin button
    addAdminBtn.addEventListener('click', () => {
        modalTitle.textContent = 'Add New Admin';
        adminForm.reset();
        delete adminForm.dataset.adminId; // Clear adminId for new admin
        adminModal.classList.add('show');
    });

    // Close modal buttons
    closeDetailsModalBtn.addEventListener('click', () => closeAllModals());
    closeModalBtn.addEventListener('click', () => closeAllModals());
    closeDeleteModalBtn.addEventListener('click', () => closeAllModals());

    // Cancel buttons
    cancelBtn.addEventListener('click', () => closeAllModals());
    cancelDeleteBtn.addEventListener('click', () => closeAllModals());
}); 