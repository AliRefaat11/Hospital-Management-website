// JavaScript source code
document.getElementById("appointmentForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const doctor = document.getElementById("doctor").value;

    if (!name || !email || !phone || !date || !time || !doctor) {
        alert("Please fill in all fields.");
        return;
    }

    const confirmationMessage = `
    Thank you, ${name}! Your appointment with ${doctor.replace("-", " ").toUpperCase()} 
    on ${date} at ${time} has been booked.`;

    document.getElementById("confirmationMessage").textContent = confirmationMessage;

    // Optionally clear the form
    document.getElementById("appointmentForm").reset();
});
