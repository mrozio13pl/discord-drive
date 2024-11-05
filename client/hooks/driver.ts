import { create } from 'zustand';
import type { FileData, ProgressFile } from '@/types';

interface DriverState {
    files: FileData[];
    totalSize: number;
    progressFiles: ProgressFile[];
    setFiles: (files: FileData[]) => void;
    setTotalSize: (size: number) => void;
    setProgressFiles(progressFile: ProgressFile[]): void;
}

export const useDriver = create<DriverState>((set) => ({
    files: [],
    totalSize: 0,
    progressFiles: [],
    setFiles: (files) => set({ files }),
    setTotalSize: (size) => set({ totalSize: size }),
    setProgressFiles(progressFiles) {
        set({ progressFiles });
    },
}));
