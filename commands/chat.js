// commands/chat.js - FIXED with real AI API
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
        'chat',
        'AI conversation with memory',
        '.chat [message]',
        'ai',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('💬');

            const userMessage = args.join(' ');
            if (!userMessage) {
                await reply('Please provide a message.\nExample: .chat What is the capital of France?');
                return;
            }

            try {
                // Initialize conversation history
                if (!global.chatSessions) global.chatSessions = new Map();
                if (!global.chatSessions.has(from)) {
                    global.chatSessions.set(from, []);
                }

                const session = global.chatSessions.get(from);
                session.push({ role: 'user', content: userMessage });
                if (session.length > 10) session.shift();

                // Build context from history
                const contextStr = session
                    .slice(-4)
                    .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
                    .join('\n');

                // Use free AI API
                const aiApis = [
                    `https://api.erdwpe.com/api/ai/gpt?query=${encodeURIComponent(userMessage)}`,
                    `https://api.gurusensei.workers.dev/llama?prompt=${encodeURIComponent(userMessage)}`
                ];

                let aiResponse = null;

                for (const apiUrl of aiApis) {
                    try {
                        const resp = await axios.get(apiUrl, { timeout: 20000 });
                        const data = resp.data;
                        aiResponse = data.result || data.response?.response || data.response || data.answer;
                        if (aiResponse && typeof aiResponse === 'string' && aiResponse.trim()) break;
                    } catch (_) {}
                }

                if (!aiResponse) {
                    aiResponse = 'I am having trouble connecting right now. Please try again in a moment.';
                }

                session.push({ role: 'assistant', content: aiResponse });

                await reply(`*💬 AI Chat*\n\n*You:* ${userMessage}\n\n*AI:* ${aiResponse}\n\n*Powered by Blu3Bot*`);
                await react('✅');

            } catch (error) {
                console.error('Chat error:', error.message);
                await reply('❌ Chat error. Please try again.');
                await react('❌');
            }
        }
    )
};
