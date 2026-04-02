// commands/botconfig.js — Full dashboard of all current bot settings
const os = require('os');

class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

function yn(v) { return v ? '🟢 ON' : '🔴 OFF'; }
function na(v) { return v || '_not set_'; }

module.exports = {
    command: new Command(
        'botconfig',
        'View a full dashboard of all current bot settings and toggles',
        '.botconfig',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('⚙️');

            if (!global.BOT_START_TIME) global.BOT_START_TIME = Date.now();
            const uptimeSec = Math.floor((Date.now() - global.BOT_START_TIME) / 1000);
            const up = `${Math.floor(uptimeSec/3600)}h ${Math.floor((uptimeSec%3600)/60)}m ${uptimeSec%60}s`;

            const mem = process.memoryUsage();
            const rss = (mem.rss / 1024 / 1024).toFixed(1);

            const cmdCount  = global.commandHandler?.getCommandCount?.() || 0;
            const blacklist = global.blacklistedUsers?.size || 0;
            const warnCount = (() => {
                let n = 0;
                if (global.warnings) for (const m of global.warnings.values()) n += m.size;
                return n;
            })();

            await reply(
                `⚙️ *BLU3BOT Configuration*\n` +
                `${'─'.repeat(30)}\n\n` +

                `🤖 *Identity*\n` +
                `  Name     : ${global.BOT_NAME || process.env.BOT_NAME || 'BLU3BOT'}\n` +
                `  Version  : ${process.env.BOT_VERSION || '2.0.0'}\n` +
                `  Prefix   : \`${context?.prefix || process.env.PREFIX || '.'}\`\n` +
                `  Mode     : ${context?.config?.MODE || process.env.BOT_MODE || 'PUBLIC'}\n` +
                `  Theme    : ${global.botTheme || 'classic'}\n` +
                `  Presence : ${global.botPresence || 'available'}\n` +
                `  AI Model : ${global.defaultAIModel || 'gpt'}\n` +
                `  Language : ${global.botLanguage || 'en'}\n` +
                `  Timezone : ${global.botTimezone || 'UTC'}\n` +
                `  Footer   : ${global.botFooter ? `"${global.botFooter}"` : '_not set_'}\n\n` +

                `🛡️ *Safety & Access*\n` +
                `  Maintenance : ${yn(global.maintenanceMode)}\n` +
                `  Blacklist   : ${blacklist} users\n` +
                `  Cooldown    : ${global.cmdCooldown ? `${global.cmdCooldown}s` : 'off'}\n` +
                `  DND         : ${yn(global.dndEnabled)}\n\n` +

                `🔧 *Moderation*\n` +
                `  Antilink    : ${yn(global.antilinkEnabled)}\n` +
                `  Antibadword : ${global.badWords?.size ? `${global.badWords.size} groups` : '🔴 OFF'}\n` +
                `  Antidelete  : ${yn(global.antideleteEnabled)}\n` +
                `  Antiedit    : ${yn(global.antieditEnabled)}\n` +
                `  Antisticker : ${yn(global.antisticker)}\n` +
                `  Antimention : ${yn(global.antimentionEnabled)}\n` +
                `  Warnings    : ${warnCount} active\n\n` +

                `🤖 *Automation*\n` +
                `  Auto-read   : ${yn(global.autoReadEnabled)}\n` +
                `  Auto-view   : ${yn(global.autoViewEnabled)}\n` +
                `  Auto-reply  : ${yn(global.autoreplyEnabled)}\n` +
                `  Chatbot     : ${yn(global.chatbotEnabled)}\n` +
                `  Auto-bio    : ${yn(global.autobioEnabled)}\n\n` +

                `📊 *Runtime*\n` +
                `  Uptime  : ${up}\n` +
                `  RAM     : ${rss} MB\n` +
                `  Node.js : ${process.version}\n` +
                `  Commands: ${cmdCount}\n\n` +

                `_Use .reload to hot-reload commands_`
            );
        }
    ),
    ownerOnly: true,
    aliases: ['config', 'settings', 'botsettings', 'cfg']
};
