// commands/autobio.js
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
        'autobio',
        'Auto-update bot bio with status',
        '.autobio [on/off] [bio text]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📝');
            
            const [action, ...bioArgs] = args;
            
            if (!['on', 'off'].includes(action)) {
                await reply('Usage: .autobio on/off [bio text]');
                return;
            }

            if (action === 'on') {
                const bioText = bioArgs.join(' ') || 'Blu3Bot | Always Active 🤖';
                global.autoBio = { enabled: true, text: bioText };
                
                // Update bio immediately
                await Blu3Bot.updateProfileStatus(bioText);
                await reply(`✅ Auto-bio enabled: "${bioText}"`);
            } else {
                global.autoBio = { enabled: false };
                await reply('❌ Auto-bio disabled');
            }
        }
    ),
    ownerOnly: true
};