// PWA Installation and App-like Features
class UtilityHubPWA {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }

    init() {
        // Check if running as PWA
        this.checkPWAMode();
        
        // Register service worker
        this.registerServiceWorker();
        
        // Setup install prompt
        this.setupInstallPrompt();
        
        // Setup app update handling
        this.setupAppUpdates();
        
        // Add app-like features
        this.addAppFeatures();
        
        console.log('🚀 UtilityHub PWA initialized');
    }

    // Check if app is running in PWA mode
    checkPWAMode() {
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            this.isInstalled = true;
            document.body.classList.add('pwa-mode');
            console.log('📱 Running as PWA');
            
            // Hide browser UI elements
            this.hideBrowserUI();
        }
    }

    // Register service worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered:', registration.scope);
                
                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    console.log('🔄 App update available');
                    this.showUpdateNotification();
                });
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    }

    // Setup install prompt
    setupInstallPrompt() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('📲 Install prompt available');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            console.log('🎉 App installed successfully');
            this.isInstalled = true;
            this.hideInstallButton();
            this.showWelcomeMessage();
        });
    }

    // Show install button
    showInstallButton() {
        let installBtn = document.getElementById('install-btn');
        
        if (!installBtn) {
            installBtn = document.createElement('button');
            installBtn.id = 'install-btn';
            installBtn.className = 'install-btn';
            installBtn.innerHTML = '📱 Install App';
            installBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 25px;
                padding: 12px 20px;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                z-index: 1000;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(installBtn);
        }

        installBtn.style.display = 'block';
        installBtn.onclick = () => this.installApp();
    }

    // Install the app
    async installApp() {
        if (!this.deferredPrompt) return;

        // Show install prompt
        this.deferredPrompt.prompt();
        
        // Wait for user choice
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`📲 Install prompt ${outcome}`);
        
        // Clear the deferred prompt
        this.deferredPrompt = null;
        this.hideInstallButton();
    }

    // Hide install button
    hideInstallButton() {
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }

    // Show welcome message after install
    showWelcomeMessage() {
        this.showNotification('🎉 Welcome to UtilityHub App!', 'You can now use UtilityHub offline and get faster access to all features.');
    }

    // Setup app updates
    setupAppUpdates() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }
    }

    // Show update notification
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div style="background: #667eea; color: white; padding: 16px; border-radius: 8px; margin: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                <strong>🔄 App Update Available</strong>
                <p>A new version of UtilityHub is ready!</p>
                <button onclick="window.location.reload()" style="background: white; color: #667eea; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">
                    Update Now
                </button>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Auto remove after 10 seconds
        setTimeout(() => {
            notification.remove();
        }, 10000);
    }

    // Add app-like features
    addAppFeatures() {
        // Prevent pull-to-refresh on mobile
        document.body.style.overscrollBehavior = 'none';
        
        // Add splash screen
        this.addSplashScreen();
        
        // Add status bar styling for iOS
        this.addIOSStatusBar();
        
        // Add haptic feedback for buttons
        this.addHapticFeedback();
        
        // Add keyboard shortcuts
        this.addKeyboardShortcuts();
    }

    // Add splash screen
    addSplashScreen() {
        if (this.isInstalled && !sessionStorage.getItem('splashShown')) {
            const splash = document.createElement('div');
            splash.className = 'splash-screen';
            splash.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">📱</div>
                    <h1 style="font-size: 2rem; margin: 0; font-weight: 300;">UtilityHub</h1>
                    <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Airtime • Data • Sportybet</p>
                    <div style="margin-top: 2rem; width: 50px; height: 3px; background: rgba(255,255,255,0.5); border-radius: 2px; overflow: hidden;">
                        <div style="width: 100%; height: 100%; background: white; transform: translateX(-100%); animation: loading 2s ease-in-out forwards;"></div>
                    </div>
                </div>
                <style>
                    @keyframes loading {
                        to { transform: translateX(0); }
                    }
                </style>
            `;
            document.body.appendChild(splash);
            
            // Remove splash after 2 seconds
            setTimeout(() => {
                splash.style.transition = 'opacity 0.5s ease';
                splash.style.opacity = '0';
                setTimeout(() => splash.remove(), 500);
            }, 2000);
            
            sessionStorage.setItem('splashShown', 'true');
        }
    }

    // Add iOS status bar styling
    addIOSStatusBar() {
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            const meta = document.createElement('meta');
            meta.name = 'apple-mobile-web-app-status-bar-style';
            meta.content = 'default';
            document.head.appendChild(meta);
        }
    }

    // Add haptic feedback
    addHapticFeedback() {
        if ('vibrate' in navigator) {
            document.addEventListener('click', (e) => {
                if (e.target.matches('button, .btn, .network-option, .quick-amount')) {
                    navigator.vibrate(10); // Short vibration
                }
            });
        }
    }

    // Add keyboard shortcuts
    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + A for Airtime
            if (e.altKey && e.key === 'a') {
                window.location.href = '/airtime.html';
            }
            // Alt + D for Data
            if (e.altKey && e.key === 'd') {
                window.location.href = '/data.html';
            }
            // Alt + S for Sportybet
            if (e.altKey && e.key === 's') {
                window.location.href = '/sportybet.html';
            }
        });
    }

    // Hide browser UI in PWA mode
    hideBrowserUI() {
        // Add CSS to hide browser-specific elements
        const style = document.createElement('style');
        style.textContent = `
            .pwa-mode .browser-only {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Show notification
    showNotification(title, message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/images/icon-192x192.png',
                vibrate: [100, 50, 100]
            });
        }
    }

    // Request notification permission
    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            console.log('📱 Notification permission:', permission);
        }
    }
}

// Initialize PWA when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.utilityHubPWA = new UtilityHubPWA();
});

// Export for use in other scripts
window.UtilityHubPWA = UtilityHubPWA;