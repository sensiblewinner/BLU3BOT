// commands/lyrics2.js - UPDATED WITH YOUR EXACT APIS
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
        'lyrics2',
        'Find song lyrics (alternative)',
        '.lyrics2 [song name] [artist]',
        'music',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📝');
            
            const query = args.join(' ');
            if (!query) {
                await reply('Please provide a song name and artist.\nExample: .lyrics2 blinding lights weeknd');
                return;
            }

            // Using YOUR exact search API from the message for lyrics search
            const searchApis = [
                'https://api.erdwpe.com/api/search/google'
            ];

            await reply('📝 *Searching for lyrics...*');

            let success = false;

            // Try the API
            for (const apiUrl of searchApis) {
                try {
                    console.log(`Trying Search API: ${apiUrl}`);
                    
                    const response = await axios.get(`${apiUrl}?query=${encodeURIComponent(query + " full lyrics")}`, {
                        timeout: 10000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    const data = response.data;

                    // Handle YOUR specific API response format for lyrics
                    if (data.status && data.result) {
                        // Find lyrics-related results with more content
                        const lyricsResults = data.result.filter(item => 
                            (item.title.toLowerCase().includes('lyrics') && 
                             item.description && 
                             item.description.length > 100) ||
                            item.description?.toLowerCase().includes('verse') ||
                            item.description?.toLowerCase().includes('chorus')
                        );

                        if (lyricsResults.length > 0) {
                            const bestResult = lyricsResults[0];
                            let lyricsInfo = `📝 *Lyrics: ${query}*\n\n`;
                            
                            // Use the description as lyrics preview
                            if (bestResult.description) {
                                const lyricsText = bestResult.description;
                                // Clean up the lyrics text
                                const cleanLyrics = lyricsText
                                    .replace(/\[.*?\]/g, '') // Remove [Verse], [Chorus] etc
                                    .substring(0, 3500); // Limit length
                                
                                lyricsInfo += `${cleanLyrics}`;
                                
                                if (lyricsText.length > 3500) {
                                    lyricsInfo += '\n\n...*(truncated)*';
                                }
                                
                                lyricsInfo += `\n\n*Source:* ${bestResult.title}`;
                            }
                            
                            await reply(lyricsInfo);
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
                // Fallback to free lyrics API
                try {
                    const response = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(query)}`);
                    const data = response.data;

                    if (data.lyrics) {
                        const shortLyrics = data.lyrics.length > 4000 ? data.lyrics.slice(0, 3997) + '...' : data.lyrics;
                        await reply(`*📝 Lyrics for: ${query}*\n\n${shortLyrics}\n\n*Powered by Blu3Bot*`);
                        await react('✅');
                    } else {
                        await reply(`❌ Lyrics not found for "${query}".\n\nTry:\n• .lyrics [song] - Alternative lyrics search\n• .spotify [song] - Song information\n• Include artist name for better results`);
                        await react('❌');
                    }
                } catch (fallbackError) {
                    await reply(`❌ Lyrics not found for "${query}".\n\n*Alternative commands:*\n• .lyrics [song] - Main lyrics search\n• .spotify [song] - Music information\n• .shazam [description] - Identify song\n\n*Powered by Blu3Bot*`);
                    await react('❌');
                }
            } else {
                await react('✅');
            }
        }
    ),
    aliases: ['lyricsalt', 'lirik2']
};