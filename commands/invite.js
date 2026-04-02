// commands/invite.js
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
        'invite',
        'Get the group invite link',
        '.invite',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🔗');

            if (!from.endsWith('@g.us')) {
                await reply('❌ This command can only be used in groups.');
                return;
            }

            try {
                const meta = await Blu3Bot.groupMetadata(from);
                const botId = Blu3Bot.user.id.replace(/:\d+/, '');
                const botMember = meta.participants.find(p => p.id.includes(botId.split('@')[0]));
                if (!botMember || !['admin', 'superadmin'].includes(botMember.admin)) {
                    await reply('❌ I need to be an admin to generate the invite link.');
                    return;
                }

                const code = await Blu3Bot.groupInviteCode(from);
                await reply(`🔗 *Group Invite Link*\n\n📌 *${meta.subject}*\nhttps://chat.whatsapp.com/${code}\n\n_Share this link to invite people to the group._`);
            } catch (err) {
                console.error('Invite error:', err.message);
                await reply('❌ Could not get invite link. Make sure I am an admin.');
            }
        }
    )
};
