// commands/schedule.js
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
        'schedule',
        'Schedule messages',
        '.schedule [time] [message]',
        'tools',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('⏰');
            
            const [time, ...messageArgs] = args;
            const scheduledMessage = messageArgs.join(' ');

            if (!time || !scheduledMessage) {
                await reply('Usage: .schedule [time] [message]\nExample: .schedule 5m Hello everyone!');
                return;
            }

            try {
                let milliseconds = 0;
                
                if (time.endsWith('s')) milliseconds = parseInt(time) * 1000;
                else if (time.endsWith('m')) milliseconds = parseInt(time) * 60 * 1000;
                else if (time.endsWith('h')) milliseconds = parseInt(time) * 60 * 60 * 1000;
                else milliseconds = parseInt(time) * 60 * 1000; // Default to minutes

                if (isNaN(milliseconds) || milliseconds <= 0) {
                    await reply('Invalid time format. Use: 30s, 5m, 1h');
                    return;
                }

                await reply(`✅ Message scheduled for ${time} from now.`);

                setTimeout(async () => {
                    try {
                        await reply(`*⏰ SCHEDULED MESSAGE*\n\n${scheduledMessage}\n\n*Scheduled ${time} ago*`);
                    } catch (error) {
                        console.log('Failed to send scheduled message');
                    }
                }, milliseconds);

            } catch (error) {
                await reply('❌ Failed to schedule message.');
            }
        }
    )
};