// commands/dnd.js - Do Not Disturb mode
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
        'dnd',
        'Do Not Disturb — bot ignores non-owner DMs',
        '.dnd [on/off]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🔕');

            const action = args[0]?.toLowerCase();

            if (!action || (action !== 'on' && action !== 'off')) {
                return reply(
                    `🔕 *DO NOT DISTURB*\n\n` +
                    `Usage: .dnd on/off\n\n` +
                    `*Current Status:* ${global.dndEnabled ? '🟢 ON' : '🔴 OFF'}\n\n` +
                    `When ON, the bot will not process commands from other users in DMs.\n` +
                    `Group commands continue to work normally.`
                );
            }

            global.dndEnabled = action === 'on';

            await react('✅');
            await reply(
                global.dndEnabled
                    ? '🔕 *DND Activated*\n\nBot will ignore DM commands from non-owners.\nGroup commands still work.'
                    : '🔔 *DND Deactivated*\n\nBot is responding to everyone again.'
            );
        }
    ),
    ownerOnly: true
};
