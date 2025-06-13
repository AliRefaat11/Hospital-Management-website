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
    labelDoctor: 'Doctor',
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
    labelDoctor: 'الطبيب',
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

// DOM Elements (declared later inside DOMContentLoaded)
let appointmentForm;
let submitBtn;
let submitLoader;
let confirmationModal;
let closeModalBtn;
let langButton;
let dateInput;
let firstName;
let lastName;
let phone;
let email;
let age;
let reason;
let departmentSelect;
let doctorSelect;
let availableDatesInput;
let availableTimesSelect;

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

let closeErrorModalBtn; // Declared here, assigned in DOMContentLoaded

// Initialize date input with minimum date of today
window.addEventListener('DOMContentLoaded', async () => {
  // Assign DOM Elements here after DOM is loaded
  appointmentForm = document.getElementById('appointmentForm');
  submitBtn = document.getElementById('submitBtn');
  submitLoader = document.getElementById('submitLoader');
  confirmationModal = document.getElementById('confirmationModal');
  closeModalBtn = document.getElementById('closeModalBtn');
  langButton = document.getElementById('langButton');
  dateInput = document.getElementById('appointmentDate');
  firstName = document.getElementById('patientFirstName');
  lastName = document.getElementById('patientLastName');
  phone = document.getElementById('patientPhone');
  email = document.getElementById('patientEmail');
  age = document.getElementById('patientAge');
  reason = document.getElementById('reason');
  departmentSelect = document.getElementById('departmentSelect');
  doctorSelect = document.getElementById('doctorSelect');
  availableDatesInput = document.getElementById('availableDates');
  availableTimesSelect = document.getElementById('availableTimes');
  closeErrorModalBtn = document.getElementById('closeErrorModalBtn');

  // Attach the main form submission listener
  if (appointmentForm) {
    appointmentForm.addEventListener('submit', handleFormSubmit);
  }

  // Event listener for confirmation modal close button
  closeModalBtn.addEventListener('click', function() {
    confirmationModal.style.display = 'none';
  });

  // Event listener for error modal close button
  closeErrorModalBtn.addEventListener('click', function() {
    errorModal.style.display = 'none';
  });

  // Add Insurance fields to the form
  addInsuranceFields();
  
  // Initialize form validation
  initFormValidation();

  // Initial language update (moved here to ensure all elements are present before updating)
  window.onload = updateLanguage;
  
  // Load doctors dynamically (if not already loaded by EJS)
  // In this case, doctors are passed from the backend, so no need for this client-side fetch
  // await loadDoctors(); 

  // Set up event listeners for doctor and date changes
  doctorSelect.addEventListener('change', handleDoctorSelection);
  availableTimesSelect.addEventListener('click', handleAvailableTimesClick);

  // If a doctor is pre-selected (e.g., from doctor profile page), trigger selection handling
  if (doctorSelect.value) {
    handleDoctorSelection();
  }

  // Get the pre-selected doctor's ID from the URL if available
  const urlParams = new URLSearchParams(window.location.search);
  const preSelectedDoctorId = urlParams.get('doctor');

  if (preSelectedDoctorId) {
    // Find the corresponding option in the doctorSelect dropdown
    const preSelectedOption = Array.from(doctorSelect.options).find(
      option => option.value === preSelectedDoctorId
    );
    if (preSelectedOption) {
      // Set the doctorSelect value to trigger the change event listeners
      doctorSelect.value = preSelectedDoctorId;
      // Manually trigger the change event if it's not already triggering handleDoctorSelection
      doctorSelect.dispatchEvent(new Event('change'));
    }
  }

});

// Function to handle doctor selection
function handleDoctorSelection() {
  const selectedOption = doctorSelect.options[doctorSelect.selectedIndex];
  const weeklyScheduleData = selectedOption.dataset.weeklySchedule;
  console.log('Weekly Schedule Data (from JS): ', weeklyScheduleData);
  const weeklySchedule = weeklyScheduleData ? JSON.parse(weeklyScheduleData) : [];
  
  // Clear previous date and time selections
  availableDatesInput.value = '';
  availableTimesSelect.innerHTML = '<option value="" disabled selected>Select Time</option>';

  if (weeklySchedule.length > 0) {
    // Extract available days from the weekly schedule
    const availableDays = weeklySchedule.map(schedule => schedule.dayOfWeek);
    initFlatpickr(availableDays, weeklySchedule); // Pass weeklySchedule to Flatpickr for time slot filtering
  } else {
    // Disable date input if no weekly schedule
    if (flatpickrInstance) {
      flatpickrInstance.destroy();
    }
    availableDatesInput.placeholder = "No availability for this doctor";
    availableDatesInput.disabled = true;
  }
}

let flatpickrInstance = null;

// Function to initialize Flatpickr
function initFlatpickr(availableDays = [], weeklySchedule = []) {
  if (flatpickrInstance) {
    flatpickrInstance.destroy(); // Destroy existing instance
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to compare dates only

  flatpickrInstance = flatpickr(availableDatesInput, {
    dateFormat: "Y-m-d",
    minDate: "today",
    enable: [function(date) {
        const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()];
        console.log('Inside flatpickr enable function: availableDays is', availableDays, 'Type:', typeof availableDays, 'Is Array:', Array.isArray(availableDays));
        // Only enable dates that are in availableDays and are not in the past
        return availableDays.includes(dayOfWeek) && date.getTime() >= today.getTime();
    }],
    onChange: function(selectedDates, dateStr, instance) {
      if (selectedDates.length > 0) {
        const selectedDayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][selectedDates[0].getDay()];
        populateAvailableTimes(selectedDayOfWeek, weeklySchedule); // Populate times based on selected date's day of week
      }
    }
  });
  availableDatesInput.disabled = false;
  availableDatesInput.placeholder = "Select an available date";
}

// Function to populate available time slots
function populateAvailableTimes(selectedDayOfWeek, weeklySchedule) {
  availableTimesSelect.innerHTML = '<option value="" disabled selected>Select Time</option>';
  const daySchedule = weeklySchedule.find(schedule => schedule.dayOfWeek === selectedDayOfWeek);

  if (daySchedule && daySchedule.timeSlots.length > 0) {
    daySchedule.timeSlots.sort().forEach(time => {
      const option = document.createElement('option');
      option.value = time;
      option.textContent = time;
      availableTimesSelect.appendChild(option);
    });
  } else {
    const option = document.createElement('option');
    option.value = "";
    option.disabled = true;
    option.textContent = "No times available for this day";
    availableTimesSelect.appendChild(option);
  }
}

// Handle click on availableTimes select to re-populate if necessary (e.g., if date changes but time wasn't re-selected)
function handleAvailableTimesClick() {
  // This function might not be strictly necessary with Flatpickr's onChange
  // but keeping it for robustness if time slots aren't immediately populated
  if (availableDatesInput.value && availableTimesSelect.options.length <= 1) {
    const selectedDate = flatpickrInstance.selectedDates[0];
    if (selectedDate) {
      const selectedDayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][selectedDate.getDay()];
      const selectedOption = doctorSelect.options[doctorSelect.selectedIndex];
      const weeklyScheduleData = selectedOption.dataset.weeklySchedule;
      const weeklySchedule = weeklyScheduleData ? JSON.parse(weeklyScheduleData) : [];
      populateAvailableTimes(selectedDayOfWeek, weeklySchedule);
    }
  }
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

  // Safely set placeholder for dynamically added insuranceID
  const insuranceIdInput = document.getElementById('insuranceID');
  if (insuranceIdInput) {
    insuranceIdInput.placeholder = translations[currentLanguage].insuranceIDPlaceholder;
  }
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
  const formTitle = document.getElementById('formTitle');
  if (formTitle) {
    formTitle.textContent = t.formTitle;
  }
  const sectionTitle = document.querySelector('.section-title');
  if (sectionTitle) {
    sectionTitle.textContent = t.sectionTitle;
  }

  // Update labels - add null checks for dynamically added elements
  const labelFirstName = document.getElementById('labelFirstName');
  if (labelFirstName) {
    labelFirstName.textContent = t.labelFirstName;
  }
  const labelLastName = document.getElementById('labelLastName');
  if (labelLastName) {
    labelLastName.textContent = t.labelLastName;
  }
  const labelPhone = document.getElementById('labelPhone');
  if (labelPhone) {
    labelPhone.textContent = t.labelPhone;
  }
  const labelEmail = document.getElementById('labelEmail');
  if (labelEmail) {
    labelEmail.textContent = t.labelEmail;
  }
  const labelGender = document.getElementById('labelGender');
  if (labelGender) {
    labelGender.textContent = t.labelGender;
  }
  const labelAge = document.getElementById('labelAge');
  if (labelAge) {
    labelAge.textContent = t.labelAge;
  }
  const labelDate = document.getElementById('labelDate');
  if (labelDate) {
    labelDate.textContent = t.labelDate;
  }
  const labelTime = document.getElementById('labelTime');
  if (labelTime) {
    labelTime.textContent = t.labelTime;
  }
  const labelDepartment = document.getElementById('labelDepartment');
  if (labelDepartment) {
    labelDepartment.textContent = t.labelDepartment;
  }
  const labelDoctor = document.getElementById('labelDoctor');
  if (labelDoctor) {
    labelDoctor.textContent = t.labelDoctor;
  }
  const labelReason = document.getElementById('labelReason');
  if (labelReason) {
    labelReason.textContent = t.labelReason;
  }
  const labelTerms = document.getElementById('labelTerms');
  if (labelTerms) {
    labelTerms.textContent = t.labelTerms;
  }
  
  // Safely update dynamically added insurance labels
  const labelInsuranceID = document.getElementById('labelInsuranceID');
  if (labelInsuranceID) {
    labelInsuranceID.textContent = t.labelInsuranceID;
  }
  const labelInsuranceProvider = document.getElementById('labelInsuranceProvider');
  if (labelInsuranceProvider) {
    labelInsuranceProvider.textContent = t.labelInsuranceProvider;
  }

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

  // Ensure the availableTimesSelect (formerly timeInput) is validated
  availableTimesSelect.setAttribute('required', '');
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
      case 'reason':
        if (input.value && input.value.trim().length < 5) {
          isValid = false;
          errorMessage = 'Reason must be at least 5 characters.';
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

// Form Submission
async function handleFormSubmit(event) {
    console.log('handleFormSubmit called.');
    event.preventDefault();

    // Validate all fields
    const isValid = validateForm();
    if (!isValid) return;

    // Show loading state
    submitBtn.disabled = true;
    submitLoader.style.display = 'block';
    submitBtn.querySelector('span').textContent = translations[currentLanguage].processing;

    try {
        const formData = new FormData(appointmentForm);
        const data = Object.fromEntries(formData.entries());

        // Adjust keys to match backend expected keys
        data.doctorID = data.doctor; // Rename 'doctor' to 'doctorID'
        data.date = data.date; // Use the value from availableDatesInput
        data.startingHour = data.startingHour; // Use the value from availableTimesSelect
        data.reason = data.reason;

        const response = await fetch(appointmentForm.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.log('Server error response data:', errorData); // Added for debugging
            showErrorModal(translations[currentLanguage].errorTitle, errorData.message || 'Failed to book appointment');
            return; // Stop execution after showing error
        }

        // Show success modal
        showConfirmationModal();
        
        // Reset form
        appointmentForm.reset();
    } catch (error) {
        // This catch block will now primarily handle network errors or issues before response parsing
        showErrorModal(translations[currentLanguage].errorTitle, error.message || 'An unexpected error occurred.');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitLoader.style.display = 'none';
        submitBtn.querySelector('span').textContent = translations[currentLanguage].submitBtn;
    }
}

// Function to dynamically load doctors from the backend
// Remove this function as doctors are now passed via EJS
/*
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
*/

// Function to filter doctor options by department (keep if departments are still a filter)
// This logic should now be handled by EJS if doctor options are pre-rendered.
// If you still need client-side filtering, ensure 'doctors' array is available globally or fetched.
function updateDoctorOptions(selectedDepartmentId) {
  Array.from(doctorSelect.options).forEach(option => {
    if (option.value === '') return; // Skip default option

    const doctorDepartmentId = option.departmentId; // Use option.departmentId instead of dataset.departmentId for simpler access
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
  // dateInput.addEventListener('change', validateDateAndTime); // Not needed with Flatpickr onChange
  availableTimesSelect.addEventListener('change', validateDateAndTime);
}

// Function to validate if the selected date and time are in the past
function validateDateAndTime() {
  const dateValue = availableDatesInput.value;
  const timeValue = availableTimesSelect.value;
  
  // Only validate if both date and time have been selected
  if (dateValue && timeValue) {
    const selectedDateTime = new Date(`${dateValue}T${timeValue}`);
    const now = new Date();
    
    if (selectedDateTime < now) {
      showErrorModal(translations[currentLanguage].errorTitle, translations[currentLanguage].pastTimeAlert);
      // availableDatesInput.value = ''; // Optionally clear the date/time
      // availableTimesSelect.value = '';
      return false;
    }
  }
  return true;
}

// Function to add insurance fields dynamically
function addInsuranceFields() {
  const insuranceGroup = document.createElement('div');
  insuranceGroup.className = 'form-group';
  insuranceGroup.id = 'insuranceGroup';
  insuranceGroup.innerHTML = `
    <label for="insuranceProvider" id="labelInsuranceProvider">Insurance Provider</label>
    <select id="insuranceProvider" name="insuranceProvider">
      <!-- Options will be populated by updateSelectOptions -->
    </select>
    <label for="insuranceId" id="labelInsuranceID">Insurance ID</label>
    <input type="text" id="insuranceId" name="insuranceId" placeholder="Enter your insurance ID number" />
  `;
  const reasonForVisitGroup = document.getElementById('reason').closest('.form-group');
  if (reasonForVisitGroup) {
    reasonForVisitGroup.before(insuranceGroup);
  }
  updateSelectOptions('insuranceProvider', translations[currentLanguage].insuranceOptions);
  updatePlaceholders(); // Call updatePlaceholders AFTER the elements are added to the DOM
}

function showErrorModal(title, message) {
  console.log('showErrorModal called with:', title, message); // Added for debugging
  document.getElementById('errorModalTitle').textContent = title;
  document.getElementById('errorModalMessage').textContent = message;
  document.getElementById('closeErrorModalBtn').textContent = translations[currentLanguage].closeBtn; // Ensure close button text is set
  errorModal.style.display = 'flex';
  console.log('Error modal display style after setting:', errorModal.style.display); // Added for debugging
}