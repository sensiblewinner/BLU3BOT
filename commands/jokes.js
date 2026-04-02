// commands/jokes.js
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
        'jokes',
        'Get a random joke',
        '.jokes',
        'fun',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('😂');
            
            try {
                const response = await fetch('https://api.popcat.xyz/joke');
                if (!response.ok) throw new Error('Network response was not ok.');
                const data = await response.json();

                await reply(data.joke);
            } catch (error) {
                console.error('Error fetching joke:', error.message);
                await reply('❌ Failed to fetch a joke. Please try again later.');
            }
        }
    )
};