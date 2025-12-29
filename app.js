/***********************
  Weatherly — Current Weather
************************/

// OpenWeather API key:
const API_KEY = "aa487c5d396e440c257bd4827bd6d45a";

const CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather";

const form = document.getElementById("search-form");
const input = document.getElementById("location-input");

const placeName = document.getElementById("place-name");
const placeSub = document.getElementById("place-sub");

const iconEl = document.getElementById("weather-icon");
const conditionEl = document.getElementById("condition");
const tempEl = document.getElementById("temp");

const highEl = document.getElementById("high");
const lowEl = document.getElementById("low");
const humidityEl = document.getElementById("humidity");
const feelsEl = document.getElementById("feels");

const messageEl = document.getElementById("message");
const updatedEl = document.getElementById("updated");

function isZip(value) {
  return /^\d{5}$/.test(value.trim());
}

function iconUrl(code) {
  return `https://openweathermap.org/img/wn/${code}@2x.png`;
}

function fmtTemp(n) {
  return `${Math.round(n)}°F`;
}
function fmtHumidity(n) {
  return `${Math.round(n)}%`;
}
function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

function setLoading(on) {
  messageEl.textContent = on ? "Loading weather..." : "Ready when you are.";
}

async function fetchJson(url, params) {
  const qs = new URLSearchParams(params);
  const res = await fetch(`${url}?${qs.toString()}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message ? `Error: ${data.message}` : "Request failed.");
  }
  return data;
}

function updateUI(current) {
  const city = current.name;
  const country = current.sys?.country || "";
  const w = current.weather?.[0];
  const main = current.main;

  placeName.textContent = `${city}${country ? ", " + country : ""}`;
  placeSub.textContent = `Lat ${current.coord.lat.toFixed(2)} • Lon ${current.coord.lon.toFixed(2)}`;

  conditionEl.textContent = w ? cap(w.description) : "—";
  tempEl.textContent = main?.temp != null ? fmtTemp(main.temp) : "—";

  highEl.textContent = main?.temp_max != null ? fmtTemp(main.temp_max) : "—";
  lowEl.textContent = main?.temp_min != null ? fmtTemp(main.temp_min) : "—";
  humidityEl.textContent = main?.humidity != null ? fmtHumidity(main.humidity) : "—";
  feelsEl.textContent = main?.feels_like != null ? fmtTemp(main.feels_like) : "—";

  if (w?.icon) {
    iconEl.src = iconUrl(w.icon);
    iconEl.alt = w.description || "Weather icon";
  }

  updatedEl.textContent = `Updated: ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

async function runSearch(raw) {
  const value = raw.trim();
  if (!value) {
    messageEl.textContent = "Please enter a city or 5-digit ZIP code.";
    input.focus();
    return;
  }

  try {
    setLoading(true);

    const params = isZip(value)
      ? { zip: value, appid: API_KEY, units: "imperial" }
      : { q: value, appid: API_KEY, units: "imperial" };

    const current = await fetchJson(CURRENT_URL, params);
    updateUI(current);

    messageEl.textContent = "Current weather loaded.";
  } catch (err) {
    messageEl.textContent = err.message || "Could not load weather.";
  } finally {
    setLoading(false);
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  runSearch(input.value);
});

// Default city so it doesn’t start empty (change if you want)
runSearch("Smyrna");