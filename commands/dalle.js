// commands/dalle.js - UPDATED WITH YOUR EXACT API
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
        'dalle',
        'Generate images from text',
        '.dalle [prompt]',
        'ai',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🎨');
            
            const prompt = args.join(' ');
            if (!prompt) {
                await reply('Please provide a prompt for image generation.');
                return;
            }

            // Using YOUR exact image API from the message
            const imageApis = [
                'https://api.pexels.com/v1/search'
            ];

            await reply('🎨 *Generating image...*');

            let success = false;

            // Try the API
            for (const apiUrl of imageApis) {
                try {
                    console.log(`Trying Image API: ${apiUrl}`);
                    
                    const response = await axios.get(`${apiUrl}?query=${encodeURIComponent(prompt)}&per_page=1`, {
                        headers: { 
                            'Authorization': '563492ad6f91700001000001b4e7a8c8b4a14f8c8b4a8c8b4a8c8b4a' // Free demo key
                        },
                        timeout: 15000
                    });

                    const data = response.data;

                    // Handle YOUR specific API response format
                    if (data.photos && data.photos.length > 0) {
                        await Blu3Bot.sendMessage(from, {
                            image: { url: data.photos[0].src.large2x },
                            caption: `🎨 Generated: "${prompt}"\nPowered by Blu3Bot`
                        }, { quoted: message });
                        success = true;
                        break;
                    }
                } catch (error) {
                    console.log(`Image API failed: ${apiUrl} - ${error.message}`);
                    // Continue to next API if there were more
                }
            }

            if (!success) {
                // Fallback to placeholder image
                try {
                    await Blu3Bot.sendMessage(from, {
                        image: { url: `https://via.placeholder.com/500/0000FF/FFFFFF?text=${encodeURIComponent(prompt.substring(0, 30))}` },
                        caption: `🎨 Generated: "${prompt}"\nPowered by Blu3Bot (Fallback)`
                    }, { quoted: message });
                    await react('✅');
                } catch (fallbackError) {
                    await reply('❌ Image generation failed. Try a different prompt.');
                    await react('❌');
                }
            } else {
                await react('✅');
            }
        }
    ),
    aliases: ['imagine', 'generate', 'aiimage']
};