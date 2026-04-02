// commands/facebook.js - UPDATED WITH YOUR EXACT APIS
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

const axios = require('axios');

module.exports = {
    command: new Command(
        'facebook',
        'Download Facebook videos',
        '.facebook [facebook url]',
        'download',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📘');
            
            const url = args.join(' ');
            if (!url) {
                await reply('Please provide a Facebook video URL.');
                return;
            }

            // Using YOUR exact Facebook APIs from the message
            const facebookApis = [
                'https://api.diioffc.web.id/api/download/facebook',
                'https://getfbstuff.com/api',
                'https://fbdownloader.com/api'
            ];

            await reply('📘 *Downloading Facebook video...*');

            let success = false;

            // Try each API until one works
            for (const apiUrl of facebookApis) {
                try {
                    console.log(`Trying Facebook API: ${apiUrl}`);
                    
                    const response = await axios.get(`${apiUrl}?url=${encodeURIComponent(url)}`, {
                        timeout: 15000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    const data = response.data;

                    // Handle your specific API format
                    if (data.status && data.result && data.result.video) {
                        // Your working API format
                        await Blu3Bot.sendMessage(from, {
                            video: { url: data.result.video },
                            caption: `📹 Facebook Video\nDownloaded by Blu3Bot`
                        }, { quoted: message });
                        success = true;
                        console.log(`✅ Success with API: ${apiUrl}`);
                        break;
                    }
                    // Add other API formats if needed
                } catch (error) {
                    console.log(`Facebook API failed: ${apiUrl} - ${error.message}`);
                    // Continue to next API
                }
            }

            if (success) {
                await react('✅');
            } else {
                await reply('❌ All Facebook downloaders failed. Please try:\n• Different Facebook URL\n• Check if video is public\n• Try again later');
                await react('❌');
            }
        }
    ),
    aliases: ['fb', 'fbdl', 'facebookdl']
};