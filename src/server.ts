/* eslint-disable @typescript-eslint/no-var-requires */
import http from 'node:http';
import ws, { WebSocketServer } from 'ws';
import sirv, { type RequestHandler } from 'sirv';
import findMyWay from 'find-my-way';
import { isDev } from '@/utils';
import { authCallback, authLogout, authRedirect, authSessionCheck, download, driverData, upload, wsConnect } from '@/api';
import { version } from '../package.json' with {type: 'json'};
import type { DiscordUser } from './types';

export class Server {
    // eslint-disable-next-line no-use-before-define
    private static instance: Server;
    private readonly sockets = new Set<ws>();
    private readonly server: http.Server;
    private readonly static: RequestHandler;
    private readonly wss: ws.Server;
    public readonly sessions: Record<string, DiscordUser> = {};

    public static get getInstance() {
        return this.instance;
    }

    constructor() {
        this.server = http.createServer();
        this.static = sirv('./public', {
            single: true,
            dev: isDev,
        });

        this.wss = new WebSocketServer({
            server: this.server,
            path: '/ws',
        });
        Server.instance = this;
    }

    init() {
        const router = findMyWay();

        router.on('GET', '/api/version', (req, res) => {
            res.end(JSON.stringify({ version }))
        });

        router.on('GET', '/api/driver', driverData);
        router.on('GET', '/api/driver/download', download);
        router.on('POST', '/api/driver/upload/:fileId', (req, res, params) => upload(req,res,params as any));

        router.on('GET', '/api/redirect', authRedirect);
        router.on('GET', '/api/callback', authCallback);
        router.on('GET', '/api/logout', authLogout);
        router.on('GET', '/api/session', authSessionCheck);

        router.on('GET', '*', (req, res) => {
            this.static(req, res);
        });

        this.server.on('request', (req, res) => {
            router.lookup(req, res);
        });

        this.wss.on('connection', (socket) => wsConnect(this.sockets, socket));

        return this;
    }

    async listen(port: number) {
        this.server.listen(port, async () => {
            if (isDev) {
                const { yellow, cyan, underline } = await import('colorette');

                console.warn(
                    `${cyan(
                        `Server running on port ${underline(port)}`
                    )} ${yellow('[DEV]')}`
                );
            } else {
                console.log('Server running on port ' + port);
            }
        });
    }

    get getServer() {
        return this.server;
    }
}
