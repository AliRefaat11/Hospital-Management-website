class StaffManagement {
    constructor() {
        // Core elements
        this.sidebar = document.getElementById('sidebarNav');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.mainContent = document.querySelector('.main-content');
        this.navLinks = document.querySelectorAll('.nav-links a');
        
        // Staff management data
        this.staffData = [];
        this.filteredData = [];
        this.currentEditingId = null;
        this.currentDeleteId = null;
        this.currentNotification = null;
        this.currentTooltip = null;
        
        // Modal elements
        this.staffModal = document.getElementById('staffModal');
        this.staffDetailsModal = document.getElementById('staffDetailsModal');
        this.deleteConfirmModal = document.getElementById('deleteConfirmModal');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStaffData();
        this.updateStatistics();
        this.updateRecentActivity();
        this.animateStatsOnLoad();
        this.setupSmoothScrolling();
        this.initializeTooltips();
        this.setupSearchFunctionality();
        this.setupValidation();
        
        // Check localStorage for sidebar state
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (sidebarCollapsed) {
            this.collapseSidebar();
        }
    }

    setupEventListeners() {
        // Sidebar toggle with advanced animations
        this.sidebarToggle.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Navigation links with page transitions
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavigation(e, link);
            });
            
            // Add hover effects
            link.addEventListener('mouseenter', () => {
                if (!link.parentElement.classList.contains('active')) {
                    link.style.transform = 'translateX(5px)';
                }
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.transform = 'translateX(0)';
            });
        });

        // Add staff button with ripple effect
        const addStaffBtn = document.getElementById('addStaffBtn');
        addStaffBtn.addEventListener('click', (e) => {
            this.createRippleEffect(e, addStaffBtn);
            setTimeout(() => this.openAddStaffModal(), 200);
        });

        // Modal close buttons
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeStaffModal();
        });
        
        document.getElementById('closeDetailsModal').addEventListener('click', () => {
            this.closeDetailsModal();
        });

        // Form submission
        document.getElementById('staffForm').addEventListener('submit', (e) => {
            this.handleFormSubmission(e);
        });

        // Filter changes with animation
        document.getElementById('roleFilter').addEventListener('change', () => {
            this.applyFilters();
        });
        
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        // Search functionality
        document.getElementById('staffSearch').addEventListener('input', (e) => {
            this.searchStaff(e.target.value);
        });

        // Edit from details modal
        document.getElementById('editFromDetails').addEventListener('click', () => {
            const id = this.staffDetailsModal.dataset.staffId;
            this.closeDetailsModal();
            this.editStaff(id);
        });

        // Delete confirmation
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            this.confirmDelete();
        });
        
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
            this.closeDeleteModal();
        });

        // Header actions with effects
        document.querySelectorAll('.header-actions .btn-icon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleHeaderAction(e, btn);
            });
        });

        // Responsive sidebar for mobile
        this.setupMobileNavigation();

        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Setup notification handlers
        this.setupNotificationHandlers();

        // Click outside modal to close
        this.setupModalClickOutside();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    // ================== SIDEBAR NAVIGATION ==================
    toggleSidebar() {
        const isCollapsed = this.sidebar.classList.contains('collapsed');
        
        if (isCollapsed) {
            this.expandSidebar();
        } else {
            this.collapseSidebar();
        }
        
        // Save state to localStorage
        localStorage.setItem('sidebarCollapsed', !isCollapsed);
    }

    collapseSidebar() {
        this.sidebar.classList.add('collapsed');
        this.mainContent.classList.add('sidebar-collapsed');
        
        // Animate toggle button
        this.sidebarToggle.style.transform = 'rotate(180deg)';
        
        // Update dashboard background
        const dashboardBg = document.querySelector('.dashboard-background');
        if (dashboardBg) {
            dashboardBg.style.left = 'var(--sidebar-collapsed-width)';
        }
    }

    expandSidebar() {
        this.sidebar.classList.remove('collapsed');
        this.mainContent.classList.remove('sidebar-collapsed');
        
        // Reset icon rotation
        this.sidebarToggle.style.transform = 'rotate(0deg)';
        
        // Update dashboard background
        const dashboardBg = document.querySelector('.dashboard-background');
        if (dashboardBg) {
            dashboardBg.style.left = 'var(--sidebar-width)';
        }
    }

    handleNavigation(e, clickedLink) {
        e.preventDefault();
        
        // Don't navigate if it's the current page
        if (clickedLink.parentElement.classList.contains('active')) {
            return;
        }
        
        // Remove active class from all nav items
        document.querySelectorAll('.nav-links li').forEach(li => {
            li.classList.remove('active');
        });
        
        // Add active class to clicked item
        clickedLink.parentElement.classList.add('active');
        
        // Get the target URL
        const targetUrl = clickedLink.getAttribute('href');
        
        // Create smooth transition effect
        this.createPageTransition(targetUrl);
    }

    createPageTransition(targetUrl) {
        // Create overlay for smooth transition
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(45, 95, 124, 0.9) 0%, rgba(30, 136, 229, 0.9) 100%);
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.2rem;
        `;
        
        overlay.innerHTML = `
            <div style="text-align: center;">
                <div class="loading-spinner" style="
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-top: 3px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                "></div>
                Loading...
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Fade in overlay
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);
        
        // Navigate after transition
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 300);
    }

    setupMobileNavigation() {
        // Create mobile overlay
        const mobileOverlay = document.createElement('div');
        mobileOverlay.className = 'mobile-overlay';
        mobileOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 999;
                        opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(mobileOverlay);
        
        // Handle clicks outside sidebar on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!this.sidebar.contains(e.target) && this.sidebar.classList.contains('active')) {
                    this.sidebar.classList.remove('active');
                    mobileOverlay.style.opacity = '0';
                    mobileOverlay.style.visibility = 'hidden';
                }
            }
        });
        
        // Close on overlay click
        mobileOverlay.addEventListener('click', () => {
            this.sidebar.classList.remove('active');
            mobileOverlay.style.opacity = '0';
            mobileOverlay.style.visibility = 'hidden';
        });
    }

    handleResize() {
        if (window.innerWidth <= 768) {
            this.sidebar.classList.remove('collapsed');
            this.mainContent.classList.remove('sidebar-collapsed');
        } else {
            const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            if (sidebarCollapsed) {
                this.collapseSidebar();
            }
        }
    }

    setupModalClickOutside() {
        // Close modal when clicking outside
        [this.staffModal, this.staffDetailsModal, this.deleteConfirmModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    if (modal === this.staffModal) {
                        this.closeStaffModal();
                    } else if (modal === this.staffDetailsModal) {
                        this.closeDetailsModal();
                    } else if (modal === this.deleteConfirmModal) {
                        this.closeDeleteModal();
                    }
                }
            });
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC to close modals
            if (e.key === 'Escape') {
                if (this.staffModal.style.display === 'flex') {
                    this.closeStaffModal();
                } else if (this.staffDetailsModal.style.display === 'flex') {
                    this.closeDetailsModal();
                } else if (this.deleteConfirmModal.style.display === 'flex') {
                    this.closeDeleteModal();
                }
            }
            
            // Ctrl+N to add new staff
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.openAddStaffModal();
            }
            
            // Focus search with Ctrl+F
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                document.getElementById('staffSearch').focus();
            }
        });
    }

    // ================== TOOLTIPS & UI EFFECTS ==================
    initializeTooltips() {
        const elements = document.querySelectorAll('[title]');
        
        elements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e, element.getAttribute('title'));
            });
            
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    showTooltip(e, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: var(--gray-900);
            color: white;
            padding: 0.5rem 0.75rem;
            border-radius: 4px;
            font-size: 0.875rem;
            z-index: 1000;
            white-space: nowrap;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = e.target.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
        
        setTimeout(() => {
            tooltip.style.opacity = '1';
        }, 10);
        
        this.currentTooltip = tooltip;
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.style.opacity = '0';
            setTimeout(() => {
                if (this.currentTooltip && this.currentTooltip.parentNode) {
                    this.currentTooltip.parentNode.removeChild(this.currentTooltip);
                }
                this.currentTooltip = null;
            }, 300);
        }
    }

    createRippleEffect(e, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(45, 95, 124, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    animateStatsOnLoad() {
        const statCards = document.querySelectorAll('.stat-card');
        
        // Animate stats with staggered effect
        statCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });

        // Animate additional sections
        setTimeout(() => {
            const sections = document.querySelectorAll('.staff-management, .quick-actions');
            sections.forEach((section, index) => {
                section.style.opacity = '0';
                section.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    section.style.transition = 'all 0.6s ease';
                    section.style.opacity = '1';
                    section.style.transform = 'translateY(0)';
                }, index * 200);
            });
        }, 600);
    }

    setupSmoothScrolling() {
        // Add smooth scrolling to any internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // ================== HEADER ACTIONS ==================
    handleHeaderAction(e, button) {
        // Add click animation
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);

        // Determine action type
        const actionType = button.querySelector('i').classList.contains('fa-bell') ? 'notifications' : 'messages';
        
        if (actionType === 'notifications') {
            this.showNotifications();
        } else {
            this.showMessages();
        }
    }

    setupNotificationHandlers() {
        const notificationBtn = document.querySelector('.header-actions .btn-icon');
        const messageBtn = document.querySelectorAll('.header-actions .btn-icon')[1];
        
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.showNotifications();
            });
        }
        
        if (messageBtn) {
            messageBtn.addEventListener('click', () => {
                this.showMessages();
            });
        }
    }

    showNotifications() {
        this.createDropdown('notifications', [
            { text: 'New staff member Dr. Sarah added', time: '5 minutes ago', type: 'info' },
            { text: 'Staff schedule updated for next week', time: '10 minutes ago', type: 'info' },
            { text: 'Emergency contact needed for Nurse Kate', time: '15 minutes ago', type: 'urgent' }
        ]);
    }

    showMessages() {
        this.createDropdown('messages', [
            { text: 'HR: New staff orientation tomorrow', time: '2 minutes ago', sender: 'HR Department' },
            { text: 'Dr. Johnson: Schedule change request', time: '8 minutes ago', sender: 'Dr. Johnson' },
            { text: 'Admin: Staff meeting at 3 PM', time: '1 hour ago', sender: 'Administration' }
        ]);
    }

    createDropdown(type, items) {
        // Remove existing dropdown
        const existingDropdown = document.querySelector('.custom-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }
        
        const dropdown = document.createElement('div');
        dropdown.className = 'custom-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            right: 0;
            width: 320px;
            background: white;
            border-radius: var(--border-radius);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1001;
            max-height: 350px;
            overflow-y: auto;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease;
        `;
        
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 1rem;
            border-bottom: 1px solid var(--gray-200);
            font-weight: 600;
            color: var(--gray-800);
        `;
        header.textContent = type === 'notifications' ? 'Notifications' : 'Messages';
        dropdown.appendChild(header);
        
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.style.cssText = `
                padding: 0.75rem 1rem;
                border-bottom: 1px solid var(--gray-100);
                cursor: pointer;
                transition: background-color 0.2s ease;
            `;
            
            itemElement.addEventListener('mouseenter', () => {
                itemElement.style.backgroundColor = 'var(--gray-50)';
            });
            
            itemElement.addEventListener('mouseleave', () => {
                itemElement.style.backgroundColor = 'transparent';
            });
            
            if (type === 'notifications') {
                itemElement.innerHTML = `
                    <div style="font-size: 0.875rem; color: var(--gray-800); margin-bottom: 0.25rem;">
                        ${item.text}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--gray-600);">
                        ${item.time}
                    </div>
                `;
            } else {
                itemElement.innerHTML = `
                    <div style="font-size: 0.75rem; color: var(--primary-color); margin-bottom: 0.25rem;">
                        ${item.sender}
                    </div>
                    <div style="font-size: 0.875rem; color: var(--gray-800); margin-bottom: 0.25rem;">
                        ${item.text}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--gray-600);">
                        ${item.time}
                    </div>
                `;
            }
            
            dropdown.appendChild(itemElement);
        });
        
        // Position dropdown
        const headerActions = document.querySelector('.header-actions');
        headerActions.style.position = 'relative';
        headerActions.appendChild(dropdown);
        
        // Show dropdown
        setTimeout(() => {
            dropdown.style.opacity = '1';
            dropdown.style.transform = 'translateY(0)';
        }, 10);
        
        // Close dropdown when clicking outside
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && !headerActions.contains(e.target)) {
                    dropdown.style.opacity = '0';
                    dropdown.style.transform = 'translateY(-10px)';
                    setTimeout(() => {
                        if (dropdown.parentNode) {
                            dropdown.parentNode.removeChild(dropdown);
                        }
                    }, 300);
                }
            }, { once: true });
        }, 100);
    }

    // ================== STAFF DATA MANAGEMENT ==================
    loadStaffData() {
        // Load from localStorage or use sample data
        const savedData = localStorage.getItem('staffManagement');
        if (savedData) {
            this.staffData = JSON.parse(savedData);
        } else {
            this.staffData = this.getSampleData();
            this.saveStaffData();
        }
        this.filteredData = [...this.staffData];
        this.renderStaffTable();
    }

    saveStaffData() {
        localStorage.setItem('staffManagement', JSON.stringify(this.staffData));
    }

    getSampleData() {
        return [
            {
                id: 'ST001',
                name: 'Dr. Emily Johnson',
                email: 'emily.johnson@primecare.com',
                phone: '+1 (555) 123-4567',
                role: 'Doctor',
                department: 'Cardiology',
                employmentType: 'Full-Time',
                status: 'active',
                lastActive: '2024-05-19',
                dateAdded: '2024-01-15'
            },
            {
                id: 'ST002',
                name: 'Nurse Sarah Wilson',
                email: 'sarah.wilson@primecare.com',
                phone: '+1 (555) 234-5678',
                role: 'Nurse',
                department: 'General Medicine',
                employmentType: 'Full-Time',
                status: 'active',
                lastActive: '2024-05-19',
                dateAdded: '2024-02-01'
            },
            {
                id: 'ST003',
                name: 'Mike Rodriguez',
                email: 'mike.rodriguez@primecare.com',
                phone: '+1 (555) 345-6789',
                role: 'Technician',
                department: 'Radiology',
                employmentType: 'Part-Time',
                status: 'active',
                lastActive: '2024-05-18',
                dateAdded: '2024-03-10'
            },
            {
                id: 'ST004',
                name: 'Lisa Chen',
                email: 'lisa.chen@primecare.com',
                phone: '+1 (555) 456-7890',
                role: 'Support Staff',
                department: 'General Medicine',
                employmentType: 'Full-Time',
                status: 'inactive',
                lastActive: '2024-05-15',
                dateAdded: '2024-01-20'
            }
        ];
    }

    // ================== SEARCH & FILTER ==================
    setupSearchFunctionality() {
        const searchInput = document.getElementById('staffSearch');
        let searchTimeout;
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchStaff(e.target.value);
                }, 300);
            });

            // Search input focus effects
            searchInput.addEventListener('focus', () => {
                searchInput.parentElement.style.transform = 'scale(1.02)';
                searchInput.parentElement.style.boxShadow = '0 4px 12px rgba(45, 95, 124, 0.1)';
            });

            searchInput.addEventListener('blur', () => {
                searchInput.parentElement.style.transform = 'scale(1)';
                searchInput.parentElement.style.boxShadow = 'none';
            });
        }
    }

    searchStaff(query) {
        let filtered = [...this.staffData];
        
        if (query) {
            filtered = filtered.filter(staff => 
                staff.name.toLowerCase().includes(query.toLowerCase()) ||
                staff.email.toLowerCase().includes(query.toLowerCase()) ||
                staff.role.toLowerCase().includes(query.toLowerCase()) ||
                staff.department.toLowerCase().includes(query.toLowerCase()) ||
                staff.id.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        // Apply other filters
        const roleFilter = document.getElementById('roleFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        
        if (roleFilter) {
            filtered = filtered.filter(staff => staff.role === roleFilter);
        }
        
        if (statusFilter) {
            filtered = filtered.filter(staff => staff.status === statusFilter);
        }
        
        this.filteredData = filtered;
        this.renderStaffTable();
        
        // Show search results count
        this.showSearchResults(filtered.length, this.staffData.length);
    }

    applyFilters() {
        const roleFilter = document.getElementById('roleFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const searchQuery = document.getElementById('staffSearch').value.toLowerCase();

        let filtered = [...this.staffData];

        if (roleFilter) {
            filtered = filtered.filter(staff => staff.role === roleFilter);
        }
        
        if (statusFilter) {
            filtered = filtered.filter(staff => staff.status === statusFilter);
        }

        if (searchQuery) {
            filtered = filtered.filter(staff => 
                staff.name.toLowerCase().includes(searchQuery) ||
                staff.email.toLowerCase().includes(searchQuery) ||
                staff.role.toLowerCase().includes(searchQuery) ||
                staff.department.toLowerCase().includes(searchQuery) ||
                staff.id.toLowerCase().includes(searchQuery)
            );
        }

        this.filteredData = filtered;
        this.renderStaffTable();
        
        // Animate filter change
        const tableContainer = document.querySelector('.table-container');
        tableContainer.style.opacity = '0.7';
        setTimeout(() => {
            tableContainer.style.opacity = '1';
        }, 200);
        
        // Show search results count
        this.showSearchResults(filtered.length, this.staffData.length);
    }

    showSearchResults(filtered, total) {
        // Remove existing search result message
        const existingMsg = document.querySelector('.search-results-message');
        if (existingMsg) existingMsg.remove();
        
        if (filtered < total) {
            const message = document.createElement('div');
            message.className = 'search-results-message';
            message.style.cssText = `
                background: var(--primary-light);
                padding: 0.75rem 1rem;
                border-radius: var(--border-radius);
                margin-bottom: 1rem;
                color: var(--primary-color);
                font-size: 0.875rem;
                border: 1px solid var(--primary-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            
            message.innerHTML = `
                <span>
                    <i class="fas fa-filter" style="margin-right: 0.5rem;"></i>
                    Showing ${filtered} of ${total} staff members
                </span>
                <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="this.clearAllFilters()" id="clearFiltersBtn">
                    Clear Filters
                </button>
            `;
            
            const tableContainer = document.querySelector('.table-container');
            tableContainer.parentNode.insertBefore(message, tableContainer);
            
            // Add event listener to clear filters button
            document.getElementById('clearFiltersBtn').addEventListener('click', () => {
                document.getElementById('staffSearch').value = '';
                document.getElementById('roleFilter').value = '';
                document.getElementById('statusFilter').value = '';
                this.applyFilters();
                message.remove();
            });
        }
    }

    // ================== TABLE MANAGEMENT ==================
    renderStaffTable() {
        const tbody = document.getElementById('staffTableBody');
        tbody.innerHTML = '';
        
        if (this.filteredData.length === 0) {
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = `
                <td colspan="8" style="text-align: center; padding: 2rem; color: var(--gray-600);">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <div>No staff members found</div>
                </td>
            `;
            tbody.appendChild(noDataRow);
            return;
        }
        
        this.filteredData.forEach((staff, index) => {
            const row = this.createStaffRow(staff, index);
            tbody.appendChild(row);
        });

        this.addTableAnimations();
        this.setupTableEventListeners();
    }

    createStaffRow(staff, index) {
            const row = document.createElement('tr');
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            
            row.innerHTML = `
            <td>${staff.id}</td>
                <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div class="staff-avatar">${staff.name.charAt(0)}</div>
                    <span class="staff-name-link" data-id="${staff.id}" style="
                        color: var(--primary-color);
                        cursor: pointer;
                        font-weight: 500;
                        transition: all 0.2s ease;
                    ">${staff.name}</span>
                </div>
                </td>
            <td>${staff.email}</td>
                <td>
                <span class="role-badge ${staff.role.toLowerCase().replace(' ', '-')}">${staff.role}</span>
                </td>
            <td>${staff.department}</td>
            <td>${this.formatDate(staff.lastActive)}</td>
            <td>
                <span class="status-badge ${staff.status}">${staff.status}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon view-btn" data-id="${staff.id}" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit-btn" data-id="${staff.id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-btn" data-id="${staff.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                </td>
            `;
            
        return row;
    }

    setupTableEventListeners() {
        // Name links to open details modal
        document.querySelectorAll('.staff-name-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.viewStaffDetails(id);
            });
            
            // Hover effect
            link.addEventListener('mouseenter', (e) => {
                e.target.style.color = 'var(--primary-dark)';
                e.target.style.textDecoration = 'underline';
            });
            
            link.addEventListener('mouseleave', (e) => {
                e.target.style.color = 'var(--primary-color)';
                e.target.style.textDecoration = 'none';
            });
        });
        
        // View buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.viewStaffDetails(id);
                this.createRippleEffect(e, btn);
            });
        });
        
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.editStaff(id);
                this.createRippleEffect(e, btn);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.deleteStaff(id);
                this.createRippleEffect(e, btn);
            });
        });
    }

    addTableAnimations() {
        const rows = document.querySelectorAll('#staffTableBody tr');
        rows.forEach((row, index) => {
            setTimeout(() => {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, index * 50);
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

    // ================== MODAL MANAGEMENT ==================
    openAddStaffModal() {
        this.currentEditingId = null;
        document.getElementById('modalTitle').textContent = 'Add New Staff';
        document.getElementById('staffId').value = this.generateStaffId();
        document.getElementById('staffForm').reset();
        this.clearValidationMessages();
        this.showModal(this.staffModal);
    }

    editStaff(id) {
        const staff = this.staffData.find(s => s.id === id);
        if (!staff) return;

        this.currentEditingId = id;
        document.getElementById('modalTitle').textContent = 'Edit Staff';
        
        // Populate form
        document.getElementById('staffId').value = staff.id;
        document.getElementById('staffNameInput').value = staff.name;
        document.getElementById('staffEmail').value = staff.email;
        document.getElementById('staffPhone').value = staff.phone;
        document.getElementById('staffRole').value = staff.role;
        document.getElementById('staffDepartment').value = staff.department;
        document.getElementById('employmentType').value = staff.employmentType;
        
        this.clearValidationMessages();
        this.showModal(this.staffModal);
    }

    viewStaffDetails(id) {
        const staff = this.staffData.find(s => s.id === id);
        if (!staff) return;

        // Populate details modal
        document.getElementById('detailName').textContent = staff.name;
        document.getElementById('detailEmail').textContent = staff.email;
        document.getElementById('detailRole').textContent = staff.role;
        document.getElementById('detailDepartment').textContent = staff.department;
        document.getElementById('detailPhone').textContent = staff.phone;
        document.getElementById('detailEmploymentType').textContent = staff.employmentType;
        document.getElementById('detailLastActive').textContent = this.formatDate(staff.lastActive);
        document.getElementById('detailStatus').innerHTML = `<span class="status-badge ${staff.status}">${staff.status}</span>`;

        this.staffDetailsModal.dataset.staffId = id;
        this.showModal(this.staffDetailsModal);
    }

    editFromDetails() {
        const id = this.staffDetailsModal.dataset.staffId;
        this.closeDetailsModal();
        this.editStaff(id);
    }

    deleteStaff(id) {
        this.currentDeleteId = id;
        const staff = this.staffData.find(s => s.id === id);
        
        // Update modal content with staff name
        const modalContent = this.deleteConfirmModal.querySelector('p');
        modalContent.innerHTML = `Are you sure you want to delete <strong>${staff.name}</strong>? This action cannot be undone.`;
        
        this.showModal(this.deleteConfirmModal);
    }

    confirmDelete() {
        if (!this.currentDeleteId) return;
        
        const deleteBtn = document.getElementById('confirmDeleteBtn');
        const originalText = deleteBtn.innerHTML;
        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
        deleteBtn.disabled = true;
        
        setTimeout(() => {
            const index = this.staffData.findIndex(s => s.id === this.currentDeleteId);
            if (index !== -1) {
                const staffName = this.staffData[index].name;
                this.staffData.splice(index, 1);
                this.saveStaffData();
                this.applyFilters();
                this.updateStatistics();
                this.showNotification(`${staffName} deleted successfully!`, 'success');
            }
            
            this.closeDeleteModal();
            deleteBtn.innerHTML = originalText;
            deleteBtn.disabled = false;
        }, 500);
    }

    showModal(modal) {
        modal.style.display = 'flex';
        modal.style.opacity = '0';
        
        setTimeout(() => {
            modal.style.transition = 'opacity 0.3s ease';
            modal.style.opacity = '1';
            
            const modalContent = modal.querySelector('.modal-content');
            modalContent.style.transform = 'scale(0.9)';
            modalContent.style.transition = 'transform 0.3s ease';
            
            setTimeout(() => {
                modalContent.style.transform = 'scale(1)';
            }, 10);
        }, 10);
        
        // Focus first input
        const firstInput = modal.querySelector('input:not([readonly])');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 300);
        }
    }

    closeStaffModal() {
        this.hideModal(this.staffModal);
        document.getElementById('staffForm').reset();
        this.clearValidationMessages();
    }

    closeDetailsModal() {
        this.hideModal(this.staffDetailsModal);
    }

    closeDeleteModal() {
        this.hideModal(this.deleteConfirmModal);
        this.currentDeleteId = null;
    }

    hideModal(modal) {
        modal.style.opacity = '0';
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    // ================== FORM HANDLING & VALIDATION ==================
    setupValidation() {
        const form = document.getElementById('staffForm');
        const inputs = form.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldValidation(input);
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const isValid = field.checkValidity();
        const validationMessage = field.parentElement.querySelector('.validation-message');
        
        if (!isValid || !value) {
            field.style.borderColor = 'var(--danger-color)';
            field.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.2)';
            validationMessage.style.display = 'block';
            return false;
        }
        
        // Additional validation
        if (field.type === 'email' && !this.isValidEmail(value)) {
            field.style.borderColor = 'var(--danger-color)';
            field.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.2)';
            validationMessage.textContent = 'Please enter a valid email address';
            validationMessage.style.display = 'block';
            return false;
        }
        
        if (field.type === 'tel' && !/^[\+]?[1-9][\d\s\(\)\-]{7,}$/.test(value)) {
            field.style.borderColor = 'var(--danger-color)';
            field.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.2)';
            validationMessage.textContent = 'Please enter a valid phone number';
            validationMessage.style.display = 'block';
            return false;
        }
        
        field.style.borderColor = 'var(--success-color)';
        field.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
        validationMessage.style.display = 'none';
        return true;
    }

    clearFieldValidation(field) {
        field.style.borderColor = '';
        field.style.boxShadow = '';
        const validationMessage = field.parentElement.querySelector('.validation-message');
        if (validationMessage) {
            validationMessage.style.display = 'none';
        }
    }

    clearValidationMessages() {
        const validationMessages = document.querySelectorAll('.validation-message');
        validationMessages.forEach(msg => {
            msg.style.display = 'none';
        });
        
        const inputs = document.querySelectorAll('#staffForm input, #staffForm select');
        inputs.forEach(input => {
            input.style.borderColor = '';
            input.style.boxShadow = '';
        });
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    handleFormSubmission(e) {
        e.preventDefault();
        
        const inputs = e.target.querySelectorAll('input:not([readonly]), select');
        let isValid = true;
        
        // Validate all fields
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            this.showNotification('Please correct the errors in the form', 'error');
            return;
        }
        
        const staffData = {
            id: document.getElementById('staffId').value,
            name: document.getElementById('staffNameInput').value,
            email: document.getElementById('staffEmail').value,
            phone: document.getElementById('staffPhone').value,
            role: document.getElementById('staffRole').value,
            department: document.getElementById('staffDepartment').value,
            employmentType: document.getElementById('employmentType').value,
            status: 'active',
            lastActive: new Date().toISOString().split('T')[0],
            dateAdded: this.currentEditingId ? 
                this.staffData.find(s => s.id === this.currentEditingId).dateAdded :
                new Date().toISOString().split('T')[0]
        };
        
        // Animate form submission
        const saveBtn = document.getElementById('saveBtn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveBtn.disabled = true;
        
        setTimeout(() => {
            if (this.currentEditingId) {
                // Update existing staff
                const index = this.staffData.findIndex(s => s.id === this.currentEditingId);
                this.staffData[index] = staffData;
                this.showNotification('Staff updated successfully!', 'success');
            } else {
                // Add new staff
                this.staffData.push(staffData);
                this.showNotification('Staff added successfully!', 'success');
            }
            
            this.saveStaffData();
            this.applyFilters();
            this.updateStatistics();
            this.closeStaffModal();
            
            // Reset button
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }, 1000);
    }

    generateStaffId() {
        const lastId = this.staffData.length > 0 
            ? Math.max(...this.staffData.map(s => parseInt(s.id.substring(2))))
            : 0;
        return `ST${String(lastId + 1).padStart(3, '0')}`;
    }

    // ================== STATISTICS ==================
    updateStatistics() {
        const totalStaff = this.staffData.length;
        const activeStaff = this.staffData.filter(s => s.status === 'active').length;
        const fullTimeStaff = this.staffData.filter(s => s.employmentType === 'Full-Time').length;
        const partTimeStaff = this.staffData.filter(s => s.employmentType === 'Part-Time').length;

        // Update stat cards with animation
        this.animateStatUpdate('totalStaff', totalStaff);
        this.animateStatUpdate('activeStaff', activeStaff);
        this.animateStatUpdate('fullTimeStaff', fullTimeStaff);
        this.animateStatUpdate('partTimeStaff', partTimeStaff);

        // Update change indicators
        const totalChange = document.getElementById('totalStaffChange');
        if (totalChange) {
            totalChange.textContent = `${activeStaff}/${totalStaff} Active`;
            totalChange.className = activeStaff === totalStaff ? 'stat-change positive' : 'stat-change';
        }
    }

    animateStatUpdate(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const currentValue = parseInt(element.textContent) || 0;
        const increment = targetValue > currentValue ? 1 : -1;
        const stepTime = Math.abs(Math.floor(100 / (targetValue - currentValue))) || 10;
        
        let value = currentValue;
        const timer = setInterval(() => {
            value += increment;
            element.textContent = value;
            
            if (value === targetValue) {
                clearInterval(timer);
                // Add pulse animation
                element.style.transform = 'scale(1.1)';
        setTimeout(() => {
                    element.style.transform = 'scale(1)';
        }, 200);
    }
        }, stepTime);
    }

    // ================== NOTIFICATION SYSTEM ==================
    showNotification(message, type = 'info') {
        // Remove existing notification
        if (this.currentNotification) {
            this.currentNotification.remove();
        }

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
        this.currentNotification = notification;
        
        // Show animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.hideNotification(notification);
        });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
            this.hideNotification(notification);
            }
        }, 5000);
    }

    hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
            if (this.currentNotification === notification) {
                this.currentNotification = null;
            }
        }, 300);
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

    updateRecentActivity() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        // Get the last 5 activities from staffData
        const recentActivities = this.staffData
            .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
            .slice(0, 5)
            .map(staff => {
                const activityDate = new Date(staff.dateAdded);
                const timeAgo = this.getTimeAgo(activityDate);
                const activityType = this.getActivityType(staff);
                
                return `
                    <div class="activity-item">
                        <div class="activity-icon">
                            <i class="fas ${this.getActivityIcon(activityType)}"></i>
                        </div>
                        <div class="activity-content">
                            <div class="activity-header">
                                <h3>${this.getActivityTitle(activityType)}</h3>
                                <span class="activity-time">${timeAgo}</span>
                            </div>
                            <p class="activity-details">${this.getActivityDescription(staff, activityType)}</p>
                        </div>
                    </div>
                `;
            });

        if (recentActivities.length === 0) {
            activityList.innerHTML = `
                <div class="activity-item">
                    <div class="activity-content">
                        <p class="activity-text">No recent activities</p>
                    </div>
                </div>
            `;
        } else {
            activityList.innerHTML = recentActivities.join('');
        }
    }

    getActivityType(staff) {
        if (staff.status === 'inactive') return 'deactivate';
        if (staff.dateAdded === new Date().toISOString().split('T')[0]) return 'add';
        return 'update';
    }

    getActivityIcon(type) {
        const icons = {
            'add': 'fa-user-plus',
            'update': 'fa-user-edit',
            'deactivate': 'fa-user-slash',
            'delete': 'fa-user-minus',
            'login': 'fa-sign-in-alt',
            'logout': 'fa-sign-out-alt',
            'role': 'fa-user-tag',
            'department': 'fa-hospital',
            'schedule': 'fa-calendar-alt'
        };
        return icons[type] || 'fa-user';
    }

    getActivityTitle(type) {
        const titles = {
            'add': 'New Staff Added',
            'update': 'Staff Updated',
            'deactivate': 'Staff Deactivated',
            'delete': 'Staff Removed',
            'login': 'Staff Login',
            'logout': 'Staff Logout',
            'role': 'Role Changed',
            'department': 'Department Changed',
            'schedule': 'Schedule Updated'
        };
        return titles[type] || 'Staff Activity';
    }

    getActivityDescription(staff, type) {
        switch (type) {
            case 'add':
                return `${staff.name} was added to the ${staff.department} department as a ${staff.role}`;
            case 'update':
                return `${staff.name}'s information was updated`;
            case 'deactivate':
                return `${staff.name} was deactivated from the system`;
            case 'delete':
                return `${staff.name} was removed from the system`;
            case 'login':
                return `${staff.name} logged into the system`;
            case 'logout':
                return `${staff.name} logged out of the system`;
            case 'role':
                return `${staff.name}'s role was changed to ${staff.role}`;
            case 'department':
                return `${staff.name} was moved to the ${staff.department} department`;
            case 'schedule':
                return `${staff.name}'s schedule was updated`;
            default:
                return `Activity related to ${staff.name}`;
        }
    }

    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + ' years ago';
        
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + ' months ago';
        
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + ' days ago';
        
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + ' hours ago';
        
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + ' minutes ago';
        
        return Math.floor(seconds) + ' seconds ago';
    }
}

// Additional CSS for animations and effects
const additionalCSS = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
    }

    .staff-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: var(--primary-light);
        color: var(--primary-color);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.875rem;
    }

    .role-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 1rem;
        font-size: 0.75rem;
        font-weight: 500;
        background-color: var(--gray-100);
        color: var(--gray-700);
    }

    .role-badge.doctor {
        background-color: #e8f5e9;
        color: var(--success-color);
    }

    .role-badge.nurse {
        background-color: #e3f2fd;
        color: var(--primary-color);
    }

    .role-badge.technician {
        background-color: #fff3e0;
        color: var(--warning-color);
    }

    .role-badge.support-staff {
        background-color: #f3e5f5;
        color: #9c27b0;
    }

    .search-highlight {
        background-color: #fff3cd;
        padding: 2px 4px;
        border-radius: 3px;
        transition: all 0.3s ease;
    }

    .nav-links a {
        transition: all 0.3s ease;
    }

    .stat-card {
        transition: all 0.3s ease;
    }

    .action-card {
        transition: all 0.3s ease;
    }

    .modal {
        transition: all 0.3s ease;
    }

    .btn {
        transition: all 0.2s ease;
    }

    .btn:active {
        transform: scale(0.98);
    }

    .action-buttons .btn-icon {
        transition: all 0.2s ease;
    }

    .action-buttons .btn-icon:hover {
        transform: scale(1.1);
    }

    .mobile-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 999;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
    }

    .custom-dropdown {
        position: absolute;
        background: white;
        border-radius: var(--border-radius);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1001;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
    }

    .custom-tooltip {
        position: absolute;
        background: var(--gray-900);
        color: white;
        padding: 0.5rem 0.75rem;
        border-radius: 4px;
        font-size: 0.875rem;
        z-index: 1000;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
    }

    .search-results-message {
        animation: fadeIn 0.3s ease;
    }
`;

// Inject additional CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);

// Initialize the staff management system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.staffManager = new StaffManagement();
});

// Add page load animation
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    body.style.opacity = '0';
    body.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        body.style.opacity = '1';
    }, 100);
});

// Smooth page unload
window.addEventListener('beforeunload', () => {
    document.body.style.opacity = '0';
});