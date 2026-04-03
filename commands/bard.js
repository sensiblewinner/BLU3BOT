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
                const response = await fetch(`https://api.diioffc.web.id/api/ai/bard?query=${encodeURIComponent(prompt)}`, {
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                if (!response.ok) throw new Error(`API returned ${response.status}`);
                const data = await response.json();

                const answer = data?.result?.message || data?.result || data?.message || data?.response;
                if (answer && typeof answer === 'string' && answer.trim()) {
                    await reply(`${answer.trim()}\n\n> *Powered by Blu3Bot*`);
                } else {
                    throw new Error('Empty response from API.');
                }

            } catch (error) {
                console.error('Error getting response:', error.message);
                await reply('❌ Error getting response from BARD AI.');
            }
        }
    )
};