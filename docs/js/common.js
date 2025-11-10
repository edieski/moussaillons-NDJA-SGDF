// ========================================
// FICHIER COMMUN - FONCTIONS PARTAGÉES
// ========================================

// Variables globales
const CORRECT_PASSWORD = 'Scout2025!';
const SESSION_KEY = 'scout_session';

// Fonction de navigation principale
function showPage(pageId) {
    // Masquer toutes les pages
    document.querySelectorAll('.fey-page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Désactiver tous les onglets
    document.querySelectorAll('.fey-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Afficher la page demandée
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Activer l'onglet correspondant
    const targetTab = document.querySelector(`[onclick="showPage('${pageId}')"]`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Défiler vers le haut
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Fonction de déconnexion
function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem('admin_mode');
        document.getElementById('mainContent').style.display = 'none';
        document.getElementById('loginPage').style.display = 'block';
        document.getElementById('passwordInput').value = '';
        
        // Masquer les onglets admin
        const adminTab = document.getElementById('adminTab');
        const registreTab = document.getElementById('registreTab');
        if (adminTab) adminTab.style.display = 'none';
        if (registreTab) registreTab.style.display = 'none';
    }
}

// Fonction de sauvegarde sécurisée
function safeSave(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Erreur de sauvegarde:', error);
        alert('⚠️ Impossible de sauvegarder les données. Vérifiez que le stockage local est activé.');
        return false;
    }
}

// Fonction de chargement sécurisé
function safeLoad(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Erreur de chargement:', error);
        return defaultValue;
    }
}

// Fonction de validation d'email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Fonction de validation de téléphone
function isValidPhone(phone) {
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return phoneRegex.test(phone);
}

// Fonction d'affichage de notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    switch (type) {
        case 'success':
            notification.style.background = '#4CAF50';
            notification.innerHTML = `✅ ${message}`;
            break;
        case 'error':
            notification.style.background = '#F44336';
            notification.innerHTML = `❌ ${message}`;
            break;
        case 'warning':
            notification.style.background = '#FF9800';
            notification.innerHTML = `⚠️ ${message}`;
            break;
        default:
            notification.style.background = '#2196F3';
            notification.innerHTML = `ℹ️ ${message}`;
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Fonction de vérification de session
function checkSession() {
    const isLoggedIn = sessionStorage.getItem(SESSION_KEY) === 'true';
    const isAdmin = sessionStorage.getItem('admin_mode') === 'true';

    const loginEl = document.getElementById('loginPage');
    const mainEl = document.getElementById('mainContent');
    // If this page doesn't have the login layout, skip session UI handling
    if (!loginEl || !mainEl) {
        return;
    }

    if (isLoggedIn) {
        loginEl.style.display = 'none';
        mainEl.style.display = 'block';
        if (isAdmin && typeof enableAdminMode === 'function') {
            try { enableAdminMode(); } catch (e) {}
        }
    } else {
        loginEl.style.display = 'block';
        mainEl.style.display = 'none';
    }
}

// Fonction d'initialisation des animations
function initAnimations() {
    // Vérifier si l'utilisateur préfère les animations réduites
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        // Désactiver les animations
        document.documentElement.style.setProperty('--m-fast', '0ms');
        document.documentElement.style.setProperty('--m-base', '0ms');
        document.documentElement.style.setProperty('--m-slow', '0ms');
    }
}

// Fonction de gestion des erreurs globales
window.addEventListener('error', function(event) {
    try {
        console.error('Erreur JavaScript:', event.error);
        showNotification('Une erreur inattendue s\'est produite', 'error');
    } catch (_) {}
});

// Fonction de vérification de la disponibilité du localStorage
function checkLocalStorage() {
    try {
        const test = 'test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (error) {
        showNotification('Le stockage local n\'est pas disponible. Certaines fonctionnalités peuvent être limitées.', 'warning');
        return false;
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    try { checkLocalStorage(); } catch (_) {}
    try { checkSession(); } catch (_) {}
    try { initAnimations(); } catch (_) {}
});

// Ajout des animations CSS pour les notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
