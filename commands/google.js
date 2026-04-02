// commands/google.js - UPDATED WITH YOUR EXACT API
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
        'google',
        'Search the web',
        '.google [search term]',
        'search',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🔍');
            
            const query = args.join(' ');
            if (!query) {
                await reply('Please provide a search term.');
                return;
            }

            // Using YOUR exact Google search API from the message
            const searchApis = [
                'https://api.erdwpe.com/api/search/google'
            ];

            await reply('🔍 *Searching the web...*');

            let searchSuccess = false;

            // Try the API
            for (const apiUrl of searchApis) {
                try {
                    console.log(`Trying Search API: ${apiUrl}`);
                    
                    const response = await axios.get(`${apiUrl}?query=${encodeURIComponent(query)}`, {
                        timeout: 10000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    const data = response.data;

                    // Handle YOUR specific API response format
                    if (data.status && data.result) {
                        let results = `*🔍 SEARCH RESULTS: ${query}*\n\n`;
                        data.result.slice(0, 5).forEach((item, index) => {
                            results += `*${index + 1}. ${item.title}*\n`;
                            if (item.description) results += `${item.description}\n`;
                            results += '\n';
                        });
                        await reply(results + '*Powered by Blu3Bot*');
                        searchSuccess = true;
                        break;
                    }
                } catch (error) {
                    console.log(`Search API failed: ${apiUrl} - ${error.message}`);
                    // Continue to next API if there were more
                }
            }

            if (!searchSuccess) {
                // Fallback response if API fails
                await reply(`*🔍 SEARCH: ${query}*\n\n*Search temporarily unavailable. Try these alternatives:*\n• Wikipedia (.wiki ${query})\n• YouTube Search (.yts ${query})\n• AI Assistant (.ai ${query})\n\n*Powered by Blu3Bot*`);
                await react('❌');
            } else {
                await react('✅');
            }
        }
    ),
    aliases: ['search', 'g']
};