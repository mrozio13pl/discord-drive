export const MIN_FILE_SIZE = 0.5 * 1024 * 1024;
export const MAX_FILE_SIZE = 7 * 1024 * 1024;
export const DISCORD_DATA_KEY = '?DISCORD_DATA?';

export enum UploadStatus {
    UPLOADING = 'uploading',
    DISCORD = 'discord',
    COMPLETED = 'completed',
    ERROR = 'error',
}

export enum DownloadStatus {
    PREPARING = 'preparing',
    DOWNLOADING = 'downloading',
    COMPLETED = 'completed_downloading',
    ERROR = 'error_downloading',
}
