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

let flatpickrInstance; // Declare a global variable to hold the Flatpickr instance

function initFlatpickr(availableDays = [], weeklySchedule = []) {
	// Destroy existing instance if it exists to prevent re-initialization issues
	if (flatpickrInstance) {
		flatpickrInstance.destroy();
	}

	const today = new Date();
	today.setHours(0, 0, 0, 0); // Normalize to start of day

	flatpickrInstance = flatpickr(dateInput, {
		minDate: "today",
		dateFormat: "Y-m-d",
		enable: [
			function(date) {
				// Enable only dates that are in the future and correspond to an available day of the week
				const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
				const isAvailableDay = availableDays.includes(dayOfWeek);
				const isFutureDate = date.getTime() >= today.getTime();
				return isAvailableDay && isFutureDate;
			}
		],
		onChange: function(selectedDates, dateStr, instance) {
			if (selectedDates.length > 0) {
				const selectedDate = selectedDates[0];
				const selectedDayOfWeek = selectedDate.toLocaleString('en-US', { weekday: 'long' });
				populateAvailableTimes(selectedDayOfWeek, weeklySchedule);
			} else {
				// Clear times if date is cleared
				availableTimesSelect.innerHTML = '<option value="" disabled selected>Select Time</option>';
			}
		}
	});
}

function populateAvailableTimes(selectedDayOfWeek, weeklySchedule) {
	availableTimesSelect.innerHTML = '<option value="" disabled selected>Select Time</option>'; // Clear previous options

	const scheduleForDay = weeklySchedule.find(schedule => schedule.dayOfWeek === selectedDayOfWeek);

	if (scheduleForDay && scheduleForDay.timeSlots.length > 0) {
		scheduleForDay.timeSlots.forEach(slot => {
			const option = document.createElement('option');
			option.value = slot;
			option.textContent = slot;
			availableTimesSelect.appendChild(option);
		});
		availableTimesSelect.disabled = false;
	} else {
		availableTimesSelect.disabled = true;
		const option = document.createElement('option');
		option.value = "";
		option.textContent = "No times available for this day";
		option.disabled = true;
		option.selected = true;
		availableTimesSelect.appendChild(option);
	}
}

function handleAvailableTimesClick() {
	const selectedDate = dateInput.value;
	const selectedTime = availableTimesSelect.value;
	if (selectedDate && selectedTime) {
		const appointmentDateTime = new Date(`${selectedDate}T${selectedTime}`);
		const now = new Date();

		if (appointmentDateTime <= now) {
			showErrorModal(translations[currentLanguage].errorTitle, translations[currentLanguage].pastTimeAlert);
			availableTimesSelect.value = ""; // Reset time selection
		}
	}
}

function toggleLanguage() {
	currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
	updateLanguage();
	// Reorder name fields based on language direction
	reorderNameFields();
}

function updatePlaceholders() {
	firstName.placeholder = translations[currentLanguage].firstNamePlaceholder;
	lastName.placeholder = translations[currentLanguage].lastNamePlaceholder;
	phone.placeholder = translations[currentLanguage].phonePlaceholder;
	email.placeholder = translations[currentLanguage].emailPlaceholder;
	age.placeholder = translations[currentLanguage].agePlaceholder;
	reason.placeholder = translations[currentLanguage].reasonPlaceholder;
	document.getElementById('insuranceID').placeholder = translations[currentLanguage].insuranceIDPlaceholder;
}

function reorderNameFields() {
	const nameGroup = document.querySelector('.form-group.name-group');
	if (nameGroup) {
		if (currentLanguage === 'ar') {
			nameGroup.classList.add('ar-layout');
		} else {
			nameGroup.classList.remove('ar-layout');
		}
	}
}

function updateLanguage() {
	const currentTranslations = translations[currentLanguage];

	// Update form titles and section titles
	document.getElementById('formTitle').textContent = currentTranslations.formTitle;
	document.getElementById('appointmentDetailsTitle').textContent = currentTranslations.sectionTitle;

	// Update labels
	document.getElementById('labelFirstName').textContent = currentTranslations.labelFirstName;
	document.getElementById('labelLastName').textContent = currentTranslations.labelLastName;
	document.getElementById('labelPhone').textContent = currentTranslations.labelPhone;
	document.getElementById('labelEmail').textContent = currentTranslations.labelEmail;
	document.getElementById('labelGender').textContent = currentTranslations.labelGender;
	document.getElementById('labelAge').textContent = currentTranslations.labelAge;
	document.getElementById('labelDate').textContent = currentTranslations.labelDate;
	document.getElementById('labelTime').textContent = currentTranslations.labelTime;
	document.getElementById('labelDepartment').textContent = currentTranslations.labelDepartment;
	document.getElementById('labelDoctor').textContent = currentTranslations.labelDoctor;
	document.getElementById('labelReason').textContent = currentTranslations.labelReason;
	document.getElementById('labelTerms').textContent = currentTranslations.labelTerms;
	document.getElementById('labelInsuranceID').textContent = currentTranslations.labelInsuranceID;
	document.getElementById('labelInsuranceProvider').textContent = currentTranslations.labelInsuranceProvider;

	// Update button texts
	submitBtn.textContent = currentTranslations.submitBtn;
	langButton.textContent = currentTranslations.switchLang;
	closeModalBtn.textContent = currentTranslations.closeBtn;
	document.getElementById('closeErrorModalBtn').textContent = currentTranslations.closeBtn;

	// Update modal content
	document.getElementById('confirmationModalTitle').textContent = currentTranslations.modalTitle;
	document.getElementById('confirmationModalMessage').textContent = currentTranslations.modalMessage;

	// Update select options
	updateSelectOptions('patientGender', currentTranslations.genderOptions);
	updateSelectOptions('departmentSelect', currentTranslations.departmentOptions);
	updateSelectOptions('insuranceProvider', currentTranslations.insuranceOptions);

	// Update placeholders
	updatePlaceholders();

	// Adjust text direction for Arabic
	document.body.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
	document.body.lang = currentLanguage;
}

function updateSelectOptions(selectId, options) {
	const selectElement = document.getElementById(selectId);
	if (!selectElement) return; // Guard against null element

	const currentValue = selectElement.value; // Store the currently selected value

	selectElement.innerHTML = ''; // Clear existing options

	options.forEach((optionText, index) => {
		const option = document.createElement('option');
		option.textContent = optionText;
		if (index === 0) { // Assuming the first option is always the "Select" placeholder
			option.value = '';
			option.disabled = true;
			option.selected = true;
		} else {
			// Use the optionText itself as the value for other options
			option.value = optionText;
		}
		selectElement.appendChild(option);
	});

	// Attempt to restore the previously selected value, if it still exists
	if (currentValue && Array.from(selectElement.options).some(option => option.value === currentValue)) {
		selectElement.value = currentValue;
	}
}

function initFormValidation() {
	const inputs = appointmentForm.querySelectorAll('input, select, textarea');
	inputs.forEach(input => {
		input.addEventListener('input', () => validateInput(input));
		input.addEventListener('change', () => validateInput(input)); // For select elements
	});
}

function validateInput(input) {
	let isValid = true;
	let errorMessage = '';

	const value = input.value.trim();
	const type = input.type;
	const id = input.id;

	// Clear previous error
	hideError(input);

	switch (id) {
		case 'patientFirstName':
		case 'patientLastName':
			if (value.length < 2) {
				isValid = false;
				errorMessage = 'Name must be at least 2 characters.';
			}
			break;
		case 'patientPhone':
			if (!isValidPhone(value)) {
				isValid = false;
				errorMessage = 'Enter a valid 11-digit phone number.';
			}
			break;
		case 'patientEmail':
			if (!isValidEmail(value)) {
				isValid = false;
				errorMessage = 'Enter a valid email address.';
			}
			break;
		case 'patientAge':
			const age = parseInt(value);
			if (isNaN(age) || age < 0 || age > 120) {
				isValid = false;
				errorMessage = 'Enter a valid age (0-120).';
			}
			break;
		case 'appointmentDate':
			if (!value) {
				isValid = false;
				errorMessage = 'Please select a date.';
			}
			break;
		case 'availableTimes':
			if (!value) {
				isValid = false;
				errorMessage = 'Please select a time.';
			}
			break;
		case 'departmentSelect':
		case 'doctorSelect':
		case 'patientGender':
		case 'insuranceProvider':
			if (!value) {
				isValid = false;
				errorMessage = 'Please select an option.';
			}
			break;
		case 'reason':
			if (value.length < 10) {
				isValid = false;
				errorMessage = 'Please describe your reason for visit (min 10 characters).';
			}
			break;
		case 'insuranceID':
			// Only validate if insurance provider is selected and not 'None/Self-pay'
			const insuranceProvider = document.getElementById('insuranceProvider').value;
			if (insuranceProvider && insuranceProvider !== 'None/Self-pay' && !value) {
				isValid = false;
				errorMessage = 'Please enter your insurance ID.';
			}
			break;
	}

	if (!isValid) {
		showError(input, errorMessage);
	}
	return isValid;

	function hideError(input) {
		const formGroup = input.closest('.form-group');
		if (formGroup) {
			const errorElement = formGroup.querySelector('.error-message');
			if (errorElement) {
				errorElement.textContent = '';
				errorElement.style.display = 'none';
			}
			input.classList.remove('input-error');
		}
	}
}

function showError(input, message) {
	const formGroup = input.closest('.form-group');
	if (formGroup) {
		let errorElement = formGroup.querySelector('.error-message');
		if (!errorElement) {
			errorElement = document.createElement('div');
			errorElement.classList.add('error-message');
			formGroup.appendChild(errorElement);
		}
		errorElement.textContent = message;
		errorElement.style.display = 'block';
		input.classList.add('input-error');
	}
}

function isValidEmail(email) {
	// Basic email validation regex
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
	// Basic 11-digit phone number validation
	return /^\d{11}$/.test(phone);
}

function validateForm() {
	let allValid = true;
	const inputs = appointmentForm.querySelectorAll('input:not([type="hidden"]), select, textarea');
	inputs.forEach(input => {
		if (!validateInput(input)) {
			allValid = false;
		}
	});
	// Special check for terms and privacy policy checkbox
	const termsCheckbox = document.getElementById('termsCheckbox');
	if (termsCheckbox && !termsCheckbox.checked) {
		showError(termsCheckbox.closest('.form-group'), 'You must agree to the terms and privacy policy.');
		allValid = false;
	} else if (termsCheckbox) {
		hideError(termsCheckbox.closest('.form-group'));
	}
	return allValid;
}

function showConfirmationModal() {
	confirmationModal.style.display = 'block';
}

async function handleFormSubmit(event) {
	event.preventDefault(); // Prevent default form submission

	// Clear previous validation messages
	clearValidationMessages();

	if (!validateForm()) {
		console.log('Form validation failed.');
		return; // Stop if form is not valid
	}

	// Show loading indicator
	submitBtn.disabled = true;
	submitLoader.style.display = 'inline-block';
	submitBtn.textContent = translations[currentLanguage].processing; // Update button text

	const formData = {
		patientFirstName: firstName.value.trim(),
		patientLastName: lastName.value.trim(),
		patientPhone: phone.value.trim(),
		patientEmail: email.value.trim(),
		patientGender: document.getElementById('patientGender').value,
		patientAge: parseInt(age.value),
		appointmentDate: dateInput.value,
		appointmentTime: availableTimesSelect.value,
		department: departmentSelect.value,
		doctor: doctorSelect.value, // This will be the doctor's _id
		reason: reason.value.trim(),
		insuranceProvider: document.getElementById('insuranceProvider').value,
		insuranceID: document.getElementById('insuranceID').value.trim()
	};

	try {
		const response = await fetch('/book-appointment', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(formData),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || 'Failed to book appointment');
		}

		const result = await response.json();
		console.log('Appointment booked:', result);

		// Show confirmation modal
		showConfirmationModal();

		// Optionally, clear the form after successful submission
		appointmentForm.reset();
		clearWeeklyScheduleInputs(); // Clear any dynamic schedule inputs
		availableDatesInput.value = ''; // Clear date input
		availableTimesSelect.innerHTML = '<option value="" disabled selected>Select Time</option>'; // Clear time input
		availableTimesSelect.disabled = true; // Disable time input

		// Reset doctor and department selects to their initial state (placeholder)
		departmentSelect.value = '';
		doctorSelect.value = '';
		doctorSelect.innerHTML = '<option value="" disabled selected>Select Doctor</option>';
		doctorSelect.disabled = true; // Disable doctor select until department is chosen

	} catch (error) {
		console.error('Error booking appointment:', error);
		showErrorModal('Booking Error', error.message);
	} finally {
		// Hide loading indicator
		submitBtn.disabled = false;
		submitLoader.style.display = 'none';
		submitBtn.textContent = translations[currentLanguage].submitBtn; // Restore button text
	}
}

function clearValidationMessages() {
	document.querySelectorAll('.error-message').forEach(el => {
		el.textContent = '';
		el.style.display = 'none';
	});
	document.querySelectorAll('.input-error').forEach(el => {
		el.classList.remove('input-error');
	});
}

function showConfirmationModal() {
	confirmationModal.style.display = 'block';
}

function showErrorModal(title, message) {
	document.getElementById('errorModalTitle').textContent = title;
	document.getElementById('errorModalMessage').textContent = message;
	errorModal.style.display = 'block';
}

function addInsuranceFields() {
	const insuranceDetailsDiv = document.getElementById('insuranceDetails');
	const insuranceProviderSelect = document.getElementById('insuranceProvider');
	const insuranceIdInput = document.getElementById('insuranceID');

	// Initially hide the insurance ID field
	insuranceDetailsDiv.style.display = 'none';

	insuranceProviderSelect.addEventListener('change', () => {
		if (insuranceProviderSelect.value && insuranceProviderSelect.value !== 'None/Self-pay') {
			insuranceDetailsDiv.style.display = 'block';
			insuranceIdInput.required = true; // Make ID required if a provider is selected
		} else {
			insuranceDetailsDiv.style.display = 'none';
			insuranceIdInput.required = false;
			insuranceIdInput.value = ''; // Clear value if hidden
		}
	});
}

function clearWeeklyScheduleInputs() {
	// This function might need to be adjusted based on how weekly schedules are displayed and cleared.
	// For now, it will just clear any time slot inputs if they exist.
	document.querySelectorAll('.time-slots-input').forEach(input => {
		input.value = '';
	});
	document.querySelectorAll('input[type="checkbox"][data-day-of-week]').forEach(checkbox => {
		checkbox.checked = false;
	});
}

// Fetch departments and doctors
async function fetchDepartments() {
	try {
		const response = await fetch('/api/departments');
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const departments = await response.json();
		populateDepartments(departments.data);
	} catch (error) {
		console.error('Error fetching departments:', error);
		showErrorModal('Error', 'Failed to load departments.');
	}
}

function populateDepartments(departments) {
	departmentSelect.innerHTML = '<option value="" disabled selected>Select Department</option>';
	departments.forEach(department => {
		const option = document.createElement('option');
		option.value = department._id; // Use _id as the value
		option.textContent = department.departmentName;
		departmentSelect.appendChild(option);
	});
}

async function fetchDoctorsByDepartment(departmentId) {
	try {
		const response = await fetch(`/api/doctors/department/${departmentId}`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const doctors = await response.json();
		populateDoctors(doctors.data);
	} catch (error) {
		console.error('Error fetching doctors:', error);
		showErrorModal('Error', 'Failed to load doctors for this department.');
	}
}

function populateDoctors(doctors) {
	doctorSelect.innerHTML = '<option value="" disabled selected>Select Doctor</option>';
	if (doctors.length > 0) {
		doctorSelect.disabled = false;
		doctors.forEach(doctor => {
			const option = document.createElement('option');
			option.value = doctor._id;
			option.textContent = `${doctor.userId.FName} ${doctor.userId.LName} - ${doctor.specialization}`;
			// Store weekly schedule as a data attribute
			option.dataset.weeklySchedule = JSON.stringify(doctor.weeklySchedule || []);
			doctorSelect.appendChild(option);
		});
	} else {
		doctorSelect.disabled = true;
		const option = document.createElement('option');
		option.value = "";
		option.textContent = "No doctors available in this department";
		option.disabled = true;
		option.selected = true;
		doctorSelect.appendChild(option);
	}
}

// Event listener for department selection
document.addEventListener('DOMContentLoaded', () => {
	fetchDepartments(); // Load departments on page load

	departmentSelect.addEventListener('change', async () => {
		const selectedDepartmentId = departmentSelect.value;
		if (selectedDepartmentId) {
			await fetchDoctorsByDepartment(selectedDepartmentId);
		} else {
			// Reset doctor select if no department is selected
			doctorSelect.innerHTML = '<option value="" disabled selected>Select Doctor</option>';
			doctorSelect.disabled = true;
			// Clear date and time if department is unselected
			availableDatesInput.value = '';
			availableTimesSelect.innerHTML = '<option value="" disabled selected>Select Time</option>';
			availableTimesSelect.disabled = true;
			if (flatpickrInstance) {
				flatpickrInstance.destroy(); // Destroy Flatpickr instance
			}
			availableDatesInput.placeholder = "Select an appointment date"; // Reset placeholder
			availableDatesInput.disabled = false; // Enable date input
		}
	});

	langButton.addEventListener('click', toggleLanguage);
});