import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    closeTimeout: 300000,
    rest: {
        timeout: 2_147_483_648 - 1,
    },
});

export { client };
