/** A very basic authentication with discord. */

import url, { URLSearchParams } from 'node:url';
import qs from 'node:querystring';
import crypto from 'node:crypto';
import cookie from 'cookie';
import urlJoin from 'url-join';
import { Server } from '@/server';
import type { Request, Response } from '@/types';

const redirectUri = () => urlJoin(process.env.SITE_URL, 'api/callback');

export function authRedirect(req: Request, res: Response): void {
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${
        process.env.DISCORD_CLIENT_ID
    }&redirect_uri=${redirectUri()}&response_type=code&scope=identify`;

    res.writeHead(302, {
        'Location': discordAuthUrl,
    });
    res.end();
}

export async function authCallback(req: Request, res: Response) {
    if (!req.url) return; // 💀💀

    const query = url.parse(req.url, true).query;
    const code = query.code;

    if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid OAuth2 code.');
        return;
    }

    try {
        const tokenUrl =
            'https://discordapp.com/api/oauth2/token?' +
            new URLSearchParams(
                qs.stringify({
                    client_id: process.env.DISCORD_CLIENT_ID,
                    client_secret: process.env.DISCORD_CLIENT_SECRET,
                    grant_type: 'authorization_code',
                    code: code.toString(),
                    redirect_uri: redirectUri(),
                    scope: 'identify',
                })
            ).toString();

        const params = {
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri(),
        };

        const headers = new Headers();
        headers.set('Content-Type', 'application/x-www-form-urlencoded');
        headers.set('Accept-Encoding', 'application/x-www-form-urlencoded');

        const tokenRes = await fetch(tokenUrl, {
            method: 'POST',
            body: new URLSearchParams(params),
            headers,
        });
        const data = (await tokenRes.json()) as {
            access_token: string;
        };

        // console.log(data);

        const userRes = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${data.access_token}` },
        });
        const userData = (await userRes.json()) as any;

        const sessionId = crypto.randomBytes(16).toString('hex');
        Server.getInstance.sessions[sessionId] = userData;

        res.writeHead(302, {
            'Set-Cookie': `session=${sessionId}; HttpOnly; Max-Age=86400`,
            Location: process.env.SITE_URL,
        });
        res.end();
    } catch (e) {
        console.error(e);
        res.end('Something went wrong! Check console.');
    }
}

export function authSessionCheck(req: Request, res: Response) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.session;
    const { sessions } = Server.getInstance;

    // console.log(sessionId, req.headers.cookie);

    if (sessionId && sessions[sessionId]) {
        const user = sessions[sessionId];
        res.writeHead(200, {
            'Set-Cookie': `session=${sessionId}; HttpOnly; Max-Age=86400`,
            'Content-Type': 'application/json',
        });
        res.end(JSON.stringify(user));
    } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not authenticated' }));
    }
}

export function authLogout(req: Request, res: Response) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.session;
    const { sessions } = Server.getInstance;

    if (sessionId && sessions[sessionId]) {
        delete sessions[sessionId];
    }

    res.writeHead(302, {
        'Set-Cookie': 'session=; HttpOnly; Max-Age=0',
        Location: process.env.SITE_URL,
    });
    res.end();
}
