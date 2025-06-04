class AdminManagement {
    constructor() {
        this.sidebar = document.getElementById('sidebarNav');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.mainContent = document.querySelector('.main-content');
        this.navLinks = document.querySelectorAll('.nav-links a');
        
        // Admin data storage
        this.admins = [];
        this.filteredAdmins = [];
        this.currentEditId = null;
        this.currentDeleteId = null;
        
        // Modal elements
        this.adminModal = document.getElementById('adminModal');
        this.adminDetailsModal = document.getElementById('adminDetailsModal');
        this.deleteConfirmModal = document.getElementById('deleteConfirmModal');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadAdmins();
        this.updateStats();
        this.animateStatsOnLoad();
        this.setupSmoothScrolling();
        this.initializeTooltips();
        this.setupSearchFunctionality();
        this.setupValidation();
        this.setupAccessControlAnimations();
        
        // Check localStorage for sidebar state
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (sidebarCollapsed) {
            this.collapseSidebar();
        }
    }

    setupEventListeners() {
        // Sidebar toggle
        this.sidebarToggle.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Navigation links with smooth transitions
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavigation(e, link);
            });
        });

        // Add admin button with ripple effect
        const addAdminBtn = document.getElementById('addAdminBtn');
        addAdminBtn.addEventListener('click', (e) => {
            this.createRippleEffect(e, addAdminBtn);
            setTimeout(() => this.openAddModal(), 200);
        });

        // Modal close buttons
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('closeDetailsModal').addEventListener('click', () => {
            this.closeDetailsModal();
        });

        // Form submission
        document.getElementById('adminForm').addEventListener('submit', (e) => {
            this.handleFormSubmit(e);
        });

        // Cancel button
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModal();
        });

        // Filter changes with animation
        document.getElementById('roleFilter').addEventListener('change', () => {
            this.filterAdmins();
        });
        
        document.getElementById('accessFilter').addEventListener('change', () => {
            this.filterAdmins();
        });

        // Search functionality
        document.getElementById('adminSearch').addEventListener('input', (e) => {
            this.searchAdmins(e.target.value);
        });

        // Edit from details modal
        document.getElementById('editFromDetails').addEventListener('click', () => {
            const id = this.adminDetailsModal.dataset.adminId;
            this.closeDetailsModal();
            this.openEditModal(parseInt(id));
        });

        // Delete confirmation
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            this.confirmDelete();
        });
        
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
            this.closeDeleteConfirmModal();
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

        // Access control interactions
        this.setupAccessControlListeners();
    }

    // Sidebar functionality
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
        this.sidebarToggle.style.transform = 'rotate(180deg)';
        
        const dashboardBg = document.querySelector('.dashboard-background');
        if (dashboardBg) {
            dashboardBg.style.left = 'var(--sidebar-collapsed-width)';
        }
    }

    expandSidebar() {
        this.sidebar.classList.remove('collapsed');
        this.mainContent.classList.remove('sidebar-collapsed');
        this.sidebarToggle.style.transform = 'rotate(0deg)';
        
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
                    border: 1px solid var(--primary-color);
                    border-top: 3px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                "></div>
                Loading...
            </div>
        `;
        
        // Add spinner animation
        if (!document.getElementById('page-transition-style')) {
            const style = document.createElement('style');
            style.id = 'page-transition-style';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);
        
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 300);
    }

    // Ripple effect for buttons
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
        
        // Add ripple animation
        if (!document.getElementById('ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = `
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
            `;
            document.head.appendChild(style);
        }
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Access control animations and interactions
    setupAccessControlAnimations() {
        const accessCards = document.querySelectorAll('.access-card');
        
        accessCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 800 + (index * 200));
        });
    }

    setupAccessControlListeners() {
        // Permission switches
        const switches = document.querySelectorAll('.switch input');
        switches.forEach(switchEl => {
            switchEl.addEventListener('change', (e) => {
                const permissionName = e.target.closest('.permission-item').querySelector('.permission-name').textContent;
                const isEnabled = e.target.checked;
                
                // Animate switch change
                const slider = e.target.nextElementSibling;
                slider.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    slider.style.transform = 'scale(1)';
                }, 150);
                
                this.showNotification(
                    `${permissionName} ${isEnabled ? 'enabled' : 'disabled'}`,
                    isEnabled ? 'success' : 'warning'
                );
            });
        });

        // Security selects
        const securitySelects = document.querySelectorAll('.security-select');
        securitySelects.forEach(select => {
            select.addEventListener('change', (e) => {
                const settingName = e.target.closest('.security-item').querySelector('.security-name').textContent;
                const value = e.target.value;
                
                // Animate select change
                e.target.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    e.target.style.transform = 'scale(1)';
                }, 150);
                
                this.showNotification(
                    `${settingName} updated to ${value}${settingName.includes('Timeout') ? ' minutes' : settingName.includes('Attempts') ? ' attempts' : ''}`,
                    'info'
                );
            });
        });

        // Export button
        const exportBtn = document.querySelector('.section-actions .btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                this.createRippleEffect(e, exportBtn);
                this.exportAccessLog();
            });
        }
    }

    exportAccessLog() {
        const btn = document.querySelector('.section-actions .btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
        btn.disabled = true;
        
        setTimeout(() => {
            // Simulate export process
            this.showNotification('Access log exported successfully!', 'success');
            
            // Reset button
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 2000);
    }

    // Utility methods
    setupSmoothScrolling() {
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

    setupSearchFunctionality() {
        const searchInput = document.getElementById('adminSearch');
        let searchTimeout;
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchAdmins(e.target.value);
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

    setupNotificationHandlers() {
        const notificationBtn = document.querySelector('.btn-icon');
        const messageBtn = document.querySelectorAll('.btn-icon')[1];
        
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
            { text: 'New admin registration pending', time: '5 minutes ago', type: 'info' },
            { text: 'Admin access level changed', time: '10 minutes ago', type: 'urgent' },
            { text: 'Security alert: Multiple login attempts', time: '15 minutes ago', type: 'warning' }
        ]);
    }

    showMessages() {
        this.createDropdown('messages', [
            { text: 'System: Backup completed successfully', time: '2 minutes ago', sender: 'System' },
            { text: 'IT Support: Server maintenance scheduled', time: '8 minutes ago', sender: 'IT Support' },
            { text: 'Security: Access logs reviewed', time: '1 hour ago', sender: 'Security' }
        ]);
    }

    createDropdown(type, items) {
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
            width: 300px;
            background: white;
            border-radius: var(--border-radius);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1001;
            max-height: 300px;
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
        const button = type === 'notifications' 
            ? document.querySelector('.btn-icon')
            : document.querySelectorAll('.btn-icon')[1];
        
        button.parentElement.style.position = 'relative';
        button.parentElement.appendChild(dropdown);
        
        // Show dropdown
        setTimeout(() => {
            dropdown.style.opacity = '1';
            dropdown.style.transform = 'translateY(0)';
        }, 10);
        
        // Close dropdown when clicking outside
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && !button.contains(e.target)) {
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

    setupMobileNavigation() {
        if (window.innerWidth <= 768) {
            this.setupMobileMenu();
        }
        
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!this.sidebar.contains(e.target) && this.sidebar.classList.contains('active')) {
                    this.sidebar.classList.remove('active');
                }
            }
        });
    }

    setupMobileMenu() {
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
        
        this.sidebarToggle.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                this.sidebar.classList.toggle('active');
                if (this.sidebar.classList.contains('active')) {
                    mobileOverlay.style.opacity = '1';
                    mobileOverlay.style.visibility = 'visible';
                } else {
                    mobileOverlay.style.opacity = '0';
                    mobileOverlay.style.visibility = 'hidden';
                }
            }
        });
        
        mobileOverlay.addEventListener('click', () => {
            this.sidebar.classList.remove('active');
            mobileOverlay.style.opacity = '0';
            mobileOverlay.style.visibility = 'hidden';
        });
    }

    setupModalClickOutside() {
        // Close modal when clicking outside
        [this.adminModal, this.adminDetailsModal, this.deleteConfirmModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    if (modal === this.adminModal) {
                        this.closeModal();
                    } else if (modal === this.adminDetailsModal) {
                        this.closeDetailsModal();
                    } else if (modal === this.deleteConfirmModal) {
                        this.closeDeleteConfirmModal();
                    }
                }
            });
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC to close modals
            if (e.key === 'Escape') {
                if (this.adminModal.style.display === 'flex') {
                    this.closeModal();
                } else if (this.adminDetailsModal.style.display === 'flex') {
                    this.closeDetailsModal();
                } else if (this.deleteConfirmModal.style.display === 'flex') {
                    this.closeDeleteConfirmModal();
                }
            }
            
            // Ctrl+N to add new admin
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.openAddModal();
            }
            
            // Focus search with Ctrl+F
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                document.getElementById('adminSearch').focus();
            }
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

    // Notification system
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
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.hideNotification(notification);
        });
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            this.hideNotification(notification);
        }, 5000);
    }

    hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
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

    // Admin data management
    loadAdmins() {
        // Sample admin data
        this.admins = [
            {
                id: 1,
                name: 'Sarah Johnson',
                email: 'sarah.johnson@primecare.com',
                role: 'System Administrator',
                department: 'Administration',
                phone: '01234567890',
                accessLevel: 'Full Access',
                lastLogin: '2024-01-15 09:30 AM',
                status: 'active'
            },
            {
                id: 2,
                name: 'Mark Davis',
                email: 'mark.davis@primecare.com',
                role: 'Department Admin',
                department: 'Cardiology',
                phone: '01234567891',
                accessLevel: 'Limited Access',
                lastLogin: '2024-01-14 02:15 PM',
                status: 'active'
            },
            {
                id: 3,
                name: 'Lisa Chen',
                email: 'lisa.chen@primecare.com',
                role: 'Support Admin',
                department: 'IT Support',
                phone: '01234567892',
                accessLevel: 'Limited Access',
                lastLogin: '2024-01-13 11:45 AM',
                status: 'inactive'
            },
            {
                id: 4,
                name: 'John Wilson',
                email: 'john.wilson@primecare.com',
                role: 'Department Admin',
                department: 'Neurology',
                phone: '01234567893',
                accessLevel: 'Limited Access',
                lastLogin: '2024-01-12 04:20 PM',
                status: 'pending'
            },
            {
                id: 5,
                name: 'Emily Brown',
                email: 'emily.brown@primecare.com',
                role: 'System Administrator',
                department: 'Administration',
                phone: '01234567894',
                accessLevel: 'Full Access',
                lastLogin: '2024-01-11 10:15 AM',
                status: 'active'
            }
        ];
        
        this.filteredAdmins = [...this.admins];
        this.renderAdminTable();
    }

    renderAdminTable() {
        const tbody = document.getElementById('adminTableBody');
        tbody.innerHTML = '';
        
        if (this.filteredAdmins.length === 0) {
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = `
                <td colspan="8" style="text-align: center; padding: 2rem; color: var(--gray-600);">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <div>No admins found</div>
                </td>
            `;
            tbody.appendChild(noDataRow);
            return;
        }
        
        this.filteredAdmins.forEach((admin, index) => {
            const row = document.createElement('tr');
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            
            row.innerHTML = `
                <td>#${admin.id.toString().padStart(3, '0')}</td>
                <td>
                    <span class="admin-name-link" data-id="${admin.id}" style="
                        color: var(--primary-color);
                        cursor: pointer;
                        font-weight: 500;
                        transition: all 0.2s ease;
                    ">${admin.name}</span>
                </td>
                <td>${admin.email}</td>
                <td>${admin.role}</td>
                <td>${admin.department}</td>
                <td>${admin.lastLogin}</td>
                <td>
                    <span class="status-badge ${admin.status}">${admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}</span>
                </td>
                <td>
                    <button class="btn-icon view-btn" data-id="${admin.id}" title="View Admin Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit-btn" data-id="${admin.id}" title="Edit Admin">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-btn" data-id="${admin.id}" title="Delete Admin">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
            
            // Animate row appearance with stagger
            setTimeout(() => {
                row.style.transition = 'all 0.5s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, index * 50);
        });
        
        // Add event listeners for edit/delete buttons and name links
        this.setupTableEventListeners();
    }

    setupTableEventListeners() {
        // Name links to open details modal
        document.querySelectorAll('.admin-name-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.openDetailsModal(id);
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
                const id = parseInt(e.currentTarget.dataset.id);
                this.openDetailsModal(id);
                
                // Create ripple effect
                this.createRippleEffect(e, btn);
            });
        });
        
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.openEditModal(id);
                
                // Create ripple effect
                this.createRippleEffect(e, btn);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.openDeleteConfirmModal(id);
                
                // Create ripple effect
                this.createRippleEffect(e, btn);
            });
        });
    }

    updateStats() {
        // Animate stat values
        this.animateStatValue('totalAdmins', this.admins.length);
        this.animateStatValue('activeAdmins', this.admins.filter(a => a.status === 'active').length);
        this.animateStatValue('systemAdmins', this.admins.filter(a => a.role === 'System Administrator').length);
        this.animateStatValue('departmentAdmins', this.admins.filter(a => a.role === 'Department Admin').length);
    }

    animateStatValue(elementId, targetValue) {
        const element = document.getElementById(elementId);
        const currentValue = parseInt(element.textContent) || 0;
        const increment = targetValue > currentValue ? 1 : -1;
        const stepTime = Math.abs(Math.floor(100 / (targetValue - currentValue))) || 10;
        
        let value = currentValue;
        const timer = setInterval(() => {
            value += increment;
            element.textContent = value;
            
            if (value === targetValue) {
                clearInterval(timer);
            }
        }, stepTime);
    }

    animateStatsOnLoad() {
        const statCards = document.querySelectorAll('.stat-card');
        
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
            const sections = document.querySelectorAll('.admin-management, .additional-details');
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

    // Modal functionality
    openAddModal() {
        this.currentEditId = null;
        document.getElementById('modalTitle').textContent = 'Add New Admin';
        document.getElementById('adminId').value = `#${(this.admins.length + 1).toString().padStart(3, '0')}`;
        document.getElementById('adminForm').reset();
        this.clearValidationMessages();
        this.showModal(this.adminModal);
    }

    openEditModal(id) {
        const admin = this.admins.find(a => a.id === id);
        if (!admin) return;
        
        this.currentEditId = id;
        document.getElementById('modalTitle').textContent = 'Edit Admin';
        document.getElementById('adminId').value = `#${admin.id.toString().padStart(3, '0')}`;
        document.getElementById('adminNameInput').value = admin.name;
        document.getElementById('adminEmail').value = admin.email;
        document.getElementById('adminPhone').value = admin.phone;
        document.getElementById('adminRole').value = admin.role;
        document.getElementById('adminDepartment').value = admin.department;
        document.getElementById('adminAccess').value = admin.accessLevel;
        
        // Clear password fields for editing
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminConfirmPassword').value = '';
        document.getElementById('adminPassword').required = false;
        document.getElementById('adminConfirmPassword').required = false;
        
        this.clearValidationMessages();
        this.showModal(this.adminModal);
    }

    openDetailsModal(id) {
        const admin = this.admins.find(a => a.id === id);
        if (!admin) return;
        
        document.getElementById('detailName').textContent = admin.name;
        document.getElementById('detailEmail').textContent = admin.email;
        document.getElementById('detailRole').textContent = admin.role;
        document.getElementById('detailDepartment').textContent = admin.department;
        document.getElementById('detailPhone').textContent = admin.phone;
        document.getElementById('detailAccess').textContent = admin.accessLevel;
        document.getElementById('detailLastLogin').textContent = admin.lastLogin;
        document.getElementById('detailStatus').innerHTML = `<span class="status-badge ${admin.status}">${admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}</span>`;
        
        this.adminDetailsModal.dataset.adminId = id;
        this.showModal(this.adminDetailsModal);
    }

    openDeleteConfirmModal(id) {
        this.currentDeleteId = id;
        const admin = this.admins.find(a => a.id === id);
        
        // Update modal content with admin name
        const modalContent = this.deleteConfirmModal.querySelector('.form-group p');
        modalContent.innerHTML = `Are you sure you want to delete <strong>${admin.name}</strong>? This action cannot be undone.`;
        
        this.showModal(this.deleteConfirmModal);
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
        const firstInput = modal.querySelector('input:not([readonly]):not([type="password"])');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 300);
        }
    }

    closeModal() {
        this.hideModal(this.adminModal);
        document.getElementById('adminForm').reset();
        this.clearValidationMessages();
        // Reset password requirements
        document.getElementById('adminPassword').required = true;
        document.getElementById('adminConfirmPassword').required = true;
    }

    closeDetailsModal() {
        this.hideModal(this.adminDetailsModal);
    }

    closeDeleteConfirmModal() {
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

    // Form handling and validation
    setupValidation() {
        const form = document.getElementById('adminForm');
        const inputs = form.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldValidation(input);
            });
        });
        
        // Password confirmation
        document.getElementById('adminConfirmPassword').addEventListener('input', () => {
            this.validatePasswordMatch();
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
        
        if (field.type === 'tel' && !/^\d{11}$/.test(value)) {
            field.style.borderColor = 'var(--danger-color)';
            field.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.2)';
            validationMessage.textContent = 'Please enter a valid 11-digit phone number';
            validationMessage.style.display = 'block';
            return false;
        }
        
        field.style.borderColor = 'var(--success-color)';
        field.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
        validationMessage.style.display = 'none';
        return true;
    }

    validatePasswordMatch() {
        const password = document.getElementById('adminPassword').value;
        const confirmPassword = document.getElementById('adminConfirmPassword').value;
        const confirmField = document.getElementById('adminConfirmPassword');
        const validationMessage = confirmField.parentElement.querySelector('.validation-message');
        
        if (confirmPassword && password !== confirmPassword) {
            confirmField.style.borderColor = 'var(--danger-color)';
            confirmField.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.2)';
            validationMessage.textContent = 'Passwords must match';
            validationMessage.style.display = 'block';
            return false;
        }
        
        if (confirmPassword && password === confirmPassword) {
            confirmField.style.borderColor = 'var(--success-color)';
            confirmField.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
            validationMessage.style.display = 'none';
            return true;
        }
        
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
        
        const inputs = document.querySelectorAll('#adminForm input, #adminForm select');
        inputs.forEach(input => {
            input.style.borderColor = '';
            input.style.boxShadow = '';
        });
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const inputs = e.target.querySelectorAll('input:not([readonly]), select');
        let isValid = true;
        
        // Validate all fields
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        // Check password match
        if (!this.validatePasswordMatch()) {
            isValid = false;
        }
        
        if (!isValid) {
            this.showNotification('Please correct the errors in the form', 'error');
            return;
        }
        
        // Create admin object
        const adminData = {
            name: document.getElementById('adminNameInput').value,
            email: document.getElementById('adminEmail').value,
            phone: document.getElementById('adminPhone').value,
            role: document.getElementById('adminRole').value,
            department: document.getElementById('adminDepartment').value,
            accessLevel: document.getElementById('adminAccess').value,
            lastLogin: 'Never',
            status: 'pending'
        };
        
        // Animate form submission
        const saveBtn = document.getElementById('saveBtn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveBtn.disabled = true;
        
        setTimeout(() => {
            if (this.currentEditId) {
                // Update existing admin
                const index = this.admins.findIndex(a => a.id === this.currentEditId);
                this.admins[index] = { ...this.admins[index], ...adminData };
                this.showNotification('Admin updated successfully!', 'success');
            } else {
                // Add new admin
                const newId = Math.max(...this.admins.map(a => a.id), 0) + 1;
                this.admins.push({ id: newId, ...adminData });
                this.showNotification('Admin added successfully!', 'success');
            }
            
            this.updateStats();
            this.filterAdmins();
            this.closeModal();
            
            // Reset button
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }, 1000);
    }

    confirmDelete() {
        if (!this.currentDeleteId) return;
        
        const deleteBtn = document.getElementById('confirmDeleteBtn');
        const originalText = deleteBtn.innerHTML;
        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
        deleteBtn.disabled = true;
        
        setTimeout(() => {
            const index = this.admins.findIndex(a => a.id === this.currentDeleteId);
            if (index !== -1) {
                const adminName = this.admins[index].name;
                this.admins.splice(index, 1);
                this.updateStats();
                this.filterAdmins();
                this.showNotification(`${adminName} deleted successfully!`, 'success');
            }
            
            this.closeDeleteConfirmModal();
            deleteBtn.innerHTML = originalText;
            deleteBtn.disabled = false;
        }, 500);
    }

    // Search and filter functionality
    searchAdmins(query) {
        let filtered = [...this.admins];
        
        if (query) {
            filtered = filtered.filter(admin => 
                admin.name.toLowerCase().includes(query.toLowerCase()) ||
                admin.email.toLowerCase().includes(query.toLowerCase()) ||
                admin.role.toLowerCase().includes(query.toLowerCase()) ||
                admin.department.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        // Apply other filters
        const roleFilter = document.getElementById('roleFilter').value;
        const accessFilter = document.getElementById('accessFilter').value;
        
        if (roleFilter) {
            filtered = filtered.filter(admin => admin.role === roleFilter);
        }
        
        if (accessFilter) {
            filtered = filtered.filter(admin => admin.accessLevel === accessFilter);
        }
        
        this.filteredAdmins = filtered;
        this.renderAdminTable();
        
        // Show search results count
        this.showSearchResults(filtered.length, this.admins.length);
    }

    filterAdmins() {
        const roleFilter = document.getElementById('roleFilter').value;
        const accessFilter = document.getElementById('accessFilter').value;
        const searchQuery = document.getElementById('adminSearch').value;
        
        let filtered = [...this.admins];
        
        if (roleFilter) {
            filtered = filtered.filter(admin => admin.role === roleFilter);
        }
        
        if (accessFilter) {
            filtered = filtered.filter(admin => admin.accessLevel === accessFilter);
        }
        
        if (searchQuery) {
            filtered = filtered.filter(admin => 
                admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                admin.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                admin.department.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        this.filteredAdmins = filtered;
        this.renderAdminTable();
        
        // Animate filter change
        const tableContainer = document.querySelector('.table-container');
        tableContainer.style.opacity = '0.7';
        setTimeout(() => {
            tableContainer.style.opacity = '1';
        }, 200);
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
            `;
            
            message.innerHTML = `
                <span>
                    <i class="fas fa-filter" style="margin-right: 0.5rem;"></i>
                    Showing ${filtered} of ${total} admins
                </span>
                <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="this.parentElement.parentElement.querySelector('#adminSearch').value = ''; this.parentElement.parentElement.querySelector('#roleFilter').value = ''; this.parentElement.parentElement.querySelector('#accessFilter').value = ''; AdminManagementInstance.filterAdmins(); this.parentElement.remove();">
                    Clear Filters
                </button>
            `;
            
            const tableContainer = document.querySelector('.table-container');
            tableContainer.parentNode.insertBefore(message, tableContainer);
        }
    }
}

// Initialize the admin management system when DOM is loaded
let AdminManagementInstance;

document.addEventListener('DOMContentLoaded', () => {
    AdminManagementInstance = new AdminManagement();
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