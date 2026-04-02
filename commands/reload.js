// commands/reload.js
const path = require('path');

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
        'reload',
        'Hot-reload all commands from disk without restarting the bot',
        '.reload',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🔄');

            if (!global.commandHandler) {
                await reply('❌ Command handler not available.');
                return;
            }

            try {
                const commandsDir = path.join(__dirname);
                const before = global.commandHandler.getCommandCount();

                // Clear all maps before reload
                global.commandHandler.commands.clear();
                global.commandHandler.aliases.clear();
                global.commandHandler.categories.clear();
                global.commandHandler.loadedCount = 0;

                // Reload
                global.commandHandler.loadCommands(commandsDir);

                const after = global.commandHandler.getCommandCount();
                const diff = after - before;
                const diffStr = diff > 0 ? `+${diff}` : `${diff}`;

                await reply(
                    `✅ *Commands Reloaded!*\n\n` +
                    `📦 Before : ${before}\n` +
                    `📦 After  : ${after}\n` +
                    `📊 Change : ${diffStr}\n\n` +
                    `_All commands refreshed from disk._`
                );
            } catch (err) {
                console.error('Reload error:', err.message);
                await reply(`❌ Reload failed: ${err.message}`);
            }
        }
    ),
    ownerOnly: true,
    aliases: ['reloadcmds', 'refreshcmds']
};
