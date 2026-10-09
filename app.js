// ========================================
// CONFIGURATION
// ========================================

import { API_KEY } from "./config.js";

const WEATHER_API_URL =
    "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_API_URL =
    "https://api.openweathermap.org/data/2.5/forecast";


// ========================================
// DOM ELEMENTS
// ========================================

const searchForm =
    document.querySelector("#searchForm");

const cityInput =
    document.querySelector("#cityInput");

const loading =
    document.querySelector("#loading");

const errorMessage =
    document.querySelector("#error");

const weatherResult =
    document.querySelector("#weatherResult");

const cityName =
    document.querySelector("#cityName");

const temperature =
    document.querySelector("#temperature");

const description =
    document.querySelector("#description");

const weatherIcon =
    document.querySelector("#weatherIcon");

const humidity =
    document.querySelector("#humidity");

const feelsLike =
    document.querySelector("#feelsLike");

const celsiusBtn =
    document.querySelector("#celsiusBtn");

const fahrenheitBtn =
    document.querySelector("#fahrenheitBtn");

const forecastContainer =
    document.querySelector("#forecastContainer");

const historyContainer =
    document.querySelector("#historyContainer");


// ========================================
// APPLICATION STATE
// ========================================

let currentWeatherData = null;

let currentUnit = "C";


// ========================================
// SHOW / HIDE ELEMENTS
// ========================================

const showLoading = () => {

    loading.classList.remove("hidden");

};


const hideLoading = () => {

    loading.classList.add("hidden");

};


const showError = (message) => {

    errorMessage.textContent = message;

    errorMessage.classList.remove("hidden");

    weatherResult.classList.add("hidden");

};


const hideError = () => {

    errorMessage.classList.add("hidden");

};


// ========================================
// TEMPERATURE CONVERSION
// ========================================

const convertTemperature = (celsius) => {

    if (currentUnit === "F") {

        return Math.round(
            (celsius * 9) / 5 + 32
        );

    }

    return Math.round(celsius);

};


const formatTemperature = (celsius) => {

    return `${convertTemperature(celsius)}°${currentUnit}`;

};


// ========================================
// UPDATE TEMPERATURE DISPLAY
// ========================================

const updateTemperatureDisplay = () => {

    if (!currentWeatherData) {
        return;
    }


    temperature.textContent =
        formatTemperature(
            currentWeatherData.main.temp
        );


    feelsLike.textContent =
        formatTemperature(
            currentWeatherData.main.feels_like
        );

};


// ========================================
// CHANGE TEMPERATURE UNIT
// ========================================

const setTemperatureUnit = (unit) => {

    currentUnit = unit;

    updateTemperatureDisplay();


    celsiusBtn.classList.toggle(
        "active",
        unit === "C"
    );


    fahrenheitBtn.classList.toggle(
        "active",
        unit === "F"
    );

};


// ========================================
// DISPLAY CURRENT WEATHER
// ========================================

const displayWeather = (data) => {

    currentWeatherData = data;

    const weather = data.weather[0];


    cityName.textContent =
        `${data.name}, ${data.sys.country}`;


    temperature.textContent =
        formatTemperature(
            data.main.temp
        );


    description.textContent =
        weather.description;


    weatherIcon.src =
        `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;


    weatherIcon.alt =
        `Ikon cuaca ${weather.description}`;


    humidity.textContent =
        `${data.main.humidity}%`;


    feelsLike.textContent =
        formatTemperature(
            data.main.feels_like
        );


    weatherResult.classList.remove(
        "hidden"
    );

};


// ========================================
// SAVE SEARCH HISTORY
// ========================================

const saveSearchHistory = (city) => {

    const history =
        JSON.parse(
            localStorage.getItem(
                "weatherHistory"
            )
        ) || [];


    const updatedHistory = [

        city,

        ...history.filter(
            (item) =>
                item.toLowerCase() !==
                city.toLowerCase()
        )

    ].slice(0, 5);


    localStorage.setItem(
        "weatherHistory",
        JSON.stringify(updatedHistory)
    );


    displaySearchHistory();

};


// ========================================
// DISPLAY SEARCH HISTORY
// ========================================

const displaySearchHistory = () => {

    const history =
        JSON.parse(
            localStorage.getItem(
                "weatherHistory"
            )
        ) || [];


    historyContainer.innerHTML = "";


    if (history.length === 0) {

        historyContainer.innerHTML =
            "<p>Belum ada riwayat pencarian.</p>";

        return;

    }


    history.forEach((city) => {

        const button =
            document.createElement("button");


        button.type = "button";

        button.className =
            "history-button";

        button.textContent = city;


        button.addEventListener(
            "click",
            () => {

                cityInput.value = city;

                getWeather(city);

            }
        );


        historyContainer.appendChild(
            button
        );

    });

};


// ========================================
// GET DAILY FORECAST
// ========================================

const getDailyForecast = (list) => {

    const groupedForecast = {};


    list.forEach((item) => {

        const date =
            item.dt_txt.split(" ")[0];


        if (!groupedForecast[date]) {

            groupedForecast[date] = [];

        }


        groupedForecast[date].push(item);

    });


    const dailyForecast =
        Object.values(groupedForecast)
            .slice(0, 5)
            .map((day) => {

                return day.reduce(
                    (closest, item) => {

                        const currentHour =
                            Number(
                                item.dt_txt
                                    .split(" ")[1]
                                    .split(":")[0]
                            );


                        const closestHour =
                            Number(
                                closest.dt_txt
                                    .split(" ")[1]
                                    .split(":")[0]
                            );


                        const currentDifference =
                            Math.abs(
                                currentHour - 12
                            );


                        const closestDifference =
                            Math.abs(
                                closestHour - 12
                            );


                        return currentDifference <
                            closestDifference
                            ? item
                            : closest;

                    }
                );

            });


    return dailyForecast;

};


// ========================================
// DISPLAY 5-DAY FORECAST
// ========================================

const displayForecast = (forecastData) => {

    const dailyForecast =
        getDailyForecast(
            forecastData.list
        );


    forecastContainer.innerHTML = "";


    dailyForecast.forEach((item) => {

        const date =
            new Date(
                item.dt * 1000
            );


        const dayName =
            date.toLocaleDateString(
                "id-ID",
                {
                    weekday: "short"
                }
            );


        const dayDate =
            date.toLocaleDateString(
                "id-ID",
                {
                    day: "numeric",
                    month: "short"
                }
            );


        const card =
            document.createElement("div");


        card.className =
            "forecast-card";


        card.innerHTML = `

            <p class="forecast-day">
                ${dayName}, ${dayDate}
            </p>

            <img
                src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png"
                alt="Ikon cuaca ${item.weather[0].description}"
            >

            <p class="forecast-temp">
                ${formatTemperature(item.main.temp)}
            </p>

            <p class="forecast-description">
                ${item.weather[0].description}
            </p>

        `;


        forecastContainer.appendChild(card);

    });

};


// ========================================
// GET FORECAST DATA
// ========================================

const getForecast = async (city) => {

    const response =
        await fetch(
            `${FORECAST_API_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=id`
        );


    if (!response.ok) {

        throw new Error(
            "Data prakiraan cuaca tidak dapat diambil."
        );

    }


    const data =
        await response.json();


    displayForecast(data);

};


// ========================================
// GET WEATHER DATA
// ========================================

const getWeather = async (city) => {

    showLoading();

    hideError();


    try {

        const response =
            await fetch(
                `${WEATHER_API_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=id`
            );


        if (!response.ok) {

            if (response.status === 404) {

                throw new Error(
                    "Kota tidak ditemukan. Silakan periksa nama kota yang kamu masukkan."
                );

            }


            throw new Error(
                "Terjadi masalah saat mengambil data cuaca."
            );

        }


        const data =
            await response.json();


        displayWeather(data);


        saveSearchHistory(city);


        await getForecast(city);


    } catch (error) {

        if (error instanceof TypeError) {

            showError(
                "Network error. Periksa koneksi internet kamu lalu coba lagi."
            );

        } else {

            showError(
                error.message
            );

        }

    } finally {

        hideLoading();

    }

};


// ========================================
// FORM SUBMIT
// ========================================

searchForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        const city =
            cityInput.value.trim();


        if (!city) {

            showError(
                "Silakan masukkan nama kota terlebih dahulu."
            );

            return;

        }


        getWeather(city);

    }
);


// ========================================
// TEMPERATURE BUTTONS
// ========================================

celsiusBtn.addEventListener(
    "click",
    () => {

        setTemperatureUnit("C");

    }
);


fahrenheitBtn.addEventListener(
    "click",
    () => {

        setTemperatureUnit("F");

    }
);


// ========================================
// INITIALIZE APP
// ========================================

displaySearchHistory();