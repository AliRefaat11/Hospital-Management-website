document.addEventListener('DOMContentLoaded', async () => {
    const tabsNav = document.querySelector('.tabs-nav');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Function to fetch and display tab content
    const loadTabContent = async (tabName) => {
        const contentDiv = document.getElementById(`${tabName}-content`);
        const loadingDiv = document.getElementById(`${tabName}-loading`);

        if (!contentDiv || !loadingDiv) {
            console.error(`Content or loading div not found for tab: ${tabName}`);
            return;
        }

        loadingDiv.style.display = 'block'; // Show loading message
        contentDiv.style.display = 'none';  // Hide previous content
        contentDiv.innerHTML = '';          // Clear previous content

        try {
            let url = '';
            if (tabName === 'statistics') {
                url = '/admin/tabs/statistics';
            } else if (tabName === 'doctors') {
                url = '/admin/doctor-management';
            } else if (tabName === 'patients') {
                url = '/admin/patient-management';
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            contentDiv.innerHTML = html;

            // Only fetch and render statistics if it's the statistics tab
            if (tabName === 'statistics') {
                const stats = await fetchAllStats();
                populateStatistics(stats); // Call a new function to populate stats and charts
            } else if (tabName === 'doctors') {
                // Initialize doctor management if it's the doctors tab
                if (typeof initDoctorManagement === 'function') {
                    initDoctorManagement();
                } else {
                    console.error("initDoctorManagement function not found.");
                }
            }

        } catch (error) {
            console.error(`Error loading ${tabName} content:`, error);
            contentDiv.innerHTML = `<div class="error">Error loading ${tabName} content. Please try again.</div>`;
        } finally {
            loadingDiv.style.display = 'none'; // Hide loading message
            contentDiv.style.display = 'block';  // Show loaded content
        }
    };

    // Function to fetch all dashboard statistics in one go
    const fetchAllStats = async () => {
        try {
            const res = await fetch('/api/admin/stats/all');
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP error! status: ${res.status}, body: ${errorText}`);
            }
            const { data } = await res.json();
            return data; // This will contain all the stats (totals, bloodTypes, departments, etc.)
        } catch (error) {
            console.error("Error fetching all dashboard stats:", error);
            // Return default/empty data structure in case of error
            return {
                totalDoctors: 0,
                totalPatients: 0,
                totalAppointments: 0,
                totalDepartments: 0,
                patientsByBloodType: [],
                doctorsByDepartment: [],
                appointmentsByStatus: [],
                doctorAppointmentCounts: [],
                monthlyAppointments: []
            };
        }
    };

    // New function to populate statistics and create charts
    const populateStatistics = (stats) => {
        // Populate totals
        document.getElementById('totalDoctors').textContent = stats.totalDoctors || 0;
        document.getElementById('totalPatients').textContent = stats.totalPatients || 0;
        document.getElementById('totalAppointments').textContent = stats.totalAppointments || 0;
        document.getElementById('totalDepartments').textContent = stats.totalDepartments || 0;

        // Chart helpers
        const createChart = (id, type, labels, data, label) => {
            const ctx = document.getElementById(id);
            if (ctx) {
                // Destroy existing chart if it exists to prevent re-rendering issues
                if (Chart.getChart(id)) {
                    Chart.getChart(id).destroy();
                }
                new Chart(ctx, {
                    type,
                    data: {
                        labels,
                        datasets: [{
                            label,
                            data,
                            backgroundColor: [
                                '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
                                '#ADD8E6', '#90EE90', '#FFB6C1', '#DDA0DD', '#FFE4B5', '#87CEEB'
                            ],
                            borderColor: [
                                '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
                                '#ADD8E6', '#90EE90', '#FFB6C1', '#DDA0DD', '#FFE4B5', '#87CEEB'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: label
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        };

        // Convert data formats for charts
        const extract = (list, key1, key2) => [list.map(i => i[key1]), list.map(i => i[key2])];

        createChart('bloodTypeChart', 'doughnut', ...extract(stats.patientsByBloodType || [], 'bloodType', 'count'), 'Patients by Blood Type');
        createChart('departmentChart', 'pie', ...extract(stats.doctorsByDepartment || [], 'department', 'count'), 'Doctors per Department');
        createChart('appointmentStatusChart', 'bar', ...extract(stats.appointmentsByStatus || [], 'status', 'count'), 'Appointments by Status');
        createChart('doctorAppointmentsChart', 'bar', ...extract(stats.doctorAppointmentCounts || [], 'doctorName', 'appointmentCount'), 'Appointments per Doctor');
        createChart('monthlyAppointmentsChart', 'line', ...extract(stats.monthlyAppointments || [], 'month', 'count'), 'Monthly Appointments');
    };

    // Event listeners for tab buttons
    tabsNav.addEventListener('click', (event) => {
        const clickedButton = event.target.closest('.tab-btn');
        if (clickedButton) {
            const targetTab = clickedButton.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            clickedButton.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            loadTabContent(targetTab);
        }
    });

    // Load the default active tab (Statistics) content on initial page load
    const initialActiveTab = document.querySelector('.tab-btn.active');
    if (initialActiveTab) {
        loadTabContent(initialActiveTab.dataset.tab);
    }
});
  