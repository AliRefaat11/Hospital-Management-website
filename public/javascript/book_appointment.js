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
window.addEventListener('DOMContentLoaded', () => {
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

  // Handle department selection
  departmentSelect.addEventListener('change', function() {
    const selectedDepartment = this.value;
    const doctors = Array.from(doctorSelect.options);
    
    doctors.forEach(doctor => {
      if (doctor.value === '') return; // Skip the default option
      
      const doctorData = JSON.parse(doctor.dataset.doctor || '{}');
      if (selectedDepartment === '' || doctorData.departmentId === selectedDepartment) {
        doctor.style.display = '';
      } else {
        doctor.style.display = 'none';
      }
    });

    // Reset doctor selection if current selection is not in the filtered list
    const currentDoctor = doctorSelect.value;
    if (currentDoctor && !Array.from(doctorSelect.options).some(opt => opt.value === currentDoctor && opt.style.display !== 'none')) {
      doctorSelect.value = '';
    }
  });
});

// Function to add insurance fields to the form
function addInsuranceFields() {
  // Create insurance section
  const departmentGroup = document.querySelector('label[for="departmentSelect"]').parentElement;
  
  // Create insurance ID field
  const insuranceIDGroup = document.createElement('div');
  insuranceIDGroup.className = 'form-group';
  insuranceIDGroup.innerHTML = `
    <label for="insuranceID" id="labelInsuranceID">Insurance ID</label>
    <input type="text" id="insuranceID" placeholder="Enter your insurance ID number" />
  `;
  
  // Create insurance provider field
  const insuranceProviderGroup = document.createElement('div');
  insuranceProviderGroup.className = 'form-group';
  insuranceProviderGroup.innerHTML = `
    <label for="insuranceProvider" id="labelInsuranceProvider">Insurance Provider</label>
    <select id="insuranceProvider">
      <option value="" disabled selected>Select Insurance Provider</option>
      <option value="axa">AXA Medical</option>
      <option value="bupa">Bupa Health</option>
      <option value="cigna">Cigna Healthcare</option>
      <option value="metlife">MetLife</option>
      <option value="allianz">Allianz Care</option>
      <option value="none">None/Self-pay</option>
    </select>
  `;
  
  // Insert the new fields after department selection
  departmentGroup.insertAdjacentElement('afterend', insuranceProviderGroup);
  departmentGroup.insertAdjacentElement('afterend', insuranceIDGroup);
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
appointmentForm.addEventListener('submit', async function(event) {
  event.preventDefault();
  
  // Validate the form including the date-time check
  if (!validateForm() || !validateDateAndTime()) {
    showErrorModal(translations[currentLanguage].errorTitle || 'Validation Error', 'Please correct the errors in the form.');
    return;
  }

  submitBtn.disabled = true; // Disable button to prevent double clicks
  submitLoader.style.display = 'inline-flex'; // Show loader

  const formData = new FormData(this);
  const patientId = document.getElementById('patientID') ? document.getElementById('patientID').value : null; // Get patientID from hidden input

  const appointmentData = {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    gender: formData.get('gender'),
    age: formData.get('age'),
    department: formData.get('department'),
    doctor: formData.get('doctor'),
    date: formData.get('date'),
    time: formData.get('time'),
    reason: formData.get('reason'),
    terms: formData.get('terms') === 'on' // Check if terms checkbox is checked
  };

  try {
    const response = await fetch('/appointments/book', { // Use the correct endpoint for booking
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData)
    });

    const result = await response.json();

    if (response.ok && result.success) {
      // Success
      document.getElementById('modalTitle').textContent = translations[currentLanguage].modalTitle;
      document.getElementById('modalMessage').textContent = translations[currentLanguage].modalMessage;
      confirmationModal.style.display = 'flex';
      appointmentForm.reset(); // Clear form after successful submission
    } else {
      // Error from backend
      showErrorModal(translations[currentLanguage].errorTitle || 'Error', result.message || 'An unknown error occurred.');
    }

  } catch (error) {
    console.error('Error during form submission:', error);
    showErrorModal(translations[currentLanguage].errorTitle || 'Error', 'Failed to connect to the server. Please try again later.');
  } finally {
    submitBtn.disabled = false; // Re-enable button
    submitLoader.style.display = 'none'; // Hide loader
  }
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

// Update placeholders
function updatePlaceholders() {
  const t = translations[currentLanguage];
  
  firstName.placeholder = t.firstNamePlaceholder;
  lastName.placeholder = t.lastNamePlaceholder;
  phone.placeholder = t.phonePlaceholder;
  email.placeholder = t.emailPlaceholder;
  age.placeholder = t.agePlaceholder;
  reason.placeholder = t.reasonPlaceholder;
  
  // Update insurance ID placeholder if it exists
  const insuranceID = document.getElementById('insuranceID');
  if (insuranceID) {
    insuranceID.placeholder = t.insuranceIDPlaceholder;
  }
}

// Reorder the name fields depending on language
function reorderNameFields() {
  const firstNameGroup = firstName.parentElement;
  const lastNameGroup = lastName.parentElement;
  const formRow = firstNameGroup.parentElement;
  
  if (currentLanguage === 'ar') {
    // In Arabic, last name should come before first name
    formRow.insertBefore(lastNameGroup, firstNameGroup);
  } else {
    // In English, first name should come before last name
    formRow.insertBefore(firstNameGroup, lastNameGroup);
  }
}

// Update UI with selected language
function updateLanguage() {
  const t = translations[currentLanguage];
  
  // Update document direction
  document.body.style.direction = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  
  // Update form labels
  document.getElementById('formTitle').textContent = t.formTitle;
  document.querySelector('.section-title').textContent = t.sectionTitle;
  
  // Update name fields labels
  document.querySelector('label[for="patientFirstName"]').textContent = t.labelFirstName;
  document.querySelector('label[for="patientLastName"]').textContent = t.labelLastName;
  
  document.querySelector('label[for="patientPhone"]').textContent = t.labelPhone;
  document.querySelector('label[for="patientEmail"]').textContent = t.labelEmail;
  document.querySelector('label[for="patientGender"]').textContent = t.labelGender;
  document.querySelector('label[for="patientAge"]').textContent = t.labelAge;
  document.querySelector('label[for="appointmentDate"]').textContent = t.labelDate;
  document.querySelector('label[for="appointmentTime"]').textContent = t.labelTime;
  document.querySelector('label[for="departmentSelect"]').textContent = t.labelDepartment;
  document.querySelector('label[for="reason"]').textContent = t.labelReason;
  document.getElementById('labelTerms').textContent = t.labelTerms;
  
  // Update insurance fields labels if they exist
  if (document.getElementById('labelInsuranceID')) {
    document.getElementById('labelInsuranceID').textContent = t.labelInsuranceID;
  }
  if (document.getElementById('labelInsuranceProvider')) {
    document.getElementById('labelInsuranceProvider').textContent = t.labelInsuranceProvider;
  }
  
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
  updateSelectOptions('insuranceProvider', t.insuranceOptions);
  
  // Update placeholders
  updatePlaceholders();
  
  // Reorder name fields based on language
  reorderNameFields();
}

// Helper function to update select options
function updateSelectOptions(selectId, options) {
  const select = document.getElementById(selectId);
  if (!select) return;
  
  select.innerHTML = '';
  
  options.forEach((option, index) => {
    const optionElement = document.createElement('option');
    if (index === 0) {
      optionElement.disabled = true;
      optionElement.selected = true;
      optionElement.value = '';
    } else {
      optionElement.value = option.toLowerCase().replace(/\s+/g, '_').replace(/[\/]/g, '_');
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
      if (!isValid) showError(input, currentLanguage === 'en' ? 'Please enter a valid email address' : 'يرجى إدخال بريد إلكتروني صحيح');
      break;
      
    case 'tel':
      isValid = /^\d{11}$/.test(input.value);
      if (!isValid) showError(input, currentLanguage === 'en' ? 'Please enter a valid 11-digit phone number' : 'يرجى إدخال رقم هاتف صحيح مكون من 11 رقم');
      break;
      
    case 'number':
      isValid = input.value > 0 && input.value <= 120;
      if (!isValid) showError(input, currentLanguage === 'en' ? 'Please enter a valid age (1-120)' : 'يرجى إدخال عمر صحيح (1-120)');
      break;
      
    case 'date':
      const selectedDate = new Date(input.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      isValid = selectedDate >= today;
      if (!isValid) showError(input, currentLanguage === 'en' ? 'Please select a date today or in the future' : 'يرجى اختيار تاريخ اليوم أو في المستقبل');
      break;
      
    case 'time':
      const time = input.value;
      isValid = time >= '09:00' && time <= '17:00';
      if (!isValid) showError(input, currentLanguage === 'en' ? 'Please select a time between 9 AM and 5 PM' : 'يرجى اختيار وقت بين 9 صباحًا و 5 مساءً');
      break;
      
    case 'select-one':
      isValid = input.value !== '';
      if (!isValid) showError(input, currentLanguage === 'en' ? 'Please make a selection' : 'يرجى الاختيار');
      break;
      
    default:
      isValid = input.value.trim() !== '';
      if (!isValid) showError(input, currentLanguage === 'en' ? 'This field is required' : 'هذا الحقل مطلوب');
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
  const inputs = appointmentForm.querySelectorAll('input[required], select[required], textarea[required]');
  let isFormValid = true;
  
  inputs.forEach(input => {
    if (!validateInput(input)) {
      isFormValid = false;
    }
  });
  
  return isFormValid;
}