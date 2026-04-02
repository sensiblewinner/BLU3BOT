// commands/play.js — YouTube Audio (MP3) downloader
const ytdl = require('@distube/ytdl-core');
const ytSearch = require('yt-search');

class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

function formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

module.exports = {
    command: new Command(
        'play',
        'Download YouTube audio as MP3, or search by name',
        '.play [youtube url or search term]',
        'download',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🎧');

            const input = args.join(' ').trim();
            if (!input) {
                await reply('🎧 *YouTube Audio Downloader*\n\nUsage:\n`.play [youtube url]`\n`.play [song name]`\n\nExample:\n`.play https://youtu.be/dQw4w9WgXcQ`\n`.play never gonna give you up`');
                return;
            }

            await reply('⏳ Searching...');

            try {
                let videoUrl = input;
                let title = '';
                let author = '';
                let durationSecs = 0;

                if (!ytdl.validateURL(input)) {
                    // Search YouTube
                    const search = await ytSearch(input);
                    const video = search?.videos?.[0];

                    if (!video) {
                        await reply('❌ No results found for: ' + input);
                        return;
                    }

                    videoUrl = video.url;
                    title = video.title;
                    author = video.author?.name || '';
                    durationSecs = video.seconds || 0;

                    await reply(`🎵 Found: *${title}*\n👤 ${author}\n⏱ ${video.timestamp || ''}\n\n⬇️ Downloading audio...`);
                } else {
                    await reply('⬇️ Fetching audio info...');
                }

                const info = await ytdl.getInfo(videoUrl);
                const details = info.videoDetails;

                if (!title) title = details.title;
                if (!author) author = details.author?.name || 'Unknown';
                if (!durationSecs) durationSecs = parseInt(details.lengthSeconds, 10);

                if (durationSecs > 600) {
                    await reply(`❌ Audio is too long (${formatDuration(durationSecs)}).\n\nMax supported length is 10 minutes.`);
                    return;
                }

                const audioFormat = ytdl.chooseFormat(info.formats, {
                    filter: 'audioonly',
                    quality: 'highestaudio'
                });

                if (!audioFormat) {
                    await reply('❌ No audio format available for this video.');
                    return;
                }

                const stream = ytdl(videoUrl, { format: audioFormat });
                const chunks = [];
                let totalSize = 0;

                for await (const chunk of stream) {
                    totalSize += chunk.length;
                    if (totalSize > 30 * 1024 * 1024) throw new Error('SIZE_EXCEEDED');
                    chunks.push(chunk);
                }

                const buffer = Buffer.concat(chunks);

                await Blu3Bot.sendMessage(from, {
                    audio: buffer,
                    mimetype: 'audio/mp4',
                    ptt: false,
                    fileName: `${title.slice(0, 50)}.m4a`
                }, { quoted: message });

                await reply(`✅ *${title}*\n👤 ${author}\n⏱ ${formatDuration(durationSecs)}\n\n_Powered by Blu3Bot_`);

            } catch (err) {
                console.error('YouTube Audio DL error:', err.message);
                if (err.message === 'SIZE_EXCEEDED') {
                    await reply('❌ Audio file is too large (>30 MB). Try a shorter track.');
                } else if (err.message?.includes('age')) {
                    await reply('❌ This video is age-restricted and cannot be downloaded.');
                } else {
                    await reply('❌ Audio download failed. The video may be unavailable or age-restricted.\n\nMake sure you paste the full YouTube URL or try a different search term.');
                }
            }
        }
    ),
    aliases: ['song', 'mp3', 'audio', 'yta']
};
