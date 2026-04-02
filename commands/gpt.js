// commands/gpt.js - UPDATED WITH YOUR EXACT APIS
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
        'gpt',
        'AI Chat using free API',
        '.gpt [question]',
        'ai',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🤖');
            
            const question = args.join(' ');
            if (!question) {
                await reply('Please provide a question for AI.');
                return;
            }

            // Using YOUR exact AI APIs from the message
            const aiApis = [
                'https://api.erdwpe.com/api/ai/gpt',
                'https://api.gurusensei.workers.dev/llama',
                'https://api.privatezia.biz.id/api/ai/GPT-4'
            ];

            await reply('🤖 *Thinking...*');

            let success = false;

            // Try each API until one works
            for (const apiUrl of aiApis) {
                try {
                    console.log(`Trying AI API: ${apiUrl}`);
                    
                    const response = await axios.get(`${apiUrl}?query=${encodeURIComponent(question)}`, {
                        timeout: 30000, // Longer timeout for AI responses
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Accept': 'application/json'
                        }
                    });

                    const data = response.data;

                    // Handle different API response formats
                    if (data.result || data.response) {
                        // API format 1: erdwpe GPT format
                        const answer = data.result || data.response;
                        await reply(`*🤖 AI Response*\n\n${answer}\n\n*Powered by Blu3Bot*`);
                        success = true;
                        break;

                    } else if (data.answer) {
                        // API format 2: Standard answer format
                        await reply(`*🤖 AI Response*\n\n${data.answer}\n\n*Powered by Blu3Bot*`);
                        success = true;
                        break;

                    } else if (data.data && data.data.response) {
                        // API format 3: Nested data format
                        await reply(`*🤖 AI Response*\n\n${data.data.response}\n\n*Powered by Blu3Bot*`);
                        success = true;
                        break;

                    } else if (data.response && data.response.response) {
                        // API format 4: LLaMA nested format
                        await reply(`*🤖 AI Response*\n\n${data.response.response}\n\n*Powered by Blu3Bot*`);
                        success = true;
                        break;
                    }
                } catch (error) {
                    console.log(`AI API failed: ${apiUrl} - ${error.message}`);
                    // Continue to next API
                }
            }

            if (!success) {
                await reply('❌ All AI services are currently busy. Try:\n• .ai [question] - Alternative AI\n• .llama [question] - LLaMA AI\n• Try again in a few minutes');
                await react('❌');
            } else {
                await react('✅');
            }
        }
    ),
    aliases: ['ai', 'chatgpt', 'openai']
};