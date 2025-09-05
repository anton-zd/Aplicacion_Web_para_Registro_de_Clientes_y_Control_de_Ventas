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

const API_BASE_URL = 'http://localhost:1337'; 
const API_ENDPOINT = '/';

const CREDENTIALS = {
    'admin': 'admin',
    'carlos01': 'carlos123',
    'cielo01': 'cielo123',
    'raul01': 'raul123',
    'tia_rosa01': 'tia_rosa123'
};

const SELLER_NAMES = {
    'admin': 'Admin',
    'carlos01': 'Carlos',
    'cielo01': 'Cielo',
    'raul01': 'Raul',
    'tia_rosa01': 'Tia Rosa'
};

const SELLER_PROFILE_IMAGES = {
    'admin': 'seller_1.png',
    'seller_2': 'seller_2.png',
    'seller_3': 'seller_3.png',
    'seller_4': 'seller_4.png',
    'seller_5': 'seller_5.png'
};

const SESSION_KEY = 'parrillada_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; 

function saveSession(username) {
    const sessionData = {
        isLoggedIn: true,
        loginTime: Date.now(),
        username: username
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

        if (timeDifference > SESSION_DURATION) {
            clearSession();
            return null;
        }

        return session;
    } catch (error) {
                        console.error('Error conectando a la API:', error);
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

function checkSessionExpiry() {
    const currentScreen = document.querySelector('.screen.active');

    if (currentScreen === searchScreen) {
        if (!isSessionValid()) {

            showError('Tu sesión ha expirado después de 24 horas. Por favor inicia sesión nuevamente.');

            clearSession();

            loginForm.reset();
            searchForm.reset();

            hideSearchMessages();
            hideClientNameField();
            hideClientDetailsFields();

            setTimeout(() => {
                showScreen(loginScreen);
                document.getElementById('username').focus();
            }, 3000);
        }
    }
}

function getRemainingSessionTime() {
    const session = getSession();
    if (!session) return 0;

    const currentTime = Date.now();
    const timeElapsed = currentTime - session.loginTime;
    const timeRemaining = SESSION_DURATION - timeElapsed;

    return Math.max(0, timeRemaining);
}

function formatRemainingTime() {
    const remaining = getRemainingSessionTime();
    if (remaining === 0) return 'Session expired';

    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

    return `${hours}h ${minutes}m remaining`;
}

function showSuccessModal(title = "¡Cliente Guardado Exitosamente!", message = "El cliente ha sido añadido a la base de datos.") {
    const successModalOverlay = document.getElementById('successModalOverlay');
    const modalTitle = successModalOverlay.querySelector('h4');
    const modalMessage = successModalOverlay.querySelector('p');

    if (successModalOverlay) {

        if (modalTitle) modalTitle.textContent = title;
        if (modalMessage) modalMessage.textContent = message;

        successModalOverlay.style.display = 'flex';
    }
}

function hideSuccessModal() {
    const successModalOverlay = document.getElementById('successModalOverlay');
    if (successModalOverlay) {
        successModalOverlay.style.display = 'none';
    }
}

function toggleSearchHeaderButtons(showBackButton = false) {
    const logoutBtn = document.getElementById('logoutBtn');
    const searchBackBtn = document.getElementById('searchBackBtn');

    if (showBackButton) {

        if (logoutBtn) logoutBtn.style.display = 'none';
        if (searchBackBtn) searchBackBtn.style.display = 'block';
    } else {

        if (logoutBtn) logoutBtn.style.display = 'block';
        if (searchBackBtn) searchBackBtn.style.display = 'none';
    }
}

function redirectToSearchScreen() {

    hideSuccessModal();

    const addClientForm = document.getElementById('addClientForm');
    if (addClientForm) {
        addClientForm.reset();
    }

    const addClientQuantityInput = document.getElementById('addClientQuantity');
    if (addClientQuantityInput) {
        addClientQuantityInput.value = '0';
    }

    const addClientDniInput = document.getElementById('addClientDni');
    if (addClientDniInput) {
        addClientDniInput.value = '';
        addClientDniInput.removeAttribute('readonly');
    }

    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.reset();
    }

    hideSearchMessages();
    hideClientNameField();
    hideClientDetailsFields();

    const clientDniInput = document.getElementById('clientDni');
    const searchBtn = document.getElementById('searchBtn');
    if (clientDniInput) {
        clientDniInput.disabled = false;

        const lastAddedDni = sessionStorage.getItem('lastAddedDni');
        if (lastAddedDni) {
            clientDniInput.value = lastAddedDni;
            sessionStorage.removeItem('lastAddedDni');
        }
    }
    if (searchBtn) {
        searchBtn.style.display = 'block';
    }

    showScreen(searchScreen);
}

function updateSellerNameDisplay(username) {
    const displayName = SELLER_NAMES[username] || 'Vendedor';
    const profileImageName = SELLER_PROFILE_IMAGES[username] || 'seller_1.png';
    
    const sellerNameDisplay = document.getElementById('sellerNameDisplay');
    const sellerNameDisplayAdd = document.getElementById('sellerNameDisplayAdd');
    const profileImage = document.getElementById('profileImage');
    const profileImageAdd = document.getElementById('profileImageAdd');

    if (sellerNameDisplay) {
        sellerNameDisplay.textContent = displayName;
    }
    if (sellerNameDisplayAdd) {
        sellerNameDisplayAdd.textContent = displayName;
    }
    
    const imageUrl = `assets/${profileImageName}`;
    if (profileImage) {
        profileImage.src = imageUrl;
        profileImage.alt = `${displayName} Profile Picture`;

        profileImage.onerror = function() {
            this.src = 'assets/seller_1.png';
            this.alt = 'Default Profile Picture';
        };
    }
    if (profileImageAdd) {
        profileImageAdd.src = imageUrl;
        profileImageAdd.alt = `${displayName} Profile Picture`;
        
        profileImageAdd.onerror = function() {
            this.src = 'assets/seller_1.png';
            this.alt = 'Default Profile Picture';
        };
    }
}

async function fetchClientData() {
    try {
        const response = await fetch(`${API_BASE_URL}/clients`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error obteniendo datos del cliente:', error);
        return null;
    }
}

function searchClientByDni(apiResponse, dniToSearch) {
    if (!apiResponse || !apiResponse.values) {
        return null;
    }

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

    return null; 
}

function showScreen(screenToShow) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    screenToShow.classList.add('active');
}

function setButtonLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.loading-spinner');

    if (isLoading) {
        if (button === loginBtn) {
            btnText.textContent = 'Iniciando sesión...';
        } else if (button === searchBtn) {
            btnText.textContent = 'Buscando...';
        } else if (button.id === 'saveBtn') {
            btnText.textContent = 'Guardando...';
        } else if (button.id === 'addBtn') {
            btnText.textContent = 'Agregando...';
        } else if (button.id === 'addClientSaveBtn') {
            btnText.textContent = 'Guardando...';
        }
        spinner.style.display = 'inline-block';
        button.disabled = true;
    } else {
        if (button === loginBtn) {
            btnText.textContent = 'Iniciar Sesión';
        } else if (button === searchBtn) {
            btnText.textContent = 'Buscar';
        } else if (button.id === 'saveBtn') {
            btnText.textContent = 'Guardar';
        } else if (button.id === 'addBtn') {
            btnText.textContent = 'Agregar';
        } else if (button.id === 'addClientSaveBtn') {
            btnText.textContent = 'Guardar Cliente';
        }
        spinner.style.display = 'none';
        button.disabled = false;
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';

    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

function hideError() {
    errorMessage.style.display = 'none';
}

function showSearchResult() {
    searchResult.style.display = 'block';

    setTimeout(() => {
        searchResult.style.display = 'none';
    }, 5000);
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    hideError();

    if (!CREDENTIALS[username] || CREDENTIALS[username] !== password) {
        showError('Credenciales inválidas. Por favor intenta nuevamente.');
        return;
    }

    setButtonLoading(loginBtn, true);

    try {
        await new Promise(resolve => setTimeout(resolve, 2000));

        saveSession(username);

        updateSellerNameDisplay(username);

        loginForm.reset();

        showScreen(searchScreen);

    } catch (error) {
        showError('Error de inicio de sesión. Por favor intenta nuevamente.');
    } finally {
        setButtonLoading(loginBtn, false);
    }
});

function showClientNameField(clientName) {
    const clientNameGroup = document.getElementById('clientNameGroup');
    const clientNameInput = document.getElementById('clientName');

    clientNameInput.value = clientName;
    clientNameGroup.style.display = 'block';
}

function showClientDetailsFields(quantity) {
    const clientDetailsGroup = document.getElementById('clientDetailsGroup');
    const clientQuantityInput = document.getElementById('clientQuantity');
    const clientPriceInput = document.getElementById('clientPrice');
    const paymentStatusInput = document.getElementById('paymentStatus');
    const paymentMethodInput = document.getElementById('paymentMethod');

    const initialQuantity = quantity || '0';
    clientQuantityInput.value = initialQuantity;

    updatePrice(parseInt(initialQuantity));

    paymentStatusInput.value = 'No Pago';

    paymentMethodInput.value = 'Efectivo';
    paymentMethodInput.disabled = true;

    clientDetailsGroup.style.display = 'block';

    const clientDniInput = document.getElementById('clientDni');
    const searchBtn = document.getElementById('searchBtn');
    if (clientDniInput) {
        clientDniInput.disabled = true;
    }
    if (searchBtn) {
        searchBtn.style.display = 'none';
    }

    toggleSearchHeaderButtons(true);
}

function updatePrice(quantity) {
    const pricePerUnit = 15; 
    const totalPrice = quantity * pricePerUnit;
    const clientPriceInput = document.getElementById('clientPrice');

    clientPriceInput.value = `S/${totalPrice}`;
}

function hideClientNameField() {
    const clientNameGroup = document.getElementById('clientNameGroup');
    const clientNameInput = document.getElementById('clientName');

    clientNameInput.value = '';
    clientNameGroup.style.display = 'none';
}

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

    const clientDniInput = document.getElementById('clientDni');
    const searchBtn = document.getElementById('searchBtn');
    if (clientDniInput) {
        clientDniInput.disabled = false;
    }
    if (searchBtn) {
        searchBtn.style.display = 'block';
    }

    toggleSearchHeaderButtons(false);
}

function showSearchError() {
    searchResult.style.display = 'block';

    if (addBtn) {
        addBtn.style.display = 'block';
    }

}

function hideSearchMessages() {
    searchResult.style.display = 'none';

    if (addBtn) {
        addBtn.style.display = 'none';
    }
}

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const clientDni = document.getElementById('clientDni').value.trim();

    if (!clientDni) {
        return;
    }

    hideSearchMessages();
    hideClientNameField();
    hideClientDetailsFields();

    setButtonLoading(searchBtn, true);

    try {
        const apiResponse = await fetchClientData();

        if (!apiResponse) {
            throw new Error('Failed to fetch client data');
        }

        const foundClient = searchClientByDni(apiResponse, clientDni);

        if (foundClient) {

            showClientNameField(foundClient.name);
            showClientDetailsFields(foundClient.quantity);
            console.log('Cliente encontrado:', foundClient);
        } else {

            showSearchError();
        }

    } catch (error) {
        console.error('Error de búsqueda:', error);
        showError('Error en la búsqueda. Por favor intenta nuevamente.');
    } finally {
        setButtonLoading(searchBtn, false);
    }
});

logoutBtn.addEventListener('click', () => {

    clearSession();

    updateSellerNameDisplay('');

    loginForm.reset();
    searchForm.reset();
    if (addClientForm) addClientForm.reset();

    const addClientQuantityInput = document.getElementById('addClientQuantity');
    if (addClientQuantityInput) addClientQuantityInput.value = '0';

    hideError();
    hideSearchMessages();
    hideClientNameField();
    hideClientDetailsFields();

    showScreen(loginScreen);
});

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

let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

function restoreSellerNameFromSession() {
    const session = getSession();
    if (session && session.username) {
        updateSellerNameDisplay(session.username);
    } else {
        const profileImage = document.getElementById('profileImage');
        const profileImageAdd = document.getElementById('profileImageAdd');
        
        if (profileImage) {
            profileImage.src = 'assets/seller_1.png';
            profileImage.alt = 'Default Profile Picture';
        }
        if (profileImageAdd) {
            profileImageAdd.src = 'assets/seller_1.png';
            profileImageAdd.alt = 'Default Profile Picture';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {

    if (isSessionValid()) {

        restoreSellerNameFromSession();

        showScreen(searchScreen);
    } else {

        showScreen(loginScreen);

        document.getElementById('username').focus();
    }

    initializeQuantityControls();

    initializePaymentStatusDropdown();

    initializePaymentMethodDropdown();

    initializeRemarkCheckbox();

    initializeSaveButton();

    initializeAddButton();

    initializeBackToSearchButton();

    initializeSearchBackButton();

    initializeAddClientControls();

    initializeSuccessModal();

    initializePasswordToggle();

    setInterval(checkSessionExpiry, 5 * 60 * 1000);
});

function initializeSuccessModal() {
    const okModalBtn = document.getElementById('okModalBtn');

    if (okModalBtn) {
        okModalBtn.addEventListener('click', () => {
            redirectToSearchScreen();
        });
    }

    const successModalOverlay = document.getElementById('successModalOverlay');
    if (successModalOverlay) {
        successModalOverlay.addEventListener('click', (e) => {

            if (e.target === successModalOverlay) {
                redirectToSearchScreen();
            }
        });
    }
}

function initializeQuantityControls() {
    const decreaseBtn = document.getElementById('decreaseBtn');
    const increaseBtn = document.getElementById('increaseBtn');
    const quantityInput = document.getElementById('clientQuantity');

    decreaseBtn.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value) || 0;
        if (currentValue > 0) {
            const newValue = currentValue - 1;
            quantityInput.value = newValue;
            updatePrice(newValue); 
        }
    });

    increaseBtn.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value) || 0;
        const newValue = currentValue + 1;
        quantityInput.value = newValue;
        updatePrice(newValue); 
    });
}

function initializePaymentStatusDropdown() {
    const paymentStatusInput = document.getElementById('paymentStatus');
    const paymentDropdown = document.getElementById('paymentDropdown');
    const paymentOptions = document.querySelectorAll('.payment-option');

    paymentStatusInput.addEventListener('click', () => {
        paymentDropdown.style.display = paymentDropdown.style.display === 'none' ? 'block' : 'none';
    });

    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedValue = option.getAttribute('data-value');
            paymentStatusInput.value = selectedValue;
            paymentDropdown.style.display = 'none';

            updatePaymentMethodStatus(selectedValue);
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.payment-status-container')) {
            paymentDropdown.style.display = 'none';
        }
    });
}

function updatePaymentMethodStatus(paymentStatus) {
    const paymentMethodInput = document.getElementById('paymentMethod');

    if (paymentStatus === 'No Pago') {

        paymentMethodInput.disabled = true;
        paymentMethodInput.value = 'Efectivo';
    } else if (paymentStatus === 'Si Pago') {

        paymentMethodInput.disabled = false;
    }
}

function initializePaymentMethodDropdown() {
    const paymentMethodInput = document.getElementById('paymentMethod');
    const paymentMethodDropdown = document.getElementById('paymentMethodDropdown');
    const paymentMethodOptions = document.querySelectorAll('.payment-method-option');

    paymentMethodInput.addEventListener('click', () => {
        if (!paymentMethodInput.disabled) {
            paymentMethodDropdown.style.display = paymentMethodDropdown.style.display === 'none' ? 'block' : 'none';
        }
    });

    paymentMethodOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedValue = option.getAttribute('data-value');
            paymentMethodInput.value = selectedValue;
            paymentMethodDropdown.style.display = 'none';
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.payment-method-container')) {
            paymentMethodDropdown.style.display = 'none';
        }
    });
}

function initializeRemarkCheckbox() {
    const remarkCheckbox = document.getElementById('remarkCheckbox');
    const remarkTextGroup = document.getElementById('remarkTextGroup');

    remarkCheckbox.addEventListener('change', () => {
        if (remarkCheckbox.checked) {

            remarkTextGroup.style.display = 'block';

            setTimeout(() => {
                document.getElementById('remarkText').focus();
            }, 200);
        } else {

            remarkTextGroup.style.display = 'none';

            document.getElementById('remarkText').value = '';
        }
    });
}

function getCurrentSellerName() {

    const sellerNameElement = document.querySelector('.user-details h3');
    return sellerNameElement ? sellerNameElement.textContent.trim() : '.user-details h3';
}

function getCurrentDNI() {
    const dniInput = document.getElementById('clientDni');
    return dniInput ? dniInput.value.trim() : null;
}

function getCurrentClientName() {
    const clientNameInput = document.getElementById('clientName');
    return clientNameInput ? clientNameInput.value.trim() : null;
}

function getCurrentQuantity() {
    const quantityInput = document.getElementById('clientQuantity');
    return quantityInput ? quantityInput.value.trim() : null;
}

function getCurrentPrice() {
    const priceInput = document.getElementById('clientPrice');
    if (priceInput) {
        const priceValue = priceInput.value.trim();

        return priceValue.replace('S/', '').trim();
    }
    return null;
}

function getCurrentPaymentStatus() {
    const paymentStatusInput = document.getElementById('paymentStatus');
    return paymentStatusInput ? paymentStatusInput.value.trim() : null;
}

function getCurrentPaymentMethod() {
    const paymentMethodInput = document.getElementById('paymentMethod');
    const paymentStatus = getCurrentPaymentStatus();

    if (paymentStatus === 'No Pago') {
        return 'none';
    }

    return paymentMethodInput ? paymentMethodInput.value.trim() : '';
}

function getCurrentRemarkText() {
    const remarkCheckbox = document.getElementById('remarkCheckbox');
    const remarkTextInput = document.getElementById('remarkText');

    if (remarkCheckbox && remarkCheckbox.checked && remarkTextInput) {
        return remarkTextInput.value.trim();
    }

    return 'null';
}

async function saveSeller() {
    try {

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

        if (quantity === null || quantity === undefined || quantity === '') {
            throw new Error('No quantity available. Please ensure quantity field is populated.');
        }

        if (price === null || price === undefined || price === '') {
            throw new Error('No price available. Please ensure price field is populated.');
        }

        if (!paymentStatus) {
            throw new Error('No payment status selected. Please select a payment status.');
        }

        if (paymentStatus === 'Si Pago' && !paymentMethod) {
            throw new Error('Payment method is required when payment status is "Si Pago".');
        }

        const timestamp = new Date().toLocaleString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

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
        console.log('Guardado exitoso:', result);

        return result;

    } catch (error) {
        console.error('Error guardando datos del vendedor:', error);
        throw error;
    }
}

function showSuccessMessage(message) {

    const successElement = document.getElementById('errorMessage'); 

    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
        successElement.style.backgroundColor = '#d4edda'; 
        successElement.style.color = '#155724'; 
        successElement.style.border = '1px solid #c3e6cb'; 

        setTimeout(() => {
            successElement.style.display = 'none';

            successElement.style.backgroundColor = '#f8d7da';
            successElement.style.color = '#721c24';
            successElement.style.border = '1px solid #f5c6cb';
        }, 5000);
    }
}

function initializeSaveButton() {
    const saveBtn = document.getElementById('saveBtn');

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {

            setButtonLoading(saveBtn, true);

            try {

                const result = await saveSeller();

                showSuccessModal(
                    "¡Transacción Guardada Exitosamente!", 
                    "La transacción del cliente ha sido registrada en la base de datos."
                );

            } catch (error) {

                showError(`Error al guardar: ${error.message}`);

            } finally {

                setButtonLoading(saveBtn, false);
            }
        });
    }
}

function initializeAddButton() {
    if (addBtn) {
        addBtn.addEventListener('click', async () => {

            setButtonLoading(addBtn, true);

            try {

                const currentDni = document.getElementById('clientDni').value.trim();

                const addClientDniInput = document.getElementById('addClientDni');
                if (addClientDniInput && currentDni) {
                    addClientDniInput.value = currentDni;

                    addClientDniInput.setAttribute('readonly', true);
                }

                const addClientNameInput = document.getElementById('addClientName');
                const addClientQuantityInput = document.getElementById('addClientQuantity');

                if (addClientNameInput) addClientNameInput.value = '';
                if (addClientQuantityInput) addClientQuantityInput.value = '0';

                showScreen(addClientScreen);

                if (addClientNameInput) {
                    setTimeout(() => addClientNameInput.focus(), 100);
                }

            } catch (error) {

                showError(`Error al abrir el formulario de agregar cliente: ${error.message}`);

            } finally {

                setButtonLoading(addBtn, false);
            }
        });
    }
}

function initializeBackToSearchButton() {
    if (backToSearchBtn) {
        backToSearchBtn.addEventListener('click', () => {

            showScreen(searchScreen);

            hideSearchMessages();

            const addClientDniInput = document.getElementById('addClientDni');
            if (addClientDniInput) {
                addClientDniInput.value = '';
                addClientDniInput.removeAttribute('readonly');
            }
        });
    }
}

function initializeSearchBackButton() {
    const searchBackBtn = document.getElementById('searchBackBtn');

    if (searchBackBtn) {
        searchBackBtn.addEventListener('click', () => {

            hideClientNameField();
            hideClientDetailsFields();
            hideSearchMessages();

            const clientDniInput = document.getElementById('clientDni');
            if (clientDniInput) {
                clientDniInput.focus();
            }

            toggleSearchHeaderButtons(false);
        });
    }
}

function initializeAddClientControls() {

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

    if (addClientForm) {
        addClientForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const dniInput = document.getElementById('addClientDni');
            const clientNameInput = document.getElementById('addClientName');
            const quantityInput = document.getElementById('addClientQuantity');
            const saveBtn = document.getElementById('addClientSaveBtn');

            if (!dniInput || !clientNameInput || !quantityInput || !saveBtn) {
                console.error('Elementos de formulario requeridos no encontrados');
                return;
            }

            const dni = dniInput.value.trim();
            const clientName = clientNameInput.value.trim();
            const quantity = parseInt(quantityInput.value) || 0;

            if (!dni || !clientName) {
                alert('Por favor completa todos los campos requeridos (DNI y Nombre del Cliente).');
                return;
            }

            const session = getSession();
            const currentUsername = session ? session.username : null;
            const sellerName = currentUsername ? SELLER_NAMES[currentUsername] : 'Vendedor Desconocido';

            if (!sellerName || sellerName === 'Vendedor Desconocido') {
                alert('No se pudo identificar al vendedor actual. Por favor inicia sesión nuevamente.');
                return;
            }

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
                        quantity: quantity,
                        sellerName: sellerName
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    console.log('Respuesta API:', result);

                    showSuccessModal(
                        "¡Cliente Añadido Exitosamente!", 
                        "El nuevo cliente ha sido añadido a la base de datos."
                    );

                    sessionStorage.setItem('lastAddedDni', dni);

                } else {
                    alert(`Error al guardar cliente: ${result.error}`);
                    console.error('Error de API:', result.error);
                }

            } catch (error) {
                console.error('Error conectando a la API:', error);
                alert('Ocurrió un error al intentar guardar el cliente. Por favor verifica tu conexión e intenta nuevamente.');
            } finally {

                setButtonLoading(saveBtn, false);
            }
        });
    }
}

function showLoginError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        errorElement.style.opacity = '1';
    }
}

function hideLoginError() {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.style.display = 'none';
        errorElement.style.opacity = '0';
    }
}

function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            hideLoginError();

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            const btnText = loginBtn.querySelector('.btn-text');
            const spinner = loginBtn.querySelector('.loading-spinner');

            if (btnText && spinner) {
                btnText.style.display = 'none';
                spinner.style.display = 'inline-block';
                loginBtn.disabled = true;
            }

            try {

                if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {

                    hideLoginError();
                    showScreen(searchScreen);
                } else {

                    showLoginError('Invalid credentials. Please try again.');
                }
            } catch (error) {

                showLoginError('Login failed. Please check your connection and try again.');
            } finally {

                if (btnText && spinner) {
                    btnText.style.display = 'inline';
                    spinner.style.display = 'none';
                    loginBtn.disabled = false;
                }
            }
        });

        usernameInput.addEventListener('input', hideLoginError);
        passwordInput.addEventListener('input', hideLoginError);
    }
}

function initializePasswordToggle() {
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const togglePasswordIcon = document.getElementById('togglePasswordIcon');

    if (!passwordInput || !togglePasswordBtn || !togglePasswordIcon) {
        return;
    }

    togglePasswordBtn.style.display = 'none';

    passwordInput.addEventListener('input', () => {
        if (passwordInput.value.length > 0) {
            togglePasswordBtn.style.display = 'block';
        } else {
            togglePasswordBtn.style.display = 'none';
            passwordInput.setAttribute('type', 'password');
            togglePasswordIcon.className = 'bx bx-hide';
        }
    });

    togglePasswordBtn.addEventListener('click', (e) => {
        e.preventDefault(); 
        
        const currentType = passwordInput.getAttribute('type');
        const newType = currentType === 'password' ? 'text' : 'password';
        
        passwordInput.setAttribute('type', newType);

        if (newType === 'text') {
            togglePasswordIcon.className = 'bx bx-show';
        } else {
            togglePasswordIcon.className = 'bx bx-hide';
        }
    });

    passwordInput.addEventListener('focus', () => {
        if (passwordInput.value.length > 0) {
            togglePasswordBtn.style.display = 'block';
        }
    });
}