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

// State
let currentCity = "Nara";
let currentCountry = "JP";
let currentLat = 33.2497182;
let currentLon = 132.6571726;
let currentDaily = "";
let dailyData = "";
let dateNow = document.querySelector(".date-now");

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

// Search with city name function
// searchForm.addEventListener("submit", (e) => {
//   e.preventDefault();

//   // Validasi menggunakan method trim(), trim() mengembalikan string tanpa spasi / tab / new line di depan atau belakang string
//   // Jika string kosong ("") akan dianggap false oleh if() dan jika ada string ("string") akan dianggap true oleh if()
//   if (!inputCity.value.trim()) {
//     errorMessageUI.innerText = "Input a City Name";
//     return;
//   }

//   currentCity = inputCity.value.trim();

//   getGeocoding(currentCity, currentCountry);
//   getWeather(currentCity);
// });

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
    errorMessageUI.innerText = "";
    errorMessageUI.innerText = "Input a City name";
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
    errorMessageUI.textContent = error.message;
  }
};

// Render suggestions UI
const renderSuggestions = (places) => {
  suggestions.innerHTML = "";

  if (!places.length == 0) {
    places.forEach((place) => {
      const li = document.createElement("li");
      li.textContent = `${place.name}, ${place.state ? place.state + "," : ""} ${place.country}`;
      suggestions.appendChild(li);

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
      });
    });
  } else {
    const li = document.createElement("li");
    li.innerText = "City not found";
    suggestions.appendChild(li);
  }
};

// Get weather by coordinats
const getWeatherByCoords = async (lat, lon, name) => {
  try {
    const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    const data = await response.json();

    if (!response.ok) {
      // data.error is the response from the catch backend
      // data.message is the response from the backend if(!response.ok)
      throw new Error(data.error || data.message || "Unknown error");
    }

    console.log("data:", data);

    let iconImage = `https://openweathermap.org/payload/api/media/file/${data.weather[0].icon}.png`;

    // const kelvinToCelcius = (kelvin) => {
    //   return Math.round(kelvin - 273.15);
    // };

    city.textContent = name;
    temperature.textContent = `${kelvinToCelcius(data.main.temp)}°C`; // Kelvin to Celcius
    maxTemp.textContent = `${kelvinToCelcius(data.main.temp_max)}°C`; // Kelvin to Celcius
    minTemp.textContent = `${kelvinToCelcius(data.main.temp_min)}°C`; // Kelvin to Celcius
    weather.textContent = data.weather[0].main;
    icon.setAttribute("src", iconImage);
    feelsLike.textContent = `${kelvinToCelcius(data.main.feels_like)}°C`; // Kelvin to Celcius
    humidity.textContent = data.main.humidity;
    windSpeed.textContent = data.wind.speed;
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

    // Get 5 (4?) days Min/Max Forecast, Average POP (Possible rain), Average Weather
    const dailyData = Object.keys(grouped).map((date) => {
      const items = grouped[date]; // Mengambil value dari object (dua cara mengambil value dari object: namaObject.key atau namaObject["key"])
      const temps = items.map((item) => kelvinToCelcius(item.main.temp));
      const avgPop =
        items.reduce((sum, item) => sum + item.pop, 0) / items.length;
      const weatherIcon = items.map((item) => item.weather[0].icon);
      const weatherCount = {};
      weatherIcon.forEach((weather) => {
        weatherCount[weather] = (weatherCount[weather] || 0) + 1;
      });
      const avgWeather = Object.keys(weatherCount).reduce((acc, curr) =>
        weatherCount[acc] >= weatherCount[curr] ? acc : curr,
      );

      return {
        date,
        avgWeather,
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

    card.innerHTML = `<p>${formatedDate}</p><div><p><img src='${"https://openweathermap.org/payload/api/media/file/" + day.avgWeather + ".png"}'></p><p>${day.avgWeather === "10n" ? day.avgPop + "%" : ""}</p></div><p>${day.min}°C / ${day.max}°C</p>`;

    daily.appendChild(card);
  });
};

// Render a day forecast
const renderADay = (data) => {
  aDay.innerHTML = "";

  data.forEach((item) => {
    const temp = kelvinToCelcius(item.main.temp);
    const time = item.dt_txt.split(" ")[1].substring(0, 5);

    const box = document.createElement("div");

    box.innerHTML = `<p>${time}</p><p>${temp}°C</p>`;

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
