import { useEffect } from 'preact/hooks';
import { useSession } from '@/client/providers/session';
import { Loader } from './ui/loader';
import { useDriver } from '@/client/hooks/driver';
import { fetchDriver } from '@/client/lib/fetch-driver';
import type { ComponentChildren } from 'preact';

export function ClientLayout({ children }: { children: ComponentChildren }) {
    const { setFiles, setTotalSize } = useDriver();
    const { session, loading } = useSession();

    if (!session && loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <Loader className="loading-lg" />
            </div>
        );
    }

    if (!session && !loading) {
        window.location.href = new URL(
            '/api/redirect',
            window.location.href
        ).toString();

        return (
            <div className="min-h-screen flex justify-center items-center">
                <p>Redirecting...</p>
            </div>
        );
    }

    useEffect(() => {
        fetchDriver();
    }, [setFiles, setTotalSize]);

    return <main className="min-h-screen bg-base-100">{children}</main>;
}
