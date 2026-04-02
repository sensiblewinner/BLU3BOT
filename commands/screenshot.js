// commands/screenshot.js
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
        'ss',
        'Takes a screenshot of a website',
        '.ss [url]',
        'tools',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📸');
            
            const url = args.join(' ');
            if (!url) {
                await reply('Provide a link to screenshot.');
                return;
            }

            try {
                const screenshotUrl = `https://api.diioffc.web.id/api/tools/sstab?url=${encodeURIComponent(url)}`;
                const response = await axios.get(screenshotUrl, { responseType: 'arraybuffer' });

                await Blu3Bot.sendMessage(from, {
                    image: Buffer.from(response.data),
                    caption: '*📸 Blu3Bot Web Screenshot*'
                }, { quoted: message });
            } catch (error) {
                console.error('Screenshot error:', error);
                await reply('Failed to take website screenshot.');
            }
        }
    )
};