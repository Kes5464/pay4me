// Real Authentication JavaScript
// Handles real user registration, login with email/phone verification

// Global variables for authentication
let currentUser = null;
let authState = 'login'; // 'login', 'signup', 'forgot', 'verify'

// API base URL
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://payme-27jxb8ful-kestine1s-projects.vercel.app/api';

// Initialize authentication on page load
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
        loginForm.addEventListener('submit', handleRealLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleRealSignup);
    }

    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
    }
}

// Handle real user signup with verification
async function handleRealSignup(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const signupData = {
        name: formData.get('signupName'),
        email: formData.get('signupEmail'),
        phone: formData.get('signupPhone'),
        password: formData.get('signupPassword'),
        confirmPassword: formData.get('confirmPassword'),
        verificationType: formData.get('verificationType') || 'email'
    };

    // Validation
    if (!signupData.name || !signupData.email || !signupData.phone || !signupData.password) {
        showMessage('All fields are required', 'error');
        return;
    }

    if (signupData.password !== signupData.confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    if (signupData.password.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error');
        return;
    }

    try {
        showLoadingState('Creating your account...');

        const response = await fetch(`${API_BASE}/auth?action=register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signupData)
        });

        const result = await response.json();

        if (result.success) {
            // Store verification info
            sessionStorage.setItem('pendingVerification', JSON.stringify({
                userId: result.data.userId,
                verificationType: result.data.verificationType,
                verificationMethod: result.data.verificationMethod
            }));

            // Show verification form
            showVerificationForm(result.data);
            showMessage(result.message, 'success');
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showMessage('Network error. Please try again.', 'error');
    } finally {
        hideLoadingState();
    }
}

// Handle account verification
async function handleVerification(userId, otp) {
    try {
        showLoadingState('Verifying your account...');

        const response = await fetch(`${API_BASE}/auth?action=verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, otp })
        });

        const result = await response.json();

        if (result.success) {
            // Store authentication token
            localStorage.setItem('authToken', result.data.token);
            localStorage.setItem('currentUser', JSON.stringify(result.data.user));
            
            currentUser = result.data.user;
            
            // Clear pending verification
            sessionStorage.removeItem('pendingVerification');
            
            showMessage('Account verified successfully! Welcome to Pay4me!', 'success');
            
            // Redirect to main app
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        console.error('Verification error:', error);
        showMessage('Verification failed. Please try again.', 'error');
    } finally {
        hideLoadingState();
    }
}

// Handle real user login
async function handleRealLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const loginData = {
        identifier: formData.get('loginEmail'), // Can be email or phone
        password: formData.get('loginPassword')
    };

    if (!loginData.identifier || !loginData.password) {
        showMessage('Email/phone and password are required', 'error');
        return;
    }

    try {
        showLoadingState('Signing you in...');

        const response = await fetch(`${API_BASE}/auth?action=login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();

        if (result.success) {
            // Store authentication
            localStorage.setItem('authToken', result.data.token);
            localStorage.setItem('currentUser', JSON.stringify(result.data.user));
            
            currentUser = result.data.user;
            
            showMessage('Login successful! Welcome back!', 'success');
            
            // Redirect to main app
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Network error. Please try again.', 'error');
    } finally {
        hideLoadingState();
    }
}

// Resend OTP
async function resendOTP() {
    const pendingVerification = JSON.parse(sessionStorage.getItem('pendingVerification'));
    
    if (!pendingVerification) {
        showMessage('No pending verification found', 'error');
        return;
    }

    try {
        showLoadingState('Sending new code...');

        const response = await fetch(`${API_BASE}/auth?action=resend-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: pendingVerification.userId })
        });

        const result = await response.json();

        if (result.success) {
            showMessage('New verification code sent!', 'success');
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        console.error('Resend OTP error:', error);
        showMessage('Failed to resend code. Please try again.', 'error');
    } finally {
        hideLoadingState();
    }
}

// Setup password visibility toggles
function setupPasswordToggles() {
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const inputId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            togglePassword(inputId);
        });
    });
}

// Toggle password visibility
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleBtn = passwordInput.nextElementSibling;
    
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
        input.addEventListener('input', clearValidationError);
    });

    // Real-time password validation
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('input', validatePassword);
    });

    // Phone number validation
    const phoneInput = document.getElementById('signupPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', validatePhoneNumber);
    }

    // Confirm password validation
    const confirmPassword = document.getElementById('confirmPassword');
    if (confirmPassword) {
        confirmPassword.addEventListener('input', validatePasswordConfirmation);
    }
}

// Validate email format
function validateEmail(e) {
    const email = e.target.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        showFieldError(e.target, 'Please enter a valid email address');
        return false;
    }
    clearFieldError(e.target);
    return true;
}

// Validate password strength
function validatePassword(e) {
    const password = e.target.value;
    const requirements = document.querySelector('.password-requirements');
    
    if (password.length > 0 && password.length < 8) {
        showFieldError(e.target, 'Password must be at least 8 characters long');
        if (requirements) requirements.style.color = '#e74c3c';
        return false;
    }
    
    clearFieldError(e.target);
    if (requirements) requirements.style.color = '#27ae60';
    return true;
}

// Validate password confirmation
function validatePasswordConfirmation(e) {
    const confirmPassword = e.target.value;
    const originalPassword = document.getElementById('signupPassword').value;
    
    if (confirmPassword && confirmPassword !== originalPassword) {
        showFieldError(e.target, 'Passwords do not match');
        return false;
    }
    
    clearFieldError(e.target);
    return true;
}

// Validate phone number
function validatePhoneNumber(input) {
    // Handle both event objects and direct string input
    const phone = typeof input === 'string' ? input : (input.target ? input.target.value : input.value || input);
    const phoneRegex = /^(\+234|234|0)[7-9][0-1]\d{8}$/;
    
    if (!phone) {
        return false;
    }
    
    const cleanPhone = phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
        // If it's an event object, show field error
        if (input.target) {
            showFieldError(input.target, 'Please enter a valid Nigerian phone number');
        }
        return false;
    }
    
    // Clear field error if it's an event object
    if (input.target) {
        clearFieldError(input.target);
    }
    return true;
}

// Show field-specific error
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.style.borderColor = '#e74c3c';
    const errorElement = document.createElement('small');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.color = '#e74c3c';
    errorElement.style.fontSize = '0.8rem';
    errorElement.style.display = 'block';
    errorElement.style.marginTop = '0.3rem';
    
    field.parentNode.appendChild(errorElement);
}

// Clear field error
function clearFieldError(field) {
    field.style.borderColor = '#e0e0e0';
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Clear validation error on input
function clearValidationError(e) {
    clearFieldError(e.target);
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validate inputs
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    if (!validateEmailString(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }

    // Show loading
    const submitBtn = e.target.querySelector('.login-btn');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> Signing in...';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        // Check if user exists in localStorage (demo functionality)
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Successful login
            currentUser = user;
            
            // Save session
            if (rememberMe) {
                localStorage.setItem('currentUser', JSON.stringify(user));
            } else {
                sessionStorage.setItem('currentUser', JSON.stringify(user));
            }
            
            showMessage(`Welcome back, ${user.name}!`, 'success');
            
            // Redirect to homepage after 2 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            
        } else {
            // Failed login
            showMessage('Invalid email or password. Please try again.', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }, 2000);
}

// Handle signup form submission
function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Validate inputs
    if (!name || !email || !phone || !password || !confirmPassword) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    if (!validateEmailString(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }

    if (!validatePhoneString(phone)) {
        showMessage('Please enter a valid phone number', 'error');
        return;
    }

    if (password.length < 8) {
        showMessage('Password must be at least 8 characters long', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    if (!agreeTerms) {
        showMessage('Please agree to the Terms of Service and Privacy Policy', 'error');
        return;
    }

    // Show loading
    const submitBtn = e.target.querySelector('.login-btn');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> Creating account...';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        // Check if email already exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        if (users.find(u => u.email === email)) {
            showMessage('An account with this email already exists', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            name,
            email,
            phone,
            password,
            createdAt: new Date().toISOString(),
            isVerified: false
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        showMessage('Account created successfully! You can now sign in.', 'success');
        
        // Switch to login form after 2 seconds
        setTimeout(() => {
            showLoginForm();
            // Pre-fill email
            document.getElementById('loginEmail').value = email;
        }, 2000);

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Handle forgot password form submission
function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('resetEmail').value;
    
    if (!email) {
        showMessage('Please enter your email address', 'error');
        return;
    }

    if (!validateEmailString(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }

    // Show loading
    const submitBtn = e.target.querySelector('.login-btn');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> Sending...';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        showMessage('If an account with this email exists, you will receive a password reset link shortly.', 'success');
        
        setTimeout(() => {
            showLoginForm();
        }, 3000);

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Form switching functions
function showLoginForm() {
    document.querySelector('.login-form-wrapper').style.display = 'block';
    document.querySelector('.signup-form-wrapper').style.display = 'none';
    document.querySelector('.forgot-form-wrapper').style.display = 'none';
    authState = 'login';
    clearAllMessages();
}

function showSignupForm() {
    document.querySelector('.login-form-wrapper').style.display = 'none';
    document.querySelector('.signup-form-wrapper').style.display = 'block';
    document.querySelector('.forgot-form-wrapper').style.display = 'none';
    authState = 'signup';
    clearAllMessages();
}

function showForgotPassword() {
    document.querySelector('.login-form-wrapper').style.display = 'none';
    document.querySelector('.signup-form-wrapper').style.display = 'none';
    document.querySelector('.forgot-form-wrapper').style.display = 'block';
    authState = 'forgot';
    clearAllMessages();
}

// Social login functions (demo)
function loginWithGoogle() {
    showMessage('Google login integration would be implemented here', 'success');
}

function loginWithFacebook() {
    showMessage('Facebook login integration would be implemented here', 'success');
}

// Terms and privacy functions (demo)
function showTerms() {
    showMessage('Terms of Service modal would open here', 'success');
}

function showPrivacy() {
    showMessage('Privacy Policy modal would open here', 'success');
}

// Check for existing session
function checkExistingSession() {
    const sessionUser = sessionStorage.getItem('currentUser');
    const persistentUser = localStorage.getItem('currentUser');
    
    if (sessionUser || persistentUser) {
        currentUser = JSON.parse(sessionUser || persistentUser);
        
        // If already logged in and on login page, redirect to home
        if (window.location.pathname.includes('login.html')) {
            showMessage(`Already logged in as ${currentUser.name}. Redirecting...`, 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }
}

// Utility functions
function validateEmailString(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhoneString(phone) {
    const phoneRegex = /^(\+234|234|0)[7-9][0-1]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

function clearAllMessages() {
    const messages = document.querySelectorAll('.message');
    messages.forEach(msg => msg.remove());
}

// Logout function (to be used in other pages)
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    showMessage('Logged out successfully', 'success');
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

// Show verification form
function showVerificationForm(verificationData) {
    const authContainer = document.querySelector('.form-container');
    
    const verificationHTML = `
        <div id="verificationForm" class="verification-container">
            <h2 style="text-align: center; margin-bottom: 2rem; color: #333;">
                📧 Verify Your Account
            </h2>
            
            <div class="verification-info" style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; text-align: center;">
                <p style="margin-bottom: 1rem; color: #666;">
                    We've sent a 6-digit verification code to:
                </p>
                <p style="font-weight: bold; color: #007bff; font-size: 1.1rem;">
                    ${verificationData.verificationMethod}
                </p>
                <p style="margin-top: 1rem; color: #666; font-size: 0.9rem;">
                    The code expires in 10 minutes
                </p>
            </div>

            <form id="otpForm" onsubmit="handleOTPSubmission(event)">
                <div class="form-group">
                    <label for="otpCode">Verification Code</label>
                    <input type="text" id="otpCode" name="otpCode" placeholder="Enter 6-digit code" 
                           maxlength="6" pattern="[0-9]{6}" required 
                           style="text-align: center; font-size: 1.5rem; letter-spacing: 0.5rem; font-weight: bold;">
                    <small style="color: #666;">Check your ${verificationData.verificationType === 'phone' ? 'SMS' : 'email'} for the code</small>
                </div>

                <button type="submit" class="btn" style="width: 100%; margin-bottom: 1rem;">
                    ✅ Verify Account
                </button>
            </form>

            <div style="text-align: center;">
                <p style="color: #666; margin-bottom: 1rem;">Didn't receive the code?</p>
                <button type="button" onclick="resendOTP()" class="btn" style="background: #6c757d;">
                    📱 Resend Code
                </button>
            </div>

            <div style="text-align: center; margin-top: 2rem;">
                <button type="button" onclick="backToSignup()" style="background: none; border: none; color: #007bff; cursor: pointer; text-decoration: underline;">
                    ← Back to Sign Up
                </button>
            </div>
        </div>
    `;
    
    authContainer.innerHTML = verificationHTML;
}

// Handle OTP form submission
function handleOTPSubmission(e) {
    e.preventDefault();
    
    const otpCode = document.getElementById('otpCode').value;
    const pendingVerification = JSON.parse(sessionStorage.getItem('pendingVerification'));
    
    if (!otpCode || otpCode.length !== 6) {
        showMessage('Please enter a valid 6-digit code', 'error');
        return;
    }
    
    if (!pendingVerification) {
        showMessage('Verification session expired. Please sign up again.', 'error');
        return;
    }
    
    handleVerification(pendingVerification.userId, otpCode);
}

// Back to signup form
function backToSignup() {
    sessionStorage.removeItem('pendingVerification');
    window.location.reload();
}

// Show loading state
function showLoadingState(message) {
    const submitBtns = document.querySelectorAll('button[type="submit"]');
    submitBtns.forEach(btn => {
        btn.innerHTML = `<span class="loading"></span> ${message}`;
        btn.disabled = true;
    });
}

// Hide loading state
function hideLoadingState() {
    const submitBtns = document.querySelectorAll('button[type="submit"]');
    submitBtns.forEach(btn => {
        btn.disabled = false;
        // Restore original text based on button context
        if (btn.closest('#loginForm')) {
            btn.textContent = 'Sign In';
        } else if (btn.closest('#signupForm')) {
            btn.textContent = 'Create Account';
        } else if (btn.closest('#otpForm')) {
            btn.textContent = '✅ Verify Account';
        }
    });
}

// Check for real authentication
function checkExistingSession() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');
    
    if (token && userData) {
        currentUser = JSON.parse(userData);
        
        // If user is already authenticated and on login page, redirect
        if (window.location.pathname.includes('login.html')) {
            window.location.href = 'index.html';
        }
    } else {
        // If not authenticated and on protected page, redirect to login
        const protectedPages = ['airtime.html', 'data.html', 'sportybet.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'login.html';
        }
    }
}

// Real logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    sessionStorage.clear();
    currentUser = null;
    
    showMessage('You have been logged out', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        logout,
        currentUser: () => currentUser,
        checkExistingSession
    };
}