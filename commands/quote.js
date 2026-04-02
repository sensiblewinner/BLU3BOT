// commands/quotes.js
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
        'quotes',
        'Get a random quote',
        '.quotes',
        'fun',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('💬');
            
            try {
                const response = await fetch('https://favqs.com/api/qotd');
                const data = await response.json();
                const quote = data.quote;

                const messageText = `💬 *Inspirational Quote*\n\n"${quote.body}"\n— ${quote.author}\n\n*Powered by Blu3Bot*`;

                await reply(messageText);
            } catch (error) {
                await reply('Failed to fetch a quote. Please try again later.');
            }
        }
    )
};