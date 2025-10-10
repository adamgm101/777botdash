// Discord OAuth2 Configuration
// تأكد من استبدال هذه القيم بقيم التطبيق الخاص بك من Discord Developer Portal

const DISCORD_CONFIG = {
    // Client ID من Discord Developer Portal
    clientId: '1399499840475500574',
    
    // Client Secret من Discord Developer Portal (احتفظ به سراً)
    clientSecret: 'P7RHo2yhr0Is2Yc5gPf78Odlgtkj0N7f',
    
    // Redirect URI - يجب أن يطابق الإعداد في Discord Developer Portal
    redirectUri: 'http://localhost:3000/callback.html',
    
    // الصلاحيات المطلوبة
    scopes: ['identify', 'guilds'],
    
    // Discord API Base URL
    apiBase: 'https://discord.com/api/v10'
};

// Backend API Configuration
const API_CONFIG = {
    // URL الخاص بخادمك الخلفي
    baseUrl: window.location.origin,
    
    // Endpoints
    endpoints: {
        discordToken: '/api/discord/token',
        guildFeatures: '/api/guilds/:guildId/features',
        saveSettings: '/api/guilds/:guildId/settings'
    }
};

// Theme Configuration
const THEME_CONFIG = {
    default: {
        bg: '#0a0d12',
        panel: '#0f141b',
        border: '#1b2433',
        text: '#e6f1ff',
        subtext: '#93a4bf',
        accent: '#00e5ff',
        accent2: '#8a2be2',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444'
    },
    
    dark: {
        bg: '#0a0d12',
        panel: '#0f141b',
        border: '#1b2433',
        text: '#e6f1ff',
        subtext: '#93a4bf',
        accent: '#00e5ff',
        accent2: '#8a2be2',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444'
    },
    
    light: {
        bg: '#ffffff',
        panel: '#f8f9fa',
        border: '#dee2e6',
        text: '#212529',
        subtext: '#6c757d',
        accent: '#007bff',
        accent2: '#6f42c1',
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545'
    }
};

// Application Settings
const APP_CONFIG = {
    // Auto-refresh interval (in milliseconds)
    autoRefreshInterval: 30000, // 30 seconds
    
    // Token validation interval (in milliseconds)
    tokenValidationInterval: 300000, // 5 minutes
    
    // Notification duration (in milliseconds)
    notificationDuration: 5000, // 5 seconds
    
    // Error notification duration (in milliseconds)
    errorNotificationDuration: 8000, // 8 seconds
    
    // Supported languages
    languages: ['ar', 'en'],
    
    // Default language
    defaultLanguage: 'ar',
    
    // Features
    features: {
        guildManagement: true,
        securitySettings: true,
        autoResponses: true,
        welcomeMessages: true,
        logging: true,
        themeCustomization: true
    }
};

// Export configuration (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DISCORD_CONFIG,
        API_CONFIG,
        THEME_CONFIG,
        APP_CONFIG
    };
}

// Make configuration available globally
window.DISCORD_CONFIG = DISCORD_CONFIG;
window.API_CONFIG = API_CONFIG;
window.THEME_CONFIG = THEME_CONFIG;
window.APP_CONFIG = APP_CONFIG;
