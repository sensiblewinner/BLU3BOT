// commands/ping.js - FIXED VERSION
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

// FIXED: Remove the extra execute function and use proper format
module.exports = {
    command: new Command(
        'ping',
        'Check bot response time and status',
        '.ping',
        'General',
        async (reply, react, from, message, args, Blu3Bot) => {
            await react('⚡');
            const start = Date.now();
            
            // Simulate processing
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const latency = Date.now() - start;
            const memoryUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
            const uptime = formatUptime(process.uptime());
            
            const pingMessage = `
+------------------------------+
|        ⚡ Ping Check ⚡        |
|------------------------------
| 🛰️ Pinging the digital realm...
| ⏳ Latency detected: ${latency} ms
| 💾 RAM Usage: ${memoryUsage} MB
| 🕒 Uptime: ${uptime}
| ✅ Connection status: STABLE
| 🔄 Sync with Blu3Bot— All systems green! 
+------------------------------+

*"Precision in every millisecond"*
            `.trim();
            
            await reply(pingMessage);
        }
    )
    // REMOVED the extra execute function - it's not needed
};

function formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}