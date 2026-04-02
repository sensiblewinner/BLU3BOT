// commands/reddit.js
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
        'reddit',
        'Download Reddit post media (video/image/gif)',
        '.reddit [url]',
        'download',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🤖');

            const url = args.join(' ').trim();
            if (!url || !url.includes('reddit')) {
                await reply('🤖 *Reddit Downloader*\n\nUsage: `.reddit [post url]`\n\nSupports: Videos, GIFs, Images\n\nExample:\n`.reddit https://www.reddit.com/r/funny/comments/abc123`');
                return;
            }

            await reply('⏳ Fetching Reddit post...');

            try {
                // Ensure the URL ends cleanly (no query params that break .json)
                const cleanUrl = url.split('?')[0].replace(/\/$/, '');
                const jsonUrl = `${cleanUrl}.json`;

                const res = await axios.get(jsonUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; WhatsApp Bot/1.0)'
                    },
                    timeout: 15000
                });

                const post = res.data?.[0]?.data?.children?.[0]?.data;
                if (!post) {
                    await reply('❌ Could not read this Reddit post. Make sure it is a public post.');
                    return;
                }

                const title = post.title || 'Reddit Post';
                const subreddit = post.subreddit_name_prefixed || '';
                const score = post.score ? `⬆️ ${post.score.toLocaleString()}` : '';
                const caption = `🤖 *Reddit Download*\n\n📌 ${title.slice(0, 200)}\n${subreddit} ${score}\n\n_Powered by Blu3Bot_`;

                // Video post (native reddit video)
                if (post.is_video && post.media?.reddit_video) {
                    const video = post.media.reddit_video;
                    const videoUrl = video.fallback_url?.replace('?source=fallback', '');

                    if (!videoUrl) {
                        await reply('❌ Could not get video URL from this post.');
                        return;
                    }

                    await Blu3Bot.sendMessage(from, {
                        video: { url: videoUrl },
                        caption
                    }, { quoted: message });

                // Gallery post (multiple images)
                } else if (post.gallery_data && post.media_metadata) {
                    const items = Object.values(post.media_metadata);
                    let sent = 0;
                    for (const item of items.slice(0, 5)) {
                        if (item.status === 'valid' && item.p?.length > 0) {
                            const imgUrl = item.s?.u?.replace(/&amp;/g, '&') || item.p?.[item.p.length - 1]?.u?.replace(/&amp;/g, '&');
                            if (imgUrl) {
                                await Blu3Bot.sendMessage(from, {
                                    image: { url: imgUrl },
                                    caption: sent === 0 ? caption : ''
                                }, { quoted: message });
                                sent++;
                            }
                        }
                    }
                    if (sent === 0) await reply('❌ No images found in this gallery post.');

                // GIF / gifv / image
                } else if (post.url) {
                    const postUrl = post.url;

                    if (postUrl.match(/\.(gif|gifv)$/i)) {
                        const mp4Url = postUrl.replace('.gifv', '.mp4').replace('.gif', '.mp4');
                        await Blu3Bot.sendMessage(from, {
                            video: { url: mp4Url },
                            caption
                        }, { quoted: message });

                    } else if (postUrl.match(/\.(jpg|jpeg|png|webp)$/i)) {
                        await Blu3Bot.sendMessage(from, {
                            image: { url: postUrl },
                            caption
                        }, { quoted: message });

                    } else if (post.preview?.images?.[0]?.source?.url) {
                        const imgUrl = post.preview.images[0].source.url.replace(/&amp;/g, '&');
                        await Blu3Bot.sendMessage(from, {
                            image: { url: imgUrl },
                            caption
                        }, { quoted: message });

                    } else {
                        await reply(`📋 *Reddit Post*\n\n📌 ${title.slice(0, 200)}\n${subreddit} ${score}\n🔗 ${postUrl}\n\n_This post type has no downloadable media._`);
                    }

                } else {
                    await reply('❌ This post does not contain downloadable media.');
                }

            } catch (err) {
                console.error('Reddit DL error:', err.message);
                await reply('❌ Download failed. Make sure this is a valid public Reddit post link.');
            }
        }
    ),
    aliases: ['rdl', 'redditdl']
};
