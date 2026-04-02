// commands/advice.js
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
        'advice',
        'Get a random piece of advice',
        '.advice',
        'fun',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('💡');
            
            try {
                const response = await fetch(`https://api.adviceslip.com/advice`);
                const data = await response.json();
                const quote = data.slip.advice;

                await reply(`*Here is an advice for you:* \n${quote}`);
            } catch (error) {
                console.error('Error:', error.message);
                await reply('❌ Oops, an error occurred while processing your request.');
            }
        }
    )
};