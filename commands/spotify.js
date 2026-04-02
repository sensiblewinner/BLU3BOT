// commands/spotify.js - UPDATED WITH YOUR EXACT APIS
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
        'spotify',
        'Search music information',
        '.spotify [song name]',
        'music',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🎵');
            
            const query = args.join(' ');
            if (!query) {
                await reply('Please provide a song name to search.');
                return;
            }

            // Using YOUR exact search API from the message
            const searchApis = [
                'https://api.erdwpe.com/api/search/google'
            ];

            await reply('🎵 *Searching for music...*');

            let success = false;

            // Try the API
            for (const apiUrl of searchApis) {
                try {
                    console.log(`Trying Search API: ${apiUrl}`);
                    
                    const response = await axios.get(`${apiUrl}?query=${encodeURIComponent(query + " song lyrics spotify")}`, {
                        timeout: 10000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    const data = response.data;

                    // Handle YOUR specific API response format
                    if (data.status && data.result) {
                        // Find music-related results
                        const musicResults = data.result.filter(item => 
                            item.title.toLowerCase().includes('lyrics') || 
                            item.title.toLowerCase().includes('spotify') ||
                            item.title.toLowerCase().includes('song') ||
                            item.description.toLowerCase().includes('music')
                        );

                        if (musicResults.length > 0) {
                            const bestResult = musicResults[0];
                            let musicInfo = `*🎵 Music Info: ${query}*\n\n`;
                            
                            musicResults.slice(0, 3).forEach((item, index) => {
                                musicInfo += `*${index + 1}. ${item.title}*\n`;
                                if (item.description) {
                                    musicInfo += `${item.description.substring(0, 100)}...\n`;
                                }
                                musicInfo += '\n';
                            });
                            
                            musicInfo += '*Try these commands:*\n• .play [song] - Play music\n• .shazam [description] - Find song\n• .yt [song] - YouTube search';
                            
                            await reply(musicInfo);
                            success = true;
                            break;
                        }
                    }
                } catch (error) {
                    console.log(`Search API failed: ${apiUrl} - ${error.message}`);
                    // Continue to next API if there were more
                }
            }

            if (!success) {
                // Fallback to YouTube search
                try {
                    const yts = require('yt-search');
                    const search = await yts(query);
                    const video = search.videos[0];

                    if (video) {
                        await reply({
                            image: { url: video.thumbnail },
                            caption: `*🎵 Music Info*\n\n*Title:* ${video.title}\n*Artist:* ${video.author.name}\n*Duration:* ${video.timestamp}\n*Views:* ${video.views.toLocaleString()}\n\n*Listen:* ${video.url}\n\n*Powered by Blu3Bot*`
                        });
                    } else {
                        await reply(`*🎵 Music Search: ${query}*\n\nNo specific results found.\n\n*Try:*\n• .play ${query} - Play music\n• .shazam ${query} - Find song details\n• .yt ${query} - YouTube search`);
                    }
                } catch (fallbackError) {
                    await reply(`*🎵 Music Search: ${query}*\n\n*Alternative commands:*\n• .play ${query} - Play music\n• .shazam ${query} - Identify song\n• .yt ${query} - YouTube search\n\n*Powered by Blu3Bot*`);
                    await react('❌');
                }
            } else {
                await react('✅');
            }
        }
    ),
    aliases: ['music', 'song', 'track']
};