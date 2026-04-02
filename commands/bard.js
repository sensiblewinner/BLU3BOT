// commands/bard.js
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
        'bard',
        'Chat with BARD AI',
        '.bard [question]',
        'ai',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🧠');
            
            try {
                if (!args || args.length === 0) {
                    await reply('Hello, I am *BARD AI*.\n\nHow can I assist you today?');
                    return;
                }

                const prompt = args.join(' ');
                const response = await fetch(`https://api.diioffc.web.id/api/ai/bard?query=${encodeURIComponent(prompt)}`);
                const data = await response.json();

                if (data.status && data.result && data.result.message) {
                    const answer = data.result.message;
                    await reply(`${answer}\n\n> *Powered by Blu3Bot*`);
                } else {
                    throw new Error('Invalid response from the API.');
                }

            } catch (error) {
                console.error('Error getting response:', error.message);
                await reply('❌ Error getting response from BARD AI.');
            }
        }
    )
};