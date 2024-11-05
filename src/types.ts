import type { DownloadStatus, UploadStatus } from '@/helpers/constants';
import type { Stats } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';

export type FileData = Pick<
    Stats,
    'size' | 'birthtimeMs' | 'atimeMs' | 'mtimeMs' | 'ctimeMs'
> & {
    id: string;
    name: string;
    isDirectory: boolean;
    encryptedSize: number;
    userId: string;
    date: number;
};

export type FileProgress = {
    parts: string[];
    currentPartIndex: number;
    filepath: string;
} & FileData;

export interface DiscordData {
    categoryId: string;
    channelId: string;
}

export type Request = IncomingMessage;
export type Response = ServerResponse;

export type Session = DiscordUser;

export interface DriverData {
    files: FileData[];
    totalSize: number;
}

export type ProgressType = 'upload' | 'download';

export type ProgressFile =
    | {
          type: 'upload';
          status: UploadStatus;
          progress: number;
          file: File;
          id: string;
          error?: string;
      }
    | {
          type: 'download';
          status: DownloadStatus;
          progress: number;
          file: FileData;
          id: string;
          error?: string;
      };

export interface DiscordUser {
    id: string;
    username: string;
    avatar: string;
    global_name: string;
    mfa_enabled: boolean;
    locale: string;
    premium_type: 0 | 1;
}
