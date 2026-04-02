// commands/song.js - WORKING AUDIO VERSION
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
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');

module.exports = {
    command: new Command(
        'song',
        'Download and send songs as MP3 audio',
        '.song [song name]',
        'music',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            try {
                if (!args || args.length === 0) {
                    await react("🎵");
                    return reply(`🎵 *Song Download*\n\n${context.prefix}song <song name>\nEx: ${context.prefix}song shape of you`);
                }

                const searchQuery = args.join(" ");
                
                await react("🔍");
                await reply(`🔍 Searching...`);

                // Search for video
                const { videos } = await yts(searchQuery);
                if (!videos || videos.length === 0) {
                    await react("❌");
                    return reply(`❌ No songs found`);
                }

                const video = videos[0];

                // Send thumbnail preview
                await react("🖼️");
                await Blu3Bot.sendMessage(from, {
                    image: { url: video.thumbnail },
                    caption: `🎵 *${video.title}*\n👤 ${video.author.name}\n⏱️ ${video.timestamp}\n👀 ${video.views.toLocaleString()} views\n\n⬇️ Downloading MP3...`
                }, { quoted: message });

                await react("⬇️");

                // Download MP3 using a working service
                const mp3Buffer = await downloadMP3(video.url, video.title);
                
                if (!mp3Buffer) {
                    await react("❌");
                    return reply(`❌ Download failed - service busy\n\nTry: .song ${video.title.slice(0, 20)}...`);
                }

                const fileSizeMB = (mp3Buffer.length / 1024 / 1024).toFixed(1);

                // Send as audio message
                await Blu3Bot.sendMessage(from, {
                    audio: mp3Buffer,
                    mimetype: 'audio/mpeg',
                    fileName: `${video.title.substring(0, 30)}.mp3`.replace(/[^\w\s.-]/gi, ''),
                    ptt: false
                }, { quoted: message });

                await react("✅");
                await reply(`✅ ${video.title}\n⏱️ ${video.timestamp} • 💾 ${fileSizeMB}MB`);

            } catch (error) {
                console.error("❌ [SONG] ERROR:", error);
                await react("❌");
                await reply(`❌ Error: ${error.message}`);
            }
        }
    ),
    aliases: ['audio', 'music']
};

// Working MP3 download function
async function downloadMP3(youtubeUrl, title) {
    try {
        const videoId = youtubeUrl.split('v=')[1]?.split('&')[0];
        if (!videoId) throw new Error('Invalid YouTube URL');

        console.log(`📥 Downloading MP3 for: ${title}`);

        // Method 1: Try yt5s.com API (usually works)
        try {
            const response = await axios.post('https://yt5s.com/en/api/convert', {
                v: videoId,
                format: 'mp3'
            }, {
                timeout: 45000,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (response.data && response.data.durl) {
                console.log(`✅ Got download URL: ${response.data.durl}`);
                const audioResponse = await axios.get(response.data.durl, {
                    responseType: 'arraybuffer',
                    timeout: 60000
                });
                return Buffer.from(audioResponse.data);
            }
        } catch (e) {
            console.log('Method 1 failed:', e.message);
        }

        // Method 2: Try different API
        try {
            const api2 = `https://api.onlinevideoconverter.pro/api/convert`;
            const response2 = await axios.post(api2, {
                url: youtubeUrl,
                format: 'mp3'
            }, {
                timeout: 30000
            });

            if (response2.data && response2.data.url) {
                console.log(`✅ Got download URL from backup API`);
                const audioResponse = await axios.get(response2.data.url, {
                    responseType: 'arraybuffer',
                    timeout: 60000
                });
                return Buffer.from(audioResponse.data);
            }
        } catch (e) {
            console.log('Method 2 failed:', e.message);
        }

        throw new Error('All download services busy');

    } catch (error) {
        console.log('Download failed:', error.message);
        return null;
    }
}