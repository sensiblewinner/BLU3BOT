// commands/fixdm.js
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
        'fixdm',
        'Fix DM response issue',
        '.fixdm',
        'utility',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🔧');
            
            const sender = context.sender;
            
            // Log EVERYTHING about the message
            console.log('🔧 FIXDM - FULL MESSAGE ANALYSIS:');
            console.log('   From:', from);
            console.log('   Sender:', sender);
            console.log('   Message Key:', message.key);
            console.log('   Push Name:', context.pushName);
            console.log('   Is Group:', from.endsWith('@g.us'));
            
            const debugInfo = `
*🔧 DM FIX DEBUG*

*Chat ID:* ${from}
*Your Sender:* ${sender}
*Push Name:* ${context.pushName}
*Is Group:* ${from.endsWith('@g.us')}

*Testing Commands:*
• Try: .ping
• Try: .menu
• Try: .debugme

*Check console for detailed logs*
            `.trim();
            
            await reply(debugInfo);
            
            // Test basic command response
            await reply('✅ If you see this, basic commands work in DMs!');
        }
    )
};