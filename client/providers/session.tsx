import React from 'react';
import { createContext, type ComponentChildren } from 'preact';
import { useContext, useState, useEffect } from 'preact/hooks';
import { api } from '@/client/lib/fetch';
import toast from 'react-hot-toast';
import type { Session } from '@/types';

export type SessionProps =
    | {
          session: Session;
          loading: boolean;
      }
    | {
          session: null;
          loading: boolean;
      };

const SessionContext = createContext<SessionProps>({
    session: null,
    loading: true,
});

export function SessionProvider({
    children,
}: {
    children: ComponentChildren;
}): JSX.Element {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await api.get('session').json<Session>();

                setSession(res);
                toast.success(`Welcome back ${res.username}!`, {
                    position: 'top-center',
                });
            } catch (err) {
                console.error('Failed to fetch session', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, []);

    return (
        <SessionContext.Provider value={{ loading, session }}>
            {children}
        </SessionContext.Provider>
    );
}

export const useSession = () => useContext(SessionContext);
