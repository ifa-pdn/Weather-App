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
const geocodingErrorUI = document.querySelector(".geocoding-error");
const suggestions = document.querySelector(".suggestions");
const daily = document.querySelector(".daily");
const aDay = document.querySelector(".a-day");
const searchCityLabel = document.querySelector(".city-label");
const mainContainer = document.querySelector(".container");
const outliner = document.querySelector(".outliner");
const mainContent = document.querySelector(".main-content");
const contentsLoader = document.querySelector(".contents-loader");
const SRButton = document.querySelector(".save-remove-btn");
const nextBtn = document.querySelector(".next-btn");
const prevBtn = document.querySelector(".prev-btn");
const navBtn = document.querySelectorAll(".nav");
const mainMessages = document.querySelector(".message");
const mainMessage = document.querySelector(".message-main");
const subMessage = document.querySelector(".message-sub");
const confirmBtn = document.querySelector(".confirm-btn");

// STATES

let currentCountry = "JP";
let activeCity = { name: "Nara", lat: 33.2497182, lon: 132.6571726 };
let currentDaily = "";
let dailyData = "";
let dateNow = document.querySelector(".date-now");
let cities = [];
let currentIndex = 0;
let debounceTimer;

// FUNCTION EXPRESSIONS

// Save current Index
const saveCurrentIndex = () => {
  localStorage.setItem("currentIndex", currentIndex);
};

// Get currnet Index
const getCurrentIndex = () => {
  currentIndex = cities.findIndex((item) => item.name === activeCity.name);
  saveCurrentIndex();
};

// Save Cities
const saveCities = () => {
  localStorage.setItem("cities", JSON.stringify(cities));
};

// Save active City
const saveActiveCity = () => {
  localStorage.setItem("activeCity", JSON.stringify(activeCity));
};

// Get current cities from local storage
const loadCities = () => {
  cities = JSON.parse(localStorage.getItem("cities")) || [];
};

// Checking city existence
const checkExistence = () =>
  cities.some(
    (item) => item.name.toLowerCase() === activeCity.name.toLowerCase(),
  );

// Save/Remove City function
const saveRemoveCity = () => {
  const existence = checkExistence();

  if (!existence) {
    addCity(activeCity);
  } else {
    removeCity();
  }
};

// Add City
const addCity = (newCity) => {
  if (cities.length < 5) {
    cities.push(newCity);
    saveCities();
    getCurrentIndex();
    navBtnToggle();
  } else {
    mainMessages.classList.add("active");
    mainMessage.textContent = "You already have 5 saved cities";
    subMessage.textContent = "Remove one to add a new City.";

    return;
  }
};

confirmBtn.addEventListener("click", () =>
  mainMessages.classList.remove("active"),
);

// Remove City
const removeCity = () => {
  cities.splice(currentIndex, 1);
  currentIndex--;

  if (cities.length === 0) {
    mainMessages.classList.add("active");
    mainMessage.textContent = "No saved cities";
    subMessage.textContent = "Find a city and tap save to add it here.";
    saveCities();
    saveActiveCity();
    getCurrentIndex();
    navBtnToggle();
    return;
  }

  if (currentIndex < 0) {
    currentIndex = cities.length - 1;
  }

  const city = cities[currentIndex];

  activeCity = {
    name: city.name,
    lat: city.lat,
    lon: city.lon,
  };

  getWeatherByCoords(city.lat, city.lon, city.name);

  saveCities();
  saveActiveCity();
  getCurrentIndex();
  navBtnToggle();
};

// Save/Remove City function
SRButton.addEventListener("click", () => {
  saveRemoveCity();
  SRButtonManager();
});

// Save/Remove button manager
const SRButtonManager = () => {
  const existence = checkExistence();

  if (!existence) {
    SRButton.textContent = "Save City";
  } else {
    SRButton.textContent = "Remove City";
  }
};

// Next/Prev buttons toogle function
const navBtnToggle = () => {
  navBtn.forEach((el) => {
    if (cities.length > 1) {
      el.classList.remove("disable");
    } else {
      el.classList.add("disable");
    }
  });
};

// Next button function
nextBtn.addEventListener("click", () => {
  if (cities.length <= 1) {
    return;
  }

  currentIndex = (currentIndex + 1) % cities.length;

  const next = {
    out: "left-out",
    in: "right-in",
  };

  mainContent.classList.add(next.out);
  mainContent.classList.add(next.out);

  getWeatherByCoords(
    cities[currentIndex].lat,
    cities[currentIndex].lon,
    cities[currentIndex].name,
    next,
  );

  activeCity = {
    name: cities[currentIndex].name,
    lat: cities[currentIndex].lat,
    lon: cities[currentIndex].lon,
  };

  saveActiveCity();
  getCurrentIndex();
  SRButtonManager();
});

// Prev button function
prevBtn.addEventListener("click", () => {
  if (cities.length <= 1) {
    return;
  }

  currentIndex = (currentIndex - 1 + cities.length) % cities.length;

  const prev = {
    out: "right-out",
    in: "left-in",
  };

  mainContent.classList.add(prev.out);

  getWeatherByCoords(
    cities[currentIndex].lat,
    cities[currentIndex].lon,
    cities[currentIndex].name,
    prev,
  );

  activeCity = {
    name: cities[currentIndex].name,
    lat: cities[currentIndex].lat,
    lon: cities[currentIndex].lon,
  };

  saveActiveCity();
  getCurrentIndex();
  SRButtonManager();
});

const slideDirection = (direction) => {
  if (!direction) return; // ✅ aman

  mainContent.classList.remove(direction.out);
  mainContent.classList.add(direction.in);
  mainContent.addEventListener(
    "animationend",
    () => {
      mainContent.classList.remove(direction.in);
    },
    { once: true },
  );
};

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

  return `url(./images/${bg})`;
};

// Save default country, city in local storage
const saveCountry = () => {
  localStorage.setItem("currentCountry", currentCountry);
  const saveCity = () => localStorage.setItem("currentCity", activeCity.name);
  const saveLat = () => localStorage.setItem("currentLat", activeCity.lat);
  const saveLon = () => localStorage.setItem("currentLon", activeCity.lon);
};

// Helper
const kelvinToCelsius = (kelvin) => {
  return Math.round(kelvin - 273.15);
};

// Select and save Country
inputCountry.addEventListener("change", () => {
  let selectedCountry = inputCountry.value;
  localStorage.setItem("currentCountry", selectedCountry);
  currentCountry = localStorage.getItem("currentCountry");
});

// Run bounceGeocoding when user inputing city name
inputCity.addEventListener("input", (e) => {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    getBounceGeocoding(e.target.value, currentCountry);
  }, 400);
});

// Get bounceGeocoding
const getBounceGeocoding = async (city, country) => {
  suggestions.innerHTML = "";

  if (!city.trim()) {
    const ul = document.createElement("ul");
    ul.classList.add("sugges-inner");
    const li = document.createElement("li");
    li.innerText = "Input a City name";
    ul.appendChild(li);
    suggestions.appendChild(ul);
    return;
  }

  const ul = document.createElement("ul");
  const li = document.createElement("li");
  ul.classList.add("sugges-inner");
  li.innerHTML = `<div class="search-loader"></div>`;
  ul.appendChild(li);
  suggestions.appendChild(ul);

  try {
    const response = await fetch(
      // Mengguakan encodeURI untuk mencegah error jika user menginput nama kota dengan spasi atau simbol
      `/api/geocoding?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`,
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Unkown error");
    }

    renderSuggestions(data);
  } catch (error) {
    const ul = document.createElement("ul");
    ul.classList.add("sugges-inner");
    const li = document.createElement("li");

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

  if (places.length !== 0) {
    places.forEach((place) => {
      const li = document.createElement("li");
      li.textContent = `${place.name}, ${place.state ? place.state + "," : ""} ${place.country}`;

      ul.appendChild(li);

      li.addEventListener("click", () => {
        inputCity.value = place.name;
        suggestions.innerHTML = "";

        getWeatherByCoords(place.lat, place.lon, place.name);
        getForecast(place.lat, place.lon);

        activeCity = { name: place.name, lat: place.lat, lon: place.lon };

        saveActiveCity();

        setTimeout(() => {
          if (document.activeElement !== inputCity) {
            inputCity.classList.remove("active");
            inputCity.value = "";
          }
        }, 5000);
        SRButtonManager();
        getCurrentIndex();
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
const getWeatherByCoords = async (lat, lon, name, direction = null) => {
  // mainContent.classList.add("hide");
  contentsLoader.classList.remove("hide");

  try {
    const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Unknown error");
    }

    // Get background URL
    const bgUrl = setBackground(data.weather[0].main);

    // Image loader
    const img = new Image();

    // get URL without "url(...)"
    const cleanUrl = bgUrl
      .replace('url("', "")
      .replace('")', "")
      .replace("url(", "")
      .replace(")", "");

    // set src
    img.src = cleanUrl;

    // Loading image
    img.onload = () => {
      // set background after loading image done
      const currentBg = document.querySelector(".bg.current");
      const nextBg = document.querySelector(".bg.next");

      nextBg.style.backgroundImage = bgUrl;

      // trigger reflow (penting biar transition kebaca)
      nextBg.offsetHeight;

      nextBg.style.opacity = 1;
      currentBg.style.opacity = 0;

      setTimeout(() => {
        currentBg.classList.remove("current");
        nextBg.classList.remove("next");

        currentBg.classList.add("next");
        nextBg.classList.add("current");

        // reset opacity biar siap untuk animasi berikutnya
        nextBg.style.opacity = 1;
        currentBg.style.opacity = 0;
      }, 400);

      // Show all data
      city.textContent = name;
      inputCountry.value = data.sys.country;
      temperature.textContent = `${kelvinToCelsius(data.main.temp)}°C`;
      maxTemp.textContent = `${kelvinToCelsius(data.main.temp_max)}°C`;
      minTemp.textContent = `${kelvinToCelsius(data.main.temp_min)}°C`;
      weather.textContent = data.weather[0].main;
      icon.innerHTML = getWeatherIcon(data.weather[0].icon);
      feelsLike.textContent = `${kelvinToCelsius(data.main.feels_like)}°C`;
      humidity.textContent = data.main.humidity;
      windSpeed.textContent = data.wind.speed;

      slideDirection(direction);
      contentsLoader.classList.add("hide");
    };
  } catch (error) {
    const ul = document.createElement("ul");
    ul.classList.add("sugges-inner");
    const li = document.createElement("li");

    if (error.message === "Failed to fetch") {
      li.textContent = "Can't access internal server";
    } else {
      li.textContent = error.message;
    }
    ul.appendChild(li);
    suggestions.appendChild(ul);
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
      const temps = items.map((item) => kelvinToCelsius(item.main.temp));
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
    const ul = document.createElement("ul");
    ul.classList.add("sugges-inner");
    const li = document.createElement("li");

    if (error.message === "Failed to fetch") {
      li.textContent = "Can't access internal server";
    } else {
      li.textContent = error.message;
    }
    ul.appendChild(li);
    suggestions.appendChild(ul);
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
    const temp = kelvinToCelsius(item.main.temp);

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

// Load current data
const loadCurrentData = () => {
  const savedCountry = localStorage.getItem("currentCountry");
  const savedActiveCity = JSON.parse(localStorage.getItem("activeCity"));

  if (savedCountry && savedActiveCity) {
    inputCountry.value = savedCountry;
    currentCountry = savedCountry;
    activeCity = savedActiveCity;
    getWeatherByCoords(activeCity.lat, activeCity.lon, activeCity.name);
    getForecast(activeCity.lat, activeCity.lon);
    getCurrentIndex();
  } else {
    saveCountry();
    saveActiveCity();
    getWeatherByCoords(activeCity.lat, activeCity.lon, activeCity.name);
    getForecast(activeCity.lat, activeCity.lon);
    getCurrentIndex();
  }
};

// Search City UI
const manageSearchField = () => {
  searchCityLabel.addEventListener("click", () => {
    inputCity.classList.add("active");
    inputCity.focus();
  });
};

// Display current date
const displayDate = () => {
  dateNow.innerText = new Date().toISOString().split("T")[0];
};

// App initialization
const appInit = () => {
  displayDate();
  manageSearchField();
  loadCities();
  loadCurrentData();
  SRButtonManager();
  navBtnToggle();
};

// APP INITIALIZATION

appInit();
