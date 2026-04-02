// commands/download.js  — YouTube Video downloader
const ytdl = require('@distube/ytdl-core');

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
        'download',
        'Download a YouTube video (max ~50MB / ~10 min)',
        '.download [youtube url]',
        'download',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🎬');

            const url = args.join(' ').trim();
            if (!url || !ytdl.validateURL(url)) {
                await reply('🎬 *YouTube Video Downloader*\n\nUsage: `.download [youtube url]`\n\nFor audio-only use: `.play [youtube url]`\n\nExample:\n`.download https://youtu.be/dQw4w9WgXcQ`');
                return;
            }

            await reply('⏳ Fetching YouTube info...');

            try {
                const info = await ytdl.getInfo(url);
                const details = info.videoDetails;

                const durationSecs = parseInt(details.lengthSeconds, 10);
                if (durationSecs > 600) {
                    await reply(`❌ Video is too long (${formatDuration(durationSecs)}).\n\nMax supported length is 10 minutes. Try a shorter video.`);
                    return;
                }

                // Pick best format under ~50MB — prefer 360p mp4 for reliability
                const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
                const preferredQualities = ['18', '22']; // 360p, 720p mp4
                let chosenFormat = null;

                for (const quality of preferredQualities) {
                    chosenFormat = formats.find(f => f.itag === parseInt(quality));
                    if (chosenFormat) break;
                }

                if (!chosenFormat) {
                    chosenFormat = formats.sort((a, b) => (a.contentLength || 0) - (b.contentLength || 0))[0];
                }

                if (!chosenFormat) {
                    await reply('❌ No suitable video format found for this video.');
                    return;
                }

                const fileSizeBytes = parseInt(chosenFormat.contentLength || 0);
                if (fileSizeBytes > 55 * 1024 * 1024) {
                    await reply(`❌ Video file is too large (${(fileSizeBytes / 1024 / 1024).toFixed(1)} MB).\n\nMax supported size is ~50 MB. Try a shorter or lower-quality video.`);
                    return;
                }

                const caption = [
                    `🎬 *YouTube Video*`,
                    `\n📌 ${details.title}`,
                    `👤 ${details.author?.name || 'Unknown'}`,
                    `⏱ ${formatDuration(durationSecs)}`,
                    `👁 ${Number(details.viewCount || 0).toLocaleString()} views`,
                    `\n_Powered by Blu3Bot_`
                ].join('\n');

                await reply(`⬇️ Downloading video...\n\n📌 ${details.title}\n⏱ ${formatDuration(durationSecs)}`);

                const stream = ytdl(url, { format: chosenFormat });
                const chunks = [];
                let totalSize = 0;

                for await (const chunk of stream) {
                    totalSize += chunk.length;
                    if (totalSize > 55 * 1024 * 1024) throw new Error('SIZE_EXCEEDED');
                    chunks.push(chunk);
                }

                const buffer = Buffer.concat(chunks);

                await Blu3Bot.sendMessage(from, {
                    video: buffer,
                    mimetype: 'video/mp4',
                    caption
                }, { quoted: message });

            } catch (err) {
                console.error('YouTube DL error:', err.message);
                if (err.message === 'SIZE_EXCEEDED') {
                    await reply('❌ Video file exceeded 50 MB during download. Try a shorter video.');
                } else if (err.message?.includes('age')) {
                    await reply('❌ This video is age-restricted and cannot be downloaded.');
                } else if (err.message?.includes('private') || err.message?.includes('unavailable')) {
                    await reply('❌ This video is private or unavailable.');
                } else {
                    await reply('❌ YouTube download failed. The video may be unavailable, age-restricted, or too long.\n\nMake sure you paste the full YouTube URL.');
                }
            }
        }
    ),
    aliases: ['yt', 'ytdl', 'ytv', 'ytvideo']
};
