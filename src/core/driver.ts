import { Uploader } from './uploader';
import { Downloader } from './downloader';
import type ws from 'ws';
import type { TextChannel } from 'discord.js';
import type { FileProgress } from '@/types';

export class Driver {
    public static instance: Driver;
    public static uploads: Map<string, Set<ws>> = new Map();

    constructor(public channel: TextChannel) {
        Driver.instance = this;
    }

    createUploader(
        discordId: string,
        filename: string,
        filepath: string,
        uploadProgress?: FileProgress
    ) {
        return new Uploader(
            this,
            discordId,
            filename,
            filepath,
            uploadProgress
        );
    }

    createDownloader(fileId: string) {
        return new Downloader(this, fileId);
    }
}
