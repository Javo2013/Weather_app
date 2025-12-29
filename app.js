const form = document.getElementById("search-form");
const input = document.getElementById("location-input");

const placeName = document.getElementById("place-name");
const placeSub = document.getElementById("place-sub");
const messageEl = document.getElementById("message");

function showMessage(text) {
  messageEl.textContent = text;
}

function runSearch(raw) {
  const value = raw.trim();
  if (!value) {
    showMessage("Please enter a city or 5-digit ZIP code.");
    input.focus();
    return;
  }

  placeName.textContent = value;
  placeSub.textContent = "Connecting to OpenWeather next.";
  showMessage("Looks good. API call comes next.");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  runSearch(input.value);
});


input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
  
  }
});