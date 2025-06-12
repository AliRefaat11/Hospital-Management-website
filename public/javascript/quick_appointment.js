const today = new Date().toISOString().split('T')[0];
document.getElementById("quickDate").setAttribute("min", today);

// Set maximum date to December 2025
const maxDate = "2025-12-31";
document.getElementById("quickDate").setAttribute("max", maxDate);

// Error modal elements (added for consistency with book_appointment.js)
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

// Function to show custom error modal
function showErrorModal(title, message) {
  document.getElementById('errorModalTitle').textContent = title;
  document.getElementById('errorModalMessage').textContent = message;
  document.getElementById('closeErrorModalBtn').textContent = currentLanguage === 'en' ? 'Close' : 'إغلاق';
  errorModal.style.display = 'flex';
}

// Form submission handling for AJAX
document.getElementById("quickAppointmentForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  
  // Reset error states
  const inputs = this.querySelectorAll("input, select");
  inputs.forEach(input => {
    input.classList.remove("error");
    const errorId = input.id.replace("quick", "").toLowerCase() + "Error";
    const errorElement = document.getElementById(errorId);
    if (errorElement) errorElement.style.display = "none";
  });
  
  // Get form values
  const firstName = document.getElementById("quickFirstName").value.trim();
  const lastName = document.getElementById("quickLastName").value.trim();
  const phone = document.getElementById("quickPhone").value.trim();
  const email = document.getElementById("quickEmail").value.trim();
  const department = document.getElementById("quickDepartment").value; // This is department ID
  const doctor = document.getElementById("quickDoctor").value; // This is doctor ID
  const date = document.getElementById("quickDate").value;
  const time = document.getElementById("quickTime").value;
  const notes = document.getElementById("quickNotes").value.trim();
  
  // Validation flags
  let hasErrors = false;
  
  // Name validation
  if (firstName === '') {
    document.getElementById("quickFirstName").classList.add("error");
    document.getElementById("firstNameError").style.display = "block";
    hasErrors = true;
  }
  
  if (lastName === '') {
    document.getElementById("quickLastName").classList.add("error");
    document.getElementById("lastNameError").style.display = "block";
    hasErrors = true;
  }
  
  // Phone number validation
  if (!/^\d{11}$/.test(phone)) {
    document.getElementById("quickPhone").classList.add("error");
    document.getElementById("phoneError").style.display = "block";
    hasErrors = true;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    document.getElementById("quickEmail").classList.add("error");
    document.getElementById("emailError").style.display = "block";
    hasErrors = true;
  }
  
  // Date validation
  const selectedDate = new Date(date);
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);  // Reset time part for comparison
  
  if (selectedDate < currentDate) {
    document.getElementById("quickDate").classList.add("error");
    document.getElementById("dateError").style.display = "block";
    hasErrors = true;
  }
  
  // Time validation (assuming clinic hours 9 AM - 5 PM)
  const timeHour = parseInt(time.split(":")[0]);
  const timeMinutes = parseInt(time.split(":")[1]);
  
  if (timeHour < 9 || timeHour >= 17) {
    document.getElementById("quickTime").classList.add("error");
    document.getElementById("timeError").style.display = "block";
    hasErrors = true;
  }
  
  // Check if selected date is today and time is in the past
  const currentDateTime = new Date();
  const isToday = selectedDate.getDate() === currentDateTime.getDate() && 
                  selectedDate.getMonth() === currentDateTime.getMonth() && 
                  selectedDate.getFullYear() === currentDateTime.getFullYear();
                  
  if (isToday) {
    const currentHour = currentDateTime.getHours();
    const currentMinutes = currentDateTime.getMinutes();
    
    if (timeHour < currentHour || (timeHour === currentHour && timeMinutes <= currentMinutes)) {
      showErrorModal(translations.en.errorTitle || 'Invalid Time', translations.en.pastTimeAlert);
      document.getElementById("quickTime").classList.add("error");
      document.getElementById("timeError").style.display = "block";
      hasErrors = true;
    }
  }
  
  // Add validation for department and doctor selection
  if (department === '') {
    document.getElementById("quickDepartment").classList.add("error");
    document.getElementById("departmentError").style.display = "block";
    hasErrors = true;
  }
  if (doctor === '') {
    document.getElementById("quickDoctor").classList.add("error");
    document.getElementById("doctorError").style.display = "block";
    hasErrors = true;
  }

  if (hasErrors) {
    return;
  }
  
  // Combine first and last name for full name
  const fullName = `${firstName} ${lastName}`;
  
  // Data to send to backend
  const appointmentData = {
    firstName,
    lastName,
    phone,
    email,
    department, // This is department ID
    doctor,     // This is doctor ID
    date,
    time,
    notes
  };
  
  // Show loading state
  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = translations[currentLanguage].processing; // Update button text to processing
  
  try {
    const response = await fetch(this.action, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData)
    });

    const result = await response.json();

    if (response.ok) {
      // Success: Show confirmation modal
      document.getElementById("modalTitle").textContent = translations[currentLanguage].modalTitle;
      document.getElementById("modalMessage").textContent = translations[currentLanguage].modalMessage;
      
      // Display appointment details in modal using backend response or current form data
      const departmentName = document.querySelector(`#quickDepartment option[value="${department}"]`).textContent;
      const doctorName = document.querySelector(`#quickDoctor option[value="${doctor}"]`).textContent; // Get doctor name for display
      const formattedDate = new Date(date).toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = new Date(`2000-01-01T${time}`).toLocaleTimeString(currentLanguage === 'en' ? 'en-US' : 'ar-EG', {
        hour: '2-digit',
        minute: '2-digit'
      });

      document.getElementById("appointmentDetails").innerHTML = `
        <div style="background-color: #f5f7fa; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: ${currentLanguage === 'ar' ? 'right' : 'left'};">
          <p><strong>${currentLanguage === 'en' ? 'Name' : 'الاسم'}:</strong> ${fullName}</p>
          <p><strong>${currentLanguage === 'en' ? 'Department' : 'القسم'}:</strong> ${departmentName}</p>
          <p><strong>${currentLanguage === 'en' ? 'Doctor' : 'الطبيب'}:</strong> ${doctorName}</p>
          <p><strong>${currentLanguage === 'en' ? 'Date' : 'التاريخ'}:</strong> ${formattedDate}</p>
          <p><strong>${currentLanguage === 'en' ? 'Time' : 'الوقت'}:</strong> ${formattedTime}</p>
        </div>
      `;
      document.getElementById("quickModal").style.display = "flex";
      this.reset(); // Reset form

    } else {
      // Error from backend: Show error modal
      showErrorModal(translations.en.errorTitle || 'Error', result.message || 'An unknown error occurred.');
    }

  } catch (error) {
    console.error('Error during form submission:', error);
    showErrorModal(translations.en.errorTitle || 'Error', 'Failed to connect to the server. Please try again later.');
  } finally {
    submitBtn.disabled = false; // Re-enable button
    submitBtn.textContent = translations[currentLanguage].submitBtn; // Restore button text
  }
});

// Modal close button
document.getElementById("modalCloseBtn").addEventListener("click", function() {
  document.getElementById("quickModal").style.display = "none";
});

// Language toggle functionality
let currentLanguage = 'en';

// Department translations
const departmentTranslations = {
  en: {
    "cardiology": "Cardiology",
    "dermatology": "Dermatology",
    "pediatrics": "Pediatrics",
    "neurology": "Neurology",
    "orthopedics": "Orthopedics",
    "dentistry": "Dentistry"
  },
  ar: {
    "cardiology": "أمراض القلب",
    "dermatology": "الأمراض الجلدية",
    "pediatrics": "طب الأطفال",
    "neurology": "الأمراض العصبية",
    "orthopedics": "جراحة العظام",
    "dentistry": "طب الأسنان"
  }
};

function toggleLanguage() {
  currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
  setLanguage(currentLanguage);
}

function setLanguage(lang) {
  const translations = {
    en: {
      formTitle: "Quick Appointment",
      formSubtitle: "Schedule your doctor appointment in just a few steps",
      personalInfoTitle: "Personal Information",
      appointmentDetailsTitle: "Appointment Details",
      labelFirstName: "First Name",
      labelLastName: "Last Name",
      labelPhone: "Phone Number",
      labelEmail: "Email Address",
      labelDepartment: "Select Department",
      labelDate: "Appointment Date",
      labelTime: "Preferred Time",
      labelNotes: "Notes or Symptoms (optional)",
      submitBtn: "Request Appointment",
      modalTitle: "Appointment Request Received!",
      modalMessage: "Thank you for choosing Prime Care. We will confirm your appointment via phone or email shortly.",
      languageToggle: "Switch to Arabic",
      modalCloseBtn: "Close",
      errorTitle: "Error",
      pastTimeAlert: "You cannot book an appointment for a past time on the current day."
    },
    ar: {
      formTitle: "حجز موعد سريع",
      formSubtitle: "جدولة موعدك مع الطبيب في خطوات قليلة",
      personalInfoTitle: "المعلومات الشخصية",
      appointmentDetailsTitle: "تفاصيل الموعد",
      labelFirstName: "الاسم الأول",
      labelLastName: "اسم العائلة",
      labelPhone: "رقم الهاتف",
      labelEmail: "البريد الإلكتروني",
      labelDepartment: "اختر القسم",
      labelDate: "تاريخ الموعد",
      labelTime: "الوقت المفضل",
      labelNotes: "ملاحظات أو أعراض (اختياري)",
      submitBtn: "طلب موعد",
      modalTitle: "تم استلام طلب الموعد!",
      modalMessage: "شكرًا لاختيارك برايم كير. سنؤكد موعدك عبر الهاتف أو البريد الإلكتروني قريبًا.",
      languageToggle: "التبديل إلى الإنجليزية",
      modalCloseBtn: "إغلاق",
      errorTitle: "خطأ",
      pastTimeAlert: "لا يمكنك حجز موعد لوقت سابق في اليوم الحالي."
    }
  };
  
  const t = translations[lang];
  
  // Update text content
  document.getElementById("formTitle").textContent = t.formTitle;
  document.getElementById("formSubtitle").textContent = t.formSubtitle;
  document.getElementById("personalInfoTitle").textContent = t.personalInfoTitle;
  document.getElementById("appointmentDetailsTitle").textContent = t.appointmentDetailsTitle;
  document.getElementById("labelFirstName").textContent = t.labelFirstName;
  document.getElementById("labelLastName").textContent = t.labelLastName;
  document.getElementById("labelPhone").textContent = t.labelPhone;
  document.getElementById("labelEmail").textContent = t.labelEmail;
  document.getElementById("labelDepartment").textContent = t.labelDepartment;
  document.getElementById("labelDate").textContent = t.labelDate;
  document.getElementById("labelTime").textContent = t.labelTime;
  document.getElementById("labelNotes").textContent = t.labelNotes;
  document.getElementById("submitBtn").textContent = t.submitBtn;
  document.getElementById("modalTitle").textContent = t.modalTitle;
  document.getElementById("modalMessage").textContent = t.modalMessage;
  document.getElementById("languageToggle").textContent = t.languageToggle;
  document.getElementById("modalCloseBtn").textContent = t.modalCloseBtn;
  
  // Update placeholders
  if (lang === 'ar') {
    document.getElementById("quickFirstName").placeholder = "أدخل اسمك الأول";
    document.getElementById("quickLastName").placeholder = "أدخل اسم العائلة";
    document.getElementById("quickPhone").placeholder = "رقم هاتف من 11 رقم";
    document.getElementById("quickEmail").placeholder = "بريدك@مثال.كوم";
    document.getElementById("quickNotes").placeholder = "صف بإيجاز أعراضك أو أي مخاوف محددة";
    document.querySelector("#quickDepartment option[disabled]").textContent = "اختر القسم الطبي";
  } else {
    document.getElementById("quickFirstName").placeholder = "Enter your first name";
    document.getElementById("quickLastName").placeholder = "Enter your last name";
    document.getElementById("quickPhone").placeholder = "11-digit phone number";
    document.getElementById("quickEmail").placeholder = "your.email@example.com";
    document.getElementById("quickNotes").placeholder = "Briefly describe your symptoms or any specific concerns";
    document.querySelector("#quickDepartment option[disabled]").textContent = "Choose medical department";
  }
  
  // Update department options text with translations
  const departmentOptions = document.querySelectorAll("#quickDepartment option:not([disabled])");
  departmentOptions.forEach(option => {
    const deptValue = option.value;
    if (deptValue && departmentTranslations[lang][deptValue]) {
      option.textContent = departmentTranslations[lang][deptValue];
    }
  });
  
  // Update body direction and text alignment
  document.body.style.direction = lang === 'ar' ? 'rtl' : 'ltr';
  
  // Update name row direction for RTL/LTR
  const nameRow = document.querySelector(".name-row");
  if (nameRow) {
    nameRow.style.flexDirection = lang === 'ar' ? 'row-reverse' : 'row';
  }
  
  // Update any appointment details currently displayed in modal
  if (document.getElementById("quickModal").style.display === "flex") {
    const departmentValue = document.getElementById("quickDepartment").value;
    let departmentName = "";
    
    if (departmentValue) {
      departmentName = departmentTranslations[lang][departmentValue] || "";
    }
    
    const date = document.getElementById("quickDate").value;
    const time = document.getElementById("quickTime").value;
    
    if (date && time) {
      const formattedDate = new Date(date).toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const formattedTime = new Date(`2000-01-01T${time}`).toLocaleTimeString(lang === 'en' ? 'en-US' : 'ar-EG', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Get first and last name for display
      const firstName = document.getElementById("quickFirstName").value || "";
      const lastName = document.getElementById("quickLastName").value || "";
      const fullName = firstName && lastName ? `${firstName} ${lastName}` : "";
      
      document.getElementById("appointmentDetails").innerHTML = `
        <div style="background-color: #f5f7fa; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: ${lang === 'ar' ? 'right' : 'left'};">
          <p><strong>${lang === 'en' ? 'Name' : 'الاسم'}:</strong> ${fullName}</p>
          <p><strong>${lang === 'en' ? 'Department' : 'القسم'}:</strong> ${departmentName}</p>
          <p><strong>${lang === 'en' ? 'Date' : 'التاريخ'}:</strong> ${formattedDate}</p>
          <p><strong>${lang === 'en' ? 'Time' : 'الوقت'}:</strong> ${formattedTime}</p>
        </div>
      `;
    }
  }
}