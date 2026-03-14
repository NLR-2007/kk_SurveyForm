/* Global Utility & Interceptors */

// Configuration
const API_URL = '/api';

// Utility for fetching with Authorization header
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const defaultHeaders = {};
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
        defaultHeaders['Content-Type'] = 'application/json';
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        
        // Handle unauthorized globally
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
            return;
        }

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'API Request Failed');
        }
        return data;
    } catch (error) {
        throw error;
    }
}

// User state utility
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function requireAuth(role = null) {
    const user = getCurrentUser();
    if (!user || (role && user.role !== role)) {
        window.location.href = '/';
    }
}

function handleLogout() {
    apiFetch('/auth/logout', { method: 'POST' }).finally(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    });
}

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered', reg))
            .catch(err => console.log('Service Worker registration failed: ', err));
    });
}

// Offline/Online status indicators
window.addEventListener('online', () => {
    // Attempt syncing offline surveys whenever online
    syncOfflineSurveys();
    showToast('Back online! Syncing data...', 'success');
});

window.addEventListener('offline', () => {
    showToast('You are offline. Surveys will be saved locally.', 'warning');
});

// Toast notification helper
function showToast(message, type = 'info') {
    // Quick custom toast implementation (could use Bootstrap toast too)
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = type === 'error' ? '#E53E3E' : type === 'success' ? '#38A169' : type === 'warning' ? '#D69E2E' : '#3182CE';
    toast.style.color = '#fff';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    toast.style.transition = 'opacity 0.3s ease';
    toast.innerText = message;

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Sidebar toggle for admin (mobile off-canvas)
function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar)  sidebar.classList.add('show');
    if (overlay)  overlay.classList.add('show');
}
function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar)  sidebar.classList.remove('show');
    if (overlay)  overlay.classList.remove('show');
}

document.addEventListener('DOMContentLoaded', () => {
    // Hamburger menu toggle for admin pages
    const toggleBtn = document.getElementById('sidebarToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar && sidebar.classList.contains('show')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
});

// Sync offline surveys
async function syncOfflineSurveys() {
    const offlineSurveys = JSON.parse(localStorage.getItem('offline_surveys') || '[]');
    if (offlineSurveys.length === 0) return;

    let successfulSyncs = [];

    for (let i = 0; i < offlineSurveys.length; i++) {
        const survey = offlineSurveys[i];
        try {
            // Cannot easily serialize File objects to localStorage,
            // If offline, we skipped files or stored base64 (complex).
            // For simple implementation, assuming offline surveys send text data only.
            
            await apiFetch('/surveys', {
                method: 'POST',
                body: JSON.stringify(survey) // if text only
                // If it was form data, we need specialized handling. 
            });
            successfulSyncs.push(i);
        } catch (e) {
            console.error('Failed to sync offline survey', e);
        }
    }

    // Remove synced surveys
    const remaining = offlineSurveys.filter((_, index) => !successfulSyncs.includes(index));
    localStorage.setItem('offline_surveys', JSON.stringify(remaining));

    if (successfulSyncs.length > 0) {
        showToast(`Successfully synced ${successfulSyncs.length} offline surveys`);
    }
}
