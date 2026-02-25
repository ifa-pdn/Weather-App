// DOM
const searchForm = document.querySelector("#search");
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

// State
let currentCity = "Nara";

// Save city name in local storage
const saveCity = () => localStorage.setItem("currentCity", currentCity);

// Search with city name function
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Validasi menggunakan method trim(), trim() mengembalikan string tanpa spasi / tab / new line di depan atau belakang string
  // Jika string kosong ("") akan dianggap false oleh if() dan jika ada string ("string") akan dianggap true oleh if()
  if (!inputCity.value.trim()) {
    errorMessageUI.innerText = "Input a City Name";
    return;
  }

  currentCity = inputCity.value.trim();

  getWeather(currentCity);
});

// Get weather information base on city name
const getWeather = async (currentCity) => {
  try {
    const response = await fetch(`/api/weather?city=${currentCity}`);

    const data = await response.json();

    if (!response.ok) {
      // data.error is the response from the catch backend
      // data.message is the response from the backend if(!response.ok)
      throw new Error(data.error || data.message || "Unknown error");
    }

    let iconImage = `https://openweathermap.org/payload/api/media/file/${data.weather[0].icon}.png`;

    city.textContent = data.name;
    temperature.textContent = data.main.temp;
    maxTemp.textContent = data.main.temp_max;
    minTemp.textContent = data.main.temp_min;
    weather.textContent = data.weather[0].main;
    icon.setAttribute("src", iconImage);
    feelsLike.textContent = data.main.feels_like;
    humidity.textContent = data.main.humidity;
    windSpeed.textContent = data.wind.speed;
    errorMessageUI.textContent = "";
    saveCity();
    inputCity.value = "";
  } catch (err) {
    // (err) is a variable to store the error thrown from if(!response.ok) above
    errorMessageUI.textContent =
      err.message === "Failed to fetch"
        ? "Can't connect to server"
        : err.message;
  }
};

// Load current city name from local storage
const savedCity = localStorage.getItem("currentCity");

// Run getWeather async function
if (savedCity) {
  currentCity = savedCity;
  getWeather(currentCity);
} else {
  getWeather(currentCity);
}
