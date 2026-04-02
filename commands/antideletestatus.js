// commands/antideletestatus.js
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
        'antideletestatus',
        'Save deleted statuses',
        '.antideletestatus [on/off]',
        'tools',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('💾');
            
            const action = args[0]?.toLowerCase();

            if (!['on', 'off'].includes(action)) {
                await reply('Usage: .antideletestatus on/off');
                return;
            }

            global.antiDeleteStatus = action === 'on';
            await reply(`✅ Anti-delete status ${action === 'on' ? 'enabled' : 'disabled'}.`);
        }
    ),
    ownerOnly: true
};