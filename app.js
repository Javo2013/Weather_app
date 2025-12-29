/***********************
  Weatherly — Current + Forecast
************************/

const API_KEY = "aa487c5d396e440c257bd4827bd6d45a";

const CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

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

const forecastGrid = document.getElementById("forecast-grid");

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
  if (!res.ok) throw new Error(data?.message ? `Error: ${data.message}` : "Request failed.");
  return data;
}

function updateCurrentUI(current) {
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

function localDateFromUTCSeconds(dtSeconds, tzOffsetSeconds) {
  return new Date((dtSeconds + tzOffsetSeconds) * 1000);
}
function dayLabel(dateObj) {
  return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(dateObj);
}
function shortDate(dateObj) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(dateObj);
}

// Build daily summaries from 3-hour forecast
function buildDailyForecast(list, tzOffsetSeconds) {
  const byDay = new Map();

  for (const item of list) {
    const d = localDateFromUTCSeconds(item.dt, tzOffsetSeconds);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

    if (!byDay.has(key)) {
      byDay.set(key, {
        date: d,
        min: item.main.temp_min,
        max: item.main.temp_max,
        humiditySum: item.main.humidity,
        humidityCount: 1,
        iconCounts: {},
        descCounts: {},
      });
    } else {
      const day = byDay.get(key);
      day.min = Math.min(day.min, item.main.temp_min);
      day.max = Math.max(day.max, item.main.temp_max);
      day.humiditySum += item.main.humidity;
      day.humidityCount += 1;
    }

    const day = byDay.get(key);
    const icon = item.weather?.[0]?.icon;
    const desc = item.weather?.[0]?.description;
    if (icon) day.iconCounts[icon] = (day.iconCounts[icon] || 0) + 1;
    if (desc) day.descCounts[desc] = (day.descCounts[desc] || 0) + 1;
  }

  const days = Array.from(byDay.values()).sort((a, b) => a.date - b.date);

  return days.slice(0, 5).map((d) => {
    const icon = Object.entries(d.iconCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "01d";
    const desc = Object.entries(d.descCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "forecast";
    const humidityAvg = d.humiditySum / d.humidityCount;

    return { date: d.date, min: d.min, max: d.max, humidity: humidityAvg, icon, desc };
  });
}

function renderForecast(days) {
  forecastGrid.innerHTML = "";

  if (!days.length) {
    forecastGrid.innerHTML = `<div class="day"><div class="left"><div class="dow">—</div><div class="desc">No forecast data</div></div></div>`;
    return;
  }

  for (const d of days) {
    const card = document.createElement("div");
    card.className = "day";

    const left = document.createElement("div");
    left.className = "left";

    const dow = document.createElement("div");
    dow.className = "dow";
    dow.textContent = `${dayLabel(d.date)} • ${shortDate(d.date)}`;

    const desc = document.createElement("div");
    desc.className = "desc";
    desc.textContent = cap(d.desc);

    const mini = document.createElement("div");
    mini.className = "mini";
    mini.textContent = `H ${fmtTemp(d.max)} • L ${fmtTemp(d.min)} • 💧 ${fmtHumidity(d.humidity)}`;

    left.appendChild(dow);
    left.appendChild(desc);
    left.appendChild(mini);

    const img = document.createElement("img");
    img.src = iconUrl(d.icon);
    img.alt = d.desc;

    card.appendChild(left);
    card.appendChild(img);

    forecastGrid.appendChild(card);
  }
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

    const [current, forecast] = await Promise.all([
      fetchJson(CURRENT_URL, params),
      fetchJson(FORECAST_URL, params),
    ]);

    updateCurrentUI(current);

    const tz = forecast.city?.timezone ?? 0;
    const days = buildDailyForecast(forecast.list, tz);
    renderForecast(days);

    messageEl.textContent = "Weather loaded successfully.";
  } catch (err) {
    messageEl.textContent = err.message || "Could not load weather.";
    forecastGrid.innerHTML = "";
  } finally {
    setLoading(false);
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  runSearch(input.value);
});

runSearch("Smyrna");