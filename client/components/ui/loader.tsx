import { clsx } from 'clsx';
import type { JSX } from 'preact';

export function Loader({
    className,
    ...props
}: JSX.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={clsx('loading loading-spinner', className)}
            {...props}
        />
    );
}
