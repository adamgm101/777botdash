const express = require('express');
const axios = require('axios');
const path = require('path');
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
    
    // إرجاع إعدادات افتراضية للخادم
    res.json({
        logs: { enabled: false, channel: null },
        security: { 
            enabled: false, 
            features: {
                links: false,
                spam: false,
                mentions: false,
                caps: false,
                emoji: false
            }
        },
        autorole: { enabled: false, memberRole: null },
        autoresponses: { enabled: false, responses: [] },
        welcome: { enabled: false, channel: null, message: 'مرحباً {user} في {server}!' }
    });
});

// Save guild settings endpoint
app.post('/api/guilds/:guildId/settings', (req, res) => {
    const { guildId } = req.params;
    const settings = req.body;
    
    console.log(`Saving settings for guild ${guildId}:`, settings);
    
    // هنا يمكنك حفظ الإعدادات في قاعدة البيانات
    res.json({ success: true, message: 'Settings saved successfully' });
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
