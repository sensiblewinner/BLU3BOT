// commands/eval.js
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
        'eval',
        'Evaluate JavaScript code (owner only)',
        '.eval [code]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('⚡');
            
            if (!args.length) {
                await reply('Provide code to evaluate. Example: .eval 2+2');
                return;
            }

            const code = args.join(' ');
            try {
                let result = await eval(code);
                if (typeof result !== 'string') {
                    result = require('util').inspect(result);
                }
                await reply(result);
            } catch (err) {
                await reply(`Error: ${err.message}`);
            }
        }
    ),
    ownerOnly: true,
    aliases: ['evaluate']
};