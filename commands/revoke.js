// commands/revoke.js
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
        'revoke',
        'Revoke the group invite link and generate a new one',
        '.revoke',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🔄');

            if (!from.endsWith('@g.us')) {
                await reply('❌ This command can only be used in groups.');
                return;
            }

            try {
                const meta = await Blu3Bot.groupMetadata(from);
                const botId = Blu3Bot.user.id.replace(/:\d+/, '');
                const botMember = meta.participants.find(p => p.id.includes(botId.split('@')[0]));
                if (!botMember || !['admin', 'superadmin'].includes(botMember.admin)) {
                    await reply('❌ I need to be an admin to revoke the invite link.');
                    return;
                }

                await Blu3Bot.groupRevokeInvite(from);
                const newCode = await Blu3Bot.groupInviteCode(from);
                await reply(`✅ *Invite Link Revoked*\n\n📌 *${meta.subject}*\nThe old link is now invalid.\n\n🔗 New link:\nhttps://chat.whatsapp.com/${newCode}`);
            } catch (err) {
                console.error('Revoke error:', err.message);
                await reply('❌ Could not revoke invite link. Make sure I am an admin.');
            }
        }
    )
};
