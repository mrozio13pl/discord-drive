import { SessionProvider } from '@/client/providers/session';
import { ClientLayout } from '@/client/components/client-layout';
import { Navbar } from '@/client/components/navbar';
import { Main } from '@/client/components/main';
import { Toaster } from 'react-hot-toast';

export function App() {
    return (
        <SessionProvider>
            <Toaster />
            <ClientLayout>
                <Navbar />

                <div className="flex overflow-y-auto max-h-[calc(100vh-122px)]">
                    {/* <Sidebar /> */}

                    <Main />
                </div>
            </ClientLayout>
        </SessionProvider>
    );
}
