// commands/poll.js
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
        'poll',
        'Create a poll',
        '.poll [question]/[option1,option2,option3]',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📊');
            
            const input = args.join(' ');
            const [question, optionsString] = input.split('/');
            if (!question || !optionsString) {
                await reply('Usage: .poll What is 2+2?/2,3,4');
                return;
            }

            const options = optionsString.split(',').map(opt => opt.trim());
            await Blu3Bot.sendMessage(from, {
                poll: {
                    name: question.trim(),
                    values: options,
                    selectableCount: 1
                }
            }, { quoted: message });
        }
    )
};