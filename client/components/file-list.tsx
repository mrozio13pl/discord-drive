import prettyBytes from 'pretty-bytes';
import tinydate, { type Dictionary } from 'tinydate';
import { FileIcon } from './file-icon';
import { downloadFile } from '../lib/download';
import { useState } from 'preact/hooks';
import { clsx } from 'clsx';
import { Download, Forward } from 'lucide-preact';
import type { FileData } from '@/types';

const oldDictionary: Dictionary = {
    MMMM: (d) => d.toLocaleString('default', { month: 'long' }),
};
const todayStamp = tinydate('Today {HH}:{mm}:{ss}', oldDictionary);
const thisYear = tinydate('{MMMM} {DD}, {HH}:{mm}', oldDictionary);
const longTimeAgo = tinydate('{MMMM} {DD}, {YYYY}');

/** @link https://stackoverflow.com/a/8215621 */
function sameDay(d1: Date, d2: Date) {
    return (
        d1.getUTCFullYear() == d2.getUTCFullYear() &&
        d1.getUTCMonth() == d2.getUTCMonth() &&
        d1.getUTCDate() == d2.getUTCDate()
    );
}

function stamp(date: Date) {
    const today = new Date();

    if (sameDay(date, today)) return todayStamp(date);
    if (today.getFullYear() === date.getFullYear()) return thisYear(date);
    return longTimeAgo(date);
}

export function FileList({ files }: { files: FileData[] }) {
    const [] = useState();
    const [hoveredFileId, setHoveredFileId] = useState<string>();

    return (
        <div className="w-full flex flex-col">
            {files
                .sort((a, b) => b.date - a.date)
                .map((file, index) => {
                    const ext = file.name?.split('.').at(-1);

                    return (
                        <div
                            className="flex items-center p-4 border-b-base-200 border-b cursor-pointer hover:bg-base-200/20"
                            onMouseEnter={() => {
                                setHoveredFileId(file.id);
                            }}
                            onMouseLeave={() => {
                                if (hoveredFileId === file.id)
                                    setHoveredFileId(void 0);
                            }}
                            key={index}>
                            <div className="basis-1/2 flex gap-4 items-center">
                                <FileIcon extension={ext} />
                                <h4 className="text-ellipsis whitespace-nowrap overflow-hidden">
                                    {file.name || 'unnamed'}
                                </h4>
                            </div>
                            <div className="basis-5/12">
                                {stamp(new Date(file.mtimeMs))}
                            </div>
                            <div className="basis-5/12">
                                {prettyBytes(file.size)}
                            </div>
                            <div
                                className={clsx(
                                    'basis-2/12 flex items-center justify-center gap-2',
                                    hoveredFileId !== file.id && 'invisible'
                                )}>
                                <button
                                    className="btn btn-square btn-ghost"
                                    title={'Download ' + file.name}
                                    onClick={() => downloadFile(file)}>
                                    <Download />
                                </button>
                                <button
                                    className="btn btn-square btn-ghost btn-disabled"
                                    title="Share (coming soon)">
                                    <Forward />
                                </button>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
}
