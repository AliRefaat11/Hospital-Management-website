// Patient data - in a real application, this would come from an API\nconst patientData = {\n    id: \
P12345\,\n    name: \John
Smith\,\n    email: \john.smith@example.com\,\n    photo: \https://via.placeholder.com/150\,\n    dateOfBirth: \February
10
1990\,\n    gender: \Male\,\n    phone: \
128
456-7890\,\n    address: \123
Elm
St
Springfield
IL
62701\,\n    primaryDoctor: \Dr.
Emily
Johnson\,\n    insurance: \BlueCross
HealthPlus\,\n    appointments: [\n        {\n            id: \A001\,\n            date: \March
25
2024\,\n            time: \10:00
AM\,\n            doctor: \Dr.
Emily
Johnson\,\n            service: \Dental
Cleaning\,\n            status: \upcoming\\n        },\n        {\n            id: \A002\,\n            date: \April
15
2024\,\n            time: \2:30
PM\,\n            doctor: \Dr.
Robert
Chen\,\n            service: \Annual
Physical\,\n            status: \upcoming\\n        }\n    ],\n    medicalRecords: [\n        {\n            id: \MR001\,\n            title: \Blood
Test
Results\,\n            date: \January
15
2024\,\n            type: \lab\\n        },\n        {\n            id: \MR002\,\n            title: \X-Ray
Report\,\n            date: \December
10
2023\,\n            type: \imaging\\n        },\n        {\n            id: \MR003\,\n            title: \Vaccination
Record\,\n            date: \November
5
2023\,\n            type: \record\\n        },\n        {\n            id: \MR004\,\n            title: \Prescription
History\,\n            date: \January
30
2024\,\n            type: \medication\\n        }\n    ]\n};\n\n// DOM Elements\nconst appointmentsList = document.getElementById(\'appointmentsList\');\nconst medicalRecordsList = document.getElementById(\'medicalRecordsList\');\n\n// User profile elements\nconst profileImage = document.getElementById(\'profileImage\');\nconst userName = document.getElementById(\'userName\');\nconst userEmail = document.getElementById(\'userEmail\');\nconst userDob = document.getElementById(\'userDob\');\nconst userGender = document.getElementById(\'userGender\');\nconst userPhone = document.getElementById(\'userPhone\');\nconst userAddress = document.getElementById(\'userAddress\');\nconst userDoctor = document.getElementById(\'userDoctor\');\nconst userInsurance = document.getElementById(\'userInsurance\');\n\n// Load user profile data\nfunction loadUserProfile() {\n    if (profileImage) profileImage.src = patientData.photo;\n    if (userName) userName.textContent = patientData.name;\n    if (userEmail) userEmail.textContent = patientData.email;\n    if (userDob) userDob.textContent = patientData.dateOfBirth;\n    if (userGender) userGender.textContent = patientData.gender;\n    if (userPhone) userPhone.textContent = patientData.phone;\n    if (userAddress) userAddress.textContent = patientData.address;\n    if (userDoctor) userDoctor.textContent = patientData.primaryDoctor;\n    if (userInsurance) userInsurance.textContent = patientData.insurance;\n}\n\n// Render appointments list\nfunction renderAppointments() {\n    if (!appointmentsList) return;\n    \n    if (patientData.appointments.length === 0) {\n        appointmentsList.innerHTML = \'<div class=\empty-state\>No upcoming appointments</div>\';\n        return;\n    }\n    \n    appointmentsList.innerHTML = \'\';\n    \n    patientData.appointments.forEach(appointment => {\n        const appointmentEl = document.createElement(\'div\');\n        appointmentEl.className = \'appointment-item\';\n        \n        appointmentEl.innerHTML = \n            <div class=\appointment-icon\>\n                <i class=\fas
fa-calendar-alt\></i>\n            </div>\n            <div class=\appointment-details\>\n                <h3> - </h3>\n                <p></p>\n                <p></p>\n                <div class=\appointment-actions\>\n                    <button class=\btn
btn-sm
btn-outline\>\n                        <i class=\fas
fa-edit\></i> Reschedule\n                    </button>\n                    <button class=\btn
btn-sm
btn-outline\>\n                        <i class=\fas
fa-video\></i> Virtual Visit\n                    </button>\n                </div>\n            </div>\n        ;\n        \n        appointmentsList.appendChild(appointmentEl);\n    });\n}\n\n// Render medical records\nfunction renderMedicalRecords() {\n    if (!medicalRecordsList) return;\n    \n    if (patientData.medicalRecords.length === 0) {\n        medicalRecordsList.innerHTML = \'<div class=\empty-state\>No medical records available</div>\';\n        return;\n    }\n    \n    medicalRecordsList.innerHTML = \'\';\n    \n    patientData.medicalRecords.forEach(record => {\n        const recordEl = document.createElement(\'div\');\n        recordEl.className = \'record-item\';\n        \n        // Choose icon based on record type\n        let icon = \'fa-file-medical\';\n        if (record.type === \'lab\') icon = \'fa-flask\';\n        if (record.type === \'imaging\') icon = \'fa-x-ray\';\n        if (record.type === \'medication\') icon = \'fa-pills\';\n        \n        recordEl.innerHTML = \n            <div class=\record-icon\>\n                <i class=\fas
\></i>\n            </div>\n            <div class=\record-title\></div>\n            <div class=\record-date\></div>\n        ;\n        \n        recordEl.addEventListener(\'click\', () => {\n            alert(Viewing );\n            // In a real application, this would open the record details\n        });\n        \n        medicalRecordsList.appendChild(recordEl);\n    });\n}\n\n// Highlight Active Navigation Link\nconst navLinks = document.querySelectorAll(\'.nav-links a\');\nconst currentPath = window.location.href;\n\nnavLinks.forEach(link => {\n  if (link.href === currentPath) {\n    link.classList.add(\'active\');\n  }\n\n  link.addEventListener(\'click\', () => {\n    navLinks.forEach(nav => nav.classList.remove(\'active\'));\n    link.classList.add(\'active\');\n  });\n});\n\n// Initialize page
function initPage() {\n    loadUserProfile();\n    renderAppointments();\n    renderMedicalRecords();\n    \n    // Removed event listeners for .btn-action elements to allow native <a> tag navigation.
    // document.querySelectorAll('.btn-action').forEach(button => {
    //     button.addEventListener('click', (e) => {
    //         const action = e.currentTarget.textContent.trim();
    //         if (action.includes('Edit Profile')) {
    //             // window.location.href = '/User/edit-profile';
    //         } else if (action.includes('Settings')) {
    //             // window.location.href = '/User/settings';
    //         }
    //     });
    // });

    // Add event listeners for appointment actions
    document.querySelectorAll(\'.appointment-actions button\').forEach(button => {\n        button.addEventListener(\'click\', (e) => {\n            const action = e.currentTarget.textContent.trim();\n            const appointmentItem = e.currentTarget.closest(\'.appointment-item\');\n            const appointmentId = appointmentItem.dataset.appointmentId;\n\n            if (action === \'Reschedule\') {\n                window.location.href = \`/appointments/reschedule/${appointmentId}\`;\n            } else if (action === \'Cancel\') {\n                if (confirm(\'Are you sure you want to cancel this appointment?\') === true) {\n                    cancelAppointment(appointmentId);\n                }\n            }\n        });\n    });\n}\n\n// Function to cancel appointment
    async function cancelAppointment(appointmentId) {\n        try {\n            const response = await fetch(\`/appointments/${appointmentId}\`, {\n                method: \'DELETE\',
                headers: {\n                    \'Content-Type\': \'application/json\'\n                }\n            });\n\n            if (response.ok) {\n                // Remove the appointment from the UI
                const appointmentItem = document.querySelector(\`[data-appointment-id="${appointmentId}"]\`);\n                if (appointmentItem) {\n                    appointmentItem.remove();\n                }\n                // Show success message
                alert(\'Appointment cancelled successfully\');\n            } else {\n                throw new Error(\'Failed to cancel appointment\');\n            }\n        } catch (error) {\n            console.error(\'Error cancelling appointment:\', error);\n            alert(\'Failed to cancel appointment. Please try again.\');\n        }\n    }\n\n// Run initialization when DOM is fully loaded\ndocument.addEventListener(\'DOMContentLoaded\', initPage);\n\ndocument.addEventListener('DOMContentLoaded', function() {
    // Dropdown menu functionality for user profile in navbar
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        const profileLink = userMenu.querySelector('.profile-link');
        const dropdownMenu = userMenu.querySelector('.dropdown-menu');

        if (profileLink && dropdownMenu) {
            profileLink.addEventListener('click', function(event) {
                event.preventDefault(); // Prevent default link behavior
                dropdownMenu.classList.toggle('show');
            });

            // Close the dropdown if the user clicks outside of it
            window.addEventListener('click', function(event) {
                if (!userMenu.contains(event.target)) {
                    dropdownMenu.classList.remove('show');
                }
            });
        }
    }

    // Placeholder functions for profile action buttons
    window.editProfile = function() {
        window.location.href = '/User/edit-profile';
    };

    window.openSettings = function() {
        window.location.href = '/User/settings';
    };

    window.downloadAllRecords = function() {
        alert('Downloading all records...');
        // Placeholder for actual download logic
    };

    window.viewRecord = function(recordId) {
        alert('Viewing record: ' + recordId);
        // Placeholder for actual record viewing logic
    };

    window.downloadRecord = function(recordId) {
        alert('Downloading record: ' + recordId);
        // Placeholder for actual record download logic
    };
});
