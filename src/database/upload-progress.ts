import { Level } from 'level';
import type { FileProgress } from '@/types';

// <message_id, FileData>
export const uploadDb = new Level<string, FileProgress>('./.db/progress', {
    valueEncoding: 'json',
});
