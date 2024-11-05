import { LogOut, MoonStar, SearchSlash, SunMedium } from 'lucide-preact';
import { useDriver } from '@/client/hooks/driver';
import { useSession } from '@/client/providers/session';
import { useTheme } from '@/client/hooks/theme';
import { Loader } from './ui/loader';
import prettyBytes from 'pretty-bytes';

export function Navbar() {
    const { totalSize } = useDriver();
    const { session } = useSession();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="w-full bg-base-200 px-8 py-4 flex justify-between items-center">
            <div className="flex gap-4 items-center">
                <div>
                    <h1>DiscordDrive</h1>
                </div>
                <div>
                    {/* <label className="input input-bordered w-xs flex items-center gap-2">
                        <SearchSlash />
                        <input
                            type="text"
                            className="grow"
                            placeholder="Search your drive..."
                        />
                    </label> unfinished */}
                </div>
            </div>
            <div className="flex gap-4 items-center">
                <p className="flex gap-2 items-center">
                    Space stolen:{' '}
                    <b>
                        {typeof totalSize === 'undefined' ? (
                            <Loader />
                        ) : (
                            prettyBytes(totalSize)
                        )}
                    </b>
                </p>
                <img
                    src={`//cdn.discordapp.com/avatars/${session?.id}/${session?.avatar}`}
                    alt="avatar"
                    height={52}
                    width={52}
                    className="avatar rounded-full"
                />
                <p className="max-w-60 text-ellipsis whitespace-nowrap overflow-hidden">
                    {session?.global_name || session?.username || 'acc'}
                </p>
                <button
                    className="btn btn-square btn-ghost"
                    onClick={() => {
                        window.location.href = '/api/logout';
                    }}
                    title="Log Out">
                    <LogOut />
                </button>
                <button
                    className="btn btn-square btn-ghost"
                    onClick={toggleTheme}
                    title="Switch Theme">
                    {theme === 'dark' ? <MoonStar /> : <SunMedium />}
                </button>
            </div>
        </div>
    );
}
