// commands/scdl.js — SoundCloud downloader
const axios = require('axios');

class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

// Fetch a fresh SoundCloud client_id dynamically from their web player
let cachedClientId = null;
let clientIdFetchedAt = 0;

async function getSoundCloudClientId() {
    const now = Date.now();
    if (cachedClientId && now - clientIdFetchedAt < 3600000) return cachedClientId;

    // Fetch SoundCloud's main page to find their JS bundle URLs
    const page = await axios.get('https://soundcloud.com', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 15000
    });

    // Extract script source URLs
    const scriptUrls = [...page.data.matchAll(/src="(https:\/\/a-v2\.sndcdn\.com\/assets\/[^"]+\.js)"/g)]
        .map(m => m[1]);

    // Check the last few scripts for the client_id
    for (const scriptUrl of scriptUrls.slice(-5).reverse()) {
        const script = await axios.get(scriptUrl, { timeout: 10000 });
        const match = script.data.match(/client_id:"([a-zA-Z0-9]+)"/);
        if (match) {
            cachedClientId = match[1];
            clientIdFetchedAt = now;
            return cachedClientId;
        }
    }

    throw new Error('Could not extract SoundCloud client_id');
}

async function resolveSoundCloudTrack(trackUrl, clientId) {
    const res = await axios.get('https://api-v2.soundcloud.com/resolve', {
        params: { url: trackUrl, client_id: clientId },
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 15000
    });
    return res.data;
}

async function getStreamUrl(track, clientId) {
    const transcoding = track.media?.transcodings?.find(
        t => t.format?.protocol === 'progressive' && t.format?.mime_type?.includes('mpeg')
    ) || track.media?.transcodings?.[0];

    if (!transcoding) throw new Error('No stream URL available');

    const streamRes = await axios.get(transcoding.url, {
        params: { client_id: clientId },
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 15000
    });

    return streamRes.data.url;
}

module.exports = {
    command: new Command(
        'soundcloud',
        'Download SoundCloud track as audio',
        '.soundcloud [soundcloud url]',
        'download',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🎶');

            const url = args.join(' ').trim();
            if (!url || !url.includes('soundcloud')) {
                await reply('🎶 *SoundCloud Downloader*\n\nUsage: `.soundcloud [url]`\n\nExample:\n`.soundcloud https://soundcloud.com/artist/trackname`');
                return;
            }

            await reply('⏳ Fetching SoundCloud track...');

            try {
                const clientId = await getSoundCloudClientId();
                const track = await resolveSoundCloudTrack(url, clientId);

                if (track.kind !== 'track') {
                    await reply('❌ Only individual tracks are supported. Paste a link to a single SoundCloud track.');
                    return;
                }

                const title = track.title || 'Unknown Title';
                const artist = track.user?.username || 'Unknown Artist';
                const durationMs = track.duration || 0;
                const mins = Math.floor(durationMs / 60000);
                const secs = Math.floor((durationMs % 60000) / 1000);
                const duration = `${mins}:${secs.toString().padStart(2, '0')}`;

                await reply(`⬇️ Downloading: *${title}* by ${artist}\n⏱ ${duration}`);

                const streamUrl = await getStreamUrl(track, clientId);

                const audioRes = await axios.get(streamUrl, {
                    responseType: 'arraybuffer',
                    timeout: 60000,
                    maxContentLength: 30 * 1024 * 1024
                });

                const buffer = Buffer.from(audioRes.data);

                if (buffer.length > 30 * 1024 * 1024) {
                    await reply('❌ Track is too large (>30 MB) to send via WhatsApp.');
                    return;
                }

                await Blu3Bot.sendMessage(from, {
                    audio: buffer,
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    fileName: `${title.slice(0, 50)}.mp3`
                }, { quoted: message });

                await reply(`✅ *${title}*\n👤 ${artist}\n⏱ ${duration}\n❤️ ${Number(track.likes_count || 0).toLocaleString()} likes\n\n_Powered by Blu3Bot_`);

            } catch (err) {
                console.error('SoundCloud DL error:', err.message);
                if (err.message?.includes('client_id') || err.message?.includes('401')) {
                    cachedClientId = null; // reset cache so it retries
                    await reply('❌ SoundCloud session expired. Please try again in a moment.');
                } else {
                    await reply('❌ Download failed. Make sure:\n• The link is a public SoundCloud track\n• Not a playlist or album link\n• The track is not geo-restricted');
                }
            }
        }
    ),
    aliases: ['sc', 'scdownload', 'scdl']
};
