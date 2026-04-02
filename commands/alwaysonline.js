// commands/alwaysonline.js
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

let onlineInterval = null;

module.exports = {
    command: new Command(
        'alwaysonline',
        'Keep the bot always appearing online',
        '.alwaysonline [on/off]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🟢');

            const action = args[0]?.toLowerCase();

            if (!action || (action !== 'on' && action !== 'off')) {
                return reply(
                    `🟢 *ALWAYS ONLINE SETTINGS*\n\n` +
                    `Usage: .alwaysonline on/off\n\n` +
                    `*Current Status:* ${global.alwaysOnlineEnabled ? '🟢 ON' : '🔴 OFF'}\n\n` +
                    `When ON, bot presence is refreshed every 30 seconds.`
                );
            }

            if (action === 'on') {
                global.alwaysOnlineEnabled = true;

                if (onlineInterval) clearInterval(onlineInterval);
                onlineInterval = setInterval(async () => {
                    try {
                        if (global.alwaysOnlineEnabled) {
                            await Blu3Bot.sendPresenceUpdate('available');
                        } else {
                            clearInterval(onlineInterval);
                            onlineInterval = null;
                        }
                    } catch {}
                }, 30000);

                await Blu3Bot.sendPresenceUpdate('available');
                await react('✅');
                await reply('🟢 *Always Online Activated*\n\nBot will continuously appear online.');
            } else {
                global.alwaysOnlineEnabled = false;
                if (onlineInterval) {
                    clearInterval(onlineInterval);
                    onlineInterval = null;
                }
                await Blu3Bot.sendPresenceUpdate('unavailable');
                await react('✅');
                await reply('🔴 *Always Online Deactivated*\n\nBot will appear offline when idle.');
            }
        }
    ),
    ownerOnly: true
};
