const form = document.getElementById("search-form");
const input = document.getElementById("location-input");

const placeName = document.getElementById("place-name");
const placeSub = document.getElementById("place-sub");

const messageEl = document.getElementById("message");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = input.value.trim();
  if (!value) {
    messageEl.textContent = "Please enter a city or ZIP.";
    return;
  }

  placeName.textContent = value;
  placeSub.textContent = "Next: connect OpenWeather.";
  messageEl.textContent = "UI ready. Waiting on API call.";
});