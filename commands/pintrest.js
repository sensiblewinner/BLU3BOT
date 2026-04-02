// commands/pinterest.js - UPDATED WITH YOUR EXACT APIS
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
        'pinterest',
        'Download images from Pinterest',
        '.pinterest [pinterest url]',
        'download',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📌');
            
            const input = args.join(' ');
            if (!input) {
                await reply('Please provide a Pinterest URL.\nExample: .pinterest https://pin.it/example');
                return;
            }

            if (!input.includes('pinterest.com') && !input.includes('pin.it')) {
                await reply('❌ Please provide a valid Pinterest URL.');
                return;
            }

            // Using YOUR exact Pinterest APIs from the message
            const pinterestApis = [
                'https://api.diioffc.web.id/api/download/pinterest',
                'https://bk9.fun/download/pinterest',
                'https://api.erdwpe.com/api/download/pinterest'
            ];

            await reply('📌 *Downloading from Pinterest...*');

            let success = false;

            // Try each API until one works
            for (const apiUrl of pinterestApis) {
                try {
                    console.log(`Trying Pinterest API: ${apiUrl}`);
                    
                    const response = await axios.get(`${apiUrl}?url=${encodeURIComponent(input)}`, {
                        timeout: 15000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    const data = response.data;

                    // Handle YOUR specific API response formats
                    if (data.status && data.result && data.result.url) {
                        // API format 1: api.diioffc.web.id format
                        await Blu3Bot.sendMessage(from, {
                            image: { url: data.result.url },
                            caption: `📌 Pinterest\n${data.result.title || 'Downloaded by Blu3Bot'}`
                        }, { quoted: message });
                        success = true;
                        break;

                    } else if (data.status && data.BK9 && data.BK9.url) {
                        // API format 2: BK9 format
                        await Blu3Bot.sendMessage(from, {
                            image: { url: data.BK9.url },
                            caption: `📌 Pinterest\nDownloaded by Blu3Bot`
                        }, { quoted: message });
                        success = true;
                        break;

                    } else if (data.url || data.imageUrl) {
                        // API format 3: Simple URL format
                        const imageUrl = data.url || data.imageUrl;
                        await Blu3Bot.sendMessage(from, {
                            image: { url: imageUrl },
                            caption: `📌 Pinterest\nDownloaded by Blu3Bot`
                        }, { quoted: message });
                        success = true;
                        break;

                    } else if (data.data && data.data.url) {
                        // API format 4: Nested data format
                        await Blu3Bot.sendMessage(from, {
                            image: { url: data.data.url },
                            caption: `📌 Pinterest\n${data.data.title || 'Downloaded by Blu3Bot'}`
                        }, { quoted: message });
                        success = true;
                        break;
                    }
                } catch (error) {
                    console.log(`Pinterest API failed: ${apiUrl} - ${error.message}`);
                    // Continue to next API
                }
            }

            if (success) {
                await react('✅');
            } else {
                await reply('❌ All Pinterest downloaders failed. Please try:\n• Different Pinterest URL\n• Check if pin is public\n• Try again later');
                await react('❌');
            }
        }
    ),
    aliases: ['pin', 'pindl', 'pinterestdl']
};