// DOM
const searchForm = document.querySelector("#search");
const inputCountry = document.querySelector("#inputCountry");
const inputCity = document.querySelector("#inputCity");
const city = document.querySelector(".city");
const weather = document.querySelector(".weather");
const icon = document.querySelector(".weather-icon");
const temperature = document.querySelector(".temperature");
const feelsLike = document.querySelector(".feels-like");
const maxTemp = document.querySelector(".max-temp");
const minTemp = document.querySelector(".min-temp");
const humidity = document.querySelector(".humidity");
const windSpeed = document.querySelector(".wind-speed");
const errorMessageUI = document.querySelector(".error-message");
const geocodingErrorUI = document.querySelector(".geocoding-error");
const suggestions = document.querySelector(".suggestions");
const daily = document.querySelector(".daily");
const aDay = document.querySelector(".a-day");
const searchCityLabel = document.querySelector(".city-label");
const mainContainer = document.querySelector(".container");
const outliner = document.querySelector(".outliner");

// State
let currentCity = "Nara";
let currentCountry = "JP";
let currentLat = 33.2497182;
let currentLon = 132.6571726;
let currentDaily = "";
let dailyData = "";
let dateNow = document.querySelector(".date-now");

// Mapping icons
function getWeatherIcon(iconCode) {
  const map = {
    "01d": "fa-sun clear-day",
    "01n": "fa-moon",
    "02d": "fa-cloud-sun",
    "02n": "fa-cloud-moon",
    "03d": "fa-cloud",
    "03n": "fa-cloud",
    "04d": "fa-cloud-meatball",
    "04n": "fa-cloud-meatball",
    "09d": "fa-cloud-rain",
    "09n": "fa-cloud-rain",
    "10d": "fa-cloud-sun-rain",
    "10n": "fa-cloud-moon-rain",
    "11d": "fa-cloud-bolt",
    "11n": "fa-cloud-bolt",
    "13d": "fa-snowflake",
    "13n": "fa-snowflake",
    "50d": "fa-smog",
    "50n": "fa-smog",
  };

  return `<i class="fa-solid ${map[iconCode] || "fa-cloud"}"></i>`;
}

// Main Background
const setBackground = (weather) => {
  const mainBg = {
    Clear: "bg-clear.jpg",
    Clouds: "bg-clouds.jpg",
    Rain: "bg-rain.jpg",
    Snow: "bg-snow.jpg",
  };

  const cloudyWeather = [
    "Mist",
    "Smoke",
    "Haze",
    "Dust",
    "Fog",
    "Sand",
    "Ash",
    "Squall",
    "Tornado",
  ];

  let bg = mainBg.Clear;

  if (weather === "Clouds" || cloudyWeather.includes(weather)) {
    bg = mainBg.Clouds;
  } else if (["Rain", "Drizzle"].includes(weather)) {
    bg = mainBg.Rain;
  } else if (weather === "Snow") {
    bg = mainBg.Snow;
  }

  return `url(images/${bg})`;
};

// Show date now
dateNow.innerText = new Date().toISOString().split("T")[0];

// Save default country, city in local storage
const saveCity = () => localStorage.setItem("currentCity", currentCity);
const saveCountry = () =>
  localStorage.setItem("currentCountry", currentCountry);
const saveLat = () => localStorage.setItem("currentLat", currentLat);
const saveLon = () => localStorage.setItem("currentLon", currentLon);

// Helper
const kelvinToCelcius = (kelvin) => {
  return Math.round(kelvin - 273.15);
};

// Select and save Country
inputCountry.addEventListener("change", () => {
  let selectedCountry = inputCountry.value;
  localStorage.setItem("currentCountry", selectedCountry);
  currentCountry = localStorage.getItem("currentCountry");
});

// Run bounceGeocoding when user inputing city name
let debounceTimer;

inputCity.addEventListener("input", (e) => {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    getBounceGeocoding(e.target.value, currentCountry);
  }, 400);
});

// Get bounceGeocoding
const getBounceGeocoding = async (city, country) => {
  if (!city.trim()) {
    suggestions.innerHTML = "";
    const ul = document.createElement("ul");
    ul.classList.add("sugges-inner");
    const li = document.createElement("li");
    li.innerText = "Input a City name";
    ul.appendChild(li);
    suggestions.appendChild(ul);
    return;
  }

  errorMessageUI.innerText = "";

  try {
    const response = await fetch(
      // Mengguakan encodeURI untuk mencegah error jika user meneginput nama kota dengan spasi atau simbol
      `/api/geocoding?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`,
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Unkown error");
    }

    renderSuggestions(data);
  } catch (error) {
    errorMessageUI.textContent = "";

    const ul = document.createElement("ul");
    ul.classList.add("sugges-inner");
    const li = document.createElement("li");
    li.innerText = "Input a City name";

    if (error.message === "Failed to fetch") {
      li.textContent = "Can't access internal server";
    } else {
      li.textContent = error.message;
    }
    ul.appendChild(li);
    suggestions.appendChild(ul);
  }
};

// Render suggestions UI
const renderSuggestions = (places) => {
  suggestions.innerHTML = "";

  const ul = document.createElement("ul");
  ul.classList.add("sugges-inner");
  suggestions.appendChild(ul);

  if (!places.length == 0) {
    places.forEach((place) => {
      const li = document.createElement("li");
      li.textContent = `${place.name}, ${place.state ? place.state + "," : ""} ${place.country}`;

      ul.appendChild(li);

      li.addEventListener("click", () => {
        inputCity.value = place.name;
        suggestions.innerHTML = "";

        currentCity = place.name;
        currentLat = place.lat;
        currentLon = place.lon;

        getWeatherByCoords(currentLat, currentLon, currentCity);
        getForecast(currentLat, currentLon);

        // Save city, lat & lon
        saveCity();
        saveLat();
        saveLon();

        setTimeout(() => {
          if (document.activeElement !== inputCity) {
            inputCity.classList.remove("active");
            inputCity.value = "";
          }
        }, 5000);
      });
    });
  } else {
    const li = document.createElement("li");
    li.innerText = "City not found";
    ul.appendChild(li);
    suggestions.appendChild(ul);
  }
};

// Get weather by coordinats
const getWeatherByCoords = async (lat, lon, name) => {
  try {
    const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Unknown error");
    }

    let iconImage = `https://openweathermap.org/payload/api/media/file/${data.weather[0].icon}.png`;

    city.textContent = name;
    temperature.textContent = `${kelvinToCelcius(data.main.temp)}°C`;
    maxTemp.textContent = `${kelvinToCelcius(data.main.temp_max)}°C`;
    minTemp.textContent = `${kelvinToCelcius(data.main.temp_min)}°C`;
    weather.textContent = data.weather[0].main;
    icon.innerHTML = getWeatherIcon(data.weather[0].icon);
    feelsLike.textContent = `${kelvinToCelcius(data.main.feels_like)}°C`;
    humidity.textContent = data.main.humidity;
    windSpeed.textContent = data.wind.speed;

    outliner.style.backgroundImage = setBackground(data.weather[0].main);
  } catch (error) {
    errorMessageUI.textContent = "";
    errorMessageUI.textContent = error.message;
  }
};

// Get forecast
const getForecast = async (lat, lon) => {
  try {
    const response = await fetch(`/api/forecast?lat=${lat}&lon=${lon}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Unknown error");
    }

    // Get 24 Hour Forecast
    const now = new Date();
    const aDaysForecast = data.list
      .filter((item) => new Date(item.dt_txt) > now)
      .slice(0, 8);

    renderADay(aDaysForecast);

    // Grouping data by Day
    const grouped = {};

    data.list.forEach((item) => {
      const date = item.dt_txt.split(" ")[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }

      grouped[date].push(item);
    });

    // Get 5 days Min/Max Forecast, Average POP (Possible rain), Average Weather
    const dailyData = Object.keys(grouped).map((date) => {
      const items = grouped[date];
      const temps = items.map((item) => kelvinToCelcius(item.main.temp));
      const avgPop =
        items.reduce((sum, item) => sum + item.pop, 0) / items.length;
      const icons = items.map((item) => item.weather[0].icon);
      const iconsCount = {};
      icons.forEach((weather) => {
        iconsCount[weather] = (iconsCount[weather] || 0) + 1;
      });
      const avgIcon = Object.keys(iconsCount).reduce((acc, curr) =>
        iconsCount[acc] >= iconsCount[curr] ? acc : curr,
      );

      return {
        date,
        avgIcon,
        avgPop: Math.round(avgPop * 100),
        max: Math.max(...temps),
        min: Math.min(...temps),
      };
    });

    renderDaily(dailyData.slice(1));
  } catch (error) {
    errorMessageUI.textContent = "";
    errorMessageUI.textContent = error.message;
  }
};

// Render daily weather
const renderDaily = (data) => {
  daily.innerHTML = "";

  data.forEach((day) => {
    const date = new Date(day.date);
    const formatedDate = date.toLocaleDateString("en-US", { weekday: "short" });

    const card = document.createElement("div");
    card.classList.add("daily-item");

    card.innerHTML = `<p class="day">${formatedDate}</p><div class="daily-icon"><p>${getWeatherIcon(day.avgIcon)}</p><p class="possible-rain">${day.avgIcon === "10n" ? day.avgPop + "%" : ""}</p></div><p class="minmax"><span class="min">${day.min}°C</span> <span class="bar"></span> <span class="max">${day.max}°C</span></p>`;

    daily.appendChild(card);
  });
};

// Render a day forecast
const renderADay = (data) => {
  aDay.innerHTML = "";

  data.forEach((item) => {
    const temp = kelvinToCelcius(item.main.temp);

    // Convert time format to PM/AM without spacing
    const formatHourParts = (dateString) => {
      const date = new Date(dateString);
      const hour = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      });

      const [h, period] = hour.split(" ");
      return { hour: h, period };
    };

    const { hour, period } = formatHourParts(item.dt_txt);
    const box = document.createElement("div");
    box.classList.add("hourly-item");

    box.innerHTML = `<p class="time"><span class="time-hour">${hour}</span><span class="time-period">${period}</span></p><p class="temp">${temp}°C</p>`;

    aDay.appendChild(box);
  });
};

// Load current data from local storage
const savedCity = localStorage.getItem("currentCity");
const savedCountry = localStorage.getItem("currentCountry");
const savedLat = localStorage.getItem("currentLat");
const savedLon = localStorage.getItem("currentLon");

// Set current Country
if (savedCountry && savedCity && savedLat && savedLon) {
  inputCountry.value = savedCountry;
  currentCountry = savedCountry;
  currentCity = savedCity;
  currentLat = savedLat;
  currentLon = savedLon;
  getWeatherByCoords(currentLat, currentLon, currentCity);
  getForecast(currentLat, currentLon);
} else {
  saveCity();
  saveCountry();
  saveLat();
  saveLon();
  getWeatherByCoords(currentLat, currentLon, currentCity);
  getForecast(currentLat, currentLon);
}

// UI
searchCityLabel.addEventListener("click", () => {
  inputCity.classList.add("active");
  inputCity.focus();
});
