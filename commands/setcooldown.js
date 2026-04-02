// commands/setcooldown.js — Per-user command rate limiting
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

if (!global.cmdCooldown)    global.cmdCooldown    = 0;
if (!global.cooldownTracker) global.cooldownTracker = new Map();

module.exports = {
    command: new Command(
        'setcooldown',
        'Set a per-user command cooldown to prevent spam',
        '.setcooldown [seconds] — use 0 to disable',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('⏱️');

            const input = args[0];

            if (input === undefined || input === '') {
                await reply(
                    `⏱️ *Command Cooldown*\n\n` +
                    `Current: ${global.cmdCooldown > 0 ? `${global.cmdCooldown}s per user` : '🔴 Disabled'}\n\n` +
                    `Usage:\n` +
                    `• \`.setcooldown 3\` — 3-second gap between commands per user\n` +
                    `• \`.setcooldown 0\` — disable cooldown`
                );
                return;
            }

            const secs = parseInt(input);
            if (isNaN(secs) || secs < 0) {
                await reply('❌ Provide a valid number of seconds (0 to disable).');
                return;
            }

            if (secs > 60) {
                await reply('⚠️ Max cooldown is 60 seconds.');
                return;
            }

            global.cmdCooldown = secs;
            global.cooldownTracker.clear(); // reset all existing cooldowns

            await react('✅');

            if (secs === 0) {
                await reply('✅ Command cooldown *disabled*. All users can send commands freely.');
            } else {
                await reply(
                    `✅ *Cooldown Set: ${secs}s*\n\n` +
                    `Non-owner users must wait ${secs} seconds between commands.\n` +
                    `_Owner is exempt from cooldown._`
                );
            }
        }
    ),
    ownerOnly: true,
    aliases: ['cooldown', 'ratelimit', 'antispam']
};
