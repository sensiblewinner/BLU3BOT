// commands/reddit.js
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

module.exports = {
    command: new Command(
        'reddit',
        'Fetch Reddit posts',
        '.reddit [subreddit]',
        'search',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📱');
            
            const subreddit = args[0] || 'all';

            try {
                const response = await axios.get(`https://www.reddit.com/r/${subreddit}/hot.json?limit=5`);
                const data = response.data;

                if (data.data.children.length > 0) {
                    let posts = `*📱 r/${subreddit} - HOT POSTS*\n\n`;
                    data.data.children.slice(0, 5).forEach((post, index) => {
                        const p = post.data;
                        posts += `*${index + 1}. ${p.title}*\n⬆️ ${p.ups} | 💬 ${p.num_comments}\n\n`;
                    });
                    await reply(posts + '*Powered by Blu3Bot*');
                } else {
                    await reply('❌ No posts found or subreddit doesn\'t exist.');
                }
            } catch (error) {
                await reply('❌ Failed to fetch Reddit posts.');
            }
        }
    )
};