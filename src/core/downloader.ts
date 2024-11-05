import fs from 'node:fs';
import path from 'node:path';
import ky from 'ky';
import { uid } from 'uid/secure';
import { TypedEmitter } from 'tiny-typed-emitter';
import { db } from '@/database/discord';
import { decryptFile, mergeFiles } from '@/helpers/fs';
import { fetchMessage } from '@/discord/utils';
import type { Driver } from './driver';
import type { FileData } from '@/types';

interface DownloaderEvents {
    'progress': (progress: number) => void;
}

export class Downloader extends TypedEmitter<DownloaderEvents> {
    constructor(private driver: Driver, private fileId: string) {
        super();
    }

    async download(): Promise<{
        output: string;
        fileData: FileData;
    }> {
        try {
            return await this._download();
        } catch (error) {
            console.error(error);
            return await this.download();
        }
    }

    async _download() {
        const fileData = await db.get(this.fileId);
        const fileParts: string[] = [];
        let messageId = fileData.id,
            messageData: Awaited<ReturnType<typeof fetchMessage>>,
            downloadedSize = 0;

        do {
            messageData = await fetchMessage(this.driver, messageId);

            const { attachment } = messageData;
            const file = await (await ky.get(attachment.url)).arrayBuffer();
            const pathname = path.join('temp', uid());

            messageId = messageData.replyTo || '';

            await fs.promises.writeFile(pathname, Buffer.from(file));
            decryptFile(pathname);
            fileParts.push(pathname);
            downloadedSize += Buffer.from(file).toString().length;
            this.emit('progress', downloadedSize / fileData.encryptedSize);
        } while (messageId);

        const output = await mergeFiles(fileParts.toReversed());

        return { output, fileData };
    }
}
