import { DownloadStatus } from '@/helpers/constants';
import { useDriver } from '../hooks/driver';
import { api } from './fetch';
import type { FileData } from '@/types';

export async function downloadFile(file: FileData) {
    const { progressFiles, setProgressFiles } = useDriver.getState();

    setProgressFiles([
        ...progressFiles,
        {
            type: 'download',
            status: DownloadStatus.PREPARING,
            progress: 0,
            file,
            id: file.id,
        },
    ]);

    const blob = await api
        .get('driver/download', {
            searchParams: {
                fileId: file.id,
            },
            timeout: false,
        })
        .blob();

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.setAttribute('download', file.name);
    a.click();
}
