const cityInput = document.querySelector(".city-input");
        const searchButton = document.querySelector(".search-btn");
        const locationButton = document.querySelector(".location-btn");
        const currentWeatherDiv = document.querySelector(".current-weather");
        const weatherCardsDiv = document.querySelector(".weather-cards");

        const API_KEY = "d9ae83d1a3ea25ea93b7f2d31a48c0e9"; // API key for OpenWeatherMap API

        const createWeatherCard = (cityName, weatherItem, index) => {
            if(index === 0) {
                return `<div class="details">
                            <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                            <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                            <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                            <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                        </div>
                        <div class="icon">
                            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                            <h6>${weatherItem.weather[0].description}</h6>
                        </div>`;
            } else {
                return `<li class="card">
                            <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                            <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                            <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                            <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                        </li>`;
            }
        }

        const getWeatherDetails = (cityName, latitude, longitude) => {
            const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

            fetch(WEATHER_API_URL)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    const uniqueForecastDays = [];
                    const fiveDaysForecast = data.list.filter(forecast => {
                        const forecastDate = new Date(forecast.dt_txt).getDate();
                        if (!uniqueForecastDays.includes(forecastDate)) {
                            return uniqueForecastDays.push(forecastDate);
                        }
                    });

                    cityInput.value = "";
                    currentWeatherDiv.innerHTML = "";
                    weatherCardsDiv.innerHTML = "";

                    fiveDaysForecast.forEach((weatherItem, index) => {
                        const html = createWeatherCard(cityName, weatherItem, index);
                        if (index === 0) {
                            currentWeatherDiv.insertAdjacentHTML("beforeend", html);
                        } else {
                            weatherCardsDiv.insertAdjacentHTML("beforeend", html);
                        }
                    });
                })
                .catch(error => {
                    console.error("Error fetching weather details:", error);
                    alert("An error occurred while fetching the weather forecast!");
                });
        }

        const getCityCoordinates = () => {
            const cityName = cityInput.value.trim();
            if (cityName === "") return;
            const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
            
            fetch(API_URL)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (!data.length) {
                        return alert(`No coordinates found for ${cityName}`);
                    }
                    const { lat, lon, name } = data[0];
                    getWeatherDetails(name, lat, lon);
                })
                .catch(error => {
                    console.error("Error fetching city coordinates:", error);
                    alert("An error occurred while fetching the coordinates!");
                });
        }

        const getUserCoordinates = () => {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
                    fetch(API_URL)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            return response.json();
                        })
                        .then(data => {
                            if (!data.length) {
                                return alert(`No city found for coordinates`);
                            }
                            const { name } = data[0];
                            getWeatherDetails(name, latitude, longitude);
                        })
                        .catch(error => {
                            console.error("Error fetching user coordinates:", error);
                            alert("An error occurred while fetching the city name!");
                        });
                },
                error => {
                    console.error("Geolocation error:", error);
                    if (error.code === error.PERMISSION_DENIED) {
                        alert("Geolocation request denied. Please reset location permission to grant access again.");
                    } else {
                        alert("Geolocation request error. Please reset location permission.");
                    }
                }
            );
        }

        locationButton.addEventListener("click", getUserCoordinates);
        searchButton.addEventListener("click", getCityCoordinates);
        cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());