// commands/shazam.js - UPDATED WITH YOUR EXACT APIS
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
        'shazam',
        'Find songs using text search',
        '.shazam [song description]',
        'music',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🎶');
            
            const description = args.join(' ');
            if (!description) {
                await reply('Please describe the song (lyrics, artist, or how it goes).\nExample: .shazam shape of you ed sheeran');
                return;
            }

            // Using YOUR exact search API from the message
            const searchApis = [
                'https://api.erdwpe.com/api/search/google'
            ];

            await reply('🎶 *Searching for your song...*');

            let success = false;

            // Try the API
            for (const apiUrl of searchApis) {
                try {
                    console.log(`Trying Search API: ${apiUrl}`);
                    
                    const response = await axios.get(`${apiUrl}?query=${encodeURIComponent(description + " song lyrics")}`, {
                        timeout: 10000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    const data = response.data;

                    // Handle YOUR specific API response format
                    if (data.status && data.result) {
                        // Find the most relevant music result
                        const musicResults = data.result.filter(item => 
                            item.title.toLowerCase().includes('lyrics') || 
                            item.title.toLowerCase().includes('song') ||
                            item.description.toLowerCase().includes('lyrics')
                        );

                        if (musicResults.length > 0) {
                            const bestResult = musicResults[0];
                            await reply(`*🎶 Song Found!*\n\n*Title:* ${bestResult.title.replace(' - Lyrics', '').replace(' Lyrics', '')}\n*Description:* ${bestResult.description || 'No description available'}\n\n*Powered by Blu3Bot*`);
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
                    const search = await yts(description + " song");
                    const video = search.videos[0];

                    if (video) {
                        await reply({
                            image: { url: video.thumbnail },
                            caption: `*🎶 Song Found!*\n\n*Title:* ${video.title}\n*Artist:* ${video.author.name}\n*Duration:* ${video.timestamp}\n\n*Listen:* ${video.url}\n\n*Powered by Blu3Bot*`
                        });
                    } else {
                        await reply('❌ No song found. Try describing it differently or use: .play [song name]');
                    }
                } catch (fallbackError) {
                    await reply('❌ Failed to identify song. Try: .play [song name]');
                    await react('❌');
                }
            } else {
                await react('✅');
            }
        }
    ),
    aliases: ['findsong', 'identifysong', 'whatsong']
};