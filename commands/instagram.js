// commands/instagram.js
const igdl = require('instagram-url-direct');

class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

module.exports = {
    command: new Command(
        'insta',
        'Download Instagram photo or video',
        '.insta [url]',
        'download',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📸');

            const url = args.join(' ').trim();
            if (!url || !url.includes('instagram')) {
                await reply('📸 *Instagram Downloader*\n\nUsage: `.insta [url]`\n\nSupports: Posts, Reels, IGTV\n\nExample:\n`.insta https://www.instagram.com/p/abc123`');
                return;
            }

            await reply('⏳ Fetching Instagram media...');

            try {
                const result = await igdl.igDl(url);

                if (!result || !result.links || result.links.length === 0) {
                    await reply('❌ Could not download this post. Make sure the account is public and the link is correct.');
                    return;
                }

                for (const item of result.links) {
                    if (item.type === 'video' || item.link?.includes('.mp4')) {
                        await Blu3Bot.sendMessage(from, {
                            video: { url: item.link },
                            caption: `🎬 *Instagram Reel/Video*\n\n_Powered by Blu3Bot_`
                        }, { quoted: message });
                    } else {
                        await Blu3Bot.sendMessage(from, {
                            image: { url: item.link },
                            caption: `📸 *Instagram Photo*\n\n_Powered by Blu3Bot_`
                        }, { quoted: message });
                    }
                }

            } catch (err) {
                console.error('Instagram DL error:', err.message);
                await reply('❌ Download failed. The post may be private, expired, or unavailable.\n\nMake sure the account is public and you pasted the full link.');
            }
        }
    ),
    aliases: ['ig', 'instagram', 'igdl']
};
