const form = document.getElementById("search-form");
const input = document.getElementById("location-input");
const placeName = document.getElementById("place-name");
const messageEl = document.getElementById("message");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = input.value.trim();
  if (!value) {
    messageEl.textContent = "Please enter a city or ZIP.";
    return;
  }
  placeName.textContent = value;
  messageEl.textContent = "Next: fetch from OpenWeather.";
});