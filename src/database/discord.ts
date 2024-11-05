import { Level } from 'level';
import type { FileData } from '@/types';
import type { LiteralUnion } from 'type-fest';

// <message_id, FileData>
export const db = new Level<LiteralUnion<'?DISCORD_DATA?', string>, FileData>(
    './.db/discord',
    {
        valueEncoding: 'json',
    }
);
