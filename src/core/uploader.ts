import fs from 'node:fs';
import { TypedEmitter } from 'tiny-typed-emitter';
import { db } from '@/database/discord';
import { uploadDb } from '@/database/upload-progress';
import { encryptFile, splitFile } from '@/helpers/fs';
import { uploadFile } from '@/discord/utils';
import type { Driver } from './driver';
import type { FileData, FileProgress } from '@/types';

interface UploaderEvents {
    'progress': (progress: number) => void;
    'finish': () => void;
}

export class Uploader extends TypedEmitter<UploaderEvents> {
    constructor(
        private readonly driver: Driver,
        private readonly discordId: string,
        private readonly filename: string,
        private readonly filepath: string,
        private readonly uploadProgress?: FileProgress
    ) {
        super();
    }

    async upload() {
        const stats = fs.statSync(this.filepath);
        const parts =
            this.uploadProgress?.parts ||
            (await splitFile(this.filepath, 'temp'));

        if (this.uploadProgress?.currentPartIndex) {
            parts.splice(0, this.uploadProgress.currentPartIndex);
        }

        let lastMessage: string | undefined = this.uploadProgress?.id,
            encryptedSize = this.uploadProgress?.encryptedSize ?? 0;

        for (const [index, part] of parts.entries()) {
            const prevMessageId = lastMessage;

            encryptFile(part);
            const message = await uploadFile(
                this.driver,
                this.filename,
                part,
                lastMessage
            );
            lastMessage = message.id;
            encryptedSize += (await fs.promises.stat(part)).size;

            await fs.promises.rm(part);

            this.emit('progress', (index + 1) / parts.length);

            await uploadDb.put(lastMessage!, {
                id: lastMessage!,
                filepath: this.filepath,
                name: this.filename,
                userId: this.discordId,
                atimeMs: stats.atimeMs,
                ctimeMs: stats.ctimeMs,
                mtimeMs: stats.mtimeMs,
                birthtimeMs: stats.birthtimeMs,
                isDirectory: stats.isDirectory(),
                size: stats.size,
                encryptedSize,
                date: Date.now(),
                currentPartIndex: index + 1,
                parts,
            });

            if (prevMessageId) await uploadDb.del(prevMessageId);
        }

        await db.put(lastMessage!, {
            id: lastMessage!,
            name: this.filename,
            userId: this.discordId,
            atimeMs: stats.atimeMs,
            ctimeMs: stats.ctimeMs,
            mtimeMs: stats.mtimeMs,
            birthtimeMs: stats.birthtimeMs,
            isDirectory: stats.isDirectory(),
            size: stats.size,
            encryptedSize,
            date: Date.now(),
        });

        this.emit('finish');

        await uploadDb.del(lastMessage!);
        await fs.promises.rm(this.filepath);
        console.log('drippin');

        return lastMessage;
    }
}
