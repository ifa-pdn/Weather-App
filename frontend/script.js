// DOM
const searchForm = document.querySelector("#search");
const inputCity = document.querySelector("#inputCity");
const city = document.querySelector(".city");
const weather = document.querySelector(".weather");
const temperature = document.querySelector(".temperature");

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
    alert("Input a City Name");
    return;
  }

  currentCity = inputCity.value.trim();
  // city.textContent = currentCity;
  getWeather(currentCity);
  saveCity();
  inputCity.value = "";
});

// Get weather information base on city name
const getWeather = async (currentCity) => {
  try {
    const response = await fetch(`/api/weather?city=${currentCity}`);

    if (!response.ok) {
      const error = new Error("HTTP Error");
      error.status = response.status;
      throw error;
    }

    const data = await response.json();

    city.textContent = data.name;
    weather.textContent = data.weather[0].main;
    temperature.textContent = data.main.temp;
  } catch (error) {
    if (error.status) {
      console.log(`Request gagal ${error.status}`);
    } else {
      console.log("Terjadi Kesalahan");
    }
  }
};

// Load current city name from local storage
const savedCity = localStorage.getItem("currentCity");

// Run getWeather async function
if (savedCity) {
  currentCity = savedCity;
  city.textContent = savedCity;

  getWeather(currentCity);
} else {
  city.textContent = currentCity;

  getWeather(currentCity);
}
