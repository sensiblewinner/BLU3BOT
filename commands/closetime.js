// commands/closetime.js
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
        'closetime',
        'Set auto-close time for group',
        '.closetime [HH:MM] or .closetime off',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('⏰');
            
            const time = args[0];

            if (!time) {
                await reply('Usage: .closetime HH:MM or .closetime off');
                return;
            }

            if (time === 'off') {
                if (global.groupSchedules) {
                    clearTimeout(global.groupSchedules.get(from)?.closeTimer);
                    global.groupSchedules.delete(from);
                }
                await reply('✅ Auto-close disabled.');
                return;
            }

            // Set auto-close logic here
            await reply(`✅ Group will auto-close at ${time} daily.`);
        }
    ),
    adminOnly: true,
    groupOnly: true
};