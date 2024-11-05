import { useState } from 'preact/hooks';
import prettyBytes from 'pretty-bytes';
import { clsx } from 'clsx';
import { ChevronDown, ChevronUp, CircleCheck, X } from 'lucide-preact';
import { DownloadStatus, UploadStatus } from '@/helpers/constants';
import { FileIcon } from './file-icon';
import type { ProgressFile } from '@/types';

export function ProgressList({
    progressFiles,
    handleRemove,
}: {
    progressFiles: ProgressFile[];
    handleRemove: (fileId: string) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const uploadingItems = progressFiles.filter(
        ({ status }) =>
            status === UploadStatus.UPLOADING || status === UploadStatus.DISCORD
    ).length;
    const completedItems = progressFiles.filter(({ status }) =>
        [UploadStatus.COMPLETED, DownloadStatus.COMPLETED].includes(status)
    ).length;

    return (
        <div className="border border-base-200 !border-b-none bg-base-100 fixed right-12 bottom-0 max-h-xs rounded-t-xl p-4 w-md">
            <div className="w-full flex justify-between items-center">
                <h4 className="font-bold">
                    {uploadingItems
                        ? `${uploadingItems} items in progress`
                        : `${completedItems} items complete`}
                </h4>
                <button
                    className="btn btn-square btn-ghost"
                    onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? <ChevronDown /> : <ChevronUp />}
                </button>
            </div>
            {isExpanded && (
                <div className="max-h-50 overflow-y-auto">
                    {progressFiles.map((progressFile, index) => {
                        const ext = progressFile.file.name?.split('.').at(-1);
                        const isLast = progressFiles.length - 1 === index;
                        const isComplete =
                            progressFile.status === DownloadStatus.COMPLETED ||
                            progressFile.status === UploadStatus.COMPLETED;

                        let progressStatus: string;

                        switch (progressFile.status) {
                            case UploadStatus.COMPLETED:
                            case DownloadStatus.COMPLETED: {
                                progressStatus = 'Done!';
                                break;
                            }
                            case UploadStatus.DISCORD: {
                                progressStatus = 'Uploading to Discord';
                                break;
                            }
                            case DownloadStatus.ERROR:
                            case UploadStatus.ERROR: {
                                progressStatus = 'Something went wrong!';
                                break;
                            }
                            case UploadStatus.UPLOADING: {
                                progressStatus = 'Uploading';
                                break;
                            }
                            case DownloadStatus.DOWNLOADING: {
                                progressStatus = 'Downloading';
                                break;
                            }
                            case DownloadStatus.PREPARING: {
                                progressStatus = 'Preparing';
                                break;
                            }
                        }

                        return (
                            <div
                                className={clsx(
                                    'py-2 flex gap-2 items-center',
                                    !isComplete && 'px-4',
                                    !isLast && 'border-b border-b-base-300'
                                )}
                                key={index}>
                                {(isComplete ||
                                    progressFile.status ===
                                        UploadStatus.ERROR) && (
                                    <button
                                        className="btn btn-square btn-ghost"
                                        onClick={() =>
                                            handleRemove(progressFile.id)
                                        }>
                                        <X />
                                    </button>
                                )}
                                <div className="w-full">
                                    <div className="flex gap-2">
                                        <FileIcon extension={ext} />
                                        <p
                                            className="max-w-40 text-ellipsis whitespace-nowrap overflow-hidden"
                                            title={progressFile.file.name}>
                                            {progressFile.file.name}
                                        </p>
                                        <p>
                                            (
                                            {prettyBytes(
                                                progressFile.file.size
                                            )}
                                            )
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="flex gap-2 items-center">
                                            {isComplete && (
                                                <CircleCheck className="text-green" />
                                            )}
                                            {progressFile.status ===
                                                UploadStatus.ERROR && (
                                                <X className="text-red" />
                                            )}
                                            {!isComplete &&
                                                `${progressFile.progress.toFixed(
                                                    0
                                                )}%`}{' '}
                                            {progressStatus}
                                        </p>
                                        {!isComplete && (
                                            <progress
                                                className="progress w-full"
                                                value={progressFile.progress}
                                                max="100"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
