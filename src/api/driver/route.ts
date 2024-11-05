import Busboy, { type BusboyHeaders } from '@fastify/busboy';
import { uid } from 'uid/secure';
import path from 'node:path';
import fs from 'node:fs';
import { Driver } from '@/core/driver';
import { db } from '@/database/discord';
import { DISCORD_DATA_KEY, DownloadStatus } from '@/helpers/constants';
import ws from 'ws';
import cookie from 'cookie';
import { Server } from '@/server';
import { UploadStatus } from '@/helpers/constants';
import { broadcast } from '@/helpers/socket';
import type { DriverData, Request, Response } from '@/types';

export function upload(
    req: Request,
    res: Response,
    { fileId }: Record<string, string>
) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.session!;
    const { sessions } = Server.getInstance;
    const session = sessions[sessionId];

    if (!session) {
        res.statusCode = 401;
        res.end();
        return;
    }

    const busboy = new Busboy({ headers: req.headers as BusboyHeaders });
    const uploadDir = path.join('temp', uid());

    if (!fs.existsSync('temp')) fs.mkdirSync('temp');

    fs.mkdirSync(uploadDir);

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        const saveTo = path.join(uploadDir, uid());
        const writeStream = fs.createWriteStream(saveTo);
        let uploadSize = 0;

        file.pipe(writeStream);

        file.on('data', (data) => {
            // console.log(`Uploading ${filename} - ${data.length} bytes received`);
            uploadSize += data.length;

            broadcast(session.id, {
                id: fileId,
                uploadProgress: uploadSize,
                status: UploadStatus.UPLOADING,
            });
            // TODO: encrypt on the fly, possibly
        });

        file.on('end', () => {
            console.log(`File upload complete: ${filename}`);
            broadcast(session.id, {
                id: fileId,
                progress: 0,
                status: UploadStatus.DISCORD,
            });

            const uploader = Driver.instance.createUploader(
                session.id,
                filename,
                saveTo
            );

            uploader.on('progress', (progress) => {
                broadcast(session.id, {
                    id: fileId,
                    progress,
                    status: UploadStatus.DISCORD,
                });
            });

            uploader.once('finish', () => {
                broadcast(session.id, {
                    id: fileId,
                    progress: 1,
                    status: UploadStatus.COMPLETED,
                });
            });

            setTimeout(uploader.upload.bind(uploader), 1000);
        });
    });

    busboy.once('finish', () => {
        res.statusCode = 201;
        res.end();
    });

    req.pipe(busboy);
}

export async function download(req: Request, res: Response) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.session!;
    const { sessions } = Server.getInstance;
    const session = sessions[sessionId];

    if (!session) {
        res.statusCode = 401;
        res.end();
        return;
    }

    if (!req.url) return;

    const fileId = new URLSearchParams(req.url.split('?')[1]).get('fileId');

    if (!fileId) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'missing fileId' }));
        return;
    }

    if (!fs.existsSync('temp')) fs.mkdirSync('temp');

    const downloader = Driver.instance.createDownloader(fileId);

    downloader.on('progress', (progress) => {
        broadcast(session.id, {
            id: fileId,
            progress,
            status: DownloadStatus.DOWNLOADING,
        });
    });

    const { output, fileData } = await downloader.download();
    const stream = fs.createReadStream(output);
    const stat = await fs.promises.stat(output);

    broadcast(session.id, {
        id: fileId,
        progress: 1,
        status: DownloadStatus.COMPLETED,
    });

    res.writeHead(200, {
        'Content-Disposition': `attachment; filename="${fileData.name}"`,
        'Content-Length': stat.size,
    });

    stream.on('error', (err) => {
        console.error('File reading error:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    });

    stream.pipe(res);
}

export async function driverData(req: Request, res: Response) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.session!;
    const { sessions } = Server.getInstance;
    const session = sessions[sessionId];

    if (!session) {
        res.statusCode = 401;
        res.end();
        return;
    }

    const data: DriverData = {
        files: [],
        totalSize: 0,
    };

    for await (const [key, value] of db.iterator()) {
        if (!key.includes(DISCORD_DATA_KEY) && value.userId === session.id) {
            data.files.push(value);
            data.totalSize += value.size;
        }
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

export function wsConnect(sockets: Set<ws>, socket: ws) {
    let userId: string;

    sockets.add(socket);

    socket.once('close', () => {
        sockets.delete(socket);

        if (userId) {
            Driver.uploads.get(userId)?.delete(socket);

            if (!Driver.uploads.get(userId)?.size)
                Driver.uploads.delete(userId);
        }
    });

    socket.on('message', (message) => {
        userId = message.toString();

        const { uploads } = Driver;
        const uploadProgress = uploads.get(userId) || new Set<ws>();

        uploads.set(userId, uploadProgress);

        uploadProgress.add(socket);
    });
}
