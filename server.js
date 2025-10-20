const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // خدمة الملفات الثابتة

// Discord OAuth2 Configuration
const DISCORD_CONFIG = {
    clientId: '1399499840475500574', // Client ID الخاص بك
    clientSecret: 'P7RHo2yhr0Is2Yc5gPf78Odlgtkj0N7f', // Client Secret الخاص بك
    redirectUri: 'http://localhost:3000/callback.html'
};

// Data storage helpers
const DATA_DIR = path.join(__dirname, 'data');
const SECURITY_FILE = path.join(DATA_DIR, 'security.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');
const AUTOROLE_FILE = path.join(DATA_DIR, 'autorole.json');
const WELCOME_FILE = path.join(DATA_DIR, 'welcome.json');
const AUTORESPONSES_FILE = path.join(DATA_DIR, 'autoresponses.json');

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}
function readJsonSafe(filePath) {
    try {
        if (!fs.existsSync(filePath)) return {};
        const raw = fs.readFileSync(filePath, 'utf8');
        return raw ? JSON.parse(raw) : {};
    } catch (_) {
        return {};
    }
}
function writeJsonSafe(filePath, data) {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Discord OAuth2 token exchange endpoint
app.post('/api/discord/token', async (req, res) => {
    try {
        console.log('Token exchange request received:', req.body);
        
        const { code, redirect_uri } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: 'Authorization code is required' });
        }
        
        // Exchange authorization code for access token
        const response = await axios.post('https://discord.com/api/oauth2/token', {
            client_id: DISCORD_CONFIG.clientId,
            client_secret: DISCORD_CONFIG.clientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirect_uri || DISCORD_CONFIG.redirectUri
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        console.log('Token exchange successful');
        res.json(response.data);
        
    } catch (error) {
        console.error('Token exchange error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to exchange token',
            details: error.response?.data || error.message
        });
    }
});

// Guild features endpoint
app.get('/api/guilds/:guildId/features', (req, res) => {
    const { guildId } = req.params;
    console.log(`Fetching features for guild: ${guildId}`);

    const logsCfg = readJsonSafe(LOGS_FILE);
    const secCfg = readJsonSafe(SECURITY_FILE);
    const autoroleCfg = readJsonSafe(AUTOROLE_FILE);
    const welcomeCfg = readJsonSafe(WELCOME_FILE);
    const autoresCfg = readJsonSafe(AUTORESPONSES_FILE);

    const payload = {
        logs: logsCfg[guildId] || { enabled: false, channel: null, perCommand: {} },
        security: secCfg[guildId] || { enabled: false, timeoutMs: 0, features: { links: false, spam: false, mentions: false, caps: false, emoji: false }, blacklistedWords: [] },
        autorole: autoroleCfg[guildId] || { enabled: false, memberRole: null },
        welcome: welcomeCfg[guildId] || { enabled: false, channel: null, message: 'Welcome {user} to {server}! 🎉' },
        autoresponses: autoresCfg[guildId] || { enabled: false, responses: [] }
    };
    res.json(payload);
});

// Save guild settings endpoint
app.post('/api/guilds/:guildId/settings', (req, res) => {
    const { guildId } = req.params;
    const settings = req.body || {};

    console.log(`Saving settings for guild ${guildId}:`, settings);

    try {
        const logsCfg = readJsonSafe(LOGS_FILE);
        const secCfg = readJsonSafe(SECURITY_FILE);
        const autoroleCfg = readJsonSafe(AUTOROLE_FILE);
        const welcomeCfg = readJsonSafe(WELCOME_FILE);
        const autoresCfg = readJsonSafe(AUTORESPONSES_FILE);

        if (settings.logs) {
            logsCfg[guildId] = {
                enabled: Boolean(settings.logs.enabled),
                channel: settings.logs.channel || null
            };
            writeJsonSafe(LOGS_FILE, logsCfg);
        }

        if (settings.security) {
            secCfg[guildId] = {
                enabled: Boolean(settings.security.enabled),
                timeoutMs: Math.max(0, Number(settings.security.timeoutMs || 0)),
                features: {
                    links: Boolean(settings.security.features?.links),
                    spam: Boolean(settings.security.features?.spam),
                    mentions: Boolean(settings.security.features?.mentions),
                    caps: Boolean(settings.security.features?.caps),
                    emoji: Boolean(settings.security.features?.emoji)
                },
                blacklistedWords: Array.isArray(settings.security.blacklistedWords) ? settings.security.blacklistedWords : []
            };
            writeJsonSafe(SECURITY_FILE, secCfg);
        }

        if (settings.autorole) {
            autoroleCfg[guildId] = {
                enabled: Boolean(settings.autorole.enabled),
                memberRole: settings.autorole.memberRole || null
            };
            writeJsonSafe(AUTOROLE_FILE, autoroleCfg);
        }

        if (settings.welcome) {
            welcomeCfg[guildId] = {
                enabled: Boolean(settings.welcome.enabled),
                channel: settings.welcome.channel || null,
                message: settings.welcome.message || 'Welcome {user} to {server}! 🎉'
            };
            writeJsonSafe(WELCOME_FILE, welcomeCfg);
        }

        if (settings.autoresponses) {
            const responses = Array.isArray(settings.autoresponses.responses) ? settings.autoresponses.responses.map(r => ({
                trigger: String(r.trigger || '').toLowerCase(),
                response: String(r.response || '')
            })).filter(r => r.trigger && r.response) : [];
            autoresCfg[guildId] = {
                enabled: Boolean(settings.autoresponses.enabled),
                responses
            };
            writeJsonSafe(AUTORESPONSES_FILE, autoresCfg);
        }

        res.json({ success: true, message: 'Settings saved successfully' });
    } catch (e) {
        console.error('Error saving settings:', e);
        res.status(500).json({ success: false, error: 'Failed to save settings' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        discord_config: {
            clientId: DISCORD_CONFIG.clientId,
            redirectUri: DISCORD_CONFIG.redirectUri
        }
    });
});

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📱 Dashboard: http://localhost:${PORT}/index.html`);
    console.log(`🔗 Callback URL: http://localhost:${PORT}/callback.html`);
    console.log(`\n📋 Discord OAuth2 Configuration:`);
    console.log(`   Client ID: ${DISCORD_CONFIG.clientId}`);
    console.log(`   Redirect URI: ${DISCORD_CONFIG.redirectUri}`);
    console.log(`\n⚠️  Make sure to:`);
    console.log(`   1. Update Client Secret in this file`);
    console.log(`   2. Add redirect URI to Discord Developer Portal`);
    console.log(`   3. Set the same redirect URI in Discord app settings`);
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
