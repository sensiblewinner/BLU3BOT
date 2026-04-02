// commands/inspire.js
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
        'inspire',
        'Get an inspirational quote',
        '.inspire',
        'general',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('✨');
            
            try {
                const response = await fetch(`https://type.fit/api/quotes`);
                const data = await response.json();
                const randomIndex = Math.floor(Math.random() * data.length);
                const quote = data[randomIndex];

                await reply(`✨ *Inspirational Quote:*\n"${quote.text}"\n— ${quote.author || "Unknown"}`);
            } catch (error) {
                console.error('Inspire Error:', error.message);
                await reply('❌ Failed to fetch an inspirational quote.');
            }
        }
    )
};