import { api } from './fetch';
import type { ProgressFile } from '@/types';

export async function uploadFile(progressFile: ProgressFile) {
    if (progressFile.type === 'download') return;

    const { file, id } = progressFile;
    const formData = new FormData();

    formData.append('files', file);

    await api.post(`driver/upload/${id}`, {
        body: formData,
        credentials: 'same-origin',
    });
}
