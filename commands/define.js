// commands/define.js
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
        'define',
        'Get a definition for a term',
        '.define [term]',
        'tools',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📖');
            
            if (!args.length) {
                await reply('Provide a term to define.');
                return;
            }

            const query = args.join(' ');
            try {
                const { data } = await axios.get(`http://api.urbandictionary.com/v0/define?term=${query}`);
                const def = data.list[0];
                const text = `📚 *Word:* ${query}\n📝 *Definition:* ${def.definition.replace(/[]/g, '')}\n💡 *Example:* ${def.example.replace(/[]/g, '')}`;
                await reply(text);
            } catch {
                await reply(`No definition found for "${query}".`);
            }
        }
    )
};