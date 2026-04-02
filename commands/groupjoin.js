// commands/groupjoin.js
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
        'groupjoin',
        'Toggle join approval mode (require admin approval to join)',
        '.groupjoin [on/off]',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🚪');

            if (!from.endsWith('@g.us')) {
                await reply('❌ This command can only be used in groups.');
                return;
            }

            const action = args[0]?.toLowerCase();
            if (!action || !['on', 'off'].includes(action)) {
                await reply('🚪 *Join Approval Mode*\n\nUsage: `.groupjoin on/off`\n\n• `on` — new members need admin approval to join\n• `off` — anyone with the invite link can join freely');
                return;
            }

            try {
                const meta = await Blu3Bot.groupMetadata(from);
                const botId = Blu3Bot.user.id.replace(/:\d+/, '');
                const botMember = meta.participants.find(p => p.id.includes(botId.split('@')[0]));
                if (!botMember || !['admin', 'superadmin'].includes(botMember.admin)) {
                    await reply('❌ I need to be a group admin to change join settings.');
                    return;
                }

                await Blu3Bot.groupMembershipApprovalMode(from, action === 'on' ? 'on' : 'off');

                const msg = action === 'on'
                    ? `✅ *Join Approval ON*\n\nNew members now require admin approval before joining *${meta.subject}*.`
                    : `✅ *Join Approval OFF*\n\nAnyone with the invite link can now join *${meta.subject}* freely.`;

                await reply(msg);
            } catch (err) {
                console.error('Groupjoin error:', err.message);
                await reply('❌ Failed to change join settings. Make sure I am a group admin.');
            }
        }
    ),
    aliases: ['joinapproval', 'approvalmode']
};
