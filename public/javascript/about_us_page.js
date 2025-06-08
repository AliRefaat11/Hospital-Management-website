// Change greeting message dynamically based on the time of the day
const greetingElement = document.getElementById('dynamic-greeting');
const hour = new Date().getHours();

if (hour < 12) {
  greetingElement.textContent = "Good Morning! Welcome to Prime Care!";
} else if (hour < 18) {
  greetingElement.textContent = "Good Afternoon! Welcome to Prime Care!";
} else {
  greetingElement.textContent = "Good Evening! Welcome to Prime Care!";
}
