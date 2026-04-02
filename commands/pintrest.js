// commands/pintrest.js
const axios = require('axios');
const cheerio = require('cheerio');

class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

async function fetchPinterestMedia(url) {
    const res = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 15000
    });

    const $ = cheerio.load(res.data);

    const videoUrl = $('meta[property="og:video"]').attr('content') ||
        $('meta[name="og:video"]').attr('content') || null;

    const imageUrl = $('meta[property="og:image"]').attr('content') ||
        $('meta[name="og:image"]').attr('content') || null;

    const title = $('meta[property="og:title"]').attr('content') ||
        $('meta[name="og:title"]').attr('content') || 'Pinterest Pin';

    // Pinterest's og:image sometimes points to a sized version — get the original
    const cleanImage = imageUrl
        ? imageUrl.replace(/\/\d+x(\d+)\//, '/originals/')
        : null;

    return { videoUrl, imageUrl: cleanImage || imageUrl, title };
}

module.exports = {
    command: new Command(
        'pinterest',
        'Download Pinterest image or video',
        '.pinterest [url]',
        'download',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📌');

            const url = args.join(' ').trim();
            if (!url || !url.includes('pinterest') && !url.includes('pin.it')) {
                await reply('📌 *Pinterest Downloader*\n\nUsage: `.pinterest [url]`\n\nSupports: Photos, Videos, Story pins\n\nExample:\n`.pinterest https://www.pinterest.com/pin/123456`');
                return;
            }

            await reply('⏳ Fetching Pinterest media...');

            try {
                let resolvedUrl = url;

                // Follow short links (pin.it)
                if (url.includes('pin.it')) {
                    const redir = await axios.get(url, { maxRedirects: 5, timeout: 10000 });
                    resolvedUrl = redir.request?.res?.responseUrl || url;
                }

                const { videoUrl, imageUrl, title } = await fetchPinterestMedia(resolvedUrl);

                if (videoUrl) {
                    await Blu3Bot.sendMessage(from, {
                        video: { url: videoUrl },
                        caption: `📌 *Pinterest Video*\n\n_${title.slice(0, 150)}_\n\n_Powered by Blu3Bot_`
                    }, { quoted: message });
                } else if (imageUrl) {
                    await Blu3Bot.sendMessage(from, {
                        image: { url: imageUrl },
                        caption: `📌 *Pinterest Photo*\n\n_${title.slice(0, 150)}_\n\n_Powered by Blu3Bot_`
                    }, { quoted: message });
                } else {
                    await reply('❌ Could not extract media from this pin. It may be a private or animated pin.');
                }

            } catch (err) {
                console.error('Pinterest DL error:', err.message);
                await reply('❌ Download failed. Make sure the link is a valid public Pinterest pin.');
            }
        }
    ),
    aliases: ['pin', 'pindl', 'pinterestdl']
};
