class DashboardManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupUserInterface();
        this.setupLogoutHandler();
        this.setupSettingsHandlers();
        this.setupEventListeners();
    }

    setupUserInterface() {
        // Set user name from session
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || 
                          JSON.parse(sessionStorage.getItem('currentUser'));
        
        if (currentUser) {
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = currentUser.name;
            }
        } else {
            // Redirect to login if no user session exists
            window.location.href = 'login.html';
        }
    }

    setupLogoutHandler() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                // Clear user session
                localStorage.removeItem('currentUser');
                sessionStorage.removeItem('currentUser');
                
                // Redirect to login page
                window.location.href = 'login.html';
            });
        }
    }

    setupSettingsHandlers() {
        // Auto mode toggle handler
        const autoModeToggle = document.getElementById('autoMode');
        if (autoModeToggle) {
            autoModeToggle.addEventListener('change', (e) => {
                this.handleAutoModeChange(e.target.checked);
            });
        }

        // Moisture threshold handler
        const thresholdSlider = document.getElementById('moistureThreshold');
        if (thresholdSlider) {
            thresholdSlider.addEventListener('input', (e) => {
                this.handleThresholdChange(e.target.value);
            });
        }
    }

    setupEventListeners() {
        // Listen for weather updates
        document.addEventListener('weatherUpdate', (e) => {
            this.handleWeatherUpdate(e.detail);
        });

        // Listen for rain forecast updates
        document.addEventListener('rainForecast', (e) => {
            this.handleRainForecast(e.detail);
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.refreshData();
            }
        });
    }

    handleAutoModeChange(enabled) {
        const statusElements = document.querySelectorAll('.moisture-status');
        statusElements.forEach(element => {
            element.textContent = `Status: ${enabled ? 'Auto Mode' : 'Manual Mode'}`;
        });

        // Update UI to reflect auto mode state
        const irrigationButtons = document.querySelectorAll('.irrigation-btn');
        irrigationButtons.forEach(button => {
            button.disabled = enabled;
            button.style.opacity = enabled ? '0.5' : '1';
        });
    }

    handleThresholdChange(value) {
        const thresholdDisplay = document.getElementById('thresholdValue');
        if (thresholdDisplay) {
            thresholdDisplay.textContent = `${value}%`;
        }
    }

    handleWeatherUpdate(weatherData) {
        // Update weather-dependent UI elements
        const weatherIcon = document.getElementById('weather-icon');
        if (weatherIcon) {
            // Update weather icon based on conditions
            const condition = weatherData.description.toLowerCase();
            if (condition.includes('rain')) {
                this.showNotification('Rain detected! Adjusting irrigation schedule...');
            }
        }

        // Update last updated timestamp
        const lastUpdated = document.getElementById('last-updated');
        if (lastUpdated) {
            const now = new Date();
            lastUpdated.textContent = now.toLocaleTimeString();
        }
    }

    handleRainForecast(forecast) {
        const rainChance = document.getElementById('rain-chance');
        if (rainChance) {
            rainChance.textContent = forecast.probability;
            
            if (forecast.probability === 'High') {
                this.showNotification('High chance of rain forecasted. Irrigation may be adjusted.');
            }
        }
    }

    refreshData() {
        // Trigger a refresh of weather and sensor data
        document.dispatchEvent(new Event('refreshWeather'));
        document.dispatchEvent(new Event('refreshSensors'));
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;

        // Add to document
        document.body.appendChild(notification);

        // Remove after animation
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Helper method to format dates
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
}

// Initialize dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add notification styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--primary-color);
            color: white;
            padding: 1rem;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        }

        .notification.fade-out {
            animation: fadeOut 0.3s ease-out;
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes fadeOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Initialize dashboard
    const dashboard = new DashboardManager();
});