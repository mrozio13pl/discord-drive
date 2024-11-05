import { isDev } from '@/utils';
import dotenv from 'dotenv';
import fs from 'node:fs';

export function loadEnv() {
    const envLocal = fs.existsSync('.env.local') && '.env.local';
    const envProd = fs.existsSync('.env') && '.env';

    dotenv.config({
        path: (isDev && envLocal ? envLocal : envLocal || envProd) || void 0,
    });
}
