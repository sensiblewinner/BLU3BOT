// commands/deepseek.js - FIXED
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
        'deepseek',
        'AI assistant using free API',
        '.deepseek [question]',
        'ai',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🧠');
            
            const question = args.join(' ');
            if (!question) {
                await reply('Please provide a question for AI.');
                return;
            }

            try {
                // Using free AI API
                const response = await axios.get(`https://api.erdwpe.com/api/ai/gpt?query=${encodeURIComponent(question)}`);
                const data = response.data;
                
                const answer = data.result || data.response || 'I am currently unavailable. Please try again later.';
                await reply(`*🧠 AI Assistant*\n\n${question}\n\n${answer}\n\n*Powered by Blu3Bot*`);
            } catch (error) {
                await reply('❌ AI service is currently busy. Try again later.');
            }
        }
    )
};