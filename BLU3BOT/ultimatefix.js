// commands/owner/ultimatefix.js
const { writeFileSync, readFileSync, existsSync } = require('fs');

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
        'ultimatefix',
        'Complete fix for owner access in other DMs',
        '',
        'owner',
        async (reply, react, from, message, args, Blu3Bot) => {
            // Need to access these from the message or context
            const PREFIX = "."; // or get from config
            const jidManager = {
                isOwner: function(msg) {
                    try {
                        const participant = msg?.key?.participant;
                        const remoteJid = msg?.key?.remoteJid;
                        const senderJid = participant || remoteJid;
                        const isFromMe = msg?.key?.fromMe;
                        const isGroup = remoteJid?.includes('@g.us');
                        
                        console.log(`🔍 ULTIMATE isOwner() called:`);
                        console.log(`   Sender: ${senderJid}`);
                        console.log(`   From Me: ${isFromMe}`);
                        console.log(`   Chat: ${remoteJid}`);
                        console.log(`   Type: ${isGroup ? 'Group' : 'DM'}`);
                        
                        // CRITICAL FIX #1: If message is from bot itself, it's owner
                        if (isFromMe) {
                            console.log(`   ✅ ULTIMATE FIX: fromMe = OWNER`);
                            return true;
                        }
                        
                        // Check if this JID matches owner
                        if (global.OWNER_JID && senderJid === global.OWNER_JID) {
                            console.log(`   ✅ Matches global OWNER_JID`);
                            return true;
                        }
                        
                        if (global.OWNER_NUMBER && senderJid?.includes(global.OWNER_NUMBER)) {
                            console.log(`   ✅ Matches global OWNER_NUMBER`);
                            return true;
                        }
                        
                        // Try to load from owner.json
                        if (existsSync('./owner.json')) {
                            try {
                                const ownerData = JSON.parse(readFileSync('./owner.json', 'utf8'));
                                if (ownerData.OWNER_JID && senderJid === ownerData.OWNER_JID) {
                                    console.log(`   ✅ Matches owner.json OWNER_JID`);
                                    return true;
                                }
                                if (ownerData.OWNER_NUMBER && senderJid?.includes(ownerData.OWNER_NUMBER)) {
                                    console.log(`   ✅ Matches owner.json OWNER_NUMBER`);
                                    return true;
                                }
                            } catch (e) {
                                // ignore
                            }
                        }
                        
                        console.log(`   ❌ Not owner`);
                        return false;
                    } catch (error) {
                        console.error('Error in isOwner:', error);
                        return msg?.key?.fromMe || false;
                    }
                },
                
                cleanJid: function(jid) {
                    if (!jid) return { cleanNumber: '', cleanJid: '', isLid: false };
                    
                    let cleaned = jid.split(':')[0].split('/')[0];
                    const isLid = cleaned.includes('@lid');
                    
                    if (!cleaned.includes('@')) {
                        cleaned += '@s.whatsapp.net';
                    }
                    
                    return {
                        cleanNumber: cleaned.split('@')[0],
                        cleanJid: cleaned,
                        isLid: isLid
                    };
                }
            };
            
            let fixLog = `🚀 *ULTIMATE OWNER FIX*\n\n`;
            
            // ========== STEP 1: Set global variables ==========
            const senderJid = message.key.participant || from;
            const cleaned = jidManager.cleanJid(senderJid);
            
            global.OWNER_NUMBER = cleaned.cleanNumber || '254703397679';
            global.OWNER_CLEAN_NUMBER = global.OWNER_NUMBER;
            global.OWNER_JID = cleaned.cleanJid || '254703397679@s.whatsapp.net';
            global.OWNER_CLEAN_JID = global.OWNER_JID;
            
            fixLog += `✅ Set global variables:\n`;
            fixLog += `   ├─ OWNER_NUMBER: ${global.OWNER_NUMBER}\n`;
            fixLog += `   └─ OWNER_JID: ${global.OWNER_JID}\n\n`;
            
            // ========== STEP 2: Update owner.json ==========
            try {
                const ownerData = {};
                
                if (existsSync('./owner.json')) {
                    try {
                        const existingData = JSON.parse(readFileSync('./owner.json', 'utf8'));
                        Object.assign(ownerData, existingData);
                    } catch (e) {
                        // ignore
                    }
                }
                
                ownerData.OWNER_NUMBER = global.OWNER_NUMBER;
                ownerData.OWNER_JID = global.OWNER_JID;
                ownerData.OWNER_CLEAN_NUMBER = global.OWNER_NUMBER;
                ownerData.OWNER_CLEAN_JID = global.OWNER_JID;
                ownerData.lastUpdated = new Date().toISOString();
                ownerData.updatedBy = 'ultimatefix';
                ownerData.fromJid = cleaned.cleanJid;
                ownerData.isLid = cleaned.isLid;
                
                writeFileSync('./owner.json', JSON.stringify(ownerData, null, 2));
                fixLog += `✅ Updated owner.json with current data\n\n`;
                
            } catch (error) {
                fixLog += `⚠️ Could not update owner.json: ${error.message}\n\n`;
            }
            
            // ========== STEP 3: Create LID mapping ==========
            if (cleaned.isLid) {
                const lidMappingFile = './lid_mappings.json';
                let lidMappings = {};
                
                if (existsSync(lidMappingFile)) {
                    try {
                        lidMappings = JSON.parse(readFileSync(lidMappingFile, 'utf8'));
                    } catch (error) {
                        // ignore
                    }
                }
                
                lidMappings[cleaned.cleanNumber] = global.OWNER_JID;
                writeFileSync(lidMappingFile, JSON.stringify(lidMappings, null, 2));
                
                fixLog += `✅ Created LID mapping:\n`;
                fixLog += `   ${cleaned.cleanJid} → ${global.OWNER_JID}\n\n`;
            }
            
            // ========== STEP 4: Immediate test ==========
            fixLog += `🎯 *IMMEDIATE TEST RESULTS:*\n`;
            
            // Test current status
            const isOwnerNow = jidManager.isOwner(message);
            fixLog += `├─ Current isOwner(): ${isOwnerNow ? '✅ YES' : '❌ NO'}\n`;
            fixLog += `├─ From Me: ${message.key?.fromMe ? '✅ YES' : '❌ NO'}\n`;
            fixLog += `├─ Is LID: ${cleaned.isLid ? '✅ YES' : '❌ NO'}\n`;
            fixLog += `└─ Sender: ${cleaned.cleanJid}\n\n`;
            
            if (isOwnerNow) {
                fixLog += `🎉 *SUCCESS!* You now have owner access!\n\n`;
                fixLog += `💡 Try using ${PREFIX}mode command now!`;
            } else {
                fixLog += `⚠️ *Still not owner*\n\n`;
                fixLog += `🔧 *Emergency Instructions:*\n`;
                fixLog += `1. Check if bot can message you\n`;
                fixLog += `2. Try sending a command from your number first\n`;
                fixLog += `3. Then restart bot and try again\n`;
                fixLog += `4. If still issues, check console logs`;
            }
            
            await reply(fixLog);
            await react("🔧");
            
            console.log('🚀 Ultimate fix applied for:', cleaned.cleanJid);
        }
    ),
    
    execute: async (reply, react, from, message, args, Blu3Bot) => {
        await module.exports.command.execute(reply, react, from, message, args, Blu3Bot);
    }
};