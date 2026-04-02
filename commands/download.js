// commands/download.js
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
        'download',
        'Download media from any supported platform',
        '.download [url]',
        'download',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📥');
            
            const url = args.join(' ');
            if (!url) {
                await reply('Please provide a URL from any supported platform:\n• YouTube\n• Instagram\n• TikTok\n• Facebook\n• Twitter\n• Pinterest\n• SoundCloud');
                return;
            }

            try {
                await reply('⏳ Detecting and downloading media, please wait...');
                
                const res = await axios.get(`https://api.diioffc.web.id/api/download/all?url=${encodeURIComponent(url)}`);
                const data = res.data;

                if (data.status && data.result) {
                    if (data.result.video) {
                        await reply({
                            video: { url: data.result.video },
                            caption: `*📹 Downloaded Video*\n\n${data.result.title || ''}\n\n_Downloaded by Blu3Bot_`
                        });
                    } else if (data.result.audio) {
                        await reply({
                            audio: { url: data.result.audio },
                            mimetype: 'audio/mpeg',
                            caption: `*🎵 Downloaded Audio*\n\n${data.result.title || ''}\n\n_Downloaded by Blu3Bot_`
                        });
                    } else if (data.result.image) {
                        await reply({
                            image: { url: data.result.image },
                            caption: `*📷 Downloaded Image*\n\n${data.result.title || ''}\n\n_Downloaded by Blu3Bot_`
                        });
                    } else {
                        await reply('❌ No media found in the provided URL.');
                    }
                } else {
                    await reply('❌ Failed to download media from this URL.');
                }
            } catch (err) {
                await reply('❌ Failed to download media. The platform might not be supported.');
            }
        }
    ),
    aliases: ['dl', 'get', 'media']
};