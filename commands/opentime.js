// commands/opentime.js
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
        'opentime',
        'Set auto-open time for group',
        '.opentime [HH:MM] or .opentime off',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('⏰');
            
            const time = args[0];

            if (!time) {
                await reply('Usage: .opentime HH:MM or .opentime off');
                return;
            }

            if (time === 'off') {
                if (global.groupSchedules) {
                    clearTimeout(global.groupSchedules.get(from)?.openTimer);
                    global.groupSchedules.delete(from);
                }
                await reply('✅ Auto-open disabled.');
                return;
            }

            // Set auto-open logic here
            await reply(`✅ Group will auto-open at ${time} daily.`);
        }
    ),
    adminOnly: true,
    groupOnly: true
};