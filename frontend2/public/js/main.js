/**
 * Main JavaScript file for LinkIt EJS frontend
 * Handles client-side interactions and dynamic behavior
 */

// Global variables
let isDarkMode = false;
let isMobileMenuOpen = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing dark mode...');
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
        isDarkMode = savedDarkMode === 'true';
        console.log('Using saved dark mode preference:', isDarkMode);
        updateDarkMode();
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        isDarkMode = prefersDark;
        console.log('Using system dark mode preference:', isDarkMode);
        updateDarkMode();
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('darkMode') === null) {
            isDarkMode = e.matches;
            updateDarkMode();
        }
    });
});

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
    console.log('Dark mode toggle clicked. Current state:', isDarkMode);
    isDarkMode = !isDarkMode;
    console.log('New dark mode state:', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode.toString());
    updateDarkMode();
}

/**
 * Update dark mode styling
 */
function updateDarkMode() {
    console.log('Updating dark mode styling. isDarkMode:', isDarkMode);
    const html = document.documentElement;
    const body = document.body;
    
    if (isDarkMode) {
        html.classList.add('dark');
        body.classList.add('bg-black', 'text-white');
        body.classList.remove('bg-white', 'text-black');
    } else {
        html.classList.remove('dark');
        body.classList.add('bg-white', 'text-black');
        body.classList.remove('bg-black', 'text-white');
    }
    
    // Update navbar
    const navbar = document.querySelector('header');
    if (navbar) {
        if (isDarkMode) {
            navbar.classList.add('bg-black', 'text-white');
            navbar.classList.remove('bg-white', 'text-black');
        } else {
            navbar.classList.add('bg-white', 'text-black');
            navbar.classList.remove('bg-black', 'text-white');
        }
    }
    
    // Update mobile menu
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        if (isDarkMode) {
            mobileMenu.classList.add('bg-black', 'text-white');
            mobileMenu.classList.remove('bg-white', 'text-black');
        } else {
            mobileMenu.classList.add('bg-white', 'text-black');
            mobileMenu.classList.remove('bg-black', 'text-white');
        }
    }
    
    // Update header logo
    const headerLogo = document.getElementById('header-logo');
    if (headerLogo) {
        if (isDarkMode) {
            headerLogo.src = '/images/logo_dark_mode.svg';
        } else {
            headerLogo.src = '/images/logo_light_mode.svg';
        }
    }
    
    // Update login page logo
    const loginLogo = document.getElementById('login-logo');
    if (loginLogo) {
        if (isDarkMode) {
            loginLogo.src = '/images/logo_dark_mode.svg';
        } else {
            loginLogo.src = '/images/logo_light_mode.svg';
        }
    }
    
    // Update register page logo
    const registerLogo = document.getElementById('register-logo');
    if (registerLogo) {
        if (isDarkMode) {
            registerLogo.src = '/images/logo_dark_mode.svg';
        } else {
            registerLogo.src = '/images/logo_light_mode.svg';
        }
    }
    
    // Update dark mode button styling and icon
    const darkModeButton = document.getElementById('dark-mode-button');
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');
    
    if (darkModeButton) {
        if (isDarkMode) {
            // Dark mode: light button with dark icon
            darkModeButton.classList.remove('bg-gray-200', 'text-gray-800');
            darkModeButton.classList.add('bg-gray-700', 'text-white');
            if (moonIcon) moonIcon.style.display = 'none';
            if (sunIcon) sunIcon.style.display = 'block';
        } else {
            // Light mode: dark button with light icon
            darkModeButton.classList.remove('bg-gray-700', 'text-white');
            darkModeButton.classList.add('bg-gray-200', 'text-gray-800');
            if (moonIcon) moonIcon.style.display = 'block';
            if (sunIcon) sunIcon.style.display = 'none';
        }
    }
    
    // Update logo
    const logoImage = document.getElementById('logo-image');
    if (logoImage) {
        logoImage.src = isDarkMode ? '/images/logo_dark_mode.svg' : '/images/logo_light_mode.svg';
    }
    
    // Update image section background
    const imageSection = document.getElementById('image-section');
    if (imageSection) {
        if (isDarkMode) {
            imageSection.classList.remove('bg-gray-100');
            imageSection.classList.add('bg-black');
        } else {
            imageSection.classList.remove('bg-black');
            imageSection.classList.add('bg-gray-100');
        }
    }
    
    // Update login page elements
    const loginCard = document.getElementById('login-card');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password');
    
    if (loginCard) {
        if (isDarkMode) {
            loginCard.classList.remove('bg-white', 'text-black');
            loginCard.classList.add('bg-custom-grey-color', 'text-white');
        } else {
            loginCard.classList.remove('bg-custom-grey-color', 'text-white');
            loginCard.classList.add('bg-white', 'text-black');
        }
    }
    
    if (loginLogo) {
        loginLogo.src = isDarkMode ? '/images/logo_dark_mode.svg' : '/images/logo_light_mode.svg';
    }
    
    if (emailInput) {
        if (isDarkMode) {
            emailInput.classList.remove('bg-gray-100', 'text-black', 'border-gray-300');
            emailInput.classList.add('bg-gray-700', 'text-white', 'border-gray-600');
        } else {
            emailInput.classList.remove('bg-gray-700', 'text-white', 'border-gray-600');
            emailInput.classList.add('bg-gray-100', 'text-black', 'border-gray-300');
        }
    }
    
    if (passwordInput) {
        if (isDarkMode) {
            passwordInput.classList.remove('bg-gray-100', 'text-black', 'border-gray-300');
            passwordInput.classList.add('bg-gray-700', 'text-white', 'border-gray-600');
        } else {
            passwordInput.classList.remove('bg-gray-700', 'text-white', 'border-gray-600');
            passwordInput.classList.add('bg-gray-100', 'text-black', 'border-gray-300');
        }
    }
    
    // Update register page elements
    const registerCard = document.getElementById('register-card');
    const usernameInput = document.getElementById('username-input');
    const registerEmailInput = document.getElementById('register-email-input');
    const registerPasswordInput = document.getElementById('register-password');
    const profileImageInput = document.getElementById('profile-image-input');
    
    if (registerCard) {
        if (isDarkMode) {
            registerCard.classList.remove('bg-white', 'text-black');
            registerCard.classList.add('bg-custom-grey-color', 'text-white');
        } else {
            registerCard.classList.remove('bg-custom-grey-color', 'text-white');
            registerCard.classList.add('bg-white', 'text-black');
        }
    }
    
    if (registerLogo) {
        registerLogo.src = isDarkMode ? '/images/logo_dark_mode.svg' : '/images/logo_light_mode.svg';
    }
    
    if (usernameInput) {
        if (isDarkMode) {
            usernameInput.classList.remove('bg-gray-100', 'text-black', 'border-gray-300');
            usernameInput.classList.add('bg-gray-700', 'text-white', 'border-gray-600');
        } else {
            usernameInput.classList.remove('bg-gray-700', 'text-white', 'border-gray-600');
            usernameInput.classList.add('bg-gray-100', 'text-black', 'border-gray-300');
        }
    }
    
    if (registerEmailInput) {
        if (isDarkMode) {
            registerEmailInput.classList.remove('bg-gray-100', 'text-black', 'border-gray-300');
            registerEmailInput.classList.add('bg-gray-700', 'text-white', 'border-gray-600');
        } else {
            registerEmailInput.classList.remove('bg-gray-700', 'text-white', 'border-gray-600');
            registerEmailInput.classList.add('bg-gray-100', 'text-black', 'border-gray-300');
        }
    }
    
    if (registerPasswordInput) {
        if (isDarkMode) {
            registerPasswordInput.classList.remove('bg-gray-100', 'text-black', 'border-gray-300');
            registerPasswordInput.classList.add('bg-gray-700', 'text-white', 'border-gray-600');
        } else {
            registerPasswordInput.classList.remove('bg-gray-700', 'text-white', 'border-gray-600');
            registerPasswordInput.classList.add('bg-gray-100', 'text-black', 'border-gray-300');
        }
    }
    
    if (profileImageInput) {
        if (isDarkMode) {
            profileImageInput.classList.remove('bg-gray-100', 'text-black', 'border-gray-300');
            profileImageInput.classList.add('bg-gray-700', 'text-white', 'border-gray-600');
        } else {
            profileImageInput.classList.remove('bg-gray-700', 'text-white', 'border-gray-600');
            profileImageInput.classList.add('bg-gray-100', 'text-black', 'border-gray-300');
        }
    }
    
    
    // Update dashboard page elements
    const dashboardMainContent = document.getElementById('dashboard-main-content');
    const dashboardCard = document.getElementById('dashboard-card');
    
    if (dashboardMainContent) {
        if (isDarkMode) {
            dashboardMainContent.classList.remove('text-black');
            dashboardMainContent.classList.add('text-white');
        } else {
            dashboardMainContent.classList.remove('text-white');
            dashboardMainContent.classList.add('text-black');
        }
    }
    
    if (dashboardCard) {
        if (isDarkMode) {
            dashboardCard.classList.remove('bg-white', 'text-black');
            dashboardCard.classList.add('bg-custom-grey-color', 'text-white');
        } else {
            dashboardCard.classList.remove('bg-custom-grey-color', 'text-white');
            dashboardCard.classList.add('bg-white', 'text-black');
        }
    }
    
    // Update public profile page elements
    const publicProfileBody = document.getElementById('public-profile-body');
    
    if (publicProfileBody) {
        if (isDarkMode) {
            publicProfileBody.classList.remove('bg-gray-100', 'text-black');
            publicProfileBody.classList.add('bg-black', 'text-white');
        } else {
            publicProfileBody.classList.remove('bg-black', 'text-white');
            publicProfileBody.classList.add('bg-gray-100', 'text-black');
        }
    }
    
    // Update profile image container
    const profileImageContainer = document.getElementById('profile-image-container');
    if (profileImageContainer) {
        if (isDarkMode) {
            profileImageContainer.classList.remove('bg-gray-100', 'text-black', 'border-custom-grey-color');
            profileImageContainer.classList.add('bg-black', 'text-white', 'border-custom-green');
        } else {
            profileImageContainer.classList.remove('bg-black', 'text-white', 'border-custom-green');
            profileImageContainer.classList.add('bg-gray-100', 'text-black', 'border-custom-grey-color');
        }
    }
    
    // Update rankings page elements
    const rankingsBody = document.getElementById('rankings-body');
    const rankingsCard = document.getElementById('rankings-card');
    const rankingsHeader = document.getElementById('rankings-header');
    const rankingsTable = document.getElementById('rankings-table');
    
    if (rankingsBody) {
        if (isDarkMode) {
            rankingsBody.classList.remove('bg-white', 'text-black');
            rankingsBody.classList.add('bg-black', 'text-white');
        } else {
            rankingsBody.classList.remove('bg-black', 'text-white');
            rankingsBody.classList.add('bg-white', 'text-black');
        }
    }
    
    if (rankingsCard) {
        if (isDarkMode) {
            rankingsCard.classList.remove('bg-white');
            rankingsCard.classList.add('bg-gray-800');
        } else {
            rankingsCard.classList.remove('bg-gray-800');
            rankingsCard.classList.add('bg-white');
        }
    }
    
    if (rankingsHeader) {
        if (isDarkMode) {
            rankingsHeader.classList.remove('bg-gray-50');
            rankingsHeader.classList.add('bg-gray-700');
        } else {
            rankingsHeader.classList.remove('bg-gray-700');
            rankingsHeader.classList.add('bg-gray-50');
        }
    }
    
    if (rankingsTable) {
        if (isDarkMode) {
            rankingsTable.classList.remove('bg-white', 'divide-gray-200');
            rankingsTable.classList.add('bg-gray-800', 'divide-gray-700');
        } else {
            rankingsTable.classList.remove('bg-gray-800', 'divide-gray-700');
            rankingsTable.classList.add('bg-white', 'divide-gray-200');
        }
    }

    // Update 404 page elements
    const notFoundBody = document.getElementById('not-found-body');
    const notFoundImage = document.getElementById('not-found-image');

    if (notFoundBody) {
        if (isDarkMode) {
            notFoundBody.classList.remove('bg-white', 'text-black');
            notFoundBody.classList.add('bg-black', 'text-white');
        } else {
            notFoundBody.classList.remove('bg-black', 'text-white');
            notFoundBody.classList.add('bg-white', 'text-black');
        }
    }

    if (notFoundImage) {
        notFoundImage.src = isDarkMode ? '/images/404_dark.svg' : '/images/404_light.svg';
    }
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    
    if (mobileMenu) {
        isMobileMenuOpen = !isMobileMenuOpen;
        
        if (isMobileMenuOpen) {
            mobileMenu.classList.remove('hidden');
            // Change icon to X
            menuIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';
        } else {
            mobileMenu.classList.add('hidden');
            // Change icon to hamburger
            menuIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
        }
    }
}

/**
 * Close mobile menu when clicking outside
 */
document.addEventListener('click', function(event) {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuButton = event.target.closest('button[onclick="toggleMobileMenu()"]');
    
    if (isMobileMenuOpen && !mobileMenu.contains(event.target) && !menuButton) {
        toggleMobileMenu();
    }
});

/**
 * Handle user logout
 */
async function logout() {
    try {
        // Call logout API endpoint to clear server-side session
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('Logged out successfully');
        } else {
            console.error('Logout failed');
        }
    } catch (error) {
        console.error('Error during logout:', error);
    } finally {
        // Always clear client-side token and redirect
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
}

/**
 * Show loading state
 */
function showLoading(element) {
    if (element) {
        element.disabled = true;
        element.innerHTML = 'Loading...';
    }
}

/**
 * Hide loading state
 */
function hideLoading(element, originalText) {
    if (element) {
        element.disabled = false;
        element.innerHTML = originalText;
    }
}

/**
 * Show error message
 */
function showError(message, containerId = 'error-message') {
    const errorContainer = document.getElementById(containerId);
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.classList.remove('hidden');
    }
}

/**
 * Hide error message
 */
function hideError(containerId = 'error-message') {
    const errorContainer = document.getElementById(containerId);
    if (errorContainer) {
        errorContainer.classList.add('hidden');
    }
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        // Show success message
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
        toast.textContent = 'Copied to clipboard!';
        document.body.appendChild(toast);
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 2000);
    }).catch(function(err) {
        console.error('Could not copy text: ', err);
    });
}

/**
 * Smooth scroll to element
 */
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Format date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Validate email
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate URL
 */
function validateURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for use in other scripts
window.LinkIt = {
    toggleDarkMode,
    toggleMobileMenu,
    logout,
    showLoading,
    hideLoading,
    showError,
    hideError,
    copyToClipboard,
    scrollToElement,
    formatDate,
    validateEmail,
    validateURL,
    debounce
};


