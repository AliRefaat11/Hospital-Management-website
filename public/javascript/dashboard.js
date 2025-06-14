document.addEventListener('DOMContentLoaded', async () => {
    const fetchData = async (endpoint) => {
      const res = await fetch(`/api/admin${endpoint}`);
      const { data } = await res.json();
      return data;
    };
  
    const totals = await fetchData('/stats/totals');
    const bloodTypes = await fetchData('/stats/patients-by-blood-type');
    const departments = await fetchData('/stats/doctors-by-department');
    const appointmentStatuses = await fetchData('/stats/appointments-by-status');
    const doctorAppointments = await fetchData('/stats/doctor-appointment-counts');
    const monthlyAppointments = await fetchData('/stats/monthly-appointments');
  
    // Populate totals
    const totalsDiv = document.getElementById('totals');
    Object.entries(totals).forEach(([key, value]) => {
      const div = document.createElement('div');
      div.innerHTML = `<strong>${key}</strong><br>${value}`;
      totalsDiv.appendChild(div);
    });
  
    // Chart helpers
    const createChart = (id, type, labels, data, label) => {
      new Chart(document.getElementById(id), {
        type,
        data: {
          labels,
          datasets: [{
            label,
            data,
            backgroundColor: [
              '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
            ]
          }]
        }
      });
    };
  
    // Convert data formats
    const extract = (list, key1, key2) => [list.map(i => i[key1]), list.map(i => i[key2])];
  
    createChart('bloodTypeChart', 'doughnut', ...extract(bloodTypes, 'bloodType', 'count'), 'Blood Type Count');
    createChart('departmentChart', 'pie', ...extract(departments, 'department', 'count'), 'Doctors per Department');
    createChart('appointmentStatusChart', 'bar', ...extract(appointmentStatuses, 'status', 'count'), 'Appointments by Status');
    createChart('doctorAppointmentsChart', 'bar', ...extract(doctorAppointments, 'doctorName', 'appointmentCount'), 'Appointments per Doctor');
    createChart('monthlyAppointmentsChart', 'line', ...extract(monthlyAppointments, 'month', 'count'), 'Monthly Appointments');
  });
  