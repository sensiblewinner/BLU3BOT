// commands/speedtest.js — measures actual WA API round-trip latency
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
        'speedtest',
        'Measure actual WhatsApp API round-trip latency',
        '.speedtest',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            const t0 = Date.now();
            await react('⚡');
            const reactMs = Date.now() - t0;

            const t1 = Date.now();
            const sentMsg = await Blu3Bot.sendMessage(from, { text: '⏳ _Testing speed..._' }, { quoted: message });
            const sendMs = Date.now() - t1;

            const mem = process.memoryUsage();
            const rss = (mem.rss / 1024 / 1024).toFixed(1);

            const rating =
                sendMs < 200 ? '🚀 Excellent'  :
                sendMs < 500 ? '✅ Good'        :
                sendMs < 1000 ? '⚠️ Average'   :
                '🐢 Slow';

            // Edit the placeholder message with actual results
            await Blu3Bot.sendMessage(from, {
                text:
                    `⚡ *BLU3BOT Speed Test*\n\n` +
                    `🔁 React Latency  : ${reactMs} ms\n` +
                    `📤 Send Latency   : ${sendMs} ms\n` +
                    `💾 Memory (RSS)   : ${rss} MB\n` +
                    `📊 Rating         : ${rating}\n\n` +
                    `_Measured at ${new Date().toLocaleTimeString()}_`,
                edit: sentMsg.key
            });
        }
    ),
    ownerOnly: false,
    aliases: ['speed', 'latency', 'nettest']
};
