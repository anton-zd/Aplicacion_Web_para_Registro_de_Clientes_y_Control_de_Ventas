// DOM elements
const loginScreen = document.getElementById('loginScreen');
const searchScreen = document.getElementById('searchScreen');
const addClientScreen = document.getElementById('addClientScreen');
const loginForm = document.getElementById('loginForm');
const searchForm = document.getElementById('searchForm');
const addClientForm = document.getElementById('addClientForm');
const loginBtn = document.getElementById('loginBtn');
const searchBtn = document.getElementById('searchBtn');
const logoutBtn = document.getElementById('logoutBtn');
const backToSearchBtn = document.getElementById('backToSearchBtn');
const errorMessage = document.getElementById('errorMessage');
const searchResult = document.getElementById('searchResult');
const addBtn = document.getElementById('addBtn');

const API_BASE_URL = 'https://api-sales-manegement.up.railway.app'; // Adjust port as needed
const API_ENDPOINT = '/';

// Demo credentials
const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = 'admin';

// Session management constants
const SESSION_KEY = 'parrillada_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Session management functions
function saveSession() {
    const sessionData = {
        isLoggedIn: true,
        loginTime: Date.now(),
        username: DEMO_USERNAME
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
}

function getSession() {
    try {
        const sessionData = localStorage.getItem(SESSION_KEY);
        if (!sessionData) return null;
        
        const session = JSON.parse(sessionData);
        const currentTime = Date.now();
        const timeDifference = currentTime - session.loginTime;
        
        // Check if session has expired (24 hours)
        if (timeDifference > SESSION_DURATION) {
            clearSession();
            return null;
        }
        
        return session;
    } catch (error) {
        console.error('Error reading session:', error);
        clearSession();
        return null;
    }
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

function isSessionValid() {
    const session = getSession();
    return session && session.isLoggedIn;
}

// Function to check session expiry periodically
function checkSessionExpiry() {
    const currentScreen = document.querySelector('.screen.active');
    
    // Only check if user is currently on search screen (logged in)
    if (currentScreen === searchScreen) {
        if (!isSessionValid()) {
            // Session has expired, automatically log out
            showError('Your session has expired after 24 hours. Please log in again.');
            
            // Clear any ongoing processes
            clearSession();
            
            // Reset forms
            loginForm.reset();
            searchForm.reset();
            
            // Hide any messages and client fields
            hideSearchMessages();
            hideClientNameField();
            hideClientDetailsFields();
            
            // Switch back to login screen after a short delay
            setTimeout(() => {
                showScreen(loginScreen);
                document.getElementById('username').focus();
            }, 3000);
        }
    }
}

// Optional: Function to get remaining session time (for debugging)
function getRemainingSessionTime() {
    const session = getSession();
    if (!session) return 0;
    
    const currentTime = Date.now();
    const timeElapsed = currentTime - session.loginTime;
    const timeRemaining = SESSION_DURATION - timeElapsed;
    
    return Math.max(0, timeRemaining);
}

// Optional: Function to format remaining time as human readable string
function formatRemainingTime() {
    const remaining = getRemainingSessionTime();
    if (remaining === 0) return 'Session expired';
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    return `${hours}h ${minutes}m remaining`;
}

//SEARCH BY DNI
// Function to fetch client data from API
async function fetchClientData() {
    try {
        const response = await fetch(`${API_BASE_URL}/clients`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching client data:', error);
        return null;
    }
}

// Function to search for client by DNI
function searchClientByDni(apiResponse, dniToSearch) {
    if (!apiResponse || !apiResponse.values) {
        return null;
    }
    
    // Skip the first row (index 0) as it contains headers
    for (let i = 1; i < apiResponse.values.length; i++) {
        const row = apiResponse.values[i];
        if (row && row[0] === dniToSearch) {
            return {
                dni: row[0],
                name: row[1],
                quantity: row[2]
            };
        }
    }
    
    return null; // Client not found
}
//END SEARCH DNI

// Utility functions
function showScreen(screenToShow) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    screenToShow.classList.add('active');
}

// Update setButtonLoading function to handle Save button
function setButtonLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.loading-spinner');
    
    if (isLoading) {
        if (button === loginBtn) {
            btnText.textContent = 'Logging in...';
        } else if (button === searchBtn) {
            btnText.textContent = 'Searching...';
        } else if (button.id === 'saveBtn') {
            btnText.textContent = 'Saving...';
        } else if (button.id === 'addBtn') {
            btnText.textContent = 'Adding...';
        } else if (button.id === 'addClientSaveBtn') {
            btnText.textContent = 'Saving...';
        }
        spinner.style.display = 'inline-block';
        button.disabled = true;
    } else {
        if (button === loginBtn) {
            btnText.textContent = 'Log In';
        } else if (button === searchBtn) {
            btnText.textContent = 'Search';
        } else if (button.id === 'saveBtn') {
            btnText.textContent = 'Save';
        } else if (button.id === 'addBtn') {
            btnText.textContent = 'Add';
        } else if (button.id === 'addClientSaveBtn') {
            btnText.textContent = 'Save Client';
        }
        spinner.style.display = 'none';
        button.disabled = false;
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

function hideError() {
    errorMessage.style.display = 'none';
}

function showSearchResult() {
    searchResult.style.display = 'block';
    
    // Hide result after 5 seconds
    setTimeout(() => {
        searchResult.style.display = 'none';
    }, 5000);
}


// Modified login functionality 
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // Hide any previous error
    hideError();
    
    // Validate credentials
    if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
        showError('Invalid credentials. Please try again.');
        return;
    }
    
    // Show loading state
    setButtonLoading(loginBtn, true);
    
    // Simulate login process
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Save session to localStorage
        saveSession();
        
        // Reset form
        loginForm.reset();
        
        // Switch to search screen
        showScreen(searchScreen);
        
    } catch (error) {
        showError('Login failed. Please try again.');
    } finally {
        setButtonLoading(loginBtn, false);
    }
});

//SEARCH DNI
// Function to show client name field
function showClientNameField(clientName) {
    const clientNameGroup = document.getElementById('clientNameGroup');
    const clientNameInput = document.getElementById('clientName');
    
    clientNameInput.value = clientName;
    clientNameGroup.style.display = 'block';
}

// Function to show client details fields (Quantity and Payment Status)
function showClientDetailsFields(quantity) {
    const clientDetailsGroup = document.getElementById('clientDetailsGroup');
    const clientQuantityInput = document.getElementById('clientQuantity');
    const clientPriceInput = document.getElementById('clientPrice');
    const paymentStatusInput = document.getElementById('paymentStatus');
    const paymentMethodInput = document.getElementById('paymentMethod');
    
    // Set the quantity from API
    const initialQuantity = quantity || '0';
    clientQuantityInput.value = initialQuantity;
    
    // Calculate and set initial price
    updatePrice(parseInt(initialQuantity));
    
    // Reset payment status to default
    paymentStatusInput.value = 'No Pago';

    // Reset payment method to default (disabled, Efectivo)
    paymentMethodInput.value = 'Efectivo';
    paymentMethodInput.disabled = true;
    
    // Show the fields
    clientDetailsGroup.style.display = 'block';
}

// Function to calculate and update price based on quantity
function updatePrice(quantity) {
    const pricePerUnit = 15; // S/15 per unit
    const totalPrice = quantity * pricePerUnit;
    const clientPriceInput = document.getElementById('clientPrice');
    
    clientPriceInput.value = `S/${totalPrice}`;
}

// Function to hide client name field
function hideClientNameField() {
    const clientNameGroup = document.getElementById('clientNameGroup');
    const clientNameInput = document.getElementById('clientName');
    
    clientNameInput.value = '';
    clientNameGroup.style.display = 'none';
}

// Function to hide client details fields
function hideClientDetailsFields() {
    const clientDetailsGroup = document.getElementById('clientDetailsGroup');
    const clientQuantityInput = document.getElementById('clientQuantity');
    const clientPriceInput = document.getElementById('clientPrice');
    const paymentStatusInput = document.getElementById('paymentStatus');
    const paymentMethodInput = document.getElementById('paymentMethod');
    
    clientQuantityInput.value = '0';
    clientPriceInput.value = 'S/0';
    paymentStatusInput.value = 'No Pago';
    paymentMethodInput.value = 'Efectivo';
    paymentMethodInput.disabled = true;
    clientDetailsGroup.style.display = 'none';
}

function showSearchError() {
    searchResult.style.display = 'block';
    // Show the Add button when client not found
    if (addBtn) {
        addBtn.style.display = 'block';
    }
    // Stays visible until next search
}

// Hide search messages
function hideSearchMessages() {
    searchResult.style.display = 'none';
    // Hide the Add button when hiding search messages
    if (addBtn) {
        addBtn.style.display = 'none';
    }
}


// Modified search functionality
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const clientDni = document.getElementById('clientDni').value.trim();
    
    if (!clientDni) {
        return;
    }
    
    // Hide any previous error message and client name field at the start of new search
    hideSearchMessages();
    hideClientNameField();
    hideClientDetailsFields();
    
    // Show loading state
    setButtonLoading(searchBtn, true);
    
    try {
        const apiResponse = await fetchClientData();
        
        if (!apiResponse) {
            throw new Error('Failed to fetch client data');
        }
        
        const foundClient = searchClientByDni(apiResponse, clientDni);
        
        if (foundClient) {
            // Client found - Show client name and details fields
            showClientNameField(foundClient.name);
            showClientDetailsFields(foundClient.quantity);
            console.log('Client found:', foundClient);
        } else {
            // Client not found - show RED error message
            showSearchError();
        }
        
        // Don't reset the DNI field - keep the entered value
        // document.getElementById('clientDni').value = ''; // Removed this line
        
    } catch (error) {
        console.error('Search error:', error);
        showError('Search failed. Please try again.');
    } finally {
        setButtonLoading(searchBtn, false);
    }
});
//END SEARCH DNI


// Logout functionality
logoutBtn.addEventListener('click', () => {
    // Clear session from localStorage
    clearSession();
    
    // Reset forms
    loginForm.reset();
    searchForm.reset();
    if (addClientForm) addClientForm.reset();
    
    // Reset add client quantity field
    const addClientQuantityInput = document.getElementById('addClientQuantity');
    if (addClientQuantityInput) addClientQuantityInput.value = '0';
    
    // Hide any messages and client name field
    hideError();
    hideSearchMessages();
    hideClientNameField();
    hideClientDetailsFields();
    
    // Switch back to login screen
    showScreen(loginScreen);
});

// Auto-fill demo credentials when clicking on them
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('credential')) {
        const credentialText = e.target.textContent;
        if (credentialText === DEMO_USERNAME) {
            document.getElementById('username').value = credentialText;
        } else if (credentialText === DEMO_PASSWORD) {
            document.getElementById('password').value = credentialText;
        }
    }
});

// Handle form submission with Enter key
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const activeScreen = document.querySelector('.screen.active');
        if (activeScreen === loginScreen) {
            loginForm.dispatchEvent(new Event('submit'));
        } else if (activeScreen === searchScreen) {
            searchForm.dispatchEvent(new Event('submit'));
        }
    }
});

// Prevent zoom on iOS double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check if user has valid session
    if (isSessionValid()) {
        // User is already logged in, show search screen
        showScreen(searchScreen);
    } else {
        // No valid session, show login screen
        showScreen(loginScreen);
        // Focus on username field
        document.getElementById('username').focus();
    }
    
    // Initialize quantity controls
    initializeQuantityControls();
    
    // Initialize payment status dropdown
    initializePaymentStatusDropdown();
    
    // Initialize payment method dropdown
    initializePaymentMethodDropdown();
    
    // Initialize remark checkbox
    initializeRemarkCheckbox();

    // Initialize save button
    initializeSaveButton();
    
    // Initialize add button
    initializeAddButton();
    
    // Initialize back to search button
    initializeBackToSearchButton();
    
    // Initialize add client form controls
    initializeAddClientControls();
    
    // Set up session check interval (check every 5 minutes)
    setInterval(checkSessionExpiry, 5 * 60 * 1000);
});

// Quantity Controls
function initializeQuantityControls() {
    const decreaseBtn = document.getElementById('decreaseBtn');
    const increaseBtn = document.getElementById('increaseBtn');
    const quantityInput = document.getElementById('clientQuantity');
    
    decreaseBtn.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value) || 0;
        if (currentValue > 0) {
            const newValue = currentValue - 1;
            quantityInput.value = newValue;
            updatePrice(newValue); // Update price when quantity changes
        }
    });
    
    increaseBtn.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value) || 0;
        const newValue = currentValue + 1;
        quantityInput.value = newValue;
        updatePrice(newValue); // Update price when quantity changes
    });
}

// Payment Status Dropdown
function initializePaymentStatusDropdown() {
    const paymentStatusInput = document.getElementById('paymentStatus');
    const paymentDropdown = document.getElementById('paymentDropdown');
    const paymentOptions = document.querySelectorAll('.payment-option');
    
    // Show dropdown when clicking the input
    paymentStatusInput.addEventListener('click', () => {
        paymentDropdown.style.display = paymentDropdown.style.display === 'none' ? 'block' : 'none';
    });
    
    // Handle option selection
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedValue = option.getAttribute('data-value');
            paymentStatusInput.value = selectedValue;
            paymentDropdown.style.display = 'none';
            
            // Update payment method field based on payment status
            updatePaymentMethodStatus(selectedValue);
        });
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.payment-status-container')) {
            paymentDropdown.style.display = 'none';
        }
    });
}

// Function to update payment method status based on payment status
function updatePaymentMethodStatus(paymentStatus) {
    const paymentMethodInput = document.getElementById('paymentMethod');
    
    if (paymentStatus === 'No Pago') {
        // Lock the payment method field and set to Efectivo
        paymentMethodInput.disabled = true;
        paymentMethodInput.value = 'Efectivo';
    } else if (paymentStatus === 'Si Pago') {
        // Unlock the payment method field
        paymentMethodInput.disabled = false;
    }
}

// Payment Method Dropdown
function initializePaymentMethodDropdown() {
    const paymentMethodInput = document.getElementById('paymentMethod');
    const paymentMethodDropdown = document.getElementById('paymentMethodDropdown');
    const paymentMethodOptions = document.querySelectorAll('.payment-method-option');
    
    // Show dropdown when clicking the input (only if not disabled)
    paymentMethodInput.addEventListener('click', () => {
        if (!paymentMethodInput.disabled) {
            paymentMethodDropdown.style.display = paymentMethodDropdown.style.display === 'none' ? 'block' : 'none';
        }
    });
    
    // Handle option selection
    paymentMethodOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedValue = option.getAttribute('data-value');
            paymentMethodInput.value = selectedValue;
            paymentMethodDropdown.style.display = 'none';
        });
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.payment-method-container')) {
            paymentMethodDropdown.style.display = 'none';
        }
    });
}

// Remark Checkbox Functionality
function initializeRemarkCheckbox() {
    const remarkCheckbox = document.getElementById('remarkCheckbox');
    const remarkTextGroup = document.getElementById('remarkTextGroup');
    
    remarkCheckbox.addEventListener('change', () => {
        if (remarkCheckbox.checked) {
            // Show the text box with animation
            remarkTextGroup.style.display = 'block';
            
            // Focus on the textarea after animation completes
            setTimeout(() => {
                document.getElementById('remarkText').focus();
            }, 200);
        } else {
            // Hide the text box
            remarkTextGroup.style.display = 'none';
            
            // Clear the text box content
            document.getElementById('remarkText').value = '';
        }
    });
}

// Function to get current seller name from DOM (reads from HTML)
function getCurrentSellerName() {
    // Read the seller name directly from the HTML element
    const sellerNameElement = document.querySelector('.user-details h3');
    return sellerNameElement ? sellerNameElement.textContent.trim() : '.user-details h3';
}

// Function to get current DNI from DOM
function getCurrentDNI() {
    const dniInput = document.getElementById('clientDni');
    return dniInput ? dniInput.value.trim() : null;
}

// Function to get current client name from DOM
function getCurrentClientName() {
    const clientNameInput = document.getElementById('clientName');
    return clientNameInput ? clientNameInput.value.trim() : null;
}

// Function to get current quantity from DOM
function getCurrentQuantity() {
    const quantityInput = document.getElementById('clientQuantity');
    return quantityInput ? quantityInput.value.trim() : null;
}

// Function to get current price from DOM (without 'S/' prefix)
function getCurrentPrice() {
    const priceInput = document.getElementById('clientPrice');
    if (priceInput) {
        const priceValue = priceInput.value.trim();
        // Remove 'S/' prefix if present and return just the numeric value
        return priceValue.replace('S/', '').trim();
    }
    return null;
}

// Function to get current payment status from DOM
function getCurrentPaymentStatus() {
    const paymentStatusInput = document.getElementById('paymentStatus');
    return paymentStatusInput ? paymentStatusInput.value.trim() : null;
}

// Function to get current payment method from DOM
function getCurrentPaymentMethod() {
    const paymentMethodInput = document.getElementById('paymentMethod');
    const paymentStatus = getCurrentPaymentStatus();
    
    // If payment status is "No Pago", return dash instead of empty string
    if (paymentStatus === 'No Pago') {
        return 'none';
    }
    
    // If payment status is "Si Pago", return the selected payment method
    return paymentMethodInput ? paymentMethodInput.value.trim() : '';
}

// Function to get current remark text from DOM
function getCurrentRemarkText() {
    const remarkCheckbox = document.getElementById('remarkCheckbox');
    const remarkTextInput = document.getElementById('remarkText');
    
    // If checkbox is checked and text exists, return the text
    if (remarkCheckbox && remarkCheckbox.checked && remarkTextInput) {
        return remarkTextInput.value.trim();
    }
    
    // Return empty string if checkbox is not checked or no text
    return 'none';
}

// Function to save seller data to Google Sheets
async function saveSeller() {
    try {
        // Get current seller name from the DOM
        const sellerName = getCurrentSellerName();
        const dni = getCurrentDNI();
        const clientName = getCurrentClientName();
        const quantity = getCurrentQuantity();
        const price = getCurrentPrice();
        const paymentStatus = getCurrentPaymentStatus();
        const paymentMethod = getCurrentPaymentMethod();
        const remarkText = getCurrentRemarkText();
        
        if (!sellerName) {
            throw new Error('No seller name available to save');
        }
        
        if (!dni) {
            throw new Error('No DNI entered. Please search for a client first.');
        }
        
        if (!clientName) {
            throw new Error('No client name available. Please search for a client first.');
        }
        
        // Allow quantity to be '0' - just check if it exists
        if (quantity === null || quantity === undefined || quantity === '') {
            throw new Error('No quantity available. Please ensure quantity field is populated.');
        }
        
        // Allow price to be '0' - just check if it exists
        if (price === null || price === undefined || price === '') {
            throw new Error('No price available. Please ensure price field is populated.');
        }
        
        if (!paymentStatus) {
            throw new Error('No payment status selected. Please select a payment status.');
        }
        
        // Validate payment method only if payment status is "Si Pago"
        if (paymentStatus === 'Si Pago' && !paymentMethod) {
            throw new Error('Payment method is required when payment status is "Si Pago".');
        }
        
        // Get current timestamp from device
        const timestamp = new Date().toLocaleString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        // Prepare data to send
        const saveData = {
            sellerName: sellerName,
            dni: dni,
            clientName: clientName,
            quantity: quantity,
            price: price,
            paymentStatus: paymentStatus,
            paymentMethod: paymentMethod,
            timestamp: timestamp,
            remarkText: remarkText
        };
        
        // Send POST request to save endpoint
        const response = await fetch(`${API_BASE_URL}/sells`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(saveData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Save successful:', result);
        
        return result;
        
    } catch (error) {
        console.error('Error saving seller data:', error);
        throw error;
    }
}

// Function to show success message (similar to showError)
function showSuccessMessage(message) {
    // You can reuse the existing error message element or create a new one
    const successElement = document.getElementById('errorMessage'); // Reusing error element
    
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
        successElement.style.backgroundColor = '#d4edda'; // Green background for success
        successElement.style.color = '#155724'; // Dark green text
        successElement.style.border = '1px solid #c3e6cb'; // Green border
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            successElement.style.display = 'none';
            // Reset to original error styling
            successElement.style.backgroundColor = '#f8d7da';
            successElement.style.color = '#721c24';
            successElement.style.border = '1px solid #f5c6cb';
        }, 5000);
    }
}

// NEW: Initialize Save Button functionality
function initializeSaveButton() {
    const saveBtn = document.getElementById('saveBtn');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            // Show loading state
            setButtonLoading(saveBtn, true);
            
            try {
                // Save seller data
                const result = await saveSeller();
                
                // Create success message with conditional payment method display
                let successMessage = `Seller "${result.sellerName}" with client "${result.clientName}" (DNI: ${result.dni}, Qty: ${result.quantity}, Price: S/${result.price}, Status: ${result.paymentStatus}`;
                
                // Add payment method to message only if it exists
                if (result.paymentMethod && result.paymentMethod !== '') {
                    successMessage += `, Method: ${result.paymentMethod}`;
                }
                
                successMessage += `) saved successfully!`;
                
                // Show success message
                showSuccessMessage(successMessage);
                
            } catch (error) {
                // Show error message
                showError(`Failed to save: ${error.message}`);
                
            } finally {
                // Hide loading state
                setButtonLoading(saveBtn, false);
            }
        });
    }
}

// NEW: Initialize Add Button functionality
function initializeAddButton() {
    if (addBtn) {
        addBtn.addEventListener('click', async () => {
            // Show loading state
            setButtonLoading(addBtn, true);
            
            try {
                // Get the current DNI from search field
                const currentDni = document.getElementById('clientDni').value.trim();
                
                // Pre-fill the DNI field in the add client form
                const addClientDniInput = document.getElementById('addClientDni');
                if (addClientDniInput && currentDni) {
                    addClientDniInput.value = currentDni;
                    // Lock the DNI field to prevent editing
                    addClientDniInput.setAttribute('readonly', true);
                }
                
                // Clear other fields in add client form
                const addClientNameInput = document.getElementById('addClientName');
                const addClientQuantityInput = document.getElementById('addClientQuantity');
                
                if (addClientNameInput) addClientNameInput.value = '';
                if (addClientQuantityInput) addClientQuantityInput.value = '0';
                
                // Switch to add client screen
                showScreen(addClientScreen);
                
                // Focus on client name field
                if (addClientNameInput) {
                    setTimeout(() => addClientNameInput.focus(), 100);
                }
                
            } catch (error) {
                // Show error message
                showError(`Failed to open add client form: ${error.message}`);
                
            } finally {
                // Hide loading state
                setButtonLoading(addBtn, false);
            }
        });
    }
}

// Initialize Back to Search Button functionality
function initializeBackToSearchButton() {
    if (backToSearchBtn) {
        backToSearchBtn.addEventListener('click', () => {
            // Switch back to search screen
            showScreen(searchScreen);
            
            // Clear any search messages
            hideSearchMessages();
            
            // Clear and unlock the DNI field in add client form for future use
            const addClientDniInput = document.getElementById('addClientDni');
            if (addClientDniInput) {
                addClientDniInput.value = '';
                addClientDniInput.removeAttribute('readonly');
            }
        });
    }
}

// Initialize Add Client Form Controls
function initializeAddClientControls() {
    // Initialize quantity controls for add client form
    const addClientDecreaseBtn = document.getElementById('addClientDecreaseBtn');
    const addClientIncreaseBtn = document.getElementById('addClientIncreaseBtn');
    const addClientQuantityInput = document.getElementById('addClientQuantity');
    
    if (addClientDecreaseBtn && addClientIncreaseBtn && addClientQuantityInput) {
        addClientDecreaseBtn.addEventListener('click', () => {
            let currentValue = parseInt(addClientQuantityInput.value) || 0;
            if (currentValue > 0) {
                const newValue = currentValue - 1;
                addClientQuantityInput.value = newValue;
            }
        });
        
        addClientIncreaseBtn.addEventListener('click', () => {
            let currentValue = parseInt(addClientQuantityInput.value) || 0;
            const newValue = currentValue + 1;
            addClientQuantityInput.value = newValue;
        });
    }
    
    // Initialize add client form submission with API integration
    if (addClientForm) {
        addClientForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form field values
            const dniInput = document.getElementById('addClientDni');
            const clientNameInput = document.getElementById('addClientName');
            const quantityInput = document.getElementById('addClientQuantity');
            const saveBtn = document.getElementById('addClientSaveBtn');
            
            if (!dniInput || !clientNameInput || !quantityInput || !saveBtn) {
                console.error('Required form elements not found');
                return;
            }
            
            const dni = dniInput.value.trim();
            const clientName = clientNameInput.value.trim();
            const quantity = parseInt(quantityInput.value) || 0;
            
            // Validate that inputs are not empty
            if (!dni || !clientName) {
                alert('Please fill in all required fields (DNI and Client Name).');
                return;
            }
            
            // Show loading state
            setButtonLoading(saveBtn, true);
            
            try {
                const response = await fetch(`${API_BASE_URL}/clients`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        dni: dni,
                        clientName: clientName,
                        quantity: quantity
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    console.log('API response:', result);
                    // Client saved successfully - no visual notification
                    // User remains on the Add Client screen
                    
                } else {
                    alert(`Error saving client: ${result.error}`);
                    console.error('API error:', result.error);
                }

            } catch (error) {
                console.error('Error connecting to the API:', error);
                alert('An error occurred while trying to save the client. Please check your connection and try again.');
            } finally {
                // Remove loading state
                setButtonLoading(saveBtn, false);
            }
        });
    }
}

// Function to show error message (persistent)
function showLoginError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        errorElement.style.opacity = '1';
    }
}

// Function to hide error message
function hideLoginError() {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.style.display = 'none';
        errorElement.style.opacity = '0';
    }
}

// Update the login form event listener
function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Hide any previous error messages when attempting new login
            hideLoginError();
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            
            // Show loading state
            const btnText = loginBtn.querySelector('.btn-text');
            const spinner = loginBtn.querySelector('.loading-spinner');
            
            if (btnText && spinner) {
                btnText.style.display = 'none';
                spinner.style.display = 'inline-block';
                loginBtn.disabled = true;
            }
            
            // Simulate login validation (replace with your actual logic)
            try {
                // Demo validation
                if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
                    // Successful login
                    hideLoginError();
                    showScreen(searchScreen);
                } else {
                    // Failed login - show persistent error
                    showLoginError('Invalid credentials. Please try again.');
                }
            } catch (error) {
                // Network or other error
                showLoginError('Login failed. Please check your connection and try again.');
            } finally {
                // Reset button state
                if (btnText && spinner) {
                    btnText.style.display = 'inline';
                    spinner.style.display = 'none';
                    loginBtn.disabled = false;
                }
            }
        });
        
        // Hide error message when user starts typing (optional)
        usernameInput.addEventListener('input', hideLoginError);
        passwordInput.addEventListener('input', hideLoginError);
    }
}

