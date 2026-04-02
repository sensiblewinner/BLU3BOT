// commands/anticall.js
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
        'anticall',
        'Auto-reject all incoming calls to the bot',
        '.anticall [on/off]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📵');

            const action = args[0]?.toLowerCase();

            if (!action || (action !== 'on' && action !== 'off')) {
                return reply(
                    `📵 *ANTI-CALL SETTINGS*\n\n` +
                    `Usage: .anticall on/off\n\n` +
                    `*Current Status:* ${global.anticallEnabled ? '🟢 ON' : '🔴 OFF'}\n\n` +
                    `When ON, all incoming calls are rejected automatically.`
                );
            }

            global.anticallEnabled = action === 'on';

            await react('✅');
            await reply(
                global.anticallEnabled
                    ? '🟢 *Anti-Call Activated*\n\nAll incoming calls will be automatically rejected.'
                    : '🔴 *Anti-Call Deactivated*\n\nCalls will no longer be auto-rejected.'
            );
        }
    ),
    ownerOnly: true
};
