// commands/uptime.js
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

function formatDuration(ms) {
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const parts = [];
    if (d) parts.push(`${d}d`);
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    parts.push(`${sec}s`);
    return parts.join(' ');
}

module.exports = {
    command: new Command(
        'uptime',
        'Show how long the bot has been running',
        '.uptime',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('⏱️');

            if (!global.BOT_START_TIME) global.BOT_START_TIME = Date.now();

            const botUptime = formatDuration(Date.now() - global.BOT_START_TIME);
            const sysUptime = formatDuration(os.uptime() * 1000);

            const mem = process.memoryUsage();
            const ramUsed = (mem.rss / 1024 / 1024).toFixed(1);
            const heapUsed = (mem.heapUsed / 1024 / 1024).toFixed(1);
            const heapTotal = (mem.heapTotal / 1024 / 1024).toFixed(1);

            const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
            const freeMem  = (os.freemem()  / 1024 / 1024).toFixed(0);
            const usedMem  = (totalMem - freeMem).toFixed(0);
            const ramPct   = Math.round(usedMem / totalMem * 100);
            const bar      = '█'.repeat(Math.round(ramPct / 10)) + '░'.repeat(10 - Math.round(ramPct / 10));

            const cmdCount = global.commandHandler?.getCommandCount?.() || 0;

            await reply(
                `⏱️ *BLU3BOT — Uptime*\n\n` +
                `🤖 *Bot Uptime:* ${botUptime}\n` +
                `🖥️ *System Uptime:* ${sysUptime}\n\n` +
                `💾 *RAM (System):* ${usedMem}/${totalMem} MB\n` +
                `📊 *RAM Bar:* [${bar}] ${ramPct}%\n` +
                `⚙️ *Heap:* ${heapUsed}/${heapTotal} MB\n` +
                `📦 *RSS:* ${ramUsed} MB\n\n` +
                `🧩 *Commands Loaded:* ${cmdCount}\n` +
                `🟢 *Status:* Online`
            );
        }
    ),
    ownerOnly: false
};
