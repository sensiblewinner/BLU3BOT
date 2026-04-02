// commands/ownertest.js
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
        'ownertest',
        'Test owner access',
        '.ownertest',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('👑');
            
            const debugInfo = `
*👑 OWNER ACCESS TEST*

*Your Sender:* ${context.sender}
*isOwner Result:* ${global.commandHandler?.isOwner?.(context.sender)}

*Testing owner commands...*
            `.trim();
            
            await reply(debugInfo);
            
            if (global.commandHandler?.isOwner?.(context.sender)) {
                await reply('✅ SUCCESS! You are recognized as OWNER!\n\nOwner commands should now work in DMs!');
            } else {
                await reply('❌ FAILED! You are NOT recognized as owner.\n\nCheck console logs for owner check debug info.');
            }
        }
    ),
    ownerOnly: true
};