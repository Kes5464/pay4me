// Authentication JavaScript - UI Only (No API calls)
// Handles simulated user registration and login

// Global variables for authentication
let currentUser = null;
let authState = 'login'; // 'login', 'signup', 'forgot', 'verify'

document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    checkExistingSession();
});

// Initialize authentication functionality
function initializeAuth() {
    setupAuthForms();
    setupPasswordToggles();
    setupFormValidation();
}

// Setup form event listeners
function setupAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const forgotForm = document.getElementById('forgotForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleSimulatedLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSimulatedSignup);
    }

    if (forgotForm) {
        forgotForm.addEventListener('submit', handleSimulatedForgotPassword);
    }
}

// Handle simulated user login
async function handleSimulatedLogin(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const loginData = {
        email: formData.get('loginEmail'),
        password: formData.get('loginPassword'),
        rememberMe: formData.get('rememberMe')
    };

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const resetLoading = showLoading(submitBtn);

    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate successful login
        currentUser = {
            id: 1,
            name: 'Demo User',
            email: loginData.email,
            phone: '08012345678'
        };

        // Store user data
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('authToken', 'demo-token-' + Date.now());

        showMessage('Login successful! Redirecting...', 'success');

        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

    } catch (error) {
        showMessage('Login failed. Please try again.', 'error');
    } finally {
        resetLoading();
    }
}

// Handle simulated user signup
async function handleSimulatedSignup(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const signupData = {
        name: formData.get('signupName'),
        email: formData.get('signupEmail'),
        phone: formData.get('signupPhone'),
        password: formData.get('signupPassword'),
        confirmPassword: formData.get('confirmPassword'),
        verificationType: formData.get('verificationType'),
        agreeTerms: formData.get('agreeTerms')
    };

    // Validate passwords match
    if (signupData.password !== signupData.confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const resetLoading = showLoading(submitBtn);

    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulate successful registration
        currentUser = {
            id: Date.now(),
            name: signupData.name,
            email: signupData.email,
            phone: signupData.phone
        };

        // Store user data
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('authToken', 'demo-token-' + Date.now());

        showMessage('Registration successful! Welcome to Pay4me!', 'success');

        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);

    } catch (error) {
        showMessage('Registration failed. Please try again.', 'error');
    } finally {
        resetLoading();
    }
}

// Handle simulated forgot password
async function handleSimulatedForgotPassword(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const email = formData.get('resetEmail');

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const resetLoading = showLoading(submitBtn);

    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        showMessage('Password reset link sent to your email!', 'success');

        // Reset form
        e.target.reset();

    } catch (error) {
        showMessage('Failed to send reset link. Please try again.', 'error');
    } finally {
        resetLoading();
    }
}

// Check existing session
function checkExistingSession() {
    const userData = localStorage.getItem('currentUser');
    const token = localStorage.getItem('authToken');

    if (userData && token) {
        currentUser = JSON.parse(userData);
        updateUIForLoggedInUser();
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const authLink = document.getElementById('authLink');
    if (authLink && currentUser) {
        authLink.textContent = `Hi, ${currentUser.name}`;
        authLink.href = '#'; // Remove link
        authLink.onclick = logout;
    }
}

// Logout function
function logout(e) {
    e.preventDefault();

    // Clear stored data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    currentUser = null;

    showMessage('Logged out successfully', 'success');

    // Redirect to home page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Setup password visibility toggles
function setupPasswordToggles() {
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const inputId = this.getAttribute('data-input-id');
            if (inputId) {
                togglePassword(inputId);
            }
        });
    });
}

// Toggle password visibility
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const wrapper = passwordInput.parentElement;
    const toggleBtn = wrapper.querySelector('.password-toggle');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

// Setup form validation
function setupFormValidation() {
    // Real-time email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', validateEmail);
    });

    // Real-time phone validation
    const phoneInputs = document.querySelectorAll('input[name*="phone"]');
    phoneInputs.forEach(input => {
        input.addEventListener('blur', validatePhone);
    });
}

// Validate email
function validateEmail(e) {
    const email = e.target.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && !emailRegex.test(email)) {
        showFieldError(e.target, 'Please enter a valid email address');
    } else {
        clearFieldError(e.target);
    }
}

// Validate phone
function validatePhone(e) {
    const phone = e.target.value;
    const phoneRegex = /^(\+234|234|0)[789]\d{9}$/;

    if (phone && !phoneRegex.test(phone)) {
        showFieldError(e.target, 'Please enter a valid Nigerian phone number');
    } else {
        clearFieldError(e.target);
    }
}

// Show field error
function showFieldError(field, message) {
    clearFieldError(field);

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;

    field.parentNode.appendChild(errorDiv);
    field.classList.add('error');
}

// Clear field error
function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    field.classList.remove('error');
}

// Show message function
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    // Add to page
    document.body.appendChild(messageDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Show loading state
function showLoading(button) {
    const originalText = button.textContent;
    button.textContent = 'Processing...';
    button.disabled = true;

    return function() {
        button.textContent = originalText;
        button.disabled = false;
    };
}

// Form switching functions
function showSignupForm() {
    document.querySelector('.login-form-wrapper').style.display = 'none';
    document.querySelector('.signup-form-wrapper').style.display = 'block';
    document.querySelector('.forgot-form-wrapper').style.display = 'none';
    authState = 'signup';
}

function showLoginForm() {
    document.querySelector('.login-form-wrapper').style.display = 'block';
    document.querySelector('.signup-form-wrapper').style.display = 'none';
    document.querySelector('.forgot-form-wrapper').style.display = 'none';
    authState = 'login';
}

function showForgotPassword() {
    document.querySelector('.login-form-wrapper').style.display = 'none';
    document.querySelector('.signup-form-wrapper').style.display = 'none';
    document.querySelector('.forgot-form-wrapper').style.display = 'block';
    authState = 'forgot';
}

// Make functions globally available
window.showSignupForm = showSignupForm;
window.showLoginForm = showLoginForm;
window.showForgotPassword = showForgotPassword;
window.logout = logout;