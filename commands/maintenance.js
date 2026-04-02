// commands/maintenance.js
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
        'maintenance',
        'Toggle maintenance mode — non-owners get a maintenance notice instead of running commands',
        '.maintenance [on/off] [message]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🔧');

            const action = args[0]?.toLowerCase();

            if (!action) {
                const status = global.maintenanceMode ? '🔧 ON' : '🟢 OFF';
                const msg    = global.maintenanceMessage || 'Bot is currently under maintenance.';
                await reply(
                    `🔧 *Maintenance Mode*\n\n` +
                    `Status : ${status}\n` +
                    `Message: _${msg}_\n\n` +
                    `Usage: \`.maintenance on [message]\` or \`.maintenance off\``
                );
                return;
            }

            if (action === 'off') {
                global.maintenanceMode = false;
                global.maintenanceMessage = null;
                await reply(`🟢 *Maintenance Mode OFF*\n\nAll users can now use the bot normally.`);
                return;
            }

            if (action === 'on') {
                global.maintenanceMode = true;
                const customMsg = args.slice(1).join(' ').trim();
                global.maintenanceMessage = customMsg || '🔧 BLU3BOT is currently under maintenance. Please try again later.';
                await reply(
                    `🔧 *Maintenance Mode ON*\n\n` +
                    `Non-owners will see:\n_"${global.maintenanceMessage}"_\n\n` +
                    `Use \`.maintenance off\` to restore normal operation.`
                );
                return;
            }

            await reply('Usage: `.maintenance on [optional message]` or `.maintenance off`');
        }
    ),
    ownerOnly: true,
    aliases: ['maint', 'botmaint']
};
