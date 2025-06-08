class SettingsManagement {
    constructor() {
        // Core elements
        this.sidebar = document.getElementById('sidebarNav');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.mainContent = document.querySelector('.main-content');
        this.navLinks = document.querySelectorAll('.nav-links a');
        
        // Settings data
        this.settings = {};
        this.originalSettings = {};
        this.hasUnsavedChanges = false;
        this.currentNotification = null;
        this.currentTooltip = null;
        this.currentConfirmationCallback = null;
        
        // Modal elements
        this.confirmationModal = document.getElementById('confirmationModal');
        this.saveSettingsBar = document.getElementById('saveSettingsBar');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.updateStatistics();
        this.animateStatsOnLoad();
        this.setupSmoothScrolling();
        this.initializeTooltips();
        this.setupSearchFunctionality();
        this.setupFileUploads();
        
        // Check localStorage for sidebar state
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (sidebarCollapsed) {
            this.collapseSidebar();
        }
        
        // Initialize first section
        this.showSection('general');
    }

    setupEventListeners() {
        // Sidebar toggle
        this.sidebarToggle.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Navigation links
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

        // Settings navigation
        document.querySelectorAll('.settings-nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });

        // Form elements change tracking
        this.setupChangeTracking();

        // Header actions
        document.querySelectorAll('.header-actions .btn-icon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleHeaderAction(e, btn);
            });
        });

        // Save/Discard actions
        document.getElementById('saveChangesBtn').addEventListener('click', () => {
            this.saveAllSettings();
        });

        document.getElementById('discardChangesBtn').addEventListener('click', () => {
            this.discardChanges();
        });

        // Confirmation modal
        document.getElementById('cancelConfirmationBtn').addEventListener('click', () => {
            this.closeConfirmationModal();
        });

        document.getElementById('confirmActionBtn').addEventListener('click', () => {
            this.confirmAction();
        });

        // Special action buttons
        this.setupSpecialActions();

        // Theme selector
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                this.selectTheme(option.dataset.theme);
            });
        });

        // Mobile navigation
        this.setupMobileNavigation();

        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Click outside modal to close
        this.setupModalClickOutside();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Prevent accidental page leave
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        });
    }

    // ================== SIDEBAR NAVIGATION ==================
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
        
        // Update save bar position
        if (this.saveSettingsBar) {
            this.saveSettingsBar.style.left = 'var(--sidebar-collapsed-width)';
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
        
        // Update save bar position
        if (this.saveSettingsBar) {
            this.saveSettingsBar.style.left = 'var(--sidebar-width)';
        }
    }

    handleNavigation(e, clickedLink) {
        e.preventDefault();
        
        if (clickedLink.parentElement.classList.contains('active')) {
            return;
        }
        
        // Check for unsaved changes before navigation
        if (this.hasUnsavedChanges) {
            this.showConfirmation(
                'Unsaved Changes',
                'You have unsaved changes. Do you want to discard them and navigate away?',
                () => {
                    this.discardChanges();
                    this.navigateToPage(clickedLink.getAttribute('href'));
                }
            );
            return;
        }
        
        this.navigateToPage(clickedLink.getAttribute('href'));
    }

    navigateToPage(href) {
        document.querySelectorAll('.nav-links li').forEach(li => {
            li.classList.remove('active');
        });
        
        const targetUrl = href;
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
        
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);
        
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 300);
    }

    setupMobileNavigation() {
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
        
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!this.sidebar.contains(e.target) && this.sidebar.classList.contains('active')) {
                    this.sidebar.classList.remove('active');
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

    handleResize() {
        if (window.innerWidth <= 768) {
            this.sidebar.classList.remove('collapsed');
            this.mainContent.classList.remove('sidebar-collapsed');
            this.saveSettingsBar.style.left = '0';
        } else {
            const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            if (sidebarCollapsed) {
                this.collapseSidebar();
            } else {
                this.saveSettingsBar.style.left = 'var(--sidebar-width)';
            }
        }
    }

    setupModalClickOutside() {
        this.confirmationModal.addEventListener('click', (e) => {
            if (e.target === this.confirmationModal) {
                this.closeConfirmationModal();
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC to close modals
            if (e.key === 'Escape') {
                if (this.confirmationModal.style.display === 'flex') {
                    this.closeConfirmationModal();
                }
            }
            
            // Ctrl+S to save settings
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                if (this.hasUnsavedChanges) {
                    this.saveAllSettings();
                }
            }
            
            // Focus search with Ctrl+F
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                document.getElementById('settingsSearch').focus();
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
        
        statCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });

        setTimeout(() => {
            const sections = document.querySelectorAll('.settings-container');
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
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);

        const actionType = button.querySelector('i').classList.contains('fa-bell') ? 'notifications' : 'messages';
        
        if (actionType === 'notifications') {
            this.showNotifications();
        } else {
            this.showMessages();
        }
    }

    showNotifications() {
        this.createDropdown('notifications', [
            { text: 'System settings updated successfully', time: '5 minutes ago', type: 'success' },
            { text: 'Backup completed automatically', time: '2 hours ago', type: 'info' },
            { text: 'Security scan completed - no issues found', time: '1 day ago', type: 'success' }
        ]);
    }

    showMessages() {
        this.createDropdown('messages', [
            { text: 'IT Team: Server maintenance scheduled', time: '30 minutes ago', sender: 'IT Team' },
            { text: 'Security: New login from unknown device', time: '2 hours ago', sender: 'Security' },
            { text: 'System: Daily backup report available', time: '1 day ago', sender: 'System' }
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
        
        const headerActions = document.querySelector('.header-actions');
        headerActions.style.position = 'relative';
        headerActions.appendChild(dropdown);
        
        setTimeout(() => {
            dropdown.style.opacity = '1';
            dropdown.style.transform = 'translateY(0)';
        }, 10);
        
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

    // ================== SETTINGS DATA MANAGEMENT ==================
    loadSettings() {
        // Load from localStorage or use defaults
        const savedSettings = localStorage.getItem('systemSettings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
        } else {
            this.settings = this.getDefaultSettings();
        }
        
        this.originalSettings = JSON.parse(JSON.stringify(this.settings));
        this.populateFormFields();
    }

    getDefaultSettings() {
        return {
            // General Settings
            organizationName: 'PrimeCare Medical Center',
            organizationEmail: 'admin@primecare.com',
            organizationPhone: '+1 (555) 123-4567',
            organizationAddress: '123 Healthcare Blvd, Medical District, NY 10001',
            timezone: 'UTC-5',
            dateFormat: 'MM/DD/YYYY',
            currency: 'USD',
            language: 'en',
            logRetention: '90',
            reportRetention: '730',
            
            // Security Settings
            twoFactorAuth: true,
            ssoEnabled: false,
            sessionTimeout: 30,
            minPasswordLength: 8,
            requireSpecialChars: true,
            requireNumbers: true,
            passwordExpiry: '90',
            ipWhitelisting: false,
            maxLoginAttempts: 5,
            lockoutDuration: 15,
            
            // Notification Settings
            notifyNewPatient: true,
            appointmentReminders: true,
            maintenanceAlerts: true,
            securityAlerts: true,
            smtpServer: 'smtp.gmail.com',
            smtpPort: 587,
            smtpUsername: 'noreply@primecare.com',
            smtpPassword: '',
            adminEmails: 'admin@primecare.com\nsarah.johnson@primecare.com',
            
            // Appearance Settings
            darkMode: false,
            compactMode: false,
            sidebarCollapsed: false,
            defaultView: 'overview',
            theme: 'default',
            
            // Backup Settings
            autoBackupEnabled: true,
            backupFrequency: 'daily',
            backupTime: '02:00',
            backupRetention: '30',
            
            // Advanced Settings
            enableCaching: true,
            cacheExpiry: 3600,
            enableCompression: true,
            maxRequestSize: 10,
            logLevel: 'info',
            enableRequestLogging: true,
            maintenanceMode: false,
            maintenanceMessage: 'System maintenance in progress. Please check back later.'
        };
    }

    populateFormFields() {
        Object.keys(this.settings).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.settings[key];
                } else {
                    element.value = this.settings[key];
                }
            }
        });
    }

    saveSettings() {
        localStorage.setItem('systemSettings', JSON.stringify(this.settings));
        this.originalSettings = JSON.parse(JSON.stringify(this.settings));
        this.markChangesSaved();
    }

    // ================== SECTIONS MANAGEMENT ==================
    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.settings-nav-links li').forEach(li => {
            li.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`).parentElement;
        activeNavItem.classList.add('active');
        
        // Update sections
        document.querySelectorAll('.settings-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Scroll to top of settings content
        document.querySelector('.settings-content').scrollTop = 0;
    }

    // ================== SEARCH FUNCTIONALITY ==================
    setupSearchFunctionality() {
        const searchInput = document.getElementById('settingsSearch');
        let searchTimeout;
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchSettings(e.target.value);
                }, 300);
            });

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

    searchSettings(query) {
        if (!query) {
            // Reset all sections visibility
            document.querySelectorAll('.setting-group').forEach(group => {
                group.style.display = 'block';
            });
            return;
        }
        
        const searchQuery = query.toLowerCase();
        let hasVisibleResults = false;
        
        document.querySelectorAll('.setting-group').forEach(group => {
            const groupText = group.textContent.toLowerCase();
            const isVisible = groupText.includes(searchQuery);
            
            group.style.display = isVisible ? 'block' : 'none';
            if (isVisible) hasVisibleResults = true;
        });
        
        if (!hasVisibleResults) {
            this.showNotification('No settings found matching your search', 'info');
        }
    }

    // ================== CHANGE TRACKING ==================
    setupChangeTracking() {
        // Track changes on all form elements
        const formElements = document.querySelectorAll('input, select, textarea');
        
        formElements.forEach(element => {
            element.addEventListener('change', () => {
                this.handleFieldChange(element);
            });
            
            // Also track input events for text fields
            if (element.type === 'text' || element.type === 'email' || element.type === 'tel' || element.type === 'password' || element.tagName === 'TEXTAREA') {
                element.addEventListener('input', () => {
                    this.handleFieldChange(element);
                });
            }
        });
    }

    handleFieldChange(element) {
        const key = element.id;
        let value;
        
        if (element.type === 'checkbox') {
            value = element.checked;
        } else if (element.type === 'number') {
            value = parseInt(element.value) || 0;
        } else {
            value = element.value;
        }
        
        // Update settings object
        this.settings[key] = value;
        
        // Check if there are changes
        this.checkForChanges();
        
        // Apply real-time changes for certain settings
        this.applyRealTimeChanges(key, value);
    }

    checkForChanges() {
        this.hasUnsavedChanges = !this.isObjectEqual(this.settings, this.originalSettings);
        
        if (this.hasUnsavedChanges) {
            this.showSaveBar();
        } else {
            this.hideSaveBar();
        }
    }

    isObjectEqual(obj1, obj2) {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    }

    applyRealTimeChanges(key, value) {
        switch (key) {
            case 'darkMode':
                this.toggleDarkMode(value);
                break;
            case 'sidebarCollapsed':
                if (value) {
                    this.collapseSidebar();
                } else {
                    this.expandSidebar();
                }
                break;
            case 'theme':
                this.applyTheme(value);
                break;
        }
    }

    // ================== SAVE/DISCARD ACTIONS ==================
    showSaveBar() {
        this.saveSettingsBar.classList.add('show');
    }

    hideSaveBar() {
        this.saveSettingsBar.classList.remove('show');
    }

    markChangesSaved() {
        this.hasUnsavedChanges = false;
        this.hideSaveBar();
    }

    saveAllSettings() {
        const saveBtn = document.getElementById('saveChangesBtn');
        const originalText = saveBtn.innerHTML;
        
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveBtn.disabled = true;
        
        setTimeout(() => {
            this.saveSettings();
            this.showNotification('Settings saved successfully!', 'success');
            
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }, 1000);
    }

    discardChanges() {
        this.settings = JSON.parse(JSON.stringify(this.originalSettings));
        this.populateFormFields();
        this.markChangesSaved();
        this.showNotification('Changes discarded', 'info');
    }

    // ================== SPECIAL ACTIONS ==================
    setupSpecialActions() {
        // Test email button
        document.getElementById('testEmailBtn').addEventListener('click', () => {
            this.testEmailConfiguration();
        });

        // Create backup button
        document.getElementById('createBackupBtn').addEventListener('click', () => {
            this.createManualBackup();
        });

        // API key actions
        const toggleApiKeyBtn = document.getElementById('toggleApiKey');
        if (toggleApiKeyBtn) {
            toggleApiKeyBtn.addEventListener('click', () => {
                this.toggleApiKeyVisibility();
            });
        }

        const copyApiKeyBtn = document.getElementById('copyApiKey');
        if (copyApiKeyBtn) {
            copyApiKeyBtn.addEventListener('click', () => {
                this.copyApiKey();
            });
        }

        const regenerateApiKeyBtn = document.getElementById('regenerateApiKeyBtn');
        if (regenerateApiKeyBtn) {
            regenerateApiKeyBtn.addEventListener('click', () => {
                this.regenerateApiKey();
            });
        }

        // Test webhook button
        const testWebhookBtn = document.getElementById('testWebhookBtn');
        if (testWebhookBtn) {
            testWebhookBtn.addEventListener('click', () => {
                this.testWebhook();
            });
        }

        // Database test connection
        const testConnectionBtn = document.getElementById('testConnectionBtn');
        if (testConnectionBtn) {
            testConnectionBtn.addEventListener('click', () => {
                this.testDatabaseConnection();
            });
        }

        // Download logs button
        const downloadLogsBtn = document.getElementById('downloadLogsBtn');
        if (downloadLogsBtn) {
            downloadLogsBtn.addEventListener('click', () => {
                this.downloadLogs();
            });
        }

        // Clear cache button
        const clearCacheBtn = document.getElementById('clearCacheBtn');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => {
                this.clearCache();
            });
        }

        // Export buttons
        document.querySelectorAll('.export-options .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = btn.textContent.includes('CSV') ? 'csv' : 
                             btn.textContent.includes('JSON') ? 'json' : 'excel';
                this.exportData(format);
            });
        });

        // Backup actions
        document.querySelectorAll('.backup-actions .btn-icon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.querySelector('i').classList.contains('fa-download') ? 'download' :
                              btn.querySelector('i').classList.contains('fa-undo') ? 'restore' : 'delete';
                this.handleBackupAction(action, btn);
            });
        });

        // Integration actions
        document.querySelectorAll('.integration-actions .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = btn.closest('.integration-card');
                const integrationName = card.querySelector('h4').textContent;
                const action = btn.textContent.includes('Connect') ? 'connect' :
                              btn.textContent.includes('Disconnect') ? 'disconnect' : 'configure';
                this.handleIntegrationAction(integrationName, action);
            });
        });
    }

    testEmailConfiguration() {
        const testBtn = document.getElementById('testEmailBtn');
        const originalText = testBtn.innerHTML;
        
        testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        testBtn.disabled = true;
        
        setTimeout(() => {
            testBtn.innerHTML = originalText;
            testBtn.disabled = false;
            this.showNotification('Test email sent successfully!', 'success');
        }, 2000);
    }

    createManualBackup() {
        const createBtn = document.getElementById('createBackupBtn');
        const originalText = createBtn.innerHTML;
        
        createBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        createBtn.disabled = true;
        
        setTimeout(() => {
            createBtn.innerHTML = originalText;
            createBtn.disabled = false;
            this.showNotification('Manual backup created successfully!', 'success');
            
            // Add new backup to the list
            this.addBackupToList();
        }, 3000);
    }

    addBackupToList() {
        const backupList = document.getElementById('backupList');
        const now = new Date();
        const backupItem = document.createElement('div');
        backupItem.className = 'backup-item';
        backupItem.innerHTML = `
            <div class="backup-info">
                <h4>Manual Backup</h4>
                <p>${now.toLocaleDateString()} - ${now.toLocaleTimeString()}</p>
                <span class="backup-size">162 MB</span>
            </div>
            <div class="backup-actions">
                <button class="btn-icon" title="Download">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn-icon" title="Restore">
                    <i class="fas fa-undo"></i>
                </button>
                <button class="btn-icon" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        backupList.insertBefore(backupItem, backupList.firstChild);
        
        // Add event listeners to new buttons
        backupItem.querySelectorAll('.btn-icon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.querySelector('i').classList.contains('fa-download') ? 'download' :
                              btn.querySelector('i').classList.contains('fa-undo') ? 'restore' : 'delete';
                this.handleBackupAction(action, btn);
            });
        });
    }

    toggleApiKeyVisibility() {
        const apiKeyInput = document.getElementById('apiKey');
        const toggleBtn = document.getElementById('toggleApiKey');
        const icon = toggleBtn.querySelector('i');
        
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            apiKeyInput.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }

    copyApiKey() {
        const apiKeyInput = document.getElementById('apiKey');
        apiKeyInput.select();
        document.execCommand('copy');
        this.showNotification('API key copied to clipboard', 'info');
    }

    regenerateApiKey() {
        this.showConfirmation(
            'Regenerate API Key',
            'This will generate a new API key and invalidate the current one. Are you sure?',
            () => {
                const apiKeyInput = document.getElementById('apiKey');
                const newKey = 'pk_live_' + this.generateRandomString(32);
                apiKeyInput.value = newKey;
                this.showNotification('New API key generated successfully!', 'success');
            }
        );
    }

    generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    testWebhook() {
        const testBtn = document.getElementById('testWebhookBtn');
        const originalText = testBtn.innerHTML;
        
        testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
        testBtn.disabled = true;
        
        setTimeout(() => {
            testBtn.innerHTML = originalText;
            testBtn.disabled = false;
            this.showNotification('Webhook test completed successfully!', 'success');
        }, 2000);
    }

    testDatabaseConnection() {
        const testBtn = document.getElementById('testConnectionBtn');
        const originalText = testBtn.innerHTML;
        
        testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
        testBtn.disabled = true;
        
        setTimeout(() => {
            testBtn.innerHTML = originalText;
            testBtn.disabled = false;
            this.showNotification('Database connection successful!', 'success');
        }, 1500);
    }

    downloadLogs() {
        const downloadBtn = document.getElementById('downloadLogsBtn');
        const originalText = downloadBtn.innerHTML;
        
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
        downloadBtn.disabled = true;
        
        setTimeout(() => {
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
            this.showNotification('Log file downloaded successfully!', 'success');
        }, 1500);
    }

    clearCache() {
        this.showConfirmation(
            'Clear Cache',
            'This will clear all cached data. The system may be slower temporarily. Continue?',
            () => {
                const clearBtn = document.getElementById('clearCacheBtn');
                const originalText = clearBtn.innerHTML;
                
                clearBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Clearing...';
                clearBtn.disabled = true;
                
                setTimeout(() => {
                    clearBtn.innerHTML = originalText;
                    clearBtn.disabled = false;
                    this.showNotification('Cache cleared successfully!', 'success');
                }, 2000);
            }
        );
    }

    exportData(format) {
        this.showNotification(`Exporting data in ${format.toUpperCase()} format...`, 'info');
        
        setTimeout(() => {
            this.showNotification(`Data exported successfully as ${format.toUpperCase()}!`, 'success');
        }, 2000);
    }

    handleBackupAction(action, button) {
        const backupItem = button.closest('.backup-item');
        const backupName = backupItem.querySelector('h4').textContent;
        
        switch (action) {
            case 'download':
                this.showNotification(`Downloading backup: ${backupName}`, 'info');
                break;
            case 'restore':
                this.showConfirmation(
                    'Restore Backup',
                    `Are you sure you want to restore from "${backupName}"? This will overwrite current data.`,
                    () => {
                        this.showNotification(`Restoring from backup: ${backupName}`, 'info');
                    }
                );
                break;
            case 'delete':
                this.showConfirmation(
                    'Delete Backup',
                    `Are you sure you want to delete "${backupName}"? This action cannot be undone.`,
                    () => {
                        backupItem.remove();
                        this.showNotification(`Backup deleted: ${backupName}`, 'success');
                    }
                );
                break;
        }
    }

    handleIntegrationAction(integrationName, action) {
        switch (action) {
            case 'connect':
                this.showNotification(`Connecting to ${integrationName}...`, 'info');
                break;
            case 'disconnect':
                this.showConfirmation(
                    'Disconnect Integration',
                    `Are you sure you want to disconnect ${integrationName}?`,
                    () => {
                        this.showNotification(`Disconnected from ${integrationName}`, 'success');
                    }
                );
                break;
            case 'configure':
                this.showNotification(`Opening ${integrationName} configuration...`, 'info');
                break;
        }
    }

    // ================== FILE UPLOADS ==================
    setupFileUploads() {
        const fileUploads = [
            { id: 'logoUploadArea', input: 'logoUpload' },
            { id: 'faviconUploadArea', input: 'faviconUpload' },
            { id: 'importUploadArea', input: 'importUpload' }
        ];
        
        fileUploads.forEach(upload => {
            const area = document.getElementById(upload.id);
            const input = document.getElementById(upload.input);
            
            if (area && input) {
                area.addEventListener('click', () => {
                    input.click();
                });
                
                area.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    area.style.borderColor = 'var(--primary-color)';
                    area.style.backgroundColor = 'var(--primary-light)';
                });
                
                area.addEventListener('dragleave', (e) => {
                    e.preventDefault();
                    area.style.borderColor = 'var(--gray-300)';
                    area.style.backgroundColor = 'white';
                });
                
                area.addEventListener('drop', (e) => {
                    e.preventDefault();
                    area.style.borderColor = 'var(--gray-300)';
                    area.style.backgroundColor = 'white';
                    
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                        this.handleFileUpload(files[0], upload.id);
                    }
                });
                
                input.addEventListener('change', (e) => {
                    if (e.target.files.length > 0) {
                        this.handleFileUpload(e.target.files[0], upload.id);
                    }
                });
            }
        });
    }

    handleFileUpload(file, uploadAreaId) {
        const uploadArea = document.getElementById(uploadAreaId);
        const placeholder = uploadArea.querySelector('.file-upload-placeholder');
        
        // Show upload progress
        placeholder.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <p>Uploading ${file.name}...</p>
            <small>${this.formatFileSize(file.size)}</small>
        `;
        
        setTimeout(() => {
            placeholder.innerHTML = `
                <i class="fas fa-check-circle" style="color: var(--success-color);"></i>
                <p>Upload successful!</p>
                <small>${file.name} (${this.formatFileSize(file.size)})</small>
            `;
            
            this.showNotification(`File uploaded successfully: ${file.name}`, 'success');
        }, 2000);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // ================== THEME MANAGEMENT ==================
    selectTheme(themeName) {
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        
        document.querySelector(`[data-theme="${themeName}"]`).classList.add('active');
        
        this.settings.theme = themeName;
        this.applyTheme(themeName);
        this.checkForChanges();
    }

    applyTheme(themeName) {
        // Apply theme to document root
        const root = document.documentElement;
        
        switch (themeName) {
            case 'dark':
                root.style.setProperty('--primary-color', '#1a1a1a');
                root.style.setProperty('--gray-100', '#2d2d2d');
                root.style.setProperty('--gray-200', '#404040');
                break;
            case 'blue':
                root.style.setProperty('--primary-color', '#1976d2');
                root.style.setProperty('--primary-light', '#e3f2fd');
                break;
            case 'green':
                root.style.setProperty('--primary-color', '#388e3c');
                root.style.setProperty('--primary-light', '#e8f5e9');
                break;
            default:
                // Reset to default theme
                root.style.setProperty('--primary-color', '#2d5f7c');
                root.style.setProperty('--primary-light', '#e3f2fd');
                root.style.setProperty('--gray-100', '#f8f9fa');
                root.style.setProperty('--gray-200', '#e9ecef');
                break;
        }
    }

    toggleDarkMode(enabled) {
        if (enabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    // ================== STATISTICS ==================
    updateStatistics() {
        // These would normally come from the backend
        this.animateStatUpdate('securityStatus', 'Secure');
        this.animateStatUpdate('lastBackup', '2h ago');
        this.animateStatUpdate('storageUsed', '68%');
        this.animateStatUpdate('activeSessions', 12);
    }

    animateStatUpdate(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        if (typeof targetValue === 'number') {
            const currentValue = parseInt(element.textContent) || 0;
            const increment = targetValue > currentValue ? 1 : -1;
            const stepTime = Math.abs(Math.floor(300 / (targetValue - currentValue))) || 10;
            
            let value = currentValue;
            const timer = setInterval(() => {
                value += increment;
                element.textContent = value;
                
                if (value === targetValue) {
                    clearInterval(timer);
                    element.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        element.style.transform = 'scale(1)';
                    }, 200);
                }
            }, stepTime);
        } else {
            element.textContent = targetValue;
        }
    }

    // ================== MODAL MANAGEMENT ==================
    showConfirmation(title, message, callback) {
        document.getElementById('confirmationTitle').textContent = title;
        document.getElementById('confirmationMessage').textContent = message;
        this.currentConfirmationCallback = callback;
        this.showModal(this.confirmationModal);
    }

    closeConfirmationModal() {
        this.hideModal(this.confirmationModal);
        this.currentConfirmationCallback = null;
    }

    confirmAction() {
        if (this.currentConfirmationCallback) {
            this.currentConfirmationCallback();
        }
        this.closeConfirmationModal();
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
    }

    hideModal(modal) {
        modal.style.opacity = '0';
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    // ================== NOTIFICATION SYSTEM ==================
    showNotification(message, type = 'info') {
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

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.hideNotification(notification);
        });

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
}

// Additional CSS for animations
const additionalCSS = `
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

    .loading-spinner {
        animation: spin 1s linear infinite;
    }

    .custom-tooltip {
        animation: fadeIn 0.3s ease;
    }

    .dark-mode {
        background-color: #1a1a1a;
        color: #ffffff;
    }

    .dark-mode .sidebar,
    .dark-mode .settings-container,
    .dark-mode .setting-group {
        background-color: #2d2d2d;
        border-color: #404040;
    }

    .dark-mode .modal-content {
        background-color: #2d2d2d;
        color: #ffffff;
    }
`;

// Inject additional CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);

// Initialize the settings management system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManagement();
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