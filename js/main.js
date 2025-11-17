// Global variables
let selectedNetwork = null;
let selectedDataPlan = null;

// API base URL
const API_BASE = 'http://localhost:3000/api';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    console.log('CONFIG available:', typeof CONFIG !== 'undefined');
    
    // Check authentication first
    checkAuthentication();
    initializeApp();
});

// Check if user is authenticated
function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    const protectedPages = ['airtime.html', 'data.html', 'sportybet.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !token) {
        showMessage('Please log in to use this feature', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return false;
    }
    
    return true;
}

// Get authentication token
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Get current user
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

// Initialize the application
function initializeApp() {
    console.log('Initializing Pay4me...');
    setupMobileMenu();
    setupFormHandlers();
    setupNetworkSelection();
    setupDataPlans();
    addFadeInAnimations();
    console.log('Pay4me initialization complete');
}

// Mobile menu functionality
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on nav links
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }
}

// Setup form handlers
function setupFormHandlers() {
    // Airtime recharge form
    const airtimeForm = document.getElementById('airtimeForm');
    if (airtimeForm) {
        airtimeForm.addEventListener('submit', handleAirtimeRecharge);
    }

    // Data purchase form
    const dataForm = document.getElementById('dataForm');
    if (dataForm) {
        dataForm.addEventListener('submit', handleDataPurchase);
    }

    // My Phone functionality
    setupMyPhoneFeature();
}

// Setup My Phone feature
function setupMyPhoneFeature() {
    // Airtime page "My Phone" buttons
    const useMyPhoneBtn = document.getElementById('useMyPhone');
    const saveMyPhoneBtn = document.getElementById('saveMyPhone');
    const myPhoneStatus = document.getElementById('myPhoneStatus');

    // Data page "My Phone" buttons  
    const useMyPhoneBtnData = document.getElementById('useMyPhoneData');
    const saveMyPhoneBtnData = document.getElementById('saveMyPhoneData');
    const myPhoneStatusData = document.getElementById('myPhoneStatusData');

    // Load and display saved phone number on page load
    const savedPhone = localStorage.getItem('myPhoneNumber');
    if (savedPhone) {
        if (myPhoneStatus) myPhoneStatus.textContent = `Saved: ${savedPhone}`;
        if (myPhoneStatusData) myPhoneStatusData.textContent = `Saved: ${savedPhone}`;
    }

    // Use My Phone for airtime
    if (useMyPhoneBtn) {
        useMyPhoneBtn.addEventListener('click', function() {
            const savedPhone = localStorage.getItem('myPhoneNumber');
            if (savedPhone) {
                document.getElementById('phoneNumber').value = savedPhone;
                // Auto-detect network
                const network = detectNetwork(savedPhone);
                if (network) {
                    selectNetworkOption(network);
                }
                showMessage('✅ Your phone number loaded!', 'success');
            } else {
                showMessage('❌ No saved phone number. Please save your phone first.', 'error');
            }
        });
    }

    // Use My Phone for data
    if (useMyPhoneBtnData) {
        useMyPhoneBtnData.addEventListener('click', function() {
            const savedPhone = localStorage.getItem('myPhoneNumber');
            if (savedPhone) {
                document.getElementById('dataPhoneNumber').value = savedPhone;
                // Auto-detect network
                const network = detectNetwork(savedPhone);
                if (network) {
                    selectNetworkOption(network);
                }
                showMessage('✅ Your phone number loaded!', 'success');
            } else {
                showMessage('❌ No saved phone number. Please save your phone first.', 'error');
            }
        });
    }

    // Save My Phone for airtime
    if (saveMyPhoneBtn) {
        saveMyPhoneBtn.addEventListener('click', function() {
            const phoneNumber = document.getElementById('phoneNumber').value;
            if (validatePhoneNumber(phoneNumber)) {
                localStorage.setItem('myPhoneNumber', phoneNumber);
                myPhoneStatus.textContent = `Saved: ${phoneNumber}`;
                if (myPhoneStatusData) myPhoneStatusData.textContent = `Saved: ${phoneNumber}`;
                showMessage('✅ Your phone number saved successfully!', 'success');
            } else {
                showMessage('❌ Please enter a valid phone number first.', 'error');
            }
        });
    }

    // Save My Phone for data
    if (saveMyPhoneBtnData) {
        saveMyPhoneBtnData.addEventListener('click', function() {
            const phoneNumber = document.getElementById('dataPhoneNumber').value;
            if (validatePhoneNumber(phoneNumber)) {
                localStorage.setItem('myPhoneNumber', phoneNumber);
                myPhoneStatusData.textContent = `Saved: ${phoneNumber}`;
                if (myPhoneStatus) myPhoneStatus.textContent = `Saved: ${phoneNumber}`;
                showMessage('✅ Your phone number saved successfully!', 'success');
            } else {
                showMessage('❌ Please enter a valid phone number first.', 'error');
            }
        });
    }
}

// Helper function to select network option
function selectNetworkOption(network) {
    const networkOptions = document.querySelectorAll('.network-option');
    networkOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.network === network) {
            option.classList.add('selected');
            selectedNetwork = network;
            
            // Update data plans if on data page
            if (document.getElementById('dataPlans')) {
                updateDataPlans(network);
            }
        }
    });
}

// Network selection functionality
function setupNetworkSelection() {
    const networkOptions = document.querySelectorAll('.network-option');
    
    networkOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            networkOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            this.classList.add('selected');
            
            // Store selected network
            selectedNetwork = this.dataset.network;
            
            // Update data plans based on selected network
            if (document.getElementById('dataPlans')) {
                updateDataPlans(selectedNetwork);
            }
        });
    });
}

// Data plans setup
function setupDataPlans() {
    const dataPlans = document.querySelectorAll('.data-plan');
    
    dataPlans.forEach(plan => {
        plan.addEventListener('click', function() {
            // Remove selected class from all plans
            dataPlans.forEach(p => p.classList.remove('selected'));
            
            // Add selected class to clicked plan
            this.classList.add('selected');
            
            // Store selected plan
            selectedDataPlan = {
                size: this.dataset.size,
                price: this.dataset.price,
                validity: this.dataset.validity
            };
        });
    });
}

// Network-specific data plans
const dataPlansData = {
    mtn: [
        { size: '1GB', price: '₦500', validity: '30 days' },
        { size: '2GB', price: '₦1000', validity: '30 days' },
        { size: '5GB', price: '₦2000', validity: '30 days' },
        { size: '10GB', price: '₦3500', validity: '30 days' },
        { size: '20GB', price: '₦6000', validity: '30 days' }
    ],
    airtel: [
        { size: '1GB', price: '₦450', validity: '30 days' },
        { size: '2GB', price: '₦900', validity: '30 days' },
        { size: '5GB', price: '₦1800', validity: '30 days' },
        { size: '10GB', price: '₦3200', validity: '30 days' },
        { size: '15GB', price: '₦5000', validity: '30 days' }
    ],
    glo: [
        { size: '1GB', price: '₦400', validity: '14 days' },
        { size: '2.5GB', price: '₦800', validity: '30 days' },
        { size: '5GB', price: '₦1600', validity: '30 days' },
        { size: '10GB', price: '₦3000', validity: '30 days' },
        { size: '18GB', price: '₦4500', validity: '30 days' }
    ]
};

// Update data plans based on selected network (with API integration)
async function updateDataPlans(network) {
    const dataPlansContainer = document.getElementById('dataPlans');
    if (!dataPlansContainer) return;

    // Show loading state
    dataPlansContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
            <span class="loading"></span>
            <p style="margin-top: 1rem;">Loading ${network.toUpperCase()} data plans...</p>
        </div>
    `;

    try {
        // Fetch plans from API
        const result = await apiService.getDataPlans(network);
        
        if (result.success && result.plans.length > 0) {
            dataPlansContainer.innerHTML = result.plans.map(plan => `
                <div class="data-plan" data-size="${plan.size}" data-price="₦${plan.price}" data-validity="${plan.validity}">
                    <h4>${plan.size}</h4>
                    <p class="price">₦${plan.price}</p>
                    <p class="validity">Valid for ${plan.validity}</p>
                    <small class="plan-type">${plan.type} plan</small>
                </div>
            `).join('');
        } else {
            // Fallback to static data
            const plans = dataPlansData[network] || [];
            dataPlansContainer.innerHTML = plans.map(plan => `
                <div class="data-plan" data-size="${plan.size}" data-price="${plan.price}" data-validity="${plan.validity}">
                    <h4>${plan.size}</h4>
                    <p class="price">${plan.price}</p>
                    <p class="validity">Valid for ${plan.validity}</p>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading data plans:', error);
        // Fallback to static data
        const plans = dataPlansData[network] || [];
        dataPlansContainer.innerHTML = plans.map(plan => `
            <div class="data-plan" data-size="${plan.size}" data-price="${plan.price}" data-validity="${plan.validity}">
                <h4>${plan.size}</h4>
                <p class="price">${plan.price}</p>
                <p class="validity">Valid for ${plan.validity}</p>
            </div>
        `).join('');
    }

    // Re-setup data plan click handlers
    setupDataPlans();
}

// Handle airtime recharge with real authentication
async function handleAirtimeRecharge(e) {
    e.preventDefault();
    
    // Check authentication
    const token = getAuthToken();
    if (!token) {
        showMessage('Please log in to make a recharge', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }
    
    const phoneNumber = document.getElementById('phoneNumber').value;
    const amount = parseFloat(document.getElementById('amount').value);
    
    if (!selectedNetwork) {
        showMessage('Please select a network', 'error');
        return;
    }
    
    if (!phoneNumber || !amount) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (!validatePhoneNumber(phoneNumber)) {
        showMessage('Please enter a valid phone number', 'error');
        return;
    }
    
    if (amount < 50 || amount > 10000) {
        showMessage('Amount should be between ₦50 and ₦10,000', 'error');
        return;
    }

    // Show loading
    const submitBtn = e.target.querySelector('.btn');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> Processing...';
    submitBtn.disabled = true;

    try {
        const reference = `PAY4ME_AIRTIME_${Date.now()}`;
        
        // Call real recharge API
        const response = await fetch(`${API_BASE}/recharge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'x-vercel-protection-bypass': 'true'
            },
            body: JSON.stringify({
                type: 'airtime',
                network: selectedNetwork,
                phoneNumber: phoneNumber,
                amount: amount,
                reference: reference
            })
        });

        const result = await response.json();

        if (result.success) {
            // Save transaction to local storage for history
            saveTransaction({
                ...result.data,
                timestamp: new Date().toISOString()
            });

            showMessage(`✅ Airtime recharge successful! Confirmation: ${result.data.confirmationCode}`, 'success');
            
            // Reset form
            document.getElementById('amount').value = '';
            selectedNetwork = null;
            document.querySelectorAll('.network-option').forEach(opt => opt.classList.remove('selected'));
            
            // Update transaction display
            updateRecentTransactions();
        } else {
            showMessage(`❌ Recharge failed: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Recharge error:', error);
        showMessage('❌ Network error. Please check your connection and try again.', 'error');
    } finally {
        // Restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Handle data purchase with real authentication
async function handleDataPurchase(e) {
    e.preventDefault();
    
    // Check authentication
    const token = getAuthToken();
    if (!token) {
        showMessage('Please log in to purchase data', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }
    
    const phoneNumber = document.getElementById('dataPhoneNumber').value;
    
    if (!selectedNetwork) {
        showMessage('Please select a network', 'error');
        return;
    }
    
    if (!selectedDataPlan) {
        showMessage('Please select a data plan', 'error');
        return;
    }
    
    if (!phoneNumber) {
        showMessage('Please enter phone number', 'error');
        return;
    }
    
    if (!validatePhoneNumber(phoneNumber)) {
        showMessage('Please enter a valid phone number', 'error');
        return;
    }
    
    // Show loading
    const submitBtn = e.target.querySelector('.btn');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> Processing...';
    submitBtn.disabled = true;
    
    try {
        const reference = `PAY4ME_DATA_${Date.now()}`;
        
        // Call real data purchase API
        const response = await fetch(`${API_BASE}/recharge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'x-vercel-protection-bypass': 'true'
            },
            body: JSON.stringify({
                type: 'data',
                network: selectedNetwork,
                phoneNumber: phoneNumber,
                amount: parseFloat(selectedDataPlan.price),
                dataSize: selectedDataPlan.size,
                reference: reference
            })
        });

        const result = await response.json();

        if (result.success) {
            // Save transaction to local storage for history
            saveTransaction({
                ...result.data,
                timestamp: new Date().toISOString()
            });

            showMessage(`✅ Data bundle purchased successfully! You will receive ${selectedDataPlan.size} data. Confirmation: ${result.data.confirmationCode}`, 'success');
            
            // Reset form
            selectedDataPlan = null;
            selectedNetwork = null;
            document.querySelectorAll('.network-option').forEach(opt => opt.classList.remove('selected'));
            document.querySelectorAll('.data-plan').forEach(plan => plan.classList.remove('selected'));
            
            // Update transaction display
            updateRecentTransactions();
        } else {
            showMessage(`❌ Data purchase failed: ${result.message}`, 'error');
        }
    } catch (error) {
        console.error('Data purchase error:', error);
        showMessage('❌ Network error. Please check your connection and try again.', 'error');
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Save transaction to local storage
function saveTransaction(transaction) {
    const transactions = JSON.parse(localStorage.getItem('pay4meTransactions') || '[]');
    transactions.unshift(transaction); // Add to beginning
    
    // Keep only last 50 transactions
    if (transactions.length > 50) {
        transactions.splice(50);
    }
    
    localStorage.setItem('pay4meTransactions', JSON.stringify(transactions));
}

// Get transactions from local storage
function getTransactions() {
    return JSON.parse(localStorage.getItem('pay4meTransactions') || '[]');
}

// Update recent transactions display
function updateRecentTransactions() {
    const transactionContainer = document.getElementById('recentTransactions');
    if (!transactionContainer) return;
    
    const transactions = getTransactions().slice(0, 5); // Show last 5
    
    if (transactions.length === 0) {
        transactionContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">No recent transactions</p>';
        return;
    }
    
    const transactionHTML = transactions.map(tx => {
        const time = new Date(tx.processedAt || tx.timestamp).toLocaleString();
        const statusIcon = tx.status === 'completed' ? '✅' : tx.status === 'failed' ? '❌' : '⏳';
        
        return `
            <div style="padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 1rem; background: white;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <strong>${statusIcon} ${tx.type === 'airtime' ? '📞 Airtime' : '📶 Data'}</strong>
                    <span style="color: #666; font-size: 0.9rem;">${time}</span>
                </div>
                <div style="color: #666; font-size: 0.9rem;">
                    ${tx.phoneNumber} • ${tx.network?.toUpperCase()} • ${tx.type === 'airtime' ? '₦' + tx.amount : tx.dataSize}
                </div>
                ${tx.confirmationCode ? `<div style="color: #28a745; font-size: 0.8rem; margin-top: 0.5rem;">Code: ${tx.confirmationCode}</div>` : ''}
            </div>
        `;
    }).join('');
    
    transactionContainer.innerHTML = transactionHTML;
}

// Validate phone number
function validatePhoneNumber(phone) {
    // Nigerian phone number validation
    const phoneRegex = /^(\+234|234|0)[7-9][0-1]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Show message
function showMessage(text, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    // Insert message at the top of the form container
    const formContainer = document.querySelector('.form-container') || document.querySelector('.container');
    if (formContainer) {
        formContainer.insertBefore(message, formContainer.firstChild);
        
        // Auto-remove message after 5 seconds
        setTimeout(() => {
            message.remove();
        }, 5000);
    }
}

// Add fade-in animations
function addFadeInAnimations() {
    const elements = document.querySelectorAll('.service-card, .form-container, .network-option, .data-plan');
    
    elements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('fade-in');
        }, index * 100);
    });
}

// Smooth scrolling for navigation links
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const href = e.target.getAttribute('href');
        if (href && href !== '#') {
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    }
});

// Update current year in footer
function updateYear() {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Call updateYear on page load
document.addEventListener('DOMContentLoaded', updateYear);

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0
    }).format(amount);
}

// Quick amount selection for airtime
function setupQuickAmounts() {
    const quickAmounts = document.querySelectorAll('.quick-amount');
    const amountInput = document.getElementById('amount');
    
    quickAmounts.forEach(btn => {
        btn.addEventListener('click', function() {
            if (amountInput) {
                amountInput.value = this.dataset.amount;
            }
            
            // Update visual selection
            quickAmounts.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

// Initialize quick amounts if they exist
document.addEventListener('DOMContentLoaded', setupQuickAmounts);

// Local storage functions for transaction history
function saveTransaction(type, data) {
    let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const transaction = {
        id: Date.now(),
        type: type,
        ...data,
        timestamp: new Date().toISOString(),
        status: 'completed'
    };
    
    transactions.unshift(transaction);
    // Keep only last 10 transactions
    transactions = transactions.slice(0, 10);
    
    localStorage.setItem('transactions', JSON.stringify(transactions));
    displayRecentTransactions();
}

// Display recent transactions
function displayRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    if (!container) return;

    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    if (transactions.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">No recent transactions</p>';
        return;
    }

    container.innerHTML = transactions.map(transaction => {
        const date = new Date(transaction.timestamp).toLocaleDateString();
        const time = new Date(transaction.timestamp).toLocaleTimeString();
        
        return `
            <div style="background: #f9f9f9; padding: 1rem; border-radius: 8px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${transaction.type === 'airtime' ? '📞 Airtime' : '📶 Data'}</strong>
                    <small style="display: block; color: #666;">
                        ${transaction.phoneNumber} • ${transaction.network?.toUpperCase()} • ${transaction.type === 'airtime' ? '₦' + transaction.amount : transaction.dataSize}
                    </small>
                    <small style="color: #999;">${date} ${time}</small>
                </div>
                <span style="background: #4CAF50; color: white; padding: 0.2rem 0.5rem; border-radius: 15px; font-size: 0.8rem;">
                    ✓ Success
                </span>
            </div>
        `;
    }).join('');
}

// Enhanced phone number validation with network detection
function detectNetwork(phoneNumber) {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // MTN prefixes
    if (/^(0703|0706|0803|0806|0813|0814|0816|0903|0906|0913|0916|07025|07026|0704)/.test(cleanNumber)) {
        return 'mtn';
    }
    
    // Airtel prefixes
    if (/^(0701|0708|0802|0808|0812|0901|0902|0904|0907|0912|07027|07028|07029|0701)/.test(cleanNumber)) {
        return 'airtel';
    }
    
    // Glo prefixes
    if (/^(0705|0805|0807|0811|0815|0905|0915|07024)/.test(cleanNumber)) {
        return 'glo';
    }
    
    return null;
}

// Auto-select network based on phone number with API validation
function setupPhoneNumberAutoDetection() {
    const phoneInputs = document.querySelectorAll('#phoneNumber, #dataPhoneNumber');
    
    phoneInputs.forEach(input => {
        let validationTimeout;
        
        input.addEventListener('input', async function() {
            const phoneNumber = this.value;
            
            // Clear previous timeout
            if (validationTimeout) {
                clearTimeout(validationTimeout);
            }
            
            // Local detection for immediate feedback
            const detectedNetwork = detectNetwork(phoneNumber);
            if (detectedNetwork && phoneNumber.length >= 4) {
                // Auto-select the detected network
                const networkOption = document.querySelector(`[data-network="${detectedNetwork}"]`);
                if (networkOption) {
                    document.querySelectorAll('.network-option').forEach(opt => opt.classList.remove('selected'));
                    networkOption.classList.add('selected');
                    selectedNetwork = detectedNetwork;
                    
                    // Update data plans if on data page
                    if (document.getElementById('dataPlans')) {
                        updateDataPlans(detectedNetwork);
                    }
                }
            }
            
            // API validation with debounce
            if (phoneNumber.length >= 11) {
                validationTimeout = setTimeout(async () => {
                    try {
                        const validation = await apiService.validatePhoneNumber(phoneNumber);
                        if (validation.success && validation.isValid) {
                            // Show validation success
                            this.style.borderColor = '#27ae60';
                            
                            // Update network selection if different from local detection
                            if (validation.carrierCode && validation.carrierCode !== selectedNetwork) {
                                const networkOption = document.querySelector(`[data-network="${validation.carrierCode}"]`);
                                if (networkOption) {
                                    document.querySelectorAll('.network-option').forEach(opt => opt.classList.remove('selected'));
                                    networkOption.classList.add('selected');
                                    selectedNetwork = validation.carrierCode;
                                    
                                    if (document.getElementById('dataPlans')) {
                                        updateDataPlans(validation.carrierCode);
                                    }
                                }
                            }
                        } else if (validation.success && !validation.isValid) {
                            this.style.borderColor = '#e74c3c';
                        }
                    } catch (error) {
                        console.log('Phone validation API unavailable, using local validation');
                    }
                }, 1000); // 1 second debounce
            }
        });
        
        // Reset border color when user starts typing again
        input.addEventListener('focus', function() {
            this.style.borderColor = '#667eea';
        });
    });
}

// Enhanced form submission tracking
function enhanceFormSubmissions() {
    // Override the existing handlers to include transaction saving
    const originalAirtimeHandler = handleAirtimeRecharge;
    
    window.handleAirtimeRecharge = function(e) {
        e.preventDefault();
        
        const phoneNumber = document.getElementById('phoneNumber').value;
        const amount = document.getElementById('amount').value;
        
        if (!selectedNetwork) {
            showMessage('Please select a network', 'error');
            return;
        }
        
        if (!phoneNumber || !amount) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        if (!validatePhoneNumber(phoneNumber)) {
            showMessage('Please enter a valid phone number', 'error');
            return;
        }
        
        if (amount < 50 || amount > 10000) {
            showMessage('Amount should be between ₦50 and ₦10,000', 'error');
            return;
        }
        
        // Show loading
        const submitBtn = e.target.querySelector('.btn');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="loading"></span> Processing...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Save transaction
            saveTransaction('airtime', {
                phoneNumber,
                amount,
                network: selectedNetwork
            });
            
            showMessage(`Successfully recharged ${phoneNumber} with ₦${amount} on ${selectedNetwork.toUpperCase()}`, 'success');
            
            // Reset form
            e.target.reset();
            document.querySelectorAll('.network-option').forEach(opt => opt.classList.remove('selected'));
            document.querySelectorAll('.quick-amount').forEach(btn => btn.classList.remove('selected'));
            selectedNetwork = null;
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    };
}

// Initialize enhanced features
document.addEventListener('DOMContentLoaded', function() {
    setupPhoneNumberAutoDetection();
    enhanceFormSubmissions();
    displayRecentTransactions();
    updateAuthUI();
    
    // Set up periodic transaction display refresh
    setInterval(displayRecentTransactions, 30000); // Refresh every 30 seconds
});

// Update authentication UI based on login state
function updateAuthUI() {
    const authLink = document.getElementById('authLink');
    if (!authLink) return;

    const sessionUser = sessionStorage.getItem('currentUser');
    const persistentUser = localStorage.getItem('currentUser');
    const currentUser = sessionUser || persistentUser;

    if (currentUser) {
        const user = JSON.parse(currentUser);
        authLink.textContent = `👤 ${user.name}`;
        authLink.href = '#';
        authLink.onclick = function(e) {
            e.preventDefault();
            showUserMenu();
        };
    } else {
        authLink.textContent = 'Login';
        authLink.href = 'login.html';
        authLink.onclick = null;
    }
}

// Show user menu when logged in
function showUserMenu() {
    // Remove existing menu if present
    const existingMenu = document.querySelector('.user-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }

    // Create user menu
    const menu = document.createElement('div');
    menu.className = 'user-menu';
    menu.style.cssText = `
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        min-width: 150px;
        z-index: 1000;
        padding: 0.5rem 0;
        margin-top: 0.5rem;
    `;

    const user = JSON.parse(sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser'));
    
    menu.innerHTML = `
        <div style="padding: 0.8rem 1rem; border-bottom: 1px solid #f0f0f0; font-weight: 500;">
            ${user.name}
        </div>
        <a href="#" onclick="showProfile(); return false;" style="display: block; padding: 0.8rem 1rem; text-decoration: none; color: #333; transition: background 0.2s;">
            👤 Profile
        </a>
        <a href="#" onclick="showTransactionHistory(); return false;" style="display: block; padding: 0.8rem 1rem; text-decoration: none; color: #333; transition: background 0.2s;">
            📊 Transactions
        </a>
        <div style="border-top: 1px solid #f0f0f0; margin: 0.5rem 0;"></div>
        <a href="#" onclick="logout(); return false;" style="display: block; padding: 0.8rem 1rem; text-decoration: none; color: #e74c3c; transition: background 0.2s;">
            🚪 Logout
        </a>
    `;

    // Add hover effects
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        link.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
        });
    });

    // Position menu relative to auth link
    const authLink = document.getElementById('authLink');
    const linkRect = authLink.getBoundingClientRect();
    authLink.parentNode.style.position = 'relative';
    authLink.parentNode.appendChild(menu);

    // Close menu when clicking outside
    document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target) && e.target !== authLink) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
}

// Profile management functions
function showProfile() {
    const user = JSON.parse(sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser'));
    showMessage(`Profile: ${user.name} (${user.email})`, 'success');
    document.querySelector('.user-menu')?.remove();
}

function showTransactionHistory() {
    showMessage('Transaction history would be displayed here', 'success');
    document.querySelector('.user-menu')?.remove();
}

// Show transaction receipt with QR code
function showTransactionReceipt(receipt) {
    const modal = document.createElement('div');
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
        z-index: 3000;
    `;

    modal.innerHTML = `
        <div style="background: white; border-radius: 15px; padding: 2rem; max-width: 400px; width: 90%; text-align: center;">
            <h3 style="color: #27ae60; margin-bottom: 1rem;">✅ Transaction Successful</h3>
            
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; text-align: left;">
                <p style="margin: 0.3rem 0;"><strong>Transaction ID:</strong> ${receipt.transactionId}</p>
                <p style="margin: 0.3rem 0;"><strong>Type:</strong> ${receipt.type.charAt(0).toUpperCase() + receipt.type.slice(1)}</p>
                <p style="margin: 0.3rem 0;"><strong>Amount:</strong> ₦${receipt.amount}</p>
                <p style="margin: 0.3rem 0;"><strong>Phone:</strong> ${receipt.phoneNumber}</p>
                <p style="margin: 0.3rem 0;"><strong>Network:</strong> ${receipt.network.toUpperCase()}</p>
                <p style="margin: 0.3rem 0;"><strong>Time:</strong> ${receipt.timestamp}</p>
            </div>
            
            <div style="margin: 1rem 0;">
                <img src="${receipt.qrCode}" alt="Transaction QR Code" style="max-width: 150px; border-radius: 8px;">
                <p style="font-size: 0.8rem; color: #666; margin-top: 0.5rem;">Scan QR for transaction details</p>
            </div>
            
            <div style="display: flex; gap: 0.5rem; justify-content: center;">
                <button onclick="this.closest('div').parentElement.remove()" style="padding: 0.8rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">Close</button>
                <button onclick="printReceipt('${receipt.transactionId}')" style="padding: 0.8rem 1.5rem; background: #27ae60; color: white; border: none; border-radius: 8px; cursor: pointer;">Print</button>
            </div>
        </div>
    `;

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
}

// Print receipt function
function printReceipt(transactionId) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Transaction Receipt - ${transactionId}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .receipt { max-width: 400px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .details { background: #f5f5f5; padding: 15px; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <div class="header">
                        <h2>Pay4me Transaction Receipt</h2>
                        <p>Transaction ID: ${transactionId}</p>
                    </div>
                    <div class="details">
                        <p>Thank you for using Pay4me!</p>
                        <p>Transaction completed successfully.</p>
                        <p>Time: ${new Date().toLocaleString()}</p>
                    </div>
                </div>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Enhanced logout function
function logout() {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    
    showMessage('Logged out successfully', 'success');
    
    setTimeout(() => {
        updateAuthUI();
        window.location.href = 'login.html';
    }, 1500);
    
    document.querySelector('.user-menu')?.remove();
}