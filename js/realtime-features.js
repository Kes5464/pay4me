// Real-time Features Component
// Handles live data updates, network status, and currency conversion

class RealTimeFeatures {
    constructor() {
        this.updateInterval = 30000; // 30 seconds
        this.isActive = true;
        this.exchangeRates = null;
        this.networkStatus = null;
        this.userLocation = null;
        
        this.init();
    }

    async init() {
        await this.loadInitialData();
        this.startRealTimeUpdates();
        this.setupUIComponents();
    }

    // Load initial data
    async loadInitialData() {
        try {
            // Load user location
            const location = await apiService.getUserLocation();
            if (location.success) {
                this.userLocation = location;
                this.displayUserLocation();
            }

            // Load exchange rates
            const rates = await apiService.getExchangeRates();
            if (rates.success) {
                this.exchangeRates = rates;
                this.displayExchangeRates();
            }

            // Load network status
            const networkStatus = await apiService.getNetworkStatus();
            if (networkStatus.success) {
                this.networkStatus = networkStatus;
                this.displayNetworkStatus();
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    // Start real-time updates
    startRealTimeUpdates() {
        setInterval(async () => {
            if (!this.isActive) return;

            try {
                // Update exchange rates every 30 seconds
                const rates = await apiService.getExchangeRates();
                if (rates.success) {
                    this.exchangeRates = rates;
                    this.updateExchangeRateDisplay();
                }

                // Update network status
                const networkStatus = await apiService.getNetworkStatus();
                if (networkStatus.success) {
                    this.networkStatus = networkStatus;
                    this.updateNetworkStatusDisplay();
                }
            } catch (error) {
                console.error('Error in real-time update:', error);
            }
        }, this.updateInterval);
    }

    // Setup UI components
    setupUIComponents() {
        this.createStatusBar();
        this.createNetworkIndicators();
        this.addCurrencyConverter();
    }

    // Create status bar
    createStatusBar() {
        const existingStatusBar = document.querySelector('.status-bar');
        if (existingStatusBar) return;

        const statusBar = document.createElement('div');
        statusBar.className = 'status-bar';
        statusBar.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(90deg, #667eea, #764ba2);
            color: white;
            padding: 0.5rem;
            font-size: 0.8rem;
            z-index: 999;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        `;

        statusBar.innerHTML = `
            <div class="location-info">
                📍 <span id="userLocationText">Loading location...</span>
            </div>
            <div class="network-status">
                📶 <span id="networkStatusText">Checking networks...</span>
            </div>
            <div class="exchange-rate">
                💱 <span id="exchangeRateText">Loading rates...</span>
            </div>
        `;

        document.body.appendChild(statusBar);

        // Adjust main content to account for status bar
        document.body.style.paddingBottom = '50px';
    }

    // Display user location
    displayUserLocation() {
        const locationElement = document.getElementById('userLocationText');
        if (locationElement && this.userLocation) {
            locationElement.textContent = `${this.userLocation.city}, ${this.userLocation.country}`;
        }
    }

    // Display exchange rates
    displayExchangeRates() {
        const rateElement = document.getElementById('exchangeRateText');
        if (rateElement && this.exchangeRates) {
            rateElement.textContent = `$1 = ₦${this.exchangeRates.ngnRate.toFixed(2)}`;
        }
    }

    // Update exchange rate display
    updateExchangeRateDisplay() {
        this.displayExchangeRates();
    }

    // Display network status
    displayNetworkStatus() {
        const statusElement = document.getElementById('networkStatusText');
        if (statusElement && this.networkStatus) {
            const activeNetworks = this.networkStatus.networks.filter(n => n.status === 'excellent' || n.status === 'good');
            statusElement.textContent = `${activeNetworks.length}/4 networks optimal`;
        }
    }

    // Update network status display
    updateNetworkStatusDisplay() {
        this.displayNetworkStatus();
    }

    // Create network indicators
    createNetworkIndicators() {
        const networkContainers = document.querySelectorAll('.network-selection');
        
        networkContainers.forEach(container => {
            const networkOptions = container.querySelectorAll('.network-option');
            
            networkOptions.forEach(option => {
                const network = option.dataset.network;
                if (!network) return;

                // Add status indicator
                const statusIndicator = document.createElement('div');
                statusIndicator.className = 'network-status-indicator';
                statusIndicator.style.cssText = `
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #27ae60;
                    box-shadow: 0 0 0 2px rgba(39, 174, 96, 0.3);
                `;
                
                option.style.position = 'relative';
                option.appendChild(statusIndicator);

                // Update status based on network data
                this.updateNetworkIndicator(network, statusIndicator);
            });
        });
    }

    // Update individual network indicator
    updateNetworkIndicator(networkName, indicator) {
        if (!this.networkStatus) return;

        const network = this.networkStatus.networks.find(n => 
            n.name.toLowerCase() === networkName.toLowerCase()
        );

        if (network) {
            const colors = {
                excellent: '#27ae60',
                good: '#f39c12',
                fair: '#e67e22',
                poor: '#e74c3c'
            };

            indicator.style.background = colors[network.status] || '#95a5a6';
            indicator.title = `${network.name}: ${network.status} (${network.uptime}% uptime)`;
        }
    }

    // Add currency converter
    addCurrencyConverter() {
        if (document.querySelector('.currency-converter')) return;

        const converter = document.createElement('div');
        converter.className = 'currency-converter';
        converter.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 1rem;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            z-index: 998;
            min-width: 200px;
            display: none;
        `;

        converter.innerHTML = `
            <h4 style="margin: 0 0 0.5rem 0; font-size: 0.9rem;">Currency Converter</h4>
            <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                <input type="number" id="usdAmount" placeholder="USD" style="width: 70px; padding: 0.3rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.8rem;">
                <span style="align-self: center;">⇄</span>
                <input type="number" id="ngnAmount" placeholder="NGN" style="width: 70px; padding: 0.3rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.8rem;">
            </div>
            <small style="color: #666; font-size: 0.7rem;">Live exchange rates</small>
        `;

        document.body.appendChild(converter);

        // Setup converter functionality
        const usdInput = converter.querySelector('#usdAmount');
        const ngnInput = converter.querySelector('#ngnAmount');

        usdInput.addEventListener('input', () => {
            if (this.exchangeRates && usdInput.value) {
                ngnInput.value = (parseFloat(usdInput.value) * this.exchangeRates.ngnRate).toFixed(2);
            }
        });

        ngnInput.addEventListener('input', () => {
            if (this.exchangeRates && ngnInput.value) {
                usdInput.value = (parseFloat(ngnInput.value) / this.exchangeRates.ngnRate).toFixed(2);
            }
        });

        // Toggle converter visibility
        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = '💱';
        toggleBtn.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            z-index: 999;
            font-size: 1.2rem;
        `;

        toggleBtn.addEventListener('click', () => {
            const isVisible = converter.style.display === 'block';
            converter.style.display = isVisible ? 'none' : 'block';
            toggleBtn.style.right = isVisible ? '20px' : '240px';
        });

        document.body.appendChild(toggleBtn);
    }

    // Currency conversion utility
    convertCurrency(amount, fromCurrency, toCurrency) {
        if (!this.exchangeRates) return null;

        const rates = this.exchangeRates.rates;
        
        if (fromCurrency === 'USD' && toCurrency === 'NGN') {
            return amount * this.exchangeRates.ngnRate;
        } else if (fromCurrency === 'NGN' && toCurrency === 'USD') {
            return amount / this.exchangeRates.ngnRate;
        }
        
        return null;
    }

    // Get network quality
    getNetworkQuality(networkName) {
        if (!this.networkStatus) return null;

        const network = this.networkStatus.networks.find(n => 
            n.name.toLowerCase() === networkName.toLowerCase()
        );

        return network || null;
    }

    // Cleanup
    destroy() {
        this.isActive = false;
        document.querySelector('.status-bar')?.remove();
        document.querySelector('.currency-converter')?.remove();
        document.body.style.paddingBottom = '0';
    }
}

// Initialize real-time features
let realTimeFeatures;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize after a short delay to ensure other scripts are loaded
    setTimeout(() => {
        if (typeof apiService !== 'undefined') {
            realTimeFeatures = new RealTimeFeatures();
        }
    }, 1000);
});

// Export for use in other files
if (typeof window !== 'undefined') {
    window.RealTimeFeatures = RealTimeFeatures;
}