// commands/dalle.js - FIXED with Pollinations.ai (free, no key needed)
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
        'Generate AI images from text (free)',
        '.dalle [prompt]',
        'ai',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🎨');

            const prompt = args.join(' ');
            if (!prompt) {
                await reply('Please provide a prompt for image generation.\nExample: .dalle a futuristic city at night');
                return;
            }

            await reply('🎨 *Generating image, please wait...*');

            try {
                // Pollinations.ai - completely free, no API key required
                const seed = Math.floor(Math.random() * 999999);
                const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&width=512&height=512&nologo=true`;

                // Fetch image as buffer to confirm it works
                const imgResp = await axios.get(imageUrl, {
                    responseType: 'arraybuffer',
                    timeout: 45000
                });

                await Blu3Bot.sendMessage(from, {
                    image: Buffer.from(imgResp.data),
                    caption: `🎨 *AI Generated Image*\n\n*Prompt:* ${prompt}\n\n*Powered by Blu3Bot*`
                }, { quoted: message });

                await react('✅');
            } catch (error) {
                console.error('DALLE error:', error.message);
                // Fallback: send the URL directly (let WhatsApp render preview)
                try {
                    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true`;
                    await Blu3Bot.sendMessage(from, {
                        image: { url: imageUrl },
                        caption: `🎨 *AI Generated Image*\n\n*Prompt:* ${prompt}\n\n*Powered by Blu3Bot*`
                    }, { quoted: message });
                    await react('✅');
                } catch (fallbackError) {
                    await reply('❌ Image generation failed. Please try a different prompt.');
                    await react('❌');
                }
            }
        }
    ),
    aliases: ['imagine', 'generate', 'aiimage']
};
