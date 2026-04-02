// commands/instastory.js
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
        'story',
        'Download all Instagram stories from a username',
        '.story [username]',
        'download',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📸');
            
            if (!args[0]) {
                await reply('Please provide a valid Instagram username.');
                return;
            }

            const username = args[0];
            const apiUrl = `https://bk9.fun/download/igs?username=${encodeURIComponent(username)}`;

            try {
                const apiResponse = await axios.get(apiUrl);

                if (!apiResponse.data.status || !apiResponse.data.BK9 || apiResponse.data.BK9.length === 0) {
                    await reply('No stories found or failed to fetch stories.');
                    return;
                }

                const stories = apiResponse.data.BK9;

                await reply(
                    `*Instagram Story Downloader*\n\n` +
                    `╭───────────────◆\n` +
                    `│⿻ *Instagram User:* ${username}\n` +
                    `│⿻ *Total Stories:* ${stories.length}\n` +
                    `╰────────────────◆\n\n` +
                    `_Downloading all stories now..._`
                );

                let mediaSent = 0;

                for (const story of stories) {
                    if (story.url) {
                        if (story.type.includes("image")) {
                            await Blu3Bot.sendMessage(from, {
                                image: { url: story.url },
                                caption: `📷 Instagram Story - @${username}`
                            }, { quoted: message });
                            mediaSent++;
                        } else if (story.type.includes("video")) {
                            await Blu3Bot.sendMessage(from, {
                                video: { url: story.url },
                                caption: `🎥 Instagram Story - @${username}`
                            }, { quoted: message });
                            mediaSent++;
                        }
                    }
                }

                if (mediaSent > 0) {
                    await reply(`✅ All ${mediaSent} stories have been sent.`);
                } else {
                    await reply('⚠️ The stories could not be sent. They might be expired or private.');
                }

            } catch (error) {
                console.error("IG Story Error:", error);
                await reply('An error occurred while fetching stories. Try again later.');
            }
        }
    ),
    aliases: ['instastory', 'igstory']
};