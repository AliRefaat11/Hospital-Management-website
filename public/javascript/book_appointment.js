// Global Variables
let currentLanguage = 'en';
const translations = {
  en: {
    formTitle: 'Personal Information',
    sectionTitle: 'Appointment Details',
    labelFirstName: 'First Name',
    labelLastName: 'Last Name',
    labelPhone: 'Phone Number',
    labelEmail: 'Email Address',
    labelGender: 'Gender',
    labelAge: 'Age',
    labelDate: 'Appointment Date',
    labelTime: 'Preferred Time',
    labelDepartment: 'Department',
    labelReason: 'Reason for Visit',
    labelTerms: 'I agree to the terms and privacy policy',
    labelInsuranceID: 'Insurance ID',
    labelInsuranceProvider: 'Insurance Provider',
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
    insuranceOptions: [
      'Select Insurance Provider',
      'AXA Medical',
      'Bupa Health',
      'Cigna Healthcare',
      'MetLife',
      'Allianz Care',
      'None/Self-pay'
    ],
    switchLang: 'Switch to Arabic',
    pastTimeAlert: 'Cannot book an appointment in the past. Please select a future date and time.',
    errorTitle: 'Invalid Time Selection',
    // Placeholders
    firstNamePlaceholder: 'Enter your first name',
    lastNamePlaceholder: 'Enter your last name',
    phonePlaceholder: '11-digit phone number',
    emailPlaceholder: 'your.email@example.com',
    agePlaceholder: 'Your age',
    reasonPlaceholder: 'Describe your symptoms or concerns...',
    insuranceIDPlaceholder: 'Enter your insurance ID number'
  },
  ar: {
    formTitle: 'المعلومات الشخصية',
    sectionTitle: 'تفاصيل الموعد',
    labelFirstName: 'الاسم الأول',
    labelLastName: 'اسم العائلة',
    labelPhone: 'رقم الهاتف',
    labelEmail: 'البريد الإلكتروني',
    labelGender: 'الجنس',
    labelAge: 'العمر',
    labelDate: 'تاريخ الموعد',
    labelTime: 'الوقت المفضل',
    labelDepartment: 'القسم',
    labelReason: 'سبب الزيارة',
    labelTerms: 'أوافق على الشروط وسياسة الخصوصية',
    labelInsuranceID: 'رقم التأمين الصحي',
    labelInsuranceProvider: 'شركة التأمين',
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
    insuranceOptions: [
      'اختر شركة التأمين',
      'أكسا الطبية',
      'بوبا للصحة',
      'سيجنا للرعاية الصحية',
      'ميتلايف',
      'أليانز كير',
      'بدون تأمين/دفع ذاتي'
    ],
    switchLang: 'التبديل إلى الإنجليزية',
    pastTimeAlert: 'لا يمكن حجز موعد في الماضي. يرجى اختيار تاريخ ووقت مستقبلي.',
    errorTitle: 'اختيار وقت غير صالح',
    // Placeholders
    firstNamePlaceholder: 'أدخل الاسم الأول',
    lastNamePlaceholder: 'أدخل اسم العائلة',
    phonePlaceholder: 'رقم هاتف مكون من 11 رقم',
    emailPlaceholder: 'بريدك@مثال.كوم',
    agePlaceholder: 'عمرك',
    reasonPlaceholder: 'صف الأعراض أو المخاوف الصحية...',
    insuranceIDPlaceholder: 'أدخل رقم بطاقة التأمين الصحي'
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
const firstName = document.getElementById('patientFirstName');
const lastName = document.getElementById('patientLastName');
const phone = document.getElementById('patientPhone');
const email = document.getElementById('patientEmail');
const age = document.getElementById('patientAge');
const reason = document.getElementById('reason');
const departmentSelect = document.getElementById('departmentSelect');
const doctorSelect = document.getElementById('doctorSelect');

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
window.addEventListener('DOMContentLoaded', async () => {
  // Add Insurance fields to the form
  addInsuranceFields();
  
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
  
  // Set default working hours
  timeInput.setAttribute('min', '09:00');
  timeInput.setAttribute('max', '17:00');
  
  // Initialize form validation
  initFormValidation();
  
  // Add validation for date and time together
  setupDateTimeValidation();
  
  // Initialize placeholders
  updatePlaceholders();

  // Load doctors dynamically
  await loadDoctors();

  // Event listeners for department selection
  departmentSelect.addEventListener('change', function() {
    const selectedDepartmentId = this.value;
    updateDoctorOptions(selectedDepartmentId);
  });

  // Populate initial doctor options based on URL parameter if present
  const urlParams = new URLSearchParams(window.location.search);
  const preSelectedDoctorId = urlParams.get('doctor');
  if (preSelectedDoctorId) {
    doctorSelect.value = preSelectedDoctorId;
  }
});

// Function to dynamically load doctors from the backend
async function loadDoctors() {
  try {
    const response = await fetch('/api/doctors');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    const doctors = result.data;

    doctorSelect.innerHTML = '<option value="" disabled selected>Select Doctor</option>';
    doctors.forEach(doctor => {
      const option = document.createElement('option');
      option.value = doctor._id;
      option.textContent = `Dr. ${doctor.userId.FName} ${doctor.userId.LName} - ${doctor.specialization}`;
      option.dataset.departmentId = doctor.departmentId._id; // Store department ID
      doctorSelect.appendChild(option);
    });
    updateDoctorOptions(departmentSelect.value); // Filter based on initial department
  } catch (error) {
    console.error('Error loading doctors:', error);
    showErrorModal(translations[currentLanguage].errorTitle, 'Failed to load doctor list.');
  }
}

// Function to filter doctor options by department
function updateDoctorOptions(selectedDepartmentId) {
  Array.from(doctorSelect.options).forEach(option => {
    if (option.value === '') return; // Skip default option

    const doctorDepartmentId = option.dataset.departmentId;
    if (selectedDepartmentId === '' || doctorDepartmentId === selectedDepartmentId) {
      option.style.display = '';
    } else {
      option.style.display = 'none';
    }
  });
  // If the currently selected doctor is hidden, reset selection
  const currentDoctor = doctorSelect.value;
  const selectedOption = doctorSelect.querySelector(`option[value="${currentDoctor}"]`);
  if (currentDoctor && selectedOption && selectedOption.style.display === 'none') {
    doctorSelect.value = '';
  }
}

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
      showErrorModal(translations[currentLanguage].errorTitle, translations[currentLanguage].pastTimeAlert); // Use translated messages
      return false;
    }
  }
  return true;
}

// Function to show the error modal
function showErrorModal(title, message) {
  const t = translations[currentLanguage];
  document.getElementById('errorModalTitle').textContent = title;
  document.getElementById('errorModalMessage').textContent = message;
  document.getElementById('closeErrorModalBtn').textContent = t.closeBtn;
  errorModal.style.display = 'flex';
}

// Function to toggle language
function toggleLanguage() {
  currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
  updateLanguage();
}

// Function to update placeholders
function updatePlaceholders() {
  document.getElementById('patientFirstName').placeholder = translations[currentLanguage].firstNamePlaceholder;
  document.getElementById('patientLastName').placeholder = translations[currentLanguage].lastNamePlaceholder;
  document.getElementById('patientPhone').placeholder = translations[currentLanguage].phonePlaceholder;
  document.getElementById('patientEmail').placeholder = translations[currentLanguage].emailPlaceholder;
  document.getElementById('patientAge').placeholder = translations[currentLanguage].agePlaceholder;
  document.getElementById('reason').placeholder = translations[currentLanguage].reasonPlaceholder;
  document.getElementById('insuranceID').placeholder = translations[currentLanguage].insuranceIDPlaceholder;
}

// Function to reorder name fields for Arabic
function reorderNameFields() {
  const formRow = document.querySelector('.form-row');
  if (currentLanguage === 'ar') {
    // Reorder for RTL (Arabic)
    formRow.style.flexDirection = 'row-reverse';
  } else {
    // Default for LTR (English)
    formRow.style.flexDirection = 'row';
  }
}

// Function to update language
function updateLanguage() {
  const t = translations[currentLanguage];
  
  // Update form titles and section titles
  document.getElementById('formTitle').textContent = t.formTitle;
  document.querySelector('.section-title').textContent = t.sectionTitle;

  // Update labels
  document.getElementById('labelFirstName').textContent = t.labelFirstName;
  document.getElementById('labelLastName').textContent = t.labelLastName;
  document.getElementById('labelPhone').textContent = t.labelPhone;
  document.getElementById('labelEmail').textContent = t.labelEmail;
  document.getElementById('labelGender').textContent = t.labelGender;
  document.getElementById('labelAge').textContent = t.labelAge;
  document.getElementById('labelDate').textContent = t.labelDate;
  document.getElementById('labelTime').textContent = t.labelTime;
  document.getElementById('labelDepartment').textContent = t.labelDepartment;
  document.getElementById('labelReason').textContent = t.labelReason;
  document.getElementById('labelTerms').textContent = t.labelTerms;
  document.getElementById('labelInsuranceID').textContent = t.labelInsuranceID;
  document.getElementById('labelInsuranceProvider').textContent = t.labelInsuranceProvider;

  // Update button texts
  submitBtn.querySelector('span').textContent = t.submitBtn;
  submitLoader.querySelector('span').textContent = t.processing;
  document.getElementById('modalTitle').textContent = t.modalTitle;
  document.getElementById('modalMessage').textContent = t.modalMessage;
  closeModalBtn.textContent = t.closeBtn;
  langButton.textContent = t.switchLang;

  // Update select options
  updateSelectOptions('patientGender', t.genderOptions);
  updateSelectOptions('departmentSelect', t.departmentOptions);
  updateSelectOptions('insuranceProvider', t.insuranceOptions);

  // Update placeholders
  updatePlaceholders();

  // Reorder name fields for RTL
  reorderNameFields();

  // Update text direction
  document.body.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
}

function updateSelectOptions(selectId, options) {
  const selectElement = document.getElementById(selectId);
  if (!selectElement) return;

  const currentValue = selectElement.value;
  selectElement.innerHTML = ''; // Clear existing options

  options.forEach((text, index) => {
    const option = document.createElement('option');
    option.value = index === 0 ? '' : text.toLowerCase().replace(/\s/g, ''); // Value for "Select Gender" is empty
    option.textContent = text;
    if (index === 0) {
      option.disabled = true;
      option.selected = true;
    }
    if (option.value === currentValue) {
        option.selected = true;
    }
    selectElement.appendChild(option);
  });
}

function initFormValidation() {
  const form = document.getElementById('appointmentForm');
  const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

  inputs.forEach(input => {
    input.addEventListener('input', () => validateInput(input));
    input.addEventListener('blur', () => validateInput(input)); // Validate on blur
  });

  // Attach a listener to the form submission to run overall validation
  form.addEventListener('submit', (event) => {
    if (!validateForm()) {
      event.preventDefault(); // Prevent form submission if validation fails
    }
  });

  // If you are using a select for time, ensure it's validated
  timeInput.setAttribute('required', '');
}

function validateInput(input) {
  let isValid = true;
  let errorMessage = '';

  if (input.hasAttribute('required') && !input.value.trim()) {
    isValid = false;
    errorMessage = 'This field is required.';
  } else {
    switch (input.id) {
      case 'patientEmail':
        if (input.value && !isValidEmail(input.value)) {
          isValid = false;
          errorMessage = 'Please enter a valid email address.';
        }
        break;
      case 'patientPhone':
        if (input.value && !isValidPhone(input.value)) {
          isValid = false;
          errorMessage = 'Please enter a valid phone number (e.g., +1234567890 or 1234567890).';
        }
        break;
      case 'patientAge':
        const age = parseInt(input.value);
        if (input.value && (isNaN(age) || age < 0 || age > 120)) {
          isValid = false;
          errorMessage = 'Please enter a valid age (0-120).';
        }
        break;
      case 'termsCheck':
        if (!input.checked) {
          isValid = false;
          errorMessage = 'You must agree to the terms and privacy policy.';
        }
        break;
      // Add validation for new time input if it's a select
      case 'appointmentTime':
        if (input.value === '' || input.disabled) {
          isValid = false;
          errorMessage = 'Please select an available time slot.';
        }
        break;
    }
  }

  if (isValid) {
    hideError(input);
  } else {
    showError(input, errorMessage);
  }
  return isValid;
}

function showError(input, message) {
  let errorElement = input.nextElementSibling;
  if (!errorElement || !errorElement.classList.contains('error-message')) {
    errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    input.parentNode.insertBefore(errorElement, input.nextSibling);
  }
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  input.classList.add('invalid');
}

function hideError(input) {
  const errorElement = input.nextElementSibling;
  if (errorElement && errorElement.classList.contains('error-message')) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }
  input.classList.remove('invalid');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^\+?[\d\s-()]{10,}$/.test(phone);
}

function validateForm() {
  let isFormValid = true;
  const form = document.getElementById('appointmentForm');
  const inputs = form.querySelectorAll('input[required], select[required], textarea[required], input[type="checkbox"]');

  inputs.forEach(input => {
    if (!validateInput(input)) {
      isFormValid = false;
    }
  });

  return isFormValid;
}

function showConfirmationModal() {
  confirmationModal.style.display = 'flex';
}

// Modify the main form submission to send doctorID and startingHour correctly
appointmentForm.addEventListener('submit', async function(event) {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  submitBtn.disabled = true;
  submitLoader.style.display = 'inline-block';

  const patientData = {
    FName: firstName.value,
    LName: lastName.value,
    PhoneNumber: phone.value,
    Email: email.value,
    Gender: document.getElementById('patientGender').value,
    Age: parseInt(age.value),
    role: 'Patient'
  };

  const appointmentData = {
    doctorID: doctorSelect.value, // Get selected doctor ID
    patientID: null, // This will be populated after patient creation/lookup
    date: dateInput.value,
    startingHour: timeInput.value, // Get selected time
    status: 'scheduled',
    reason: reason.value
  };

  const insuranceID = document.getElementById('insuranceID').value;
  const insuranceProvider = document.getElementById('insuranceProvider').value;

  if (insuranceID && insuranceProvider) {
    patientData.insurance = { insuranceID, insuranceProvider };
  }

  try {
    // Create/get patient
    const patientResponse = await fetch('/api/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patientData)
    });
    const patientResult = await patientResponse.json();

    if (!patientResponse.ok) {
      throw new Error(patientResult.message || 'Failed to create/get patient');
    }
    appointmentData.patientID = patientResult.data._id;

    // Create appointment
    const appointmentResponse = await fetch('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData)
    });
    const appointmentResult = await appointmentResponse.json();

    if (!appointmentResponse.ok) {
      throw new Error(appointmentResult.message || 'Failed to create appointment');
    }

    showConfirmationModal();
    appointmentForm.reset();
    // Clear time slots after successful booking
    timeInput.innerHTML = '<option value="" disabled selected>Select Preferred Time</option>';
    timeInput.disabled = true;

  } catch (error) {
    console.error('Error booking appointment:', error);
    showErrorModal(translations[currentLanguage].errorTitle, error.message);
  } finally {
    submitBtn.disabled = false;
    submitLoader.style.display = 'none';
  }
});