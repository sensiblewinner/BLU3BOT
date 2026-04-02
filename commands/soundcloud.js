// commands/tiktok.js - UPDATED WITH YOUR EXACT APIS
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
        'tiktok',
        'Download TikTok video',
        '.tiktok [tiktok url]',
        'download',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🎵');
            
            const input = args.join(' ');
            if (!input) {
                await reply('Please provide a TikTok video link.');
                return;
            }

            // Using YOUR exact TikTok APIs from the message
            const tiktokApis = [
                'https://tikwm.com/api',
                'https://tikcdn.io/api',
                'https://tiktod.net/api',
                'https://bk9.fun/download/tiktok'
            ];

            await reply('🎵 *Downloading TikTok video...*');

            let success = false;

            // Try each API until one works
            for (const apiUrl of tiktokApis) {
                try {
                    console.log(`Trying TikTok API: ${apiUrl}`);
                    
                    const response = await axios.get(`${apiUrl}?url=${encodeURIComponent(input)}`, {
                        timeout: 15000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Accept': 'application/json'
                        }
                    });

                    const data = response.data;

                    // Handle different API response formats
                    if (data.data && data.data.play) {
                        // API format 1: tikwm.com format
                        await Blu3Bot.sendMessage(from, {
                            video: { url: data.data.play },
                            caption: `📱 TikTok\n${data.data.title || 'Downloaded by Blu3Bot'}`
                        }, { quoted: message });
                        success = true;
                        break;

                    } else if (data.status && data.BK9 && data.BK9.BK9) {
                        // API format 2: bk9.fun format
                        const caption = data.BK9.desc || "TikTok Video";
                        await Blu3Bot.sendMessage(from, {
                            video: { url: data.BK9.BK9 },
                            caption: `📱 TikTok\n${caption}`
                        }, { quoted: message });
                        success = true;
                        break;

                    } else if (data.videoUrl || data.url) {
                        // API format 3: Simple URL format
                        const videoUrl = data.videoUrl || data.url;
                        await Blu3Bot.sendMessage(from, {
                            video: { url: videoUrl },
                            caption: `📱 TikTok\nDownloaded by Blu3Bot`
                        }, { quoted: message });
                        success = true;
                        break;

                    } else if (data.download && data.download.url) {
                        // API format 4: Download object format
                        await Blu3Bot.sendMessage(from, {
                            video: { url: data.download.url },
                            caption: `📱 TikTok\n${data.meta?.title || 'Downloaded by Blu3Bot'}`
                        }, { quoted: message });
                        success = true;
                        break;

                    } else if (data.result && data.result.video) {
                        // API format 5: Result object format
                        await Blu3Bot.sendMessage(from, {
                            video: { url: data.result.video },
                            caption: `📱 TikTok\n${data.result.caption || 'Downloaded by Blu3Bot'}`
                        }, { quoted: message });
                        success = true;
                        break;
                    }
                } catch (error) {
                    console.log(`TikTok API failed: ${apiUrl} - ${error.message}`);
                    // Continue to next API
                }
            }

            if (success) {
                await react('✅');
            } else {
                await reply('❌ All TikTok downloaders failed. Please try:\n• Different TikTok URL\n• Check if video is public\n• Try again later\n• Use original TikTok app link');
                await react('❌');
            }
        }
    ),
    aliases: ['tik', 'tok', 'tikdl', 'tiktokdl']
};