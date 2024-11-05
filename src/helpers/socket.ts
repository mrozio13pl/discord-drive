import { Driver } from '@/core/driver';

export function broadcast(id: string, message: any) {
    Driver.uploads.get(id)?.forEach((socket) => {
        socket.send(JSON.stringify(message));
    });
}
