// commands/mute.js — mute/unmute group (lock for members only, admins can still speak)
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
        'mute',
        'Mute the group — only admins can send messages',
        '.mute',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🔇');

            if (!from.endsWith('@g.us')) {
                await reply('❌ This command can only be used in groups.');
                return;
            }

            try {
                const meta = await Blu3Bot.groupMetadata(from);
                const botId = Blu3Bot.user.id.replace(/:\d+/, '');
                const botMember = meta.participants.find(p => p.id.includes(botId.split('@')[0]));
                if (!botMember || !['admin', 'superadmin'].includes(botMember.admin)) {
                    await reply('❌ I need to be an admin to mute this group.');
                    return;
                }

                await Blu3Bot.groupSettingUpdate(from, 'announcement');
                await reply(`🔇 *Group Muted*\n\nOnly admins can send messages in *${meta.subject}* now.\n\nUse \`.unmute\` to restore normal messaging.`);
            } catch (err) {
                console.error('Mute error:', err.message);
                await reply('❌ Failed to mute group. Make sure I am an admin.');
            }
        }
    )
};
