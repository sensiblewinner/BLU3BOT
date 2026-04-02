// commands/clearstate.js
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

const CLEARABLE = {
    warnings:      { label: 'Warnings',          reset: () => { global.warnings = new Map(); } },
    blacklist:     { label: 'Blacklist',          reset: () => { global.blacklistedUsers = new Set(); } },
    autoreply:     { label: 'Auto-reply log',     reset: () => { global.autoreplyContacted = new Set(); } },
    antidelete:    { label: 'Anti-delete cache',  reset: () => { global.antideleteEnabled = false; } },
    antiedit:      { label: 'Anti-edit toggle',   reset: () => { global.antieditEnabled = false; } },
    antilink:      { label: 'Antilink toggle',    reset: () => { global.antilinkEnabled = false; } },
    antisticker:   { label: 'Antisticker toggle', reset: () => { global.antisticker = false; } },
    antimention:   { label: 'Anti-mention toggle',reset: () => { global.antimentionEnabled = false; } },
    maintenance:   { label: 'Maintenance mode',   reset: () => { global.maintenanceMode = false; global.maintenanceMessage = null; } },
    rules:         { label: 'Group rules',        reset: () => { global.groupRules = new Map(); } },
    badwords:      { label: 'Bad word lists',     reset: () => { global.badWords = new Map(); } },
    stealthtriggers: { label: 'Stealth triggers', reset: () => {
        global.stealthTriggers = new Map([
            ['🗑️', 'antidelete'], ['✏️', 'antiedit'],
            ['👁️', 'vv'], ['💾', 'save'], ['🔍', 'getprofile'],
        ]);
    }},
};

module.exports = {
    command: new Command(
        'clearstate',
        'Clear in-memory bot state — warnings, blacklists, toggles, etc.',
        '.clearstate [all | category]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🧹');

            const target = args[0]?.toLowerCase();

            // No argument — show what can be cleared
            if (!target) {
                const keys = Object.keys(CLEARABLE).map(k => `• \`${k}\``).join('\n');
                await reply(
                    `🧹 *Clear Bot State*\n\n` +
                    `Usage:\n` +
                    `\`.clearstate all\` — reset everything\n` +
                    `\`.clearstate [category]\` — reset one thing\n\n` +
                    `*Available categories:*\n${keys}`
                );
                return;
            }

            if (target === 'all') {
                const cleared = [];
                for (const [key, cfg] of Object.entries(CLEARABLE)) {
                    try { cfg.reset(); cleared.push(cfg.label); } catch {}
                }
                await reply(
                    `✅ *Full State Reset*\n\n` +
                    cleared.map(l => `• ${l}`).join('\n') +
                    `\n\n_All in-memory state cleared._`
                );
                return;
            }

            const cfg = CLEARABLE[target];
            if (!cfg) {
                await reply(`❌ Unknown category \`${target}\`\n\nRun \`.clearstate\` to see available options.`);
                return;
            }

            cfg.reset();
            await reply(`✅ *${cfg.label}* cleared and reset to default.`);
        }
    ),
    ownerOnly: true,
    aliases: ['resetstate', 'clearbot', 'botclear']
};
