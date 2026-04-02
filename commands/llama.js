// commands/llama.js - UPDATED WITH YOUR EXACT APIS
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
        'llama',
        'Ask LLaMA AI a question or prompt',
        '.llama [question]',
        'ai',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🦙');
            
            if (!args || args.length === 0) {
                await reply('Please provide a question to ask LLaMA.');
                return;
            }

            const prompt = args.join(' ');

            // Using YOUR exact LLaMA API from the message
            const llamaApis = [
                'https://api.gurusensei.workers.dev/llama'
            ];

            await reply('🦙 *Thinking...*');

            let success = false;

            // Try the API
            for (const apiUrl of llamaApis) {
                try {
                    console.log(`Trying LLaMA API: ${apiUrl}`);
                    
                    const response = await axios.get(`${apiUrl}?prompt=${encodeURIComponent(prompt)}`, {
                        timeout: 30000, // Longer timeout for AI responses
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Accept': 'application/json'
                        }
                    });

                    const data = response.data;

                    // Handle YOUR specific API response format
                    if (data.response && data.response.response) {
                        // API format 1: gurusensei format
                        const responseText = data.response.response.trim();
                        await reply(`*🦙 LLaMA says:*\n\n${responseText}\n\n*Powered by Blu3Bot*`);
                        success = true;
                        break;

                    } else if (data.answer || data.response) {
                        // API format 2: Alternative formats
                        const responseText = data.answer || data.response;
                        await reply(`*🦙 LLaMA says:*\n\n${responseText}\n\n*Powered by Blu3Bot*`);
                        success = true;
                        break;

                    } else if (data.data && data.data.response) {
                        // API format 3: Nested data format
                        const responseText = data.data.response.trim();
                        await reply(`*🦙 LLaMA says:*\n\n${responseText}\n\n*Powered by Blu3Bot*`);
                        success = true;
                        break;
                    }
                } catch (error) {
                    console.log(`LLaMA API failed: ${apiUrl} - ${error.message}`);
                    // Continue to next API if there were more
                }
            }

            if (!success) {
                // Fallback to other AI APIs
                try {
                    // Try your GPT API as fallback
                    const fallbackResponse = await axios.get(`https://api.erdwpe.com/api/ai/gpt?query=${encodeURIComponent(prompt)}`, {
                        timeout: 15000
                    });

                    if (fallbackResponse.data && fallbackResponse.data.answer) {
                        await reply(`*🤖 AI Response (Fallback):*\n\n${fallbackResponse.data.answer}\n\n*Note: Using GPT as LLaMA is unavailable*`);
                    } else {
                        await reply('❌ LLaMA is currently unavailable. Try:\n• .ai [question] - GPT AI\n• .gpt [question] - Alternative AI\n• Try again in a few minutes');
                    }
                } catch (fallbackError) {
                    await reply('❌ All AI services are currently unavailable. Please try again later.');
                    await react('❌');
                }
            } else {
                await react('✅');
            }
        }
    ),
    aliases: ['llama2', 'llamaai', 'metaai']
};