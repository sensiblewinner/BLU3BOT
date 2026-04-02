// commands/fact.js
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
        'fact',
        'Get a random fact',
        '.fact',
        'fun',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('💡');
            
            try {
                const response = await fetch('https://nekos.life/api/v2/fact');
                const data = await response.json();

                await reply(`📚 *Random Fact*\n\n${data.fact}\n\n*Powered by Blu3Bot*`);
            } catch (error) {
                await reply('Failed to fetch a fact. Please try again later.');
            }
        }
    )
};