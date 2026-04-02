// commands/approveall.js
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
        'approveall',
        'Approve all pending requests',
        '.approveall',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('✅');
            
            try {
                const requests = await Blu3Bot.groupRequestParticipantsList(from);
                
                if (requests.length === 0) {
                    await reply('📭 No pending join requests.');
                    return;
                }

                for (const req of requests) {
                    await Blu3Bot.groupRequestParticipantsUpdate(from, [req.jid], 'approve');
                }

                await reply(`✅ Approved ${requests.length} join requests.`);
            } catch (error) {
                await reply('❌ Failed to approve requests.');
            }
        }
    ),
    adminOnly: true,
    botAdminOnly: true,
    groupOnly: true
};