// commands/music.js - FIXED with real YouTube search
const axios = require('axios');
const yts = require('yt-search');

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
        'music',
        'Search for music information',
        '.music [song name]',
        'music',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            const query = args.join(' ');

            if (!query) {
                await react('❌');
                return reply('❌ Please provide a song name to search.\n\nUsage: .music [song name]\nExample: .music shape of you ed sheeran');
            }

            try {
                await react('🎵');

                const result = await yts(query);
                const video = result.videos[0];

                if (!video) {
                    await react('❌');
                    return reply(`❌ No music found for "${query}". Try a different search term.`);
                }

                await Blu3Bot.sendMessage(from, {
                    image: { url: video.thumbnail },
                    caption:
                        `🎵 *${video.title}*\n\n` +
                        `👤 *Artist:* ${video.author.name}\n` +
                        `⏱️ *Duration:* ${video.timestamp}\n` +
                        `👀 *Views:* ${video.views?.toLocaleString() || 'N/A'}\n` +
                        `🔗 *URL:* ${video.url}\n\n` +
                        `💡 *Tip:* Use *.song ${query}* to download this track\n\n` +
                        `*Powered by Blu3Bot*`
                }, { quoted: message });

                await react('✅');

            } catch (error) {
                console.error('Music command error:', error);
                await react('❌');
                await reply(`❌ Music search failed: ${error.message}`);
            }
        }
    )
};
