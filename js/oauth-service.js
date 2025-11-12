// OAuth Authentication Service
// Supports Google and Facebook login integration

class OAuthService {
    constructor() {
        this.providers = {
            google: {
                clientId: null, // Will be set from config
                scope: 'email profile',
                redirectUri: window.location.origin + '/auth/callback'
            },
            facebook: {
                appId: null, // Will be set from config
                scope: 'email,public_profile',
                version: 'v18.0'
            }
        };
        
        this.currentUser = null;
        this.loadConfiguration();
    }

    async loadConfiguration() {
        // Load OAuth configuration from environment or config
        try {
            // In production, these should come from environment variables
            this.providers.google.clientId = CONFIG?.oauth?.google?.clientId || ''; 
            this.providers.facebook.appId = CONFIG?.oauth?.facebook?.appId || '';
        } catch (error) {
            console.log('OAuth config not loaded, using demo mode');
        }
    }

    // Initialize Google OAuth
    async initializeGoogle() {
        return new Promise((resolve) => {
            if (typeof google !== 'undefined' && google.accounts) {
                google.accounts.id.initialize({
                    client_id: this.providers.google.clientId,
                    callback: (response) => this.handleGoogleSignIn(response),
                    auto_select: false,
                    cancel_on_tap_outside: true
                });
                resolve(true);
            } else {
                // Load Google Sign-In script
                const script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.onload = () => {
                    google.accounts.id.initialize({
                        client_id: this.providers.google.clientId,
                        callback: (response) => this.handleGoogleSignIn(response)
                    });
                    resolve(true);
                };
                document.head.appendChild(script);
            }
        });
    }

    // Initialize Facebook OAuth
    async initializeFacebook() {
        return new Promise((resolve) => {
            if (typeof FB !== 'undefined') {
                resolve(true);
                return;
            }

            window.fbAsyncInit = () => {
                FB.init({
                    appId: this.providers.facebook.appId,
                    cookie: true,
                    xfbml: true,
                    version: this.providers.facebook.version
                });
                resolve(true);
            };

            // Load Facebook SDK
            const script = document.createElement('script');
            script.async = true;
            script.defer = true;
            script.crossOrigin = 'anonymous';
            script.src = 'https://connect.facebook.net/en_US/sdk.js';
            document.head.appendChild(script);
        });
    }

    // Google Sign-In Handler
    async handleGoogleSignIn(response) {
        try {
            // Decode the JWT token
            const payload = this.parseJWT(response.credential);
            
            const userData = {
                id: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                provider: 'google',
                verified: payload.email_verified || false
            };

            await this.processUserAuth(userData);
            
        } catch (error) {
            console.error('Google Sign-In Error:', error);
            this.showAuthError('Google sign-in failed. Please try again.');
        }
    }

    // Facebook Login
    async loginWithFacebook() {
        try {
            await this.initializeFacebook();

            FB.login((response) => {
                if (response.authResponse) {
                    // Get user profile
                    FB.api('/me', {fields: 'id,name,email,picture'}, (userInfo) => {
                        const userData = {
                            id: userInfo.id,
                            email: userInfo.email,
                            name: userInfo.name,
                            picture: userInfo.picture?.data?.url,
                            provider: 'facebook',
                            verified: true
                        };

                        this.processUserAuth(userData);
                    });
                } else {
                    this.showAuthError('Facebook login was cancelled.');
                }
            }, {scope: this.providers.facebook.scope});

        } catch (error) {
            console.error('Facebook Login Error:', error);
            this.showAuthError('Facebook login failed. Please try again.');
        }
    }

    // Google Login
    async loginWithGoogle() {
        try {
            await this.initializeGoogle();

            // Render the Google Sign-In button programmatically
            google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    // Fallback to popup
                    this.showGooglePopup();
                }
            });

        } catch (error) {
            console.error('Google Login Error:', error);
            this.showAuthError('Google login failed. Please try again.');
        }
    }

    // Show Google popup as fallback
    showGooglePopup() {
        google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            {
                theme: 'outline',
                size: 'large',
                text: 'continue_with',
                shape: 'rectangular',
                logo_alignment: 'left'
            }
        );
    }

    // Process authenticated user data
    async processUserAuth(userData) {
        try {
            // Store user data locally
            this.currentUser = userData;
            localStorage.setItem('authUser', JSON.stringify(userData));

            // Send to your backend for registration/login
            const response = await fetch(`${CONFIG.API_BASE_URL}/auth/oauth-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const result = await response.json();
                
                // Update UI
                this.updateAuthUI(userData);
                
                // Show success message
                this.showAuthSuccess(`Welcome, ${userData.name}!`);
                
                // Close login modal if open
                this.closeAuthModals();
                
                // Redirect or update page
                window.location.reload();
                
            } else {
                throw new Error('Server authentication failed');
            }

        } catch (error) {
            console.error('Auth processing error:', error);
            this.showAuthError('Authentication failed. Please try again.');
        }
    }

    // Update UI after successful auth
    updateAuthUI(user) {
        // Update auth link
        const authLink = document.getElementById('authLink');
        if (authLink) {
            authLink.textContent = user.name;
            authLink.href = '#profile';
        }

        // Show user avatar if available
        if (user.picture) {
            const avatar = document.createElement('img');
            avatar.src = user.picture;
            avatar.alt = user.name;
            avatar.className = 'user-avatar';
            avatar.style.cssText = 'width: 32px; height: 32px; border-radius: 50%; margin-left: 10px;';
            
            if (authLink) {
                authLink.appendChild(avatar);
            }
        }
    }

    // Logout
    async logout() {
        try {
            // Clear local storage
            localStorage.removeItem('authUser');
            this.currentUser = null;

            // Logout from providers
            if (typeof google !== 'undefined' && google.accounts) {
                google.accounts.id.disableAutoSelect();
            }

            if (typeof FB !== 'undefined') {
                FB.logout();
            }

            // Update UI
            const authLink = document.getElementById('authLink');
            if (authLink) {
                authLink.textContent = 'Login';
                authLink.href = 'login.html';
            }

            // Redirect to home
            window.location.href = 'index.html';

        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        const stored = localStorage.getItem('authUser');
        if (stored) {
            try {
                this.currentUser = JSON.parse(stored);
                return true;
            } catch (error) {
                localStorage.removeItem('authUser');
                return false;
            }
        }
        return false;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Utility: Parse JWT token
    parseJWT(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    // UI Helper: Show error
    showAuthError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-error';
        errorDiv.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            background: #ef4444; color: white; padding: 15px 20px;
            border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 300px; font-size: 14px;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    // UI Helper: Show success
    showAuthSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'auth-success';
        successDiv.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            background: #10b981; color: white; padding: 15px 20px;
            border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 300px; font-size: 14px;
        `;
        successDiv.textContent = message;
        document.body.appendChild(successDiv);

        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }

    // Close auth modals
    closeAuthModals() {
        const modals = document.querySelectorAll('.auth-modal, .login-modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }
}

// Initialize OAuth service
window.oauthService = new OAuthService();

// Auto-update UI if user is already authenticated
document.addEventListener('DOMContentLoaded', () => {
    if (window.oauthService.isAuthenticated()) {
        const user = window.oauthService.getCurrentUser();
        window.oauthService.updateAuthUI(user);
    }
});