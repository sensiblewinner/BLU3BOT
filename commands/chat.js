// commands/chat.js
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

module.exports = {
    command: new Command(
        'chat',
        'Continue AI conversations',
        '.chat [message]',
        'ai',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('💬');
            
            const userMessage = args.join(' ');
            if (!userMessage) {
                await reply('Please provide a message to continue the conversation.');
                return;
            }

            try {
                // Initialize conversation history if not exists
                if (!global.chatSessions) global.chatSessions = new Map();
                if (!global.chatSessions.has(from)) {
                    global.chatSessions.set(from, []);
                }

                const session = global.chatSessions.get(from);
                session.push({ role: 'user', content: userMessage });

                // Keep only last 10 messages
                if (session.length > 10) session.shift();

                // Simple AI response (replace with actual AI API)
                const responses = [
                    "That's an interesting point! What else would you like to discuss?",
                    "I understand. Can you tell me more about that?",
                    "Fascinating! How does that make you feel?",
                    "I see what you mean. What are your thoughts on this?",
                    "That's a great conversation starter! What would you like to explore next?"
                ];
                
                const aiResponse = responses[Math.floor(Math.random() * responses.length)];
                session.push({ role: 'assistant', content: aiResponse });

                await reply(`*💬 AI Chat*\n\n*You:* ${userMessage}\n\n*AI:* ${aiResponse}\n\n*Powered by Blu3Bot*`);
            } catch (error) {
                await reply('❌ Chat session error.');
            }
        }
    )
};