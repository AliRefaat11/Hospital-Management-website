// Global Variables
let currentLanguage = 'en';
const translations = {
  en: {
    formTitle: 'Personal Information',
    sectionTitle: 'Appointment Details',
    labelName: 'Your Name',
    labelPhone: 'Phone Number',
    labelEmail: 'Email Address',
    labelGender: 'Gender',
    labelAge: 'Age',
    labelDate: 'Appointment Date',
    labelTime: 'Preferred Time',
    labelDepartment: 'Department',
    labelReason: 'Reason for Visit',
    labelTerms: 'I agree to the terms and privacy policy',
    submitBtn: 'Confirm Appointment',
    processing: 'Processing...',
    modalTitle: 'Appointment Confirmed',
    modalMessage: 'Your appointment has been scheduled successfully. A confirmation has been sent to your email.',
    closeBtn: 'Close',
    genderOptions: ['Select Gender', 'Male', 'Female'],
    departmentOptions: [
      'Select Department',
      'General Medicine',
      'Cardiology',
      'Dermatology',
      'Orthopedics',
      'Pediatrics',
      'Neurology'
    ],
    switchLang: 'Switch to Arabic',
    pastTimeAlert: 'Cannot book an appointment in the past. Please select a future date and time.',
    errorTitle: 'Invalid Time Selection'
  },
  ar: {
    formTitle: 'المعلومات الشخصية',
    sectionTitle: 'تفاصيل الموعد',
    labelName: 'الاسم الكامل',
    labelPhone: 'رقم الهاتف',
    labelEmail: 'البريد الإلكتروني',
    labelGender: 'الجنس',
    labelAge: 'العمر',
    labelDate: 'تاريخ الموعد',
    labelTime: 'الوقت المفضل',
    labelDepartment: 'القسم',
    labelReason: 'سبب الزيارة',
    labelTerms: 'أوافق على الشروط وسياسة الخصوصية',
    submitBtn: 'تأكيد الموعد',
    processing: 'جاري المعالجة...',
    modalTitle: 'تم تأكيد الموعد',
    modalMessage: 'تم جدولة موعدك بنجاح. تم إرسال تأكيد إلى بريدك الإلكتروني.',
    closeBtn: 'إغلاق',
    genderOptions: ['اختر الجنس', 'ذكر', 'أنثى'],
    departmentOptions: [
      'اختر القسم',
      'الطب العام',
      'أمراض القلب',
      'الجلدية',
      'العظام',
      'طب الأطفال',
      'الأعصاب'
    ],
    switchLang: 'التبديل إلى الإنجليزية',
    pastTimeAlert: 'لا يمكن حجز موعد في الماضي. يرجى اختيار تاريخ ووقت مستقبلي.',
    errorTitle: 'اختيار وقت غير صالح'
  }
};

// DOM Elements
const appointmentForm = document.getElementById('appointmentForm');
const submitBtn = document.getElementById('submitBtn');
const submitLoader = document.getElementById('submitLoader');
const confirmationModal = document.getElementById('confirmationModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const langButton = document.getElementById('langButton');
const dateInput = document.getElementById('appointmentDate');
const timeInput = document.getElementById('appointmentTime');

// Custom error modal elements - Add to the HTML dynamically
const errorModal = document.createElement('div');
errorModal.id = 'errorModal';
errorModal.className = 'modal';
errorModal.innerHTML = `
  <div class="modal-content">
    <div class="modal-icon" style="color: #e74c3c;">
      <i class="fas fa-exclamation-circle"></i>
    </div>
    <h3 id="errorModalTitle"></h3>
    <p id="errorModalMessage"></p>
    <button id="closeErrorModalBtn"></button>
  </div>
`;
document.body.appendChild(errorModal);

const closeErrorModalBtn = document.getElementById('closeErrorModalBtn');
closeErrorModalBtn.addEventListener('click', function() {
  errorModal.style.display = 'none';
});

// Initialize date input with minimum date of today
window.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
  
  // Set default working hours
  timeInput.setAttribute('min', '09:00');
  timeInput.setAttribute('max', '17:00');
  
  // Initialize form validation
  initFormValidation();
  
  // Add validation for date and time together
  setupDateTimeValidation();
});

// Setup combined date and time validation
function setupDateTimeValidation() {
  dateInput.addEventListener('change', validateDateAndTime);
  timeInput.addEventListener('change', validateDateAndTime);
}

// Function to validate if the selected date and time are in the past
function validateDateAndTime() {
  const dateValue = dateInput.value;
  const timeValue = timeInput.value;
  
  // Only validate if both date and time have been selected
  if (dateValue && timeValue) {
    const selectedDateTime = new Date(`${dateValue}T${timeValue}`);
    const now = new Date();
    
    if (selectedDateTime < now) {
      // Selected time is in the past, show error modal
      showErrorModal();
      return false;
    }
  }
  return true;
}

// Function to show the error modal for past time selection
function showErrorModal() {
  const t = translations[currentLanguage];
  document.getElementById('errorModalTitle').textContent = t.errorTitle;
  document.getElementById('errorModalMessage').textContent = t.pastTimeAlert;
  document.getElementById('closeErrorModalBtn').textContent = t.closeBtn;
  errorModal.style.display = 'flex';
  
  // Reset the time input to empty
  timeInput.value = '';
}

// Form submission handler
appointmentForm.addEventListener('submit', function(event) {
  event.preventDefault();
  
  // Validate the form including the date-time check
  if (!validateForm() || !validateDateAndTime()) {
    return false;
  }
  
  // Show loading state
  submitBtn.style.display = 'none';
  submitLoader.style.display = 'flex';
  
  // Simulate API call with timeout
  setTimeout(() => {
    // Hide loading state
    submitBtn.style.display = 'flex';
    submitLoader.style.display = 'none';
    
    // Show confirmation modal
    confirmationModal.style.display = 'flex';
    
    // Reset form
    appointmentForm.reset();
  }, 1500);
});

// Close modal handler
closeModalBtn.addEventListener('click', function() {
  confirmationModal.style.display = 'none';
});

// Close modal if clicking outside
window.addEventListener('click', function(event) {
  if (event.target === confirmationModal) {
    confirmationModal.style.display = 'none';
  }
  if (event.target === errorModal) {
    errorModal.style.display = 'none';
  }
});

// Toggle language
function toggleLanguage() {
  currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
  updateLanguage();
}

// Update UI with selected language
function updateLanguage() {
  const t = translations[currentLanguage];
  
  // Update document direction
  document.body.style.direction = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  
  // Update form labels
  document.getElementById('formTitle').textContent = t.formTitle;
  document.querySelector('.section-title').textContent = t.sectionTitle;
  document.querySelector('label[for="patientName"]').textContent = t.labelName;
  document.querySelector('label[for="patientPhone"]').textContent = t.labelPhone;
  document.querySelector('label[for="patientEmail"]').textContent = t.labelEmail;
  document.querySelector('label[for="patientGender"]').textContent = t.labelGender;
  document.querySelector('label[for="patientAge"]').textContent = t.labelAge;
  document.querySelector('label[for="appointmentDate"]').textContent = t.labelDate;
  document.querySelector('label[for="appointmentTime"]').textContent = t.labelTime;
  document.querySelector('label[for="departmentSelect"]').textContent = t.labelDepartment;
  document.querySelector('label[for="reason"]').textContent = t.labelReason;
  document.getElementById('labelTerms').textContent = t.labelTerms;
  
  // Update button text
  submitBtn.querySelector('span').textContent = t.submitBtn;
  submitLoader.querySelector('span').textContent = t.processing;
  
  // Update modal text
  document.getElementById('modalTitle').textContent = t.modalTitle;
  document.getElementById('modalMessage').textContent = t.modalMessage;
  closeModalBtn.textContent = t.closeBtn;
  
  // Update error modal text if it exists in the DOM
  if (document.getElementById('errorModalTitle')) {
    document.getElementById('errorModalTitle').textContent = t.errorTitle;
    document.getElementById('errorModalMessage').textContent = t.pastTimeAlert;
    document.getElementById('closeErrorModalBtn').textContent = t.closeBtn;
  }
  
  // Update language toggle button
  langButton.textContent = t.switchLang;
  
  // Update select options
  updateSelectOptions('patientGender', t.genderOptions);
  updateSelectOptions('departmentSelect', t.departmentOptions);
}

// Helper function to update select options
function updateSelectOptions(selectId, options) {
  const select = document.getElementById(selectId);
  select.innerHTML = '';
  
  options.forEach((option, index) => {
    const optionElement = document.createElement('option');
    if (index === 0) {
      optionElement.disabled = true;
      optionElement.selected = true;
      optionElement.value = '';
    } else {
      optionElement.value = option.toLowerCase().replace(/\s+/g, '_');
    }
    optionElement.textContent = option;
    select.appendChild(optionElement);
  });
}

// Form validation
function initFormValidation() {
  const inputs = appointmentForm.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    input.addEventListener('input', function() {
      validateInput(this);
    });
    
    input.addEventListener('blur', function() {
      validateInput(this);
    });
  });
}

function validateInput(input) {
  // Remove any existing error messages
  const existingError = input.parentElement.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // Skip validation for non-required fields
  if (!input.hasAttribute('required') && input.value === '') {
    input.classList.remove('error');
    return true;
  }
  
  let isValid = true;
  
  // Validate based on input type
  switch (input.type) {
    case 'email':
      isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
      if (!isValid) showError(input, 'Please enter a valid email address');
      break;
      
    case 'tel':
      isValid = /^\d{11}$/.test(input.value);
      if (!isValid) showError(input, 'Please enter a valid 11-digit phone number');
      break;
      
    case 'number':
      isValid = input.value > 0 && input.value <= 120;
      if (!isValid) showError(input, 'Please enter a valid age (1-120)');
      break;
      
    case 'date':
      const selectedDate = new Date(input.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      isValid = selectedDate >= today;
      if (!isValid) showError(input, 'Please select a date today or in the future');
      break;
      
    case 'time':
      const time = input.value;
      isValid = time >= '09:00' && time <= '17:00';
      if (!isValid) showError(input, 'Please select a time between 9 AM and 5 PM');
      break;
      
    case 'select-one':
      isValid = input.value !== '';
      if (!isValid) showError(input, 'Please make a selection');
      break;
      
    default:
      isValid = input.value.trim() !== '';
      if (!isValid) showError(input, 'This field is required');
      break;
  }
  
  // Update input styling
  if (isValid) {
    input.classList.remove('error');
    input.classList.add('valid');
  } else {
    input.classList.add('error');
    input.classList.remove('valid');
  }
  
  return isValid;
}

function showError(input, message) {
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  errorElement.style.color = '#ff3860';
  errorElement.style.fontSize = '0.8rem';
  errorElement.style.marginTop = '5px';
  
  input.parentElement.appendChild(errorElement);
}

function validateForm() {
  const inputs = appointmentForm.querySelectorAll('input, select, textarea');
  let isFormValid = true;
  
  inputs.forEach(input => {
    if (!validateInput(input)) {
      isFormValid = false;
    }
  });
  
  return isFormValid;
}