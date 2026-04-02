// commands/instagram.js - UPDATED WITH YOUR EXACT APIS
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
        'insta',
        'Download Instagram videos and images',
        '.insta [instagram url]',
        'download',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📸');
            
            if (!args || args.length === 0) {
                await reply('Please provide an Instagram URL to download from.');
                return;
            }

            const url = args.join(' ');

            // Using YOUR exact Instagram APIs from the message
            const instagramApis = [
                'https://api.diioffc.web.id/api/download/instagram',
                'https://igram.io/api',
                'https://igram.world/api/instagram'
            ];

            await reply('📸 *Downloading Instagram media...*');

            let success = false;

            // Try each API until one works
            for (const apiUrl of instagramApis) {
                try {
                    console.log(`Trying Instagram API: ${apiUrl}`);
                    
                    const response = await axios.get(`${apiUrl}?url=${encodeURIComponent(url)}`, {
                        timeout: 15000
                    });

                    const data = response.data;

                    // Handle your specific API format
                    if (data.status && data.result && data.result.length > 0) {
                        const media = data.result[0];

                        if (media.url) {
                            await Blu3Bot.sendMessage(from, {
                                video: { url: media.url },
                                caption: "📸 Instagram Video - Blu3Bot"
                            }, { quoted: message });
                            success = true;
                            break;
                        } else if (media.thumbnail) {
                            await Blu3Bot.sendMessage(from, {
                                image: { url: media.thumbnail },
                                caption: "📸 Instagram Image - Blu3Bot"
                            }, { quoted: message });
                            success = true;
                            break;
                        }
                    }
                } catch (error) {
                    console.log(`Instagram API failed: ${apiUrl} - ${error.message}`);
                    // Continue to next API
                }
            }

            if (success) {
                await react('✅');
            } else {
                await reply('❌ All Instagram downloaders failed. Please try again later or use a different URL.');
                await react('❌');
            }
        }
    ),
    aliases: ['ig', 'instagram', 'igdl']
};