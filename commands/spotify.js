// commands/spotify.js
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

module.exports = {
    command: new Command(
        'spotify',
        'Get Spotify track info and thumbnail',
        '.spotify [spotify url or track name]',
        'download',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🎵');

            const input = args.join(' ').trim();
            if (!input) {
                await reply('🎵 *Spotify Info*\n\nUsage: `.spotify [spotify url or track name]`\n\nExample:\n`.spotify https://open.spotify.com/track/abc`\n`.spotify Blinding Lights The Weeknd`');
                return;
            }

            await reply('⏳ Fetching Spotify info...');

            try {
                let spotifyUrl = input;

                if (!input.includes('spotify.com')) {
                    // Search Spotify by track name using unofficial search
                    const searchRes = await axios.get('https://api.spotify.com/v1/search', {
                        params: { q: input, type: 'track', limit: 1 },
                        headers: {
                            Authorization: `Bearer ${await getSpotifyToken()}`
                        },
                        timeout: 10000
                    }).catch(() => null);

                    if (searchRes?.data?.tracks?.items?.[0]) {
                        spotifyUrl = searchRes.data.tracks.items[0].external_urls.spotify;
                    } else {
                        await reply(`❌ No Spotify track found for: "${input}"\n\nTry pasting the full Spotify track link instead.`);
                        return;
                    }
                }

                // Use Spotify OEmbed (public, no auth required)
                const oembedRes = await axios.get('https://open.spotify.com/oembed', {
                    params: { url: spotifyUrl },
                    timeout: 10000
                });

                const data = oembedRes.data;

                const caption = [
                    `🎵 *Spotify Track*`,
                    `\n📌 *${data.title || 'Unknown Title'}*`,
                    data.artist_name ? `👤 ${data.artist_name}` : '',
                    data.album_name ? `💿 ${data.album_name}` : '',
                    `\n🔗 ${spotifyUrl}`,
                    `\n⚠️ _Full audio download requires Spotify API credentials._`,
                    `\n_Powered by Blu3Bot_`
                ].filter(Boolean).join('\n');

                if (data.thumbnail_url) {
                    await Blu3Bot.sendMessage(from, {
                        image: { url: data.thumbnail_url },
                        caption
                    }, { quoted: message });
                } else {
                    await reply(caption);
                }

            } catch (err) {
                console.error('Spotify error:', err.message);

                if (err.response?.status === 401) {
                    await reply('❌ Spotify session expired. Please try again.');
                } else {
                    await reply('❌ Could not fetch Spotify info. Make sure the link is valid.\n\nSpotify requires an API key for full audio access — track info and cover art are available without one.');
                }
            }
        }
    ),
    aliases: ['sp', 'spotifydl', 'track']
};

async function getSpotifyToken() {
    // Public token endpoint — gives limited access (search)
    const res = await axios.get('https://open.spotify.com/get_access_token', {
        params: { reason: 'transport', productType: 'web_player' },
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 8000
    });
    return res.data.accessToken;
}
