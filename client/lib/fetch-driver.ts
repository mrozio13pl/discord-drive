import { useDriver } from '../hooks/driver';
import { api } from './fetch';
import type { DriverData } from '@/types';

export async function fetchDriver() {
    const { setFiles, setTotalSize } = useDriver.getState();

    const { files: newFiles, totalSize } = await api
        .get<DriverData>('driver')
        .json();

    setFiles(newFiles);
    setTotalSize(totalSize);
}
