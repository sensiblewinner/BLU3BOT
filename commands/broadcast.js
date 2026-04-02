// commands/broadcast.js
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
        'broadcast',
        'Send a message to all groups the bot is in',
        '.broadcast [message]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📢');

            const text = args.join(' ');
            if (!text) {
                return reply('Usage: .broadcast [message]\nExample: .broadcast Hello everyone!');
            }

            try {
                await reply('📡 *Fetching group list...*');
                const groups = await Blu3Bot.groupFetchAllParticipating();
                const groupJids = Object.keys(groups);

                if (groupJids.length === 0) {
                    return reply('❌ Bot is not in any groups.');
                }

                const broadcastText = `📢 *BROADCAST MESSAGE*\n\n${text}\n\n_Sent by Blu3Bot owner_`;

                let sent = 0;
                let failed = 0;

                for (const jid of groupJids) {
                    try {
                        await Blu3Bot.sendMessage(jid, { text: broadcastText });
                        sent++;
                        await new Promise(r => setTimeout(r, 500));
                    } catch {
                        failed++;
                    }
                }

                await react('✅');
                await reply(
                    `✅ *Broadcast Complete*\n\n` +
                    `📤 Sent: ${sent} groups\n` +
                    `❌ Failed: ${failed} groups\n` +
                    `📊 Total: ${groupJids.length} groups`
                );
            } catch (error) {
                console.error('Broadcast error:', error);
                await react('❌');
                await reply(`❌ Broadcast failed: ${error.message}`);
            }
        }
    ),
    ownerOnly: true
};
