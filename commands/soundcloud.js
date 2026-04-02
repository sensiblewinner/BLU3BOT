// commands/soundcloud.js  [serves the .tiktok command]
const { TiktokDL } = require('@tobyg74/tiktok-api-dl');

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
        'tiktok',
        'Download TikTok video without watermark',
        '.tiktok [url]',
        'download',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🎵');

            const url = args.join(' ').trim();
            if (!url || !url.includes('tiktok')) {
                await reply('📱 *TikTok Downloader*\n\nUsage: `.tiktok [url]`\n\nExample:\n`.tiktok https://www.tiktok.com/@user/video/123`');
                return;
            }

            await reply('⏳ Fetching TikTok video...');

            try {
                const result = await TiktokDL(url, { version: 'v3' });

                if (result.status !== 'ok' || !result.result) {
                    await reply('❌ Could not download this TikTok. Make sure the link is valid and the account is public.');
                    return;
                }

                const data = result.result;
                const videoUrl = Array.isArray(data.video) ? data.video[0] : (data.video || data.play);

                if (!videoUrl) {
                    await reply('❌ No downloadable video found. The video may be private or removed.');
                    return;
                }

                const caption = [
                    `📱 *TikTok Download*`,
                    data.description ? `\n_${data.description.slice(0, 200)}_` : '',
                    `\n👤 ${data.author?.nickname || data.author?.unique_id || 'Unknown'}`,
                    data.statistics
                        ? `\n❤️ ${Number(data.statistics.likeCount || 0).toLocaleString()}  💬 ${Number(data.statistics.commentCount || 0).toLocaleString()}`
                        : ''
                ].join('\n').trim();

                await Blu3Bot.sendMessage(from, {
                    video: { url: videoUrl },
                    caption
                }, { quoted: message });

            } catch (err) {
                console.error('TikTok DL error:', err.message);
                await reply('❌ Download failed. The link may have expired or the video is restricted.\n\nMake sure you paste the full TikTok link.');
            }
        }
    ),
    aliases: ['tik', 'tok', 'tikdl']
};
