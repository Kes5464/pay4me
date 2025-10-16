// Enhanced Utility Features Component
// Showcases additional API integrations and utility services

class UtilityFeaturesWidget {
    constructor() {
        this.isVisible = false;
        this.updateInterval = 60000; // 1 minute
        this.init();
    }

    async init() {
        this.createUtilityWidget();
        this.loadUtilityData();
        this.startPeriodicUpdates();
    }

    createUtilityWidget() {
        // Create floating utility widget
        const widget = document.createElement('div');
        widget.id = 'utilityWidget';
        widget.className = 'utility-widget';
        widget.style.cssText = `
            position: fixed;
            top: 50%;
            right: -320px;
            transform: translateY(-50%);
            width: 300px;
            max-height: 80vh;
            background: white;
            border-radius: 15px 0 0 15px;
            box-shadow: -5px 0 20px rgba(0,0,0,0.15);
            z-index: 1000;
            transition: right 0.3s ease;
            overflow: hidden;
            border: 2px solid #667eea;
        `;

        widget.innerHTML = `
            <div class="widget-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem; cursor: pointer;" onclick="utilityWidget.toggleWidget()">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="margin: 0; font-size: 1rem;">🛠️ Utility Center</h4>
                    <span id="widgetToggle" style="font-size: 1.2rem; transition: transform 0.3s ease;">◀</span>
                </div>
            </div>
            
            <div class="widget-content" style="padding: 1rem; max-height: calc(80vh - 60px); overflow-y: auto;">
                <!-- Weather Info -->
                <div class="utility-section" style="margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                    <h5 style="margin: 0 0 0.5rem 0; color: #333; font-size: 0.9rem;">🌤️ Weather</h5>
                    <div id="weatherInfo" style="font-size: 0.8rem; color: #666;">Loading weather...</div>
                </div>

                <!-- Service Status -->
                <div class="utility-section" style="margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                    <h5 style="margin: 0 0 0.5rem 0; color: #333; font-size: 0.9rem;">📊 Service Status</h5>
                    <div id="serviceStatus" style="font-size: 0.8rem;">Checking services...</div>
                </div>

                <!-- Crypto Prices -->
                <div class="utility-section" style="margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                    <h5 style="margin: 0 0 0.5rem 0; color: #333; font-size: 0.9rem;">₿ Crypto Prices</h5>
                    <div id="cryptoPrices" style="font-size: 0.8rem; color: #666;">Loading prices...</div>
                </div>

                <!-- Quick Tools -->
                <div class="utility-section" style="margin-bottom: 1.5rem;">
                    <h5 style="margin: 0 0 0.5rem 0; color: #333; font-size: 0.9rem;">⚡ Quick Tools</h5>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.7rem;">
                        <button class="tool-btn" onclick="utilityWidget.showQRGenerator()" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;">📱 QR Code</button>
                        <button class="tool-btn" onclick="utilityWidget.showBankList()" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;">🏦 Banks</button>
                        <button class="tool-btn" onclick="utilityWidget.showTimeZones()" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;">🕐 Time</button>
                        <button class="tool-btn" onclick="utilityWidget.verifyTransaction()" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;">✅ Verify</button>
                    </div>
                </div>

                <!-- Current Time -->
                <div class="utility-section" style="padding: 0.5rem; background: #e8f4fd; border-radius: 8px; text-align: center;">
                    <div id="currentTime" style="font-size: 0.8rem; color: #667eea; font-weight: 500;">Loading time...</div>
                </div>
            </div>
        `;

        document.body.appendChild(widget);
        this.widget = widget;

        // Add hover effects to tool buttons
        this.setupToolButtonEffects();
    }

    setupToolButtonEffects() {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#667eea';
                this.style.color = 'white';
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'white';
                this.style.color = '#333';
            });
        });
    }

    toggleWidget() {
        this.isVisible = !this.isVisible;
        const widget = document.getElementById('utilityWidget');
        const toggle = document.getElementById('widgetToggle');
        
        if (this.isVisible) {
            widget.style.right = '0px';
            toggle.textContent = '▶';
            toggle.style.transform = 'rotate(180deg)';
        } else {
            widget.style.right = '-320px';
            toggle.textContent = '◀';
            toggle.style.transform = 'rotate(0deg)';
        }
    }

    async loadUtilityData() {
        // Load weather data
        this.updateWeather();
        
        // Load service status
        this.updateServiceStatus();
        
        // Load crypto prices
        this.updateCryptoPrices();
        
        // Update current time
        this.updateCurrentTime();
    }

    async updateWeather() {
        try {
            const weather = await apiService.getWeatherInfo();
            const weatherElement = document.getElementById('weatherInfo');
            
            if (weather.success) {
                weatherElement.innerHTML = `
                    <div style="display: flex; justify-content: space-between;">
                        <span>${weather.city}</span>
                        <span>${weather.temperature}</span>
                    </div>
                    <div style="font-size: 0.7rem; color: #999; margin-top: 0.2rem;">
                        ${weather.condition} • Humidity: ${weather.humidity}
                    </div>
                `;
            } else {
                weatherElement.textContent = 'Weather data unavailable';
            }
        } catch (error) {
            console.error('Weather update failed:', error);
        }
    }

    async updateServiceStatus() {
        try {
            const status = await apiService.checkServiceStatus();
            const statusElement = document.getElementById('serviceStatus');
            
            if (status.success) {
                const operationalCount = status.services.filter(s => s.status === 'operational').length;
                const totalCount = status.services.length;
                
                statusElement.innerHTML = `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.3rem;">
                        <span>Overall Status</span>
                        <span style="color: ${status.overall === 'operational' ? '#27ae60' : '#f39c12'};">
                            ${status.overall === 'operational' ? '✅ Operational' : '⚠️ Partial'}
                        </span>
                    </div>
                    <div style="font-size: 0.7rem; color: #666;">
                        ${operationalCount}/${totalCount} services online
                    </div>
                `;
            } else {
                statusElement.textContent = 'Status check failed';
            }
        } catch (error) {
            console.error('Service status update failed:', error);
        }
    }

    async updateCryptoPrices() {
        try {
            const prices = await apiService.getCryptoPrices();
            const pricesElement = document.getElementById('cryptoPrices');
            
            if (prices.success) {
                pricesElement.innerHTML = `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.2rem;">
                        <span>₿ Bitcoin</span>
                        <span>₦${prices.prices.bitcoin.ngn.toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.2rem;">
                        <span>⟠ Ethereum</span>
                        <span>₦${prices.prices.ethereum.ngn.toLocaleString()}</span>
                    </div>
                    <div style="font-size: 0.7rem; color: #666; margin-top: 0.2rem;">
                        Updated: ${new Date(prices.lastUpdated).toLocaleTimeString()}
                    </div>
                `;
            } else {
                pricesElement.textContent = 'Crypto prices unavailable';
            }
        } catch (error) {
            pricesElement.textContent = 'Loading crypto prices...';
        }
    }

    async updateCurrentTime() {
        try {
            const time = await apiService.getCurrentTime();
            const timeElement = document.getElementById('currentTime');
            
            if (time.success) {
                timeElement.textContent = `🕐 ${time.formatted}`;
            } else {
                timeElement.textContent = `🕐 ${new Date().toLocaleString('en-NG')}`;
            }
        } catch (error) {
            console.error('Time update failed:', error);
        }
    }

    startPeriodicUpdates() {
        setInterval(() => {
            this.updateCurrentTime();
            this.updateCryptoPrices();
        }, this.updateInterval);

        // Update weather less frequently (every 10 minutes)
        setInterval(() => {
            this.updateWeather();
            this.updateServiceStatus();
        }, 10 * 60 * 1000);
    }

    // Quick tool functions
    showQRGenerator() {
        const text = prompt('Enter text to generate QR code:', 'UtilityHub - Your Utility Solution');
        if (text) {
            const qrUrl = apiService.generateQRCode(text, 300);
            const modal = this.createModal('QR Code Generator', `
                <div style="text-align: center;">
                    <img src="${qrUrl}" alt="QR Code" style="max-width: 100%; height: auto; border-radius: 8px;">
                    <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">QR Code for: "${text}"</p>
                    <button onclick="this.closest('.modal').remove()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
                </div>
            `);
            document.body.appendChild(modal);
        }
    }

    async showBankList() {
        const banks = await apiService.getNigerianBanks();
        let bankList = '<div style="max-height: 300px; overflow-y: auto;">';
        
        if (banks.success) {
            banks.banks.slice(0, 10).forEach(bank => {
                bankList += `
                    <div style="padding: 0.5rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
                        <span style="font-size: 0.9rem;">${bank.name}</span>
                        <span style="font-size: 0.8rem; color: #666;">${bank.code}</span>
                    </div>
                `;
            });
        } else {
            bankList += '<p>Unable to load bank information</p>';
        }
        
        bankList += '</div>';
        
        const modal = this.createModal('Nigerian Banks', bankList + `
            <button onclick="this.closest('.modal').remove()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Close</button>
        `);
        document.body.appendChild(modal);
    }

    async showTimeZones() {
        const timezones = ['Africa/Lagos', 'Africa/Abuja', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
        let timeList = '';
        
        for (const tz of timezones) {
            try {
                const time = await apiService.getCurrentTime(tz);
                const city = tz.split('/')[1].replace('_', ' ');
                timeList += `
                    <div style="padding: 0.5rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
                        <span style="font-size: 0.9rem;">${city}</span>
                        <span style="font-size: 0.8rem; color: #666;">${time.formatted}</span>
                    </div>
                `;
            } catch (error) {
                console.error(`Failed to get time for ${tz}`);
            }
        }
        
        const modal = this.createModal('World Time', timeList + `
            <button onclick="this.closest('.modal').remove()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Close</button>
        `);
        document.body.appendChild(modal);
    }

    async verifyTransaction() {
        const txnId = prompt('Enter transaction ID to verify:');
        if (txnId) {
            const phoneNumber = prompt('Enter phone number:');
            if (phoneNumber) {
                const modal = this.createModal('Transaction Verification', `
                    <div style="text-align: center;">
                        <div style="margin: 1rem 0;">
                            <span class="loading"></span>
                            <p style="margin-top: 0.5rem;">Verifying transaction...</p>
                        </div>
                    </div>
                `);
                document.body.appendChild(modal);

                try {
                    const result = await apiService.verifyTransaction(txnId, phoneNumber);
                    const content = modal.querySelector('.modal-content');
                    
                    if (result.success && result.verified) {
                        content.innerHTML = `
                            <h3 style="color: #27ae60; margin-bottom: 1rem;">✅ Transaction Verified</h3>
                            <p><strong>Transaction ID:</strong> ${txnId}</p>
                            <p><strong>Status:</strong> ${result.status}</p>
                            <p><strong>Message:</strong> ${result.message}</p>
                            <button onclick="this.closest('.modal').remove()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
                        `;
                    } else {
                        content.innerHTML = `
                            <h3 style="color: #f39c12; margin-bottom: 1rem;">⏳ Transaction Pending</h3>
                            <p><strong>Transaction ID:</strong> ${txnId}</p>
                            <p><strong>Status:</strong> ${result.status}</p>
                            <p><strong>Message:</strong> ${result.message}</p>
                            <button onclick="this.closest('.modal').remove()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
                        `;
                    }
                } catch (error) {
                    const content = modal.querySelector('.modal-content');
                    content.innerHTML = `
                        <h3 style="color: #e74c3c; margin-bottom: 1rem;">❌ Verification Failed</h3>
                        <p>Unable to verify transaction. Please try again later.</p>
                        <button onclick="this.closest('.modal').remove()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
                    `;
                }
            }
        }
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;

        modal.innerHTML = `
            <div class="modal-content" style="background: white; border-radius: 10px; padding: 2rem; max-width: 90%; max-height: 90%; overflow-y: auto;">
                <h3 style="margin-top: 0; color: #333;">${title}</h3>
                ${content}
            </div>
        `;

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        return modal;
    }
}

// Initialize utility widget
let utilityWidget;

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof apiService !== 'undefined') {
            utilityWidget = new UtilityFeaturesWidget();
            
            // Auto-show widget after 3 seconds on first visit
            setTimeout(() => {
                if (!localStorage.getItem('utilityWidgetShown')) {
                    utilityWidget.toggleWidget();
                    localStorage.setItem('utilityWidgetShown', 'true');
                }
            }, 3000);
        }
    }, 2000);
});

// Export for global use
if (typeof window !== 'undefined') {
    window.UtilityFeaturesWidget = UtilityFeaturesWidget;
}