import fs from 'node:fs';
import { generateUsername } from 'unique-username-generator';
import { isDev } from '@/utils';
import type { Driver } from '@/core/driver';

export async function uploadFile(
    driver: Driver,
    filename: string,
    filepath: string,
    reply?: string
) {
    const stream = fs.createReadStream(filepath);

    const message = await driver.channel.send({
        content: isDev ? filename : void 0,
        files: [
            { attachment: stream, name: generateUsername('_', 1) + '.local' },
        ],
        reply: reply ? { messageReference: reply } : void 0,
    });

    return message;
}

export async function fetchMessage(driver: Driver, messageId: string) {
    const message = await driver.channel.messages.fetch(messageId);

    return {
        message,
        attachment: message.attachments.first()!,
        replyTo: message.reference?.messageId,
    };
}
