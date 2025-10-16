# UtilityHub - Multipage Utility Site

A responsive web application for recharging airtime, buying data bundles, and sports betting simulation for Nigerian networks (MTN, Airtel, Glo) with Sportybet integration.

## Features

### 📞 Airtime Recharge
- Support for MTN, Airtel, and Glo networks
- Auto-network detection based on phone number
- Quick amount selection (₦100, ₦200, ₦500, ₦1000, ₦2000, ₦5000)
- Custom amount input (₦50 - ₦10,000)
- Transaction history tracking
- Form validation and error handling

### 📶 Data Bundle Purchase
- Network-specific data plans with competitive pricing
- Visual plan comparison across all networks
- Dynamic plan loading based on selected network
- Validity period information
- Data usage tips and best practices

### ⚽ Sportybet Integration
- Sports betting simulation interface
- Popular match selection with live odds
- Multiple bet types (Match Winner, Over/Under, Both Teams to Score, Correct Score)
- Stake amount selection with potential winnings calculation
- Live matches display
- Quick bet functionality

### 🔐 User Authentication
- Secure login and registration system
- Password strength validation
- Email format validation
- Nigerian phone number validation
- Social login options (Google, Facebook)
- Password recovery functionality
- Session management with "Remember me" option
- User profile and transaction history access

## Technical Features

### 🎨 Responsive Design
- Mobile-first approach using CSS Grid and Flexbox
- Optimized for all screen sizes (mobile, tablet, desktop)
- Touch-friendly interface with proper tap targets
- Smooth animations and transitions
- Modern gradient backgrounds

### ⚡ Interactive JavaScript
- Form handling with validation
- Network auto-detection from phone numbers
- Local storage for transaction history
- Dynamic content loading
- Real-time calculations
- Mobile menu functionality

### 🔒 Security & Validation
- Client-side form validation
- Nigerian phone number format validation with API verification
- Input sanitization and real-time validation
- Amount range validation with live currency conversion
- Network-specific validation rules

### 🌐 API Integration
- Real-time exchange rate conversion (USD ⇄ NGN)
- IP-based location detection for localized services
- Phone number validation with carrier detection
- Live network status monitoring
- Transaction processing with confirmation codes
- Error handling and fallback mechanisms

## File Structure

```
utility bill/
├── index.html          # Homepage with service overview
├── airtime.html        # Airtime recharge page
├── data.html          # Data bundle purchase page
├── sportybet.html     # Sports betting page
├── login.html         # User authentication page
├── css/
│   └── style.css      # Main stylesheet with responsive design
├── js/
│   ├── main.js            # Main JavaScript functionality
│   ├── auth.js            # Authentication handling
│   ├── api-service.js     # API integration and service calls
│   └── realtime-features.js # Live data updates and real-time features
├── images/                # Image assets directory
├── README.md              # Project documentation
└── API-SETUP-GUIDE.md     # API integration setup guide
```

## Getting Started

1. **Clone or Download** the project files to your local machine
2. **Open** `index.html` in your web browser
3. **Navigate** between pages using the top navigation menu
4. **Test** the responsive design by resizing your browser window

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Network Information

### MTN
- **Color**: Yellow (#ffcc00)
- **Prefixes**: 0703, 0706, 0803, 0806, 0813, 0814, 0816, 0903, 0906, 0913, 0916
- **Features**: Largest coverage, fastest speeds, bonus offers

### Airtel
- **Color**: Red (#ff0000)
- **Prefixes**: 0701, 0708, 0802, 0808, 0812, 0901, 0902, 0904, 0907, 0912
- **Features**: SmartConnect technology, competitive rates

### Glo
- **Color**: Green (#00cc44)
- **Prefixes**: 0705, 0805, 0807, 0811, 0815, 0905, 0915
- **Features**: Data-rich plans, campus specials, flexible options

## Usage Examples

### User Registration & Login
1. Navigate to the Login page
2. Click "Create one" to register a new account
3. Fill in your details (name, email, phone, password)
4. Agree to terms and create account
5. Sign in with your credentials
6. Use "Remember me" for persistent sessions

### Airtime Recharge
1. Login to your account (optional but recommended)
2. Select your network (MTN/Airtel/Glo) or let auto-detection work
3. Enter your phone number
4. Choose amount using quick buttons or enter custom amount
5. Click "Recharge Now"

### Data Purchase
1. Login for better experience and history tracking
2. Select your network
3. Enter phone number for data recipient
4. Choose from available data plans
5. Confirm purchase

### Sports Betting (Demo)
1. Access the Sportybet page
2. Select a match from popular games
3. Choose bet type
4. Enter stake amount
5. Review potential winnings
6. Place demo bet

## Customization

### Colors
Update the CSS custom properties in `style.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --mtn-color: #ffcc00;
    --airtel-color: #ff0000;
    --glo-color: #00cc44;
}
```

### Data Plans
Modify the `dataPlansData` object in `main.js` to update pricing and plans.

### Network Prefixes
Update the `detectNetwork` function in `main.js` to modify network detection logic.

## Known Limitations

- This is a frontend-only demo application
- No real payment processing
- No actual network API integration
- Sportybet integration is simulated (not real betting)
- Transaction history stored in browser local storage

## Future Enhancements

- Backend API integration
- Real payment gateway integration
- User authentication system
- Transaction receipt generation
- Push notifications
- Offline functionality
- Dark mode support

## Support

For support or questions about this project, please refer to the code comments or documentation within the files.

## License

This project is for educational and demonstration purposes. All network logos and branding belong to their respective owners.

---

**Disclaimer**: This is a demo application. No real money transactions are processed. For actual airtime, data, or betting services, please visit the official websites of the respective service providers.