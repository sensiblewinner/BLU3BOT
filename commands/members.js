// commands/members.js
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
        'members',
        'List all members in the group',
        '.members',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('👥');

            if (!from.endsWith('@g.us')) {
                await reply('❌ This command can only be used in groups.');
                return;
            }

            try {
                const meta = await Blu3Bot.groupMetadata(from);
                const participants = meta.participants;
                const admins = participants.filter(p => p.admin);
                const regular = participants.filter(p => !p.admin);

                let text = `👥 *Group Members*\n📌 ${meta.subject}\n`;
                text += `Total: ${participants.length} member${participants.length !== 1 ? 's' : ''} (${admins.length} admin${admins.length !== 1 ? 's' : ''})\n\n`;

                if (admins.length > 0) {
                    text += `👑 *Admins (${admins.length})*\n`;
                    for (const a of admins) {
                        const star = a.admin === 'superadmin' ? '⭐' : '👑';
                        text += `${star} +${a.id.split('@')[0]}\n`;
                    }
                    text += '\n';
                }

                if (regular.length > 0) {
                    text += `👤 *Members (${regular.length})*\n`;
                    for (const m of regular) {
                        text += `• +${m.id.split('@')[0]}\n`;
                    }
                }

                // Split into chunks if message is too long
                if (text.length > 3000) {
                    const lines = text.split('\n');
                    let chunk = '';
                    for (const line of lines) {
                        if (chunk.length + line.length > 3000) {
                            await reply(chunk);
                            chunk = '';
                        }
                        chunk += line + '\n';
                    }
                    if (chunk.trim()) await reply(chunk);
                } else {
                    await reply(text);
                }

            } catch (err) {
                console.error('Members error:', err.message);
                await reply('❌ Could not fetch member list.');
            }
        }
    ),
    aliases: ['memberlist', 'listmembers', 'groupmembers']
};
