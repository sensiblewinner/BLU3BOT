// commands/lyrics.js - CONVERTED FOR BLU3BOT
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
const cheerio = require('cheerio');

module.exports = {
    command: new Command(
        'lyrics',
        'Get song lyrics from multiple sources',
        '.lyrics [song name]',
        'music',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            try {
                if (!args || args.length === 0) {
                    await react("🎵");
                    return reply(`🎵 *Lyrics Finder*\n\n${context.prefix}lyrics <song name>\n\nExamples:\n${context.prefix}lyrics "Home by NF"\n${context.prefix}lyrics "Blinding Lights The Weeknd"\n${context.prefix}lyrics "Shape of You Ed Sheeran"`);
                }

                const searchQuery = args.join(" ");
                console.log(`🎵 [LYRICS] Searching for: ${searchQuery}`);

                await react("🔍");
                await reply(`🔍 *Searching lyrics*: "${searchQuery}"`);

                // Try multiple methods to get lyrics
                const lyricsData = await getLyricsEnhanced(searchQuery);
                
                if (lyricsData && lyricsData.lyrics) {
                    const formattedLyrics = formatLyrics(lyricsData);
                    await react("📝");
                    await reply(formattedLyrics);
                    console.log(`✅ [LYRICS] Successfully sent lyrics for: ${lyricsData.title}`);
                } else {
                    await react("❌");
                    await reply(`❌ *Lyrics Not Found*\n\n"${searchQuery}"\n\n🌐 *Search manually:*\n• https://genius.com/search?q=${encodeURIComponent(searchQuery)}\n• https://www.azlyrics.com/lyrics/${generateAZLyricsPath(searchQuery)}\n• https://www.google.com/search?q=${encodeURIComponent(searchQuery + ' lyrics')}\n\n💡 *Tip:* Try the exact song title with artist name`);
                }

            } catch (error) {
                console.error("❌ [LYRICS] ERROR:", error);
                await react("🎙️");
                await reply(`❌ Error: ${error.message}`);
            }
        }
    ),
    aliases: ['lyric', 'lirik', 'songtext']
};

// Enhanced lyrics search with multiple methods
async function getLyricsEnhanced(query) {
    const methods = [
        { name: 'Lyrics.ovh API', func: getLyricsOvh },
        { name: 'Genius Scrape', func: scrapeGeniusLyrics },
        { name: 'AZLyrics Scrape', func: scrapeAZLyrics },
        { name: 'Google Search', func: searchGoogleLyrics }
    ];

    for (const method of methods) {
        try {
            console.log(`🔍 Trying ${method.name}...`);
            const result = await method.func(query);
            if (result && result.lyrics && result.lyrics.length > 50) { // Ensure we have substantial lyrics
                console.log(`✅ Found lyrics with ${method.name}`);
                return result;
            }
        } catch (error) {
            console.log(`❌ ${method.name} failed:`, error.message);
        }
    }
    return null;
}

// Method 1: Lyrics.ovh API
async function getLyricsOvh(query) {
    try {
        const parsed = parseSongQuery(query);
        const response = await axios.get(
            `https://api.lyrics.ovh/v1/${encodeURIComponent(parsed.artist)}/${encodeURIComponent(parsed.title)}`,
            { timeout: 15000 }
        );

        if (response.data && response.data.lyrics) {
            return {
                title: parsed.title,
                artist: parsed.artist,
                lyrics: response.data.lyrics,
                source: 'Lyrics.ovh'
            };
        }
    } catch (error) {
        throw new Error('Lyrics.ovh API failed');
    }
}

// Method 2: Scrape Genius.com
async function scrapeGeniusLyrics(query) {
    try {
        // Search Genius
        const searchUrl = `https://genius.com/api/search/multi?q=${encodeURIComponent(query)}`;
        const searchResponse = await axios.get(searchUrl, { timeout: 20000 });
        
        if (searchResponse.data && searchResponse.data.response) {
            // Find song in results
            const sections = searchResponse.data.response.sections;
            for (const section of sections) {
                if (section.type === 'song') {
                    const song = section.hits[0]?.result;
                    if (song) {
                        // Get lyrics from song page
                        const songResponse = await axios.get(song.url, { timeout: 20000 });
                        const $ = cheerio.load(songResponse.data);
                        
                        // Extract lyrics from Genius page
                        let lyrics = '';
                        $('[data-lyrics-container="true"]').each((i, elem) => {
                            lyrics += $(elem).text() + '\n\n';
                        });
                        
                        if (lyrics.trim().length > 100) {
                            return {
                                title: song.title,
                                artist: song.primary_artist.name,
                                lyrics: lyrics.trim(),
                                source: 'Genius.com',
                                url: song.url
                            };
                        }
                    }
                }
            }
        }
        throw new Error('No lyrics found on Genius');
    } catch (error) {
        throw new Error(`Genius scrape failed: ${error.message}`);
    }
}

// Method 3: Scrape AZLyrics
async function scrapeAZLyrics(query) {
    try {
        const parsed = parseSongQuery(query);
        
        // Generate AZLyrics URL pattern
        const artistSlug = parsed.artist.toLowerCase().replace(/[^a-z0-9]/g, '');
        const titleSlug = parsed.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        const azUrl = `https://www.azlyrics.com/lyrics/${artistSlug}/${titleSlug}.html`;
        
        const response = await axios.get(azUrl, { 
            timeout: 20000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        
        // Extract lyrics from AZLyrics
        let lyrics = '';
        $('div.main-page div.row div.text-center div').each((i, elem) => {
            if (i === 0) return; // Skip the first div (usually ads)
            const text = $(elem).text().trim();
            if (text && !text.includes('if (') && !text.includes('function(')) {
                lyrics += text + '\n\n';
            }
        });
        
        if (lyrics.trim().length > 100) {
            return {
                title: parsed.title,
                artist: parsed.artist,
                lyrics: lyrics.trim(),
                source: 'AZLyrics.com',
                url: azUrl
            };
        }
        
        throw new Error('No lyrics found on AZLyrics');
    } catch (error) {
        throw new Error(`AZLyrics scrape failed: ${error.message}`);
    }
}

// Method 4: Google search fallback
async function searchGoogleLyrics(query) {
    try {
        const parsed = parseSongQuery(query);
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`"${parsed.title}" "${parsed.artist}" lyrics`)}`;
        
        return {
            title: parsed.title,
            artist: parsed.artist,
            lyrics: `🔍 *Lyrics search required*\n\nSong: ${parsed.title}\nArtist: ${parsed.artist}\n\n🌐 *Search on:*\n${searchUrl}\n\n💡 Click the link above to find lyrics on Google`,
            source: 'Google Search',
            url: searchUrl
        };
    } catch (error) {
        throw new Error('Google search failed');
    }
}

// Parse song query intelligently
function parseSongQuery(query) {
    // Common patterns
    const patterns = [
        /^"(.+)"\s+by\s+(.+)$/i,                    // "title" by artist
        /^"(.+)"\s+-\s+(.+)$/i,                     // "title" - artist  
        /^(.+)\s+by\s+(.+)$/i,                      // title by artist
        /^(.+)\s+-\s+(.+)$/i,                       // artist - title
        /^(.+)\s+\(\s*(.+)\s*\)$/i,                 // title (artist)
        /^(.+)\s+ft\.?\s+(.+)$/i,                   // title ft. artist
        /^(.+)\s+feat\.?\s+(.+)$/i                  // title feat. artist
    ];

    for (const pattern of patterns) {
        const match = query.match(pattern);
        if (match) {
            return {
                title: match[1].trim(),
                artist: match[2].trim()
            };
        }
    }

    // If no pattern matches, try to intelligently split
    const words = query.split(' ');
    if (words.length >= 3) {
        // Common case: assume first part is title, last word is artist
        return {
            title: words.slice(0, -1).join(' '),
            artist: words[words.length - 1]
        };
    }

    // Fallback
    return {
        title: query,
        artist: 'Unknown Artist'
    };
}

// Generate AZLyrics path
function generateAZLyricsPath(query) {
    const parsed = parseSongQuery(query);
    const artist = parsed.artist.toLowerCase().replace(/[^a-z0-9]/g, '');
    const title = parsed.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${artist}/${title}.html`;
}

// Format lyrics for WhatsApp
function formatLyrics(lyricsData) {
    const { title, artist, lyrics, source, url } = lyricsData;
    
    let message = `🎵 *${title}*`;
    if (artist && artist !== 'Unknown Artist') {
        message += `\n👤 *Artist:* ${artist}`;
    }
    message += `\n📝 *Source:* ${source}\n\n`;
    
    // Clean and format lyrics
    const cleanLyrics = lyrics
        .replace(/\[.*?\]/g, '\n$&\n') // Put [Verse], [Chorus] on separate lines
        .replace(/\n\s*\n/g, '\n\n')   // Clean up extra newlines
        .replace(/^\s+|\s+$/g, '')     // Trim
        .substring(0, 3500);           // Limit length
    
    message += cleanLyrics;
    
    // Add URL if available and there's space
    if (url && message.length < 3800) {
        message += `\n\n🔗 ${url}`;
    }
    
    // Add truncation notice if needed
    if (lyrics.length > 3500) {
        message += `\n\n📜 *Lyrics truncated* - Visit link for complete lyrics`;
    }
    
    return message;
}