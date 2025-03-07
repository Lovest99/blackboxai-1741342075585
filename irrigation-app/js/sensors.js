class SensorService {
    constructor() {
        this.zones = [
            { id: 1, moisture: 50, isIrrigating: false, lastUpdate: new Date() },
            { id: 2, moisture: 50, isIrrigating: false, lastUpdate: new Date() }
        ];
        
        this.settings = {
            autoMode: false,
            moistureThreshold: 40,
            irrigationDuration: 30000, // 30 seconds
            moistureIncreaseRate: 2, // % per second during irrigation
            moistureDecreaseRate: 0.1 // % per second natural decrease
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startSimulation();
        this.loadSettings();
        this.updateUI();
    }

    setupEventListeners() {
        // Irrigation control buttons
        document.getElementById('irrigate1')?.addEventListener('click', () => this.toggleIrrigation(1));
        document.getElementById('irrigate2')?.addEventListener('click', () => this.toggleIrrigation(2));

        // Auto mode toggle
        document.getElementById('autoMode')?.addEventListener('change', (e) => {
            this.settings.autoMode = e.target.checked;
            this.saveSettings();
        });

        // Moisture threshold slider
        document.getElementById('moistureThreshold')?.addEventListener('input', (e) => {
            this.settings.moistureThreshold = parseInt(e.target.value);
            document.getElementById('thresholdValue').textContent = `${this.settings.moistureThreshold}%`;
            this.saveSettings();
        });

        // Listen for weather updates
        document.addEventListener('weatherUpdate', (e) => {
            if (this.settings.autoMode) {
                this.handleWeatherUpdate(e.detail);
            }
        });

        document.addEventListener('rainForecast', (e) => {
            if (this.settings.autoMode) {
                this.handleRainForecast(e.detail);
            }
        });
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('irrigationSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            
            // Update UI with loaded settings
            const autoModeToggle = document.getElementById('autoMode');
            if (autoModeToggle) {
                autoModeToggle.checked = this.settings.autoMode;
            }

            const thresholdSlider = document.getElementById('moistureThreshold');
            if (thresholdSlider) {
                thresholdSlider.value = this.settings.moistureThreshold;
                document.getElementById('thresholdValue').textContent = `${this.settings.moistureThreshold}%`;
            }
        }
    }

    saveSettings() {
        localStorage.setItem('irrigationSettings', JSON.stringify({
            autoMode: this.settings.autoMode,
            moistureThreshold: this.settings.moistureThreshold
        }));
    }

    startSimulation() {
        // Simulate moisture level changes
        setInterval(() => {
            this.zones.forEach(zone => {
                if (zone.isIrrigating) {
                    // Increase moisture during irrigation
                    zone.moisture = Math.min(100, zone.moisture + this.settings.moistureIncreaseRate);
                } else {
                    // Natural decrease in moisture
                    zone.moisture = Math.max(0, zone.moisture - this.settings.moistureDecreaseRate);
                }
                zone.lastUpdate = new Date();
            });
            this.updateUI();
            this.checkAutoIrrigation();
        }, 1000);
    }

    toggleIrrigation(zoneId) {
        const zone = this.zones.find(z => z.id === zoneId);
        if (!zone) return;

        if (zone.isIrrigating) {
            this.stopIrrigation(zoneId);
        } else {
            this.startIrrigation(zoneId);
        }
    }

    startIrrigation(zoneId) {
        const zone = this.zones.find(z => z.id === zoneId);
        if (!zone) return;

        zone.isIrrigating = true;
        this.updateUI();

        // Auto-stop irrigation after duration
        setTimeout(() => {
            this.stopIrrigation(zoneId);
        }, this.settings.irrigationDuration);
    }

    stopIrrigation(zoneId) {
        const zone = this.zones.find(z => z.id === zoneId);
        if (!zone) return;

        zone.isIrrigating = false;
        this.updateUI();
    }

    updateUI() {
        this.zones.forEach(zone => {
            // Update moisture display
            const moistureElement = document.getElementById(`moisture${zone.id}`);
            if (moistureElement) {
                moistureElement.textContent = `${Math.round(zone.moisture)}%`;
            }

            // Update gauge fill
            const gaugeElement = document.getElementById(`gauge${zone.id}`);
            if (gaugeElement) {
                gaugeElement.style.height = `${zone.moisture}%`;
                
                // Update gauge color based on moisture level
                if (zone.moisture < 30) {
                    gaugeElement.style.backgroundColor = '#f44336'; // Red
                } else if (zone.moisture < 60) {
                    gaugeElement.style.backgroundColor = '#ff9800'; // Orange
                } else {
                    gaugeElement.style.backgroundColor = '#4CAF50'; // Green
                }
            }

            // Update status text
            const statusElement = document.getElementById(`status${zone.id}`);
            if (statusElement) {
                if (zone.isIrrigating) {
                    statusElement.textContent = 'Status: Irrigating...';
                    statusElement.style.color = '#4CAF50';
                } else {
                    statusElement.textContent = 'Status: Monitoring';
                    statusElement.style.color = '#666666';
                }
            }

            // Update irrigation button
            const buttonElement = document.getElementById(`irrigate${zone.id}`);
            if (buttonElement) {
                buttonElement.textContent = zone.isIrrigating ? 'Stop Irrigation' : 'Start Irrigation';
                buttonElement.classList.toggle('active', zone.isIrrigating);
            }
        });
    }

    checkAutoIrrigation() {
        if (!this.settings.autoMode) return;

        this.zones.forEach(zone => {
            if (zone.moisture < this.settings.moistureThreshold && !zone.isIrrigating) {
                this.startIrrigation(zone.id);
            }
        });
    }

    handleWeatherUpdate(weatherData) {
        // Adjust moisture decrease rate based on temperature and humidity
        const baseRate = 0.1;
        const tempFactor = Math.max(0, (weatherData.temperature - 20) / 10); // Increase rate in higher temperatures
        const humidityFactor = (100 - weatherData.humidity) / 100; // Decrease rate in higher humidity
        
        this.settings.moistureDecreaseRate = baseRate * (1 + tempFactor) * humidityFactor;
    }

    handleRainForecast(forecast) {
        // If high chance of rain, stop irrigation and increase moisture
        if (forecast.probability === 'High') {
            this.zones.forEach(zone => {
                if (zone.isIrrigating) {
                    this.stopIrrigation(zone.id);
                }
            });
        }
    }
}

// Initialize sensor service when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const sensorService = new SensorService();
});