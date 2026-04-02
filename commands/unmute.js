// commands/unmute.js — unmute group (allow all members to send messages)
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
        'unmute',
        'Unmute the group — all members can send messages again',
        '.unmute',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🔊');

            if (!from.endsWith('@g.us')) {
                await reply('❌ This command can only be used in groups.');
                return;
            }

            try {
                const meta = await Blu3Bot.groupMetadata(from);
                const botId = Blu3Bot.user.id.replace(/:\d+/, '');
                const botMember = meta.participants.find(p => p.id.includes(botId.split('@')[0]));
                if (!botMember || !['admin', 'superadmin'].includes(botMember.admin)) {
                    await reply('❌ I need to be an admin to unmute this group.');
                    return;
                }

                await Blu3Bot.groupSettingUpdate(from, 'not_announcement');
                await reply(`🔊 *Group Unmuted*\n\nAll members can now send messages in *${meta.subject}*.`);
            } catch (err) {
                console.error('Unmute error:', err.message);
                await reply('❌ Failed to unmute group. Make sure I am an admin.');
            }
        }
    )
};
