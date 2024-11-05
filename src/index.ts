import { loadEnv } from '@/helpers/env';

loadEnv();

import { Server } from '@/server';
import { client } from '@/discord/client';
import { db } from '@/database/discord';
import { Driver } from '@/core/driver';
import { ActivityType, ChannelType } from 'discord.js';
import { niceTryPromise } from '@/utils';
import { DISCORD_DATA_KEY } from '@/helpers/constants';
import type { DiscordData } from '@/types';
import { uploadDb } from './database/upload-progress';

const server = new Server();

client.once('ready', async () => {
    client.user?.setPresence({
        // activities: [
        //     {
        //         name: 'depression',
        //         type: ActivityType.Competing,
        //         url: 'https://github.com/mrozio13pl',
        //     },
        // ],
    });

    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);

    if (!guild) {
        console.error('Guild not found');
        process.exit(1);
    }

    const discordData = (await niceTryPromise(
        db.get(DISCORD_DATA_KEY)
    )) as unknown as DiscordData;

    let category =
        discordData &&
        (await niceTryPromise(guild.channels.fetch(discordData.categoryId)));
    let channel =
        discordData &&
        (await niceTryPromise(guild.channels.fetch(discordData.channelId)));

    if (
        !category ||
        category.type !== ChannelType.GuildCategory ||
        !channel ||
        channel.type !== ChannelType.GuildText
    ) {
        console.warn('No stash found, creating new one.');

        category = await guild.channels.create({
            type: ChannelType.GuildCategory,
            name: 'drive',
        });
        channel = await guild.channels.create({
            type: ChannelType.GuildText,
            name: 'stash',
            parent: category.id,
        });

        db.put('?DISCORD_DATA?', {
            categoryId: category.id,
            channelId: channel.id,
        } as any);
    } else {
        console.log('Found working stash!');
    }

    const driver = new Driver(channel);

    // interrupted uploads
    for await (const [key, value] of uploadDb.iterator()) {
        console.log('Reuploading', value.name);
        const uploader = driver.createUploader(
            value.userId,
            value.name,
            value.filepath,
            value
        );
        uploader.upload();
    }
});

await client.login(process.env.DISCORD_TOKEN);
await server.init().listen(+process.env.PORT!);
