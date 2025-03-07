class WeatherService {
    constructor() {
        this.apiKey = 'CWTy5s23URw7ul9V'; // Your Meteoblue API key
        this.baseUrl = 'https://api.meteoblue.com/weather';
        
        // Default coordinates (user should provide their location)
        this.defaultLat = 40.7128;
        this.defaultLon = -74.0060;
        
        this.init();
    }

    async init() {
        try {
            // Try to get user's location
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        this.updateWeather(position.coords.latitude, position.coords.longitude);
                    },
                    error => {
                        console.warn('Geolocation error:', error);
                        this.updateWeather(this.defaultLat, this.defaultLon);
                    }
                );
            } else {
                this.updateWeather(this.defaultLat, this.defaultLon);
            }
        } catch (error) {
            console.error('Weather initialization error:', error);
            this.showError();
        }
    }

    async updateWeather(lat, lon) {
        try {
            const response = await fetch(
                `${this.baseUrl}/current?lat=${lat}&lon=${lon}&apikey=${this.apiKey}`
            );
            
            if (!response.ok) {
                throw new Error('Weather API request failed');
            }

            const data = await response.json();
            this.updateUI(data);
            
            // Also fetch forecast for rain probability
            this.updateForecast(lat, lon);
            
        } catch (error) {
            console.error('Weather update error:', error);
            this.showError();
        }
    }

    async updateForecast(lat, lon) {
        try {
            const response = await fetch(
                `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&apikey=${this.apiKey}`
            );
            
            if (!response.ok) {
                throw new Error('Forecast API request failed');
            }

            const data = await response.json();
            this.updateRainChance(data);
            
        } catch (error) {
            console.error('Forecast update error:', error);
        }
    }

    updateUI(data) {
        // Update temperature
        const tempElement = document.getElementById('temperature');
        if (tempElement) {
            tempElement.textContent = `${Math.round(data.main.temp)}°C`;
        }

        // Update weather description
        const descElement = document.getElementById('weather-description');
        if (descElement) {
            descElement.textContent = data.weather[0].description
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        }

        // Update humidity
        const humidityElement = document.getElementById('humidity');
        if (humidityElement) {
            humidityElement.textContent = `${data.main.humidity}%`;
        }

        // Update weather icon
        const iconElement = document.getElementById('weather-icon');
        if (iconElement) {
            iconElement.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
            iconElement.alt = data.weather[0].description;
        }

        // Update last updated time
        const lastUpdatedElement = document.getElementById('last-updated');
        if (lastUpdatedElement) {
            const now = new Date();
            lastUpdatedElement.textContent = now.toLocaleTimeString();
        }

        // Dispatch weather update event
        const weatherEvent = new CustomEvent('weatherUpdate', {
            detail: {
                temperature: data.main.temp,
                humidity: data.main.humidity,
                description: data.weather[0].main.toLowerCase()
            }
        });
        document.dispatchEvent(weatherEvent);
    }

    updateRainChance(forecastData) {
        // Calculate rain probability from next few hours
        const nextFewHours = forecastData.list.slice(0, 3);
        const rainProbability = nextFewHours.some(hour => 
            hour.weather[0].main.toLowerCase().includes('rain')
        ) ? 'High' : 'Low';

        const rainElement = document.getElementById('rain-chance');
        if (rainElement) {
            rainElement.textContent = rainProbability;
        }

        // Dispatch rain forecast event
        const rainEvent = new CustomEvent('rainForecast', {
            detail: {
                probability: rainProbability
            }
        });
        document.dispatchEvent(rainEvent);
    }

    showError() {
        const elements = ['temperature', 'weather-description', 'humidity', 'rain-chance'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = 'Error loading weather data';
            }
        });
    }

    // Start periodic updates
    startUpdates(interval = 300000) { // Default 5 minutes
        this.updateInterval = setInterval(() => {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        this.updateWeather(position.coords.latitude, position.coords.longitude);
                    },
                    error => {
                        this.updateWeather(this.defaultLat, this.defaultLon);
                    }
                );
            } else {
                this.updateWeather(this.defaultLat, this.defaultLon);
            }
        }, interval);
    }

    // Stop periodic updates
    stopUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialize weather service when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const weatherService = new WeatherService();
    weatherService.startUpdates();

    // Clean up on page unload
    window.addEventListener('unload', () => {
        weatherService.stopUpdates();
    });
});