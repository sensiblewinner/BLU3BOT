// commands/stats.js
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

function fmtDur(ms) {
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

function cpuModel() {
    const cpus = os.cpus();
    return cpus.length ? `${cpus[0].model.trim()} ×${cpus.length}` : 'Unknown';
}

function cpuLoad() {
    const cpus = os.cpus();
    let total = 0, idle = 0;
    for (const cpu of cpus) {
        for (const v of Object.values(cpu.times)) total += v;
        idle += cpu.times.idle;
    }
    return ((1 - idle / total) * 100).toFixed(1);
}

module.exports = {
    command: new Command(
        'stats',
        'Full system stats — RAM, CPU, uptime, node version',
        '.stats',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📊');

            if (!global.BOT_START_TIME) global.BOT_START_TIME = Date.now();

            const mem = process.memoryUsage();
            const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
            const freeMem  = (os.freemem()  / 1024 / 1024).toFixed(0);
            const usedMem  = (totalMem - freeMem).toFixed(0);
            const ramPct   = Math.round(usedMem / totalMem * 100);
            const bar      = '█'.repeat(Math.round(ramPct / 10)) + '░'.repeat(10 - Math.round(ramPct / 10));

            const rss       = (mem.rss       / 1024 / 1024).toFixed(1);
            const heapUsed  = (mem.heapUsed  / 1024 / 1024).toFixed(1);
            const heapTotal = (mem.heapTotal / 1024 / 1024).toFixed(1);

            const botUp = fmtDur(Date.now() - global.BOT_START_TIME);
            const sysUp = fmtDur(os.uptime() * 1000);

            const cmdCount  = global.commandHandler?.getCommandCount?.() || 0;
            const warnCount = (() => {
                let n = 0;
                if (global.warnings) {
                    for (const m of global.warnings.values()) n += m.size;
                }
                return n;
            })();

            await reply(
                `📊 *BLU3BOT — System Stats*\n\n` +

                `🖥️ *System*\n` +
                `• Platform : ${os.platform()} ${os.arch()}\n` +
                `• OS       : ${os.type()} ${os.release()}\n` +
                `• Hostname : ${os.hostname()}\n` +
                `• CPU      : ${cpuModel()}\n` +
                `• CPU Load : ${cpuLoad()}%\n` +
                `• Sys Up   : ${sysUp}\n\n` +

                `⚙️ *Process*\n` +
                `• Node.js  : ${process.version}\n` +
                `• PID      : ${process.pid}\n` +
                `• Bot Up   : ${botUp}\n` +
                `• RSS      : ${rss} MB\n` +
                `• Heap     : ${heapUsed}/${heapTotal} MB\n\n` +

                `💾 *Memory*\n` +
                `• Used     : ${usedMem}/${totalMem} MB\n` +
                `• Free     : ${freeMem} MB\n` +
                `• Load     : [${bar}] ${ramPct}%\n\n` +

                `🤖 *Bot*\n` +
                `• Commands  : ${cmdCount}\n` +
                `• Warnings  : ${warnCount}\n` +
                `• Antilink  : ${global.antilinkEnabled ? '🟢 ON' : '🔴 OFF'}\n` +
                `• Antidelete: ${global.antideleteEnabled ? '🟢 ON' : '🔴 OFF'}\n` +
                `• Antiedit  : ${global.antieditEnabled ? '🟢 ON' : '🔴 OFF'}\n` +
                `• Maintenance: ${global.maintenanceMode ? '🔧 ON' : '🟢 OFF'}\n` +
                `• Mode      : ${context?.config?.MODE || 'Public'}`
            );
        }
    ),
    ownerOnly: false,
    aliases: ['sysinfo', 'system', 'botstats']
};
