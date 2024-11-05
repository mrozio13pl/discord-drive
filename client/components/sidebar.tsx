import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-preact';
import { useState } from 'preact/hooks';
import type { JSX } from 'preact';

export function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(false);

    function SidebarButton({
        className,
        ...props
    }: JSX.HTMLAttributes<HTMLButtonElement>) {
        return (
            <button
                className={clsx(
                    'btn btn-ghost',
                    !isExpanded && 'btn-square',
                    className
                )}
                {...props}
            />
        );
    }

    return (
        <div className="min-h-full flex flex-col justify-between p-2 bg-base-200">
            <div className="flex flex-col gap-4">
                <SidebarButton onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? <ChevronLeft /> : <ChevronRight />}
                    {isExpanded && <p>Close</p>}
                </SidebarButton>
                <SidebarButton>
                    <Trash2 />
                    {isExpanded && <p>Recycle Bin</p>}
                </SidebarButton>
            </div>
            <div></div>
        </div>
    );
}
