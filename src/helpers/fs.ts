import fs from 'node:fs';
import path from 'node:path';
import { encrypt, decrypt } from '@/helpers/crypto';
import { MAX_FILE_SIZE, MIN_FILE_SIZE } from '@/helpers/constants';
import { uid } from 'uid/secure';
import { randomInt } from '@/utils';

export function encryptFile(filepath: string) {
    const content = fs.readFileSync(filepath);
    const encrypted = encrypt(content);
    fs.writeFileSync(filepath, encrypted);
}

export function decryptFile(filepath: string) {
    const content = fs.readFileSync(filepath);
    const decrypted = decrypt(content);
    fs.writeFileSync(filepath, decrypted);
}

export function splitFile(filepath: string, dir: string) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    return new Promise<string[]>((resolve, reject) => {
        const id = uid();
        const parts: string[] = [];
        const readStream = fs.createReadStream(filepath);

        let partIndex = 0;
        let currentSize = 0;
        let maxFileSize = MAX_FILE_SIZE;
        let currentPart: Buffer[] = [];

        readStream.on('data', (chunk) => {
            currentSize += chunk.length;
            currentPart.push(chunk as any);

            if (currentSize >= maxFileSize) {
                const partFilename = path.join(
                    dir,
                    `${path.basename(filepath)}.${id}.part${partIndex}`
                );
                fs.writeFileSync(partFilename, Buffer.concat(currentPart));
                partIndex++;
                currentSize = 0;
                currentPart = [];
                parts.push(partFilename);
                maxFileSize = randomInt(MIN_FILE_SIZE, MAX_FILE_SIZE);
            }
        });

        readStream.on('end', () => {
            if (currentPart.length > 0) {
                const partFilename = path.join(
                    dir,
                    `${path.basename(filepath)}.${id}.part${partIndex}`
                );
                fs.writeFileSync(partFilename, Buffer.concat(currentPart));
                parts.push(partFilename);
            }
            resolve(parts);
        });

        readStream.on('error', reject);
    });
}

export function mergeFiles(parts: string[]) {
    const output = path.join('temp', uid());

    return new Promise<string>((resolve, reject) => {
        const writeStream = fs.createWriteStream(output);

        let currentIndex = 0;

        function appendNextPart() {
            if (currentIndex >= parts.length) {
                writeStream.end();
                // console.log(`File merge completed. Output file: ${output}`);
                resolve(output);
                return;
            }

            const currentPart = parts[currentIndex]!;
            const readStream = fs.createReadStream(currentPart, {
                encoding: void 0,
            });

            readStream.pipe(writeStream, { end: false });

            readStream.on('end', () => {
                currentIndex++;
                appendNextPart();
            });

            readStream.on('error', (error) => {
                writeStream.end();
                reject(error);
            });
        }

        writeStream.on('error', reject);

        appendNextPart();
    });
}
