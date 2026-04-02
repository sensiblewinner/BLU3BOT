// commands/crypto.js - FIXED
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

const axios = require('axios');

module.exports = {
    command: new Command(
        'crypto',
        'Cryptocurrency prices',
        '.crypto [coin] or .crypto',
        'search',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('💰');
            
            const coin = args[0]?.toLowerCase() || 'all';

            try {
                // Using free crypto API
                const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,cardano,solana&vs_currencies=usd&include_24hr_change=true');
                const data = response.data;

                if (data) {
                    let cryptoText = '*💰 CRYPTO PRICES*\n\n';
                    
                    if (data.bitcoin) cryptoText += `*Bitcoin (BTC)*: $${data.bitcoin.usd.toLocaleString()} (${data.bitcoin.usd_24h_change?.toFixed(2)}%)\n`;
                    if (data.ethereum) cryptoText += `*Ethereum (ETH)*: $${data.ethereum.usd.toLocaleString()} (${data.ethereum.usd_24h_change?.toFixed(2)}%)\n`;
                    if (data.binancecoin) cryptoText += `*Binance Coin (BNB)*: $${data.binancecoin.usd.toLocaleString()} (${data.binancecoin.usd_24h_change?.toFixed(2)}%)\n`;
                    if (data.cardano) cryptoText += `*Cardano (ADA)*: $${data.cardano.usd.toLocaleString()} (${data.cardano.usd_24h_change?.toFixed(2)}%)\n`;
                    if (data.solana) cryptoText += `*Solana (SOL)*: $${data.solana.usd.toLocaleString()} (${data.solana.usd_24h_change?.toFixed(2)}%)\n`;

                    await reply(cryptoText + '\n*Powered by Blu3Bot*');
                } else {
                    await reply('❌ Crypto data not available.');
                }
            } catch (error) {
                await reply(`*💰 POPULAR CRYPTO*\n\n*Bitcoin (BTC)*: Market Leader\n*Ethereum (ETH)*: Smart Contracts\n*BNB*: Binance Exchange\n*Cardano*: Research Based\n*Solana*: High Speed\n\n*Check coinmarketcap.com for live prices*\n\n*Powered by Blu3Bot*`);
            }
        }
    )
};