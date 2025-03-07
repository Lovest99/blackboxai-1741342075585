class AuthManager {
    constructor() {
        this.users = [
            {
                id: '1',
                name: 'Admin',
                email: 'admin@mail.com',
                password: this.hashPassword('password123!')
            }
        ];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.setupEventListeners();
        this.checkAuthState();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Registration form
        document.getElementById('registerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegistration();
        });

        // Toggle between login and registration forms
        document.getElementById('showRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleForms('register');
        });

        document.getElementById('showLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleForms('login');
        });

        // Forgot password link
        document.querySelector('.forgot-password')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleForgotPassword();
        });
    }

    toggleForms(form) {
        const loginCard = document.querySelector('.auth-card:not(.register-card)');
        const registerCard = document.querySelector('.register-card');
        
        if (form === 'register') {
            loginCard.classList.add('hidden');
            registerCard.classList.remove('hidden');
        } else {
            loginCard.classList.remove('hidden');
            registerCard.classList.add('hidden');
        }

        // Clear any existing messages
        this.clearMessages();
    }

    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember').checked;

        try {
            const submitBtn = document.querySelector('#loginForm .auth-button');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';

            const user = this.users.find(u => u.email === email && u.password === this.hashPassword(password));

            if (user) {
                this.currentUser = {
                    id: user.id,
                    name: user.name,
                    email: user.email
                };

                if (rememberMe) {
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                } else {
                    sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                }

                this.showMessage('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                this.showMessage('Invalid email or password', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login';
            }
        } catch (error) {
            this.showMessage('An error occurred. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    }

    async handleRegistration() {
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        try {
            const submitBtn = document.querySelector('#registerForm .auth-button');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating account...';

            if (password.length < 8) {
                throw new Error('Password must be at least 8 characters long');
            }

            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            if (this.users.some(u => u.email === email)) {
                throw new Error('Email already registered');
            }

            const newUser = {
                id: Date.now().toString(),
                name,
                email,
                password: this.hashPassword(password)
            };

            this.users.push(newUser);
            localStorage.setItem('users', JSON.stringify(this.users));

            this.showMessage('Registration successful! Please login.', 'success');
            setTimeout(() => {
                this.toggleForms('login');
            }, 1500);
        } catch (error) {
            this.showMessage(error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
        }
    }

    async handleForgotPassword() {
        const email = prompt("Please enter your email address for password recovery:");
        
        if (!email) {
            this.showMessage('Please enter your email address', 'error');
            return;
        }

        const user = this.users.find(u => u.email === email);
        
        if (!user) {
            this.showMessage('No account found with this email', 'error');
            return;
        }

        const tempPassword = Math.random().toString(36).slice(-8);
        user.password = this.hashPassword(tempPassword);
        
        localStorage.setItem('users', JSON.stringify(this.users));

        this.showMessage(`Your temporary password is: ${tempPassword}`, 'success', 10000);
    }

    checkAuthState() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || 
                          JSON.parse(sessionStorage.getItem('currentUser'));

        if (currentUser && window.location.pathname.endsWith('login.html')) {
            window.location.href = 'dashboard.html';
        }
    }

    hashPassword(password) {
        return btoa(password);
    }

    showMessage(message, type, duration = 3000) {
        this.clearMessages();

        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}-message`;
        messageElement.textContent = message;

        const activeForm = document.querySelector('.auth-card:not(.hidden) .auth-form');
        activeForm.appendChild(messageElement);

        setTimeout(() => {
            messageElement.remove();
        }, duration);
    }

    clearMessages() {
        const messages = document.querySelectorAll('.message');
        messages.forEach(msg => msg.remove());
    }

    static logout() {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// Initialize authentication
const auth = new AuthManager();

// Protect dashboard route
if (window.location.pathname.endsWith('dashboard.html')) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || 
                       JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'login.html';
    }
}