// commands/listadmins.js
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
        'listadmins',
        'List all admins in the group',
        '.listadmins',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('👑');

            if (!from.endsWith('@g.us')) {
                await reply('❌ This command can only be used in groups.');
                return;
            }

            try {
                const meta = await Blu3Bot.groupMetadata(from);
                const admins = meta.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');

                if (admins.length === 0) {
                    await reply('❌ No admins found in this group.');
                    return;
                }

                let text = `👑 *Group Admins*\n📌 ${meta.subject}\n\n`;
                const mentions = [];
                let i = 1;
                for (const admin of admins) {
                    const label = admin.admin === 'superadmin' ? '⭐ ' : '';
                    text += `${i++}. ${label}@${admin.id.split('@')[0]}\n`;
                    mentions.push(admin.id);
                }
                text += `\n_Total: ${admins.length} admin${admins.length !== 1 ? 's' : ''}_`;

                await Blu3Bot.sendMessage(from, { text, mentions }, { quoted: message });
            } catch (err) {
                console.error('Listadmins error:', err.message);
                await reply('❌ Could not fetch admin list.');
            }
        }
    ),
    aliases: ['admins', 'getadmins', 'adminlist']
};
