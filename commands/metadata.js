// commands/metadata.js
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
        'metadata',
        'Show detailed group information',
        '',
        'Group',
        async (reply, react, from, message, args, Blu3Bot) => {
            if (!from.endsWith('@g.us')) {
                await react("❌");
                return reply("❌ This command only works in groups!");
            }

            try {
                await react("📊");
                const groupInfo = await Blu3Bot.groupMetadata(from);
                
                const admins = groupInfo.participants?.filter(p => p.admin) || [];
                const superAdmins = admins.filter(p => p.admin === 'superadmin');
                const regularAdmins = admins.filter(p => p.admin === 'admin');
                const members = groupInfo.participants?.filter(p => !p.admin) || [];

                const metadataMessage = `
+------------------------------+
|         📊 METADATA          |
|------------------------------|
| 📛 Group Name: ${groupInfo.subject || 'No Name'}
| 👥 Total Members: ${groupInfo.participants?.length || 0}
| 👑 Super Admins: ${superAdmins.length}
| 👮 Admins: ${regularAdmins.length}
| 👤 Members: ${members.length}
| 🔒 Group Status: ${groupInfo.announce ? 'Muted 🔒' : 'Open 🔓'}
| 🏷️ Group ID: ${groupInfo.id?.substring(0, 15)}...
| 📅 Created: ${
    groupInfo.creation
      ? new Date(groupInfo.creation * 1000).toLocaleDateString()
      : 'Unknown'
  }
| 📝 Description: ${
    groupInfo.desc
      ? groupInfo.desc.substring(0, 100) + (groupInfo.desc.length > 100 ? '...' : '')
      : 'No description'
  }
+------------------------------+

*Detailed group insights*
                `.trim();

                await reply(metadataMessage);
            } catch (error) {
                await react("❌");
                await reply(`❌ Failed to get group metadata: ${error.message}`);
            }
        }
    ),
    
    execute: async (reply, react, from, message, args, Blu3Bot) => {
        await module.exports.command.execute(reply, react, from, message, args, Blu3Bot);
    }
};