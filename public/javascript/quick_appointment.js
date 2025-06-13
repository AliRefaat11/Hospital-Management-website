// Global Variables
const translations = {
    en: {
        formTitle: 'Quick Appointment',
        formSubtitle: 'Schedule your doctor appointment in just a few steps',
        personalInfoTitle: 'Personal Information',
        appointmentDetailsTitle: 'Appointment Details',
        labelFirstName: 'First Name',
        labelLastName: 'Last Name',
        labelPhone: 'Phone Number',
        labelEmail: 'Email Address',
        labelDepartment: 'Select Department',
        labelDate: 'Appointment Date',
        labelTime: 'Preferred Time',
        labelNotes: 'Notes or Symptoms (optional)',
        submitBtn: 'Request Appointment',
        modalTitle: 'Appointment Request Received!',
        modalMessage: 'Thank you for choosing Prime Care. We will confirm your appointment via phone or email shortly.',
        closeModalBtn: 'Close',
        switchToArabic: 'Switch to Arabic'
    },
    ar: {
        formTitle: 'موعد سريع',
        formSubtitle: 'جدولة موعد الطبيب في بضع خطوات',
        personalInfoTitle: 'المعلومات الشخصية',
        appointmentDetailsTitle: 'تفاصيل الموعد',
        labelFirstName: 'الاسم الأول',
        labelLastName: 'اسم العائلة',
        labelPhone: 'رقم الهاتف',
        labelEmail: 'البريد الإلكتروني',
        labelDepartment: 'اختر القسم',
        labelDate: 'تاريخ الموعد',
        labelTime: 'الوقت المفضل',
        labelNotes: 'ملاحظات أو أعراض (اختياري)',
        submitBtn: 'طلب موعد',
        modalTitle: 'تم استلام طلب الموعد!',
        modalMessage: 'شكراً لاختيارك Prime Care. سنقوم بتأكيد موعدك عبر الهاتف أو البريد الإلكتروني قريباً.',
        closeModalBtn: 'إغلاق',
        switchToArabic: 'التبديل إلى الإنجليزية'
    }
};

// DOM Elements
const form = document.getElementById('quickAppointmentForm');
const dateInput = document.getElementById('quickDate');
const timeInput = document.getElementById('quickTime');
const departmentSelect = document.getElementById('quickDepartment');
const modal = document.getElementById('quickModal');
const closeModalBtn = document.getElementById('modalCloseBtn');
const languageToggle = document.getElementById('languageToggle');

// Initialize date input to prevent past dates
const today = new Date().toISOString().split('T')[0];
dateInput.min = today;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initializeTimeValidation();
});

function setupEventListeners() {
    // Form submission
    form.addEventListener('submit', handleFormSubmit);

    // Modal close
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Language toggle
    languageToggle.addEventListener('click', toggleLanguage);

    // Input validation
    setupInputValidation();
}

function setupInputValidation() {
    // Phone number validation
    const phoneInput = document.getElementById('quickPhone');
    phoneInput.addEventListener('input', (e) => {
        const value = e.target.value.replace(/\D/g, '');
        e.target.value = value;
        validatePhone(value);
    });

    // Email validation
    const emailInput = document.getElementById('quickEmail');
    emailInput.addEventListener('input', (e) => {
        validateEmail(e.target.value);
    });

    // Date validation
    dateInput.addEventListener('change', validateDate);

    // Time validation
    timeInput.addEventListener('change', validateTime);
}

// Validation Functions
function validatePhone(value) {
    const error = document.getElementById('phoneError');
    if (value.length !== 11) {
        error.textContent = 'Phone number must be exactly 11 digits';
        error.style.display = 'block';
        return false;
    }
    error.style.display = 'none';
    return true;
}

function validateEmail(value) {
    const error = document.getElementById('emailError');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        error.textContent = 'Please enter a valid email address';
        error.style.display = 'block';
        return false;
    }
    error.style.display = 'none';
    return true;
}

function validateDate() {
    const error = document.getElementById('dateError');
    const selectedDate = new Date(dateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        error.textContent = 'Please select a future date';
        error.style.display = 'block';
        return false;
    }
    error.style.display = 'none';
    return true;
}

function validateTime() {
    const error = document.getElementById('timeError');
    const time = timeInput.value;
    const [hours, minutes] = time.split(':').map(Number);

    if (hours < 9 || (hours === 17 && minutes > 0) || hours > 17) {
        error.textContent = 'Please select a time between 9:00 AM and 5:00 PM';
        error.style.display = 'block';
        return false;
    }
    error.style.display = 'none';
    return true;
}

function initializeTimeValidation() {
    timeInput.addEventListener('input', (e) => {
        const time = e.target.value;
        const [hours, minutes] = time.split(':').map(Number);
        
        if (hours < 9) {
            e.target.value = '09:00';
        } else if (hours > 17 || (hours === 17 && minutes > 0)) {
            e.target.value = '17:00';
        }
    });
}

// Form Submission
async function handleFormSubmit(e) {
    e.preventDefault();

    // Validate all fields
    const isValid = validateForm();
    if (!isValid) return;

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const response = await fetch('/appointments/quick-book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to book appointment');
        }

        // Show success modal
        showSuccessModal(data);
        
        // Reset form
        form.reset();
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = translations[document.documentElement.lang].submitBtn;
    }
}

function validateForm() {
    const phone = document.getElementById('quickPhone').value;
    const email = document.getElementById('quickEmail').value;
    
    return (
        validatePhone(phone) &&
        validateEmail(email) &&
        validateDate() &&
        validateTime()
    );
}

function showSuccessModal(data) {
    const details = document.getElementById('appointmentDetails');
    details.innerHTML = `
        <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${data.time}</p>
        <p><strong>Department:</strong> ${departmentSelect.options[departmentSelect.selectedIndex].text}</p>
    `;
    
    modal.style.display = 'flex';
}

// Language Toggle
function toggleLanguage() {
    const currentLang = document.documentElement.lang;
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    
    // Update HTML lang attribute
    document.documentElement.lang = newLang;
    
    // Update button text
    languageToggle.textContent = translations[newLang].switchToArabic;
    
    // Update form text
    document.getElementById('formTitle').textContent = translations[newLang].formTitle;
    document.getElementById('formSubtitle').textContent = translations[newLang].formSubtitle;
    document.getElementById('personalInfoTitle').textContent = translations[newLang].personalInfoTitle;
    document.getElementById('appointmentDetailsTitle').textContent = translations[newLang].appointmentDetailsTitle;
    document.getElementById('labelFirstName').textContent = translations[newLang].labelFirstName;
    document.getElementById('labelLastName').textContent = translations[newLang].labelLastName;
    document.getElementById('labelPhone').textContent = translations[newLang].labelPhone;
    document.getElementById('labelEmail').textContent = translations[newLang].labelEmail;
    document.getElementById('labelDepartment').textContent = translations[newLang].labelDepartment;
    document.getElementById('labelDate').textContent = translations[newLang].labelDate;
    document.getElementById('labelTime').textContent = translations[newLang].labelTime;
    document.getElementById('labelNotes').textContent = translations[newLang].labelNotes;
    document.getElementById('submitBtn').textContent = translations[newLang].submitBtn;
    document.getElementById('modalTitle').textContent = translations[newLang].modalTitle;
    document.getElementById('modalMessage').textContent = translations[newLang].modalMessage;
    document.getElementById('modalCloseBtn').textContent = translations[newLang].closeModalBtn;
    
    // Update RTL if needed
    document.body.dir = newLang === 'ar' ? 'rtl' : 'ltr';
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }, 100);
}