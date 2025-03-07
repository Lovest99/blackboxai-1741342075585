# Smart Irrigation System

## Overview
The Smart Irrigation System is a mobile-friendly web application designed to manage irrigation based on weather data and soil moisture levels. It integrates with the Meteoblue API for weather information and simulates moisture sensor readings.

## Features
- **User Authentication**: Secure login, registration, and password recovery.
- **Real-time Weather Updates**: Fetches current weather conditions and forecasts.
- **Soil Moisture Monitoring**: Simulates moisture sensor readings for different zones.
- **Automatic Irrigation Controls**: Automatically starts irrigation based on moisture levels and weather conditions.
- **Responsive Design**: Optimized for mobile devices, ensuring usability on smartphones and tablets.

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Weather API**: Meteoblue API for weather data
- **Data Storage**: Local storage for user data management

## Setup Instructions
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd irrigation-app
   ```

2. **Install Dependencies**:
   - Currently, there are no external dependencies. Ensure you have a modern web browser.

3. **Run the Application**:
   ```bash
   python3 -m http.server 8091 --directory irrigation-app
   ```
   Open your browser and navigate to `http://localhost:8091/login.html`.

## Usage
- **Login**: Use the following credentials to log in:
  - Email: `admin@mail.com`
  - Password: `password123!`
  
- **Register**: Fill out the registration form to create a new account.

- **Forgot Password**: Click the "Forgot password?" link to receive a temporary password via a prompt.

- **Dashboard**: After logging in, you will be redirected to the dashboard, where you can view weather data, soil moisture levels, and control irrigation settings.

## API Integration
- The application uses the Meteoblue API to fetch weather data. Ensure you have a valid API key and replace it in the `weather.js` file.

## Contributing
Feel free to submit issues or pull requests for improvements. Contributions are welcome!

## License
This project is licensed under the MIT License.

## Contact
For any inquiries, please contact [Your Name] at [Your Email].