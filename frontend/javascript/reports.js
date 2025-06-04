
class ReportsManagement {
    constructor() {
        // Core elements
        this.sidebar = document.getElementById('sidebarNav');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.mainContent = document.querySelector('.main-content');
        this.navLinks = document.querySelectorAll('.nav-links a');
        
        // Reports data
        this.reportsData = [];
        this.filteredData = [];
        this.currentEditingId = null;
        this.currentNotification = null;
        this.currentTooltip = null;
        this.charts = {};
        
        // Modal elements
        this.reportModal = document.getElementById('reportModal');
        this.reportDetailsModal = document.getElementById('reportDetailsModal');
        this.customDateModal = document.getElementById('customDateModal');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadReportsData();
        this.updateStatistics();
        this.initializeCharts();
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

        // Report generation buttons
        document.querySelectorAll('.generate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const reportType = btn.dataset.type;
                this.createRippleEffect(e, btn);
                setTimeout(() => this.openReportModal(reportType), 200);
            });
        });

        // Date range selector
        document.getElementById('dateRange').addEventListener('change', (e) => {
            this.handleDateRangeChange(e.target.value);
        });

        // Modal close buttons
        document.getElementById('closeReportModal').addEventListener('click', () => {
            this.closeReportModal();
        });

        document.getElementById('closeDetailsModal').addEventListener('click', () => {
            this.closeDetailsModal();
        });

        document.getElementById('cancelReportBtn').addEventListener('click', () => {
            this.closeReportModal();
        });

        // Form submission
        document.getElementById('reportForm').addEventListener('submit', (e) => {
            this.handleFormSubmission(e);
        });

        // Filter changes
        document.getElementById('typeFilter').addEventListener('change', () => {
            this.applyFilters();
        });
        
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        // Search functionality
        document.getElementById('reportSearch').addEventListener('input', (e) => {
            this.searchReports(e.target.value);
        });

        // Detail modal actions
        document.getElementById('downloadReportBtn').addEventListener('click', () => {
            this.downloadReport();
        });

        document.getElementById('shareReportBtn').addEventListener('click', () => {
            this.shareReport();
        });

        document.getElementById('regenerateReportBtn').addEventListener('click', () => {
            this.regenerateReport();
        });

        // Custom date modal
        document.getElementById('cancelCustomDateBtn').addEventListener('click', () => {
            this.closeCustomDateModal();
        });

        document.getElementById('applyCustomDateBtn').addEventListener('click', () => {
            this.applyCustomDateRange();
        });

        // Chart controls
        document.querySelectorAll('.chart-controls .btn-icon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleChartAction(e, btn);
            });
        });

        // Header actions
        document.querySelectorAll('.header-actions .btn-icon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleHeaderAction(e, btn);
            });
        });

        // Mobile navigation
        this.setupMobileNavigation();

        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
            this.resizeCharts();
        });

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
        
        if (clickedLink.parentElement.classList.contains('active')) {
            return;
        }
        
        document.querySelectorAll('.nav-links li').forEach(li => {
            li.classList.remove('active');
        });
        
        clickedLink.parentElement.classList.add('active');
        const targetUrl = clickedLink.getAttribute('href');
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
        } else {
            const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            if (sidebarCollapsed) {
                this.collapseSidebar();
            }
        }
    }

    setupModalClickOutside() {
        [this.reportModal, this.reportDetailsModal, this.customDateModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    if (modal === this.reportModal) {
                        this.closeReportModal();
                    } else if (modal === this.reportDetailsModal) {
                        this.closeDetailsModal();
                    } else if (modal === this.customDateModal) {
                        this.closeCustomDateModal();
                    }
                }
            });
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC to close modals
            if (e.key === 'Escape') {
                if (this.reportModal.style.display === 'flex') {
                    this.closeReportModal();
                } else if (this.reportDetailsModal.style.display === 'flex') {
                    this.closeDetailsModal();
                } else if (this.customDateModal.style.display === 'flex') {
                    this.closeCustomDateModal();
                }
            }
            
            // Ctrl+N to create new report
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.openReportModal();
            }
            
            // Focus search with Ctrl+F
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                document.getElementById('reportSearch').focus();
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
            const sections = document.querySelectorAll('.report-types-section, .charts-section, .reports-table-section');
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
            { text: 'Report generation completed', time: '2 minutes ago', type: 'success' },
            { text: 'New financial analytics available', time: '10 minutes ago', type: 'info' },
            { text: 'Monthly report scheduled for tomorrow', time: '1 hour ago', type: 'reminder' }
        ]);
    }

    showMessages() {
        this.createDropdown('messages', [
            { text: 'CFO: Q4 financial report needed', time: '5 minutes ago', sender: 'Sarah Wilson' },
            { text: 'Data team: Analytics update ready', time: '30 minutes ago', sender: 'Mike Johnson' },
            { text: 'System: Automated backup completed', time: '2 hours ago', sender: 'System' }
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

    // ================== DATE RANGE HANDLING ==================
    handleDateRangeChange(value) {
        if (value === 'custom') {
            this.showModal(this.customDateModal);
        } else {
            this.applyDateFilter(value);
        }
    }

    closeCustomDateModal() {
        this.hideModal(this.customDateModal);
        document.getElementById('dateRange').value = '30'; // Reset to default
    }

    applyCustomDateRange() {
        const fromDate = document.getElementById('customDateFrom').value;
        const toDate = document.getElementById('customDateTo').value;
        
        if (!fromDate || !toDate) {
            this.showNotification('Please select both start and end dates', 'error');
            return;
        }
        
        if (new Date(fromDate) > new Date(toDate)) {
            this.showNotification('Start date must be before end date', 'error');
            return;
        }
        
        this.applyDateFilter('custom', { from: fromDate, to: toDate });
        this.hideModal(this.customDateModal);
        this.showNotification('Custom date range applied successfully', 'success');
    }

    applyDateFilter(period, customRange = null) {
        let startDate, endDate = new Date();
        
        if (period === 'custom' && customRange) {
            startDate = new Date(customRange.from);
            endDate = new Date(customRange.to);
        } else {
            const days = parseInt(period);
            startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
        }
        
        // Filter reports data based on date range
        this.filteredData = this.reportsData.filter(report => {
            const reportDate = new Date(report.dateCreated);
            return reportDate >= startDate && reportDate <= endDate;
        });
        
        this.renderReportsTable();
        this.updateChartsWithDateFilter(startDate, endDate);
        this.updateStatistics();
    }

    // ================== REPORTS DATA MANAGEMENT ==================
    loadReportsData() {
        const savedData = localStorage.getItem('reportsManagement');
        if (savedData) {
            this.reportsData = JSON.parse(savedData);
        } else {
            this.reportsData = this.getSampleData();
            this.saveReportsData();
        }
        this.filteredData = [...this.reportsData];
        this.renderReportsTable();
    }

    saveReportsData() {
        localStorage.setItem('reportsManagement', JSON.stringify(this.reportsData));
    }

    getSampleData() {
        return [
            {
                id: 'RPT001',
                name: 'Monthly Patient Analytics',
                type: 'patient',
                format: 'pdf',
                generatedBy: 'Sarah Johnson',
                dateCreated: '2024-05-18',
                status: 'completed',
                fileSize: '2.5 MB',
                downloadCount: 12,
                description: 'Comprehensive patient demographics and visit patterns analysis'
            },
            {
                id: 'RPT002',
                name: 'Q1 Financial Summary',
                type: 'financial',
                format: 'excel',
                generatedBy: 'Mike Brown',
                dateCreated: '2024-05-17',
                status: 'completed',
                fileSize: '1.8 MB',
                downloadCount: 8,
                description: 'Revenue, expenses, and profitability analysis for Q1'
            },
            {
                id: 'RPT003',
                name: 'Staff Performance Review',
                type: 'staff',
                format: 'pdf',
                generatedBy: 'Emma Wilson',
                dateCreated: '2024-05-16',
                status: 'processing',
                fileSize: '3.2 MB',
                downloadCount: 0,
                description: 'Individual and departmental performance metrics'
            },
            {
                id: 'RPT004',
                name: 'Appointment Efficiency',
                type: 'appointment',
                format: 'csv',
                generatedBy: 'John Doe',
                dateCreated: '2024-05-15',
                status: 'completed',
                fileSize: '0.9 MB',
                downloadCount: 15,
                description: 'Scheduling patterns and wait time analysis'
            },
            {
                id: 'RPT005',
                name: 'Operational Dashboard',
                type: 'operational',
                format: 'pdf',
                generatedBy: 'Sarah Johnson',
                dateCreated: '2024-05-14',
                status: 'failed',
                fileSize: '0 MB',
                downloadCount: 0,
                description: 'Resource utilization and efficiency metrics'
            }
        ];
    }

    generateReportId() {
        const lastId = this.reportsData.length > 0 
            ? Math.max(...this.reportsData.map(r => parseInt(r.id.substring(3))))
            : 0;
        return `RPT${String(lastId + 1).padStart(3, '0')}`;
    }

    // ================== SEARCH & FILTER ==================
    setupSearchFunctionality() {
        const searchInput = document.getElementById('reportSearch');
        let searchTimeout;
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchReports(e.target.value);
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

    searchReports(query) {
        let filtered = [...this.reportsData];
        
        if (query) {
            filtered = filtered.filter(report => 
                report.name.toLowerCase().includes(query.toLowerCase()) ||
                report.type.toLowerCase().includes(query.toLowerCase()) ||
                report.generatedBy.toLowerCase().includes(query.toLowerCase()) ||
                report.description.toLowerCase().includes(query.toLowerCase()) ||
                report.id.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        // Apply other filters
        const typeFilter = document.getElementById('typeFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        
        if (typeFilter) {
            filtered = filtered.filter(report => report.type === typeFilter);
        }
        
        if (statusFilter) {
            filtered = filtered.filter(report => report.status === statusFilter);
        }
        
        this.filteredData = filtered;
        this.renderReportsTable();
        this.showSearchResults(filtered.length, this.reportsData.length);
    }

    applyFilters() {
        const typeFilter = document.getElementById('typeFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const searchQuery = document.getElementById('reportSearch').value.toLowerCase();

        let filtered = [...this.reportsData];

        if (typeFilter) {
            filtered = filtered.filter(report => report.type === typeFilter);
        }
        
        if (statusFilter) {
            filtered = filtered.filter(report => report.status === statusFilter);
        }

        if (searchQuery) {
            filtered = filtered.filter(report => 
                report.name.toLowerCase().includes(searchQuery) ||
                report.type.toLowerCase().includes(searchQuery) ||
                report.generatedBy.toLowerCase().includes(searchQuery) ||
                report.description.toLowerCase().includes(searchQuery) ||
                report.id.toLowerCase().includes(searchQuery)
            );
        }

        this.filteredData = filtered;
        this.renderReportsTable();
        
        const tableContainer = document.querySelector('.table-container');
        tableContainer.style.opacity = '0.7';
        setTimeout(() => {
            tableContainer.style.opacity = '1';
        }, 200);
        
        this.showSearchResults(filtered.length, this.reportsData.length);
    }

    showSearchResults(filtered, total) {
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
                    Showing ${filtered} of ${total} reports
                </span>
                <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" id="clearFiltersBtn">
                    Clear Filters
                </button>
            `;
            
            const tableContainer = document.querySelector('.table-container');
            tableContainer.parentNode.insertBefore(message, tableContainer);
            
            document.getElementById('clearFiltersBtn').addEventListener('click', () => {
                document.getElementById('reportSearch').value = '';
                document.getElementById('typeFilter').value = '';
                document.getElementById('statusFilter').value = '';
                this.applyFilters();
                message.remove();
            });
        }
    }

    // ================== TABLE MANAGEMENT ==================
    renderReportsTable() {
        const tbody = document.getElementById('reportsTableBody');
        tbody.innerHTML = '';

        if (this.filteredData.length === 0) {
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = `
                <td colspan="7" style="text-align: center; padding: 2rem; color: var(--gray-600);">
                    <i class="fas fa-file-alt" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <div>No reports found</div>
                </td>
            `;
            tbody.appendChild(noDataRow);
            return;
        }

        this.filteredData.forEach((report, index) => {
            const row = this.createReportRow(report, index);
            tbody.appendChild(row);
        });

        this.addTableAnimations();
        this.setupTableEventListeners();
    }

    createReportRow(report, index) {
        const row = document.createElement('tr');
        row.style.opacity = '0';
        row.style.transform = 'translateY(20px)';
        
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-file-alt" style="color: var(--primary-color);"></i>
                    <span class="report-name-link" data-id="${report.id}" style="
                        color: var(--primary-color);
                        cursor: pointer;
                        font-weight: 500;
                        transition: all 0.2s ease;
                    ">${report.name}</span>
                </div>
            </td>
            <td>
                <span class="type-badge ${report.type}">${this.capitalizeFirst(report.type)}</span>
            </td>
            <td>${report.generatedBy}</td>
            <td>${this.formatDate(report.dateCreated)}</td>
            <td>
                <span class="status-badge ${report.status}">${this.capitalizeFirst(report.status)}</span>
            </td>
            <td>${report.fileSize}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon view-btn" data-id="${report.id}" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${report.status === 'completed' ? `
                        <button class="btn-icon download-btn" data-id="${report.id}" title="Download">
                            <i class="fas fa-download"></i>
                        </button>
                    ` : ''}
                    <button class="btn-icon edit-btn" data-id="${report.id}" title="Regenerate">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button class="btn-icon delete-btn" data-id="${report.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        return row;
    }

    setupTableEventListeners() {
        // Name links to open details modal
        document.querySelectorAll('.report-name-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.viewReportDetails(id);
            });
            
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
                this.viewReportDetails(id);
                this.createRippleEffect(e, btn);
            });
        });
        
        // Download buttons
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.downloadReportById(id);
                this.createRippleEffect(e, btn);
            });
        });
        
        // Edit/Regenerate buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.regenerateReportById(id);
                this.createRippleEffect(e, btn);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.deleteReport(id);
                this.createRippleEffect(e, btn);
            });
        });
    }

    addTableAnimations() {
        const rows = document.querySelectorAll('#reportsTableBody tr');
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

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ================== MODAL MANAGEMENT ==================
    openReportModal(reportType = null) {
        document.getElementById('reportModalTitle').textContent = 'Generate Report';
        document.getElementById('reportForm').reset();
        
        if (reportType) {
            document.getElementById('reportType').value = reportType;
        }
        
        // Set default dates
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        document.getElementById('dateTo').value = today.toISOString().split('T')[0];
        document.getElementById('dateFrom').value = thirtyDaysAgo.toISOString().split('T')[0];
        
        this.clearValidationMessages();
        this.showModal(this.reportModal);
    }

    viewReportDetails(id) {
        const report = this.reportsData.find(r => r.id === id);
        if (!report) return;

        // Populate details modal
        document.getElementById('detailReportName').textContent = report.name;
        document.getElementById('detailReportType').innerHTML = `<span class="type-badge ${report.type}">${this.capitalizeFirst(report.type)}</span>`;
        document.getElementById('detailReportFormat').textContent = report.format.toUpperCase();
        document.getElementById('detailGeneratedBy').textContent = report.generatedBy;
        document.getElementById('detailDateCreated').textContent = this.formatDate(report.dateCreated);
        document.getElementById('detailStatus').innerHTML = `<span class="status-badge ${report.status}">${this.capitalizeFirst(report.status)}</span>`;
        document.getElementById('detailFileSize').textContent = report.fileSize;
        document.getElementById('detailDownloadCount').textContent = report.downloadCount;
        document.getElementById('detailDescription').textContent = report.description;

        this.reportDetailsModal.dataset.reportId = id;
        this.showModal(this.reportDetailsModal);
    }

    downloadReport() {
        const id = this.reportDetailsModal.dataset.reportId;
        this.downloadReportById(id);
    }

    shareReport() {
        const id = this.reportDetailsModal.dataset.reportId;
        const report = this.reportsData.find(r => r.id === id);
        
        if (navigator.share) {
            navigator.share({
                title: report.name,
                text: `Check out this report: ${report.name}`,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            this.showNotification('Report link copied to clipboard', 'info');
        }
    }

    regenerateReport() {
        const id = this.reportDetailsModal.dataset.reportId;
        this.regenerateReportById(id);
        this.closeDetailsModal();
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
        
        const firstInput = modal.querySelector('input:not([readonly])');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 300);
        }
    }

    closeReportModal() {
        this.hideModal(this.reportModal);
        document.getElementById('reportForm').reset();
        this.clearValidationMessages();
    }

    closeDetailsModal() {
        this.hideModal(this.reportDetailsModal);
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
        const form = document.getElementById('reportForm');
        const inputs = form.querySelectorAll('input, select, textarea');
        
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
        
        if (!isValid || !value) {
            field.style.borderColor = 'var(--danger-color)';
            field.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.2)';
            return false;
        }
        
        // Additional validation for dates
        if (field.type === 'date') {
            const fromDate = document.getElementById('dateFrom').value;
            const toDate = document.getElementById('dateTo').value;
            
            if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
                field.style.borderColor = 'var(--danger-color)';
                field.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.2)';
                return false;
            }
        }
        
        field.style.borderColor = 'var(--success-color)';
        field.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
        return true;
    }

    clearFieldValidation(field) {
        field.style.borderColor = '';
        field.style.boxShadow = '';
    }

    clearValidationMessages() {
        const inputs = document.querySelectorAll('#reportForm input, #reportForm select, #reportForm textarea');
        inputs.forEach(input => {
            input.style.borderColor = '';
            input.style.boxShadow = '';
        });
    }

    handleFormSubmission(e) {
        e.preventDefault();
        
        const inputs = e.target.querySelectorAll('input[required], select[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            this.showNotification('Please correct the errors in the form', 'error');
            return;
        }

        const reportData = {
            id: this.generateReportId(),
            name: document.getElementById('reportName').value,
            type: document.getElementById('reportType').value,
            format: document.getElementById('reportFormat').value,
            generatedBy: 'Sarah Johnson', // Current user
            dateCreated: new Date().toISOString().split('T')[0],
            status: 'processing',
            fileSize: '0 MB',
            downloadCount: 0,
            description: document.getElementById('reportDescription').value || 'No description provided'
        };

        const generateBtn = document.getElementById('generateReportBtn');
        const originalText = generateBtn.innerHTML;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        generateBtn.disabled = true;

        setTimeout(() => {
            // Simulate report generation
            reportData.status = 'completed';
            reportData.fileSize = this.generateRandomFileSize();
            
            this.reportsData.unshift(reportData);
            this.saveReportsData();
            this.applyFilters();
            this.updateStatistics();
            this.closeReportModal();
            
            this.showNotification(`Report "${reportData.name}" generated successfully!`, 'success');
            
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        }, 2000);
    }

    generateRandomFileSize() {
        const sizes = ['1.2 MB', '2.5 MB', '3.8 MB', '0.9 MB', '4.1 MB', '1.7 MB'];
        return sizes[Math.floor(Math.random() * sizes.length)];
    }

    // ================== REPORT ACTIONS ==================
    downloadReportById(id) {
        const report = this.reportsData.find(r => r.id === id);
        if (!report || report.status !== 'completed') {
            this.showNotification('Report is not available for download', 'error');
            return;
        }
        
        // Simulate download
        const link = document.createElement('a');
        link.href = '#';
        link.download = `${report.name}.${report.format}`;
        
        // Update download count
        report.downloadCount++;
        this.saveReportsData();
        this.renderReportsTable();
        
        this.showNotification(`Downloading "${report.name}"...`, 'info');
    }

    regenerateReportById(id) {
        const report = this.reportsData.find(r => r.id === id);
        if (!report) return;
        
        report.status = 'processing';
        report.dateCreated = new Date().toISOString().split('T')[0];
        
        this.saveReportsData();
        this.renderReportsTable();
        
        setTimeout(() => {
            report.status = 'completed';
            report.fileSize = this.generateRandomFileSize();
            this.saveReportsData();
            this.renderReportsTable();
            this.showNotification(`Report "${report.name}" regenerated successfully!`, 'success');
        }, 3000);
        
        this.showNotification(`Regenerating report "${report.name}"...`, 'info');
    }

    deleteReport(id) {
        const report = this.reportsData.find(r => r.id === id);
        if (!report) return;
        
        if (confirm(`Are you sure you want to delete "${report.name}"? This action cannot be undone.`)) {
            const index = this.reportsData.findIndex(r => r.id === id);
            this.reportsData.splice(index, 1);
            this.saveReportsData();
            this.applyFilters();
            this.updateStatistics();
            this.showNotification(`Report "${report.name}" deleted successfully`, 'success');
        }
    }

    // ================== CHART MANAGEMENT ==================
    initializeCharts() {
        this.initPatientGrowthChart();
        this.initRevenueChart();
        this.initAppointmentStatusChart();
        this.initDepartmentChart();
    }

    initPatientGrowthChart() {
        const ctx = document.getElementById('patientGrowthChart');
        if (!ctx) return;

        this.charts.patientGrowth = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                datasets: [{
                    label: 'New Patients',
                    data: [65, 75, 80, 88, 92],
                    borderColor: 'rgba(45, 95, 124, 1)',
                    backgroundColor: 'rgba(45, 95, 124, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    initRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        this.charts.revenue = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                datasets: [{
                    label: 'Revenue',
                    data: [12000, 15000, 18000, 16000, 20000],
                    backgroundColor: 'rgba(76, 175, 80, 0.8)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    initAppointmentStatusChart() {
        const ctx = document.getElementById('appointmentStatusChart');
        if (!ctx) return;

        this.charts.appointmentStatus = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Scheduled', 'Cancelled'],
                datasets: [{
                    data: [60, 30, 10],
                    backgroundColor: [
                        'rgba(76, 175, 80, 0.8)',
                        'rgba(255, 152, 0, 0.8)',
                        'rgba(244, 67, 54, 0.8)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    initDepartmentChart() {
        const ctx = document.getElementById('departmentChart');
        if (!ctx) return;

        this.charts.department = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General'],
                datasets: [{
                    label: 'Performance',
                    data: [80, 90, 75, 85, 88],
                    borderColor: 'rgba(45, 95, 124, 1)',
                    backgroundColor: 'rgba(45, 95, 124, 0.2)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    handleChartAction(e, button) {
        this.createRippleEffect(e, button);
        
        const chartCard = button.closest('.chart-card');
        const chartId = chartCard.querySelector('canvas').id;
        const action = button.querySelector('i').classList.contains('fa-sync-alt') ? 'refresh' : 'export';
        
        if (action === 'refresh') {
            this.refreshChart(chartId);
        } else {
            this.exportChart(chartId);
        }
    }

    refreshChart(chartId) {
        const chart = this.charts[chartId.replace('Chart', '')];
        if (chart) {
            // Simulate data refresh
            chart.data.datasets[0].data = chart.data.datasets[0].data.map(() => 
                Math.floor(Math.random() * 100) + 1
            );
            chart.update();
            this.showNotification('Chart data refreshed', 'info');
        }
    }

    exportChart(chartId) {
        const chart = this.charts[chartId.replace('Chart', '')];
        if (chart) {
            // Simulate chart export
            this.showNotification('Chart exported successfully', 'success');
        }
    }

    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.resize();
            }
        });
    }

    updateChartsWithDateFilter(startDate, endDate) {
        // Update all charts based on the new date range
        // This is a simplified implementation
        this.showNotification('Charts updated for selected date range', 'info');
    }

    // ================== STATISTICS ==================
    updateStatistics() {
        const totalReports = this.reportsData.length;
        const completedReports = this.reportsData.filter(r => r.status === 'completed').length;
        const totalDownloads = this.reportsData.reduce((sum, r) => sum + r.downloadCount, 0);
        
        this.animateStatUpdate('totalReports', totalReports);
        this.animateStatUpdate('totalDownloads', totalDownloads);
        
        // Update change indicators
        const totalChange = document.getElementById('totalReportsChange');
        if (totalChange) {
            const thisMonth = new Date().getMonth();
            const thisMonthReports = this.reportsData.filter(r => 
                new Date(r.dateCreated).getMonth() === thisMonth
            ).length;
            totalChange.textContent = `+${thisMonthReports} this month`;
        }
    }

    animateStatUpdate(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

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

    .search-results-message {
        animation: fadeIn 0.3s ease;
    }

    .chart-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 200px;
        background-color: var(--gray-100);
        border-radius: var(--border-radius);
        color: var(--gray-500);
        font-size: 0.875rem;
    }
`;

// Inject additional CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);

// Initialize the reports management system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.reportsManager = new ReportsManagement();
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