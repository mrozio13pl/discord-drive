import type { DragEvent } from 'react';
import { FileList } from './file-list';
import { useEffect, useState } from 'preact/hooks';
import { useDriver } from '@/client/hooks/driver';
import { Loader } from './ui/loader';
import { UploadStatus } from '@/helpers/constants';
import { uid } from 'uid';
import { uploadFile } from '@/client/lib/upload';
import { useSession } from '@/client/providers/session';
import { HTTPError } from 'ky';
import toast from 'react-hot-toast';
import { fetchDriver } from '@/client/lib/fetch-driver';
import { ProgressList } from './progress-list';
import type { ProgressFile } from '@/types';

export function Driver() {
    const { files, progressFiles, setProgressFiles } = useDriver();
    const { session } = useSession();
    const [dragging, setDragging] = useState(false);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
        const dropped = Array.from(e.dataTransfer?.files || []);
        const updatedProgressFiles = dropped.map(
            (file): ProgressFile => ({
                type: 'upload',
                status: UploadStatus.UPLOADING,
                progress: 0,
                file,
                id: uid(),
            })
        );

        setProgressFiles([...updatedProgressFiles, ...progressFiles]);

        updatedProgressFiles.forEach(async (file) => {
            try {
                await uploadFile(file);
            } catch (e: any) {
                let errorMessage = 'Something went wrong!';

                if (e instanceof HTTPError) {
                    if (e.response.status === 401) {
                        errorMessage = 'Your session has expired!';
                        toast.error(errorMessage, {
                            position: 'top-center',
                        });
                    } else {
                        toast.error(
                            'Something went wrong! Check the console.',
                            {
                                position: 'top-center',
                            }
                        );
                    }
                } else {
                    toast.error('Something went wrong!', {
                        position: 'top-center',
                    });
                }

                setProgressFiles(
                    useDriver.getState().progressFiles.map((progressFile) =>
                        progressFile.id === file.id &&
                        progressFile.type === 'upload'
                            ? {
                                  ...progressFile,
                                  status: UploadStatus.ERROR,
                                  error: errorMessage,
                              }
                            : progressFile
                    )
                );
                console.error(e);
            }
        });
    };

    useEffect(() => {
        if (!session) return;

        const ws = new WebSocket(`ws://${window.location.host}/ws`);

        ws.onopen = () => {
            ws.send(session.id);
        };

        ws.onmessage = (message) => {
            const { progressFiles } = useDriver.getState();
            const data = JSON.parse(message.data) as
                | {
                      id: string;
                      status: UploadStatus.UPLOADING;
                      uploadProgress: number;
                  }
                | {
                      id: string;
                      status:
                          | UploadStatus.COMPLETED
                          | UploadStatus.DISCORD
                          | UploadStatus.ERROR;
                      progress: number;
                  };

            if (data.status === UploadStatus.UPLOADING) {
                setProgressFiles(
                    progressFiles.map((progressFile) =>
                        progressFile.id === data.id &&
                        progressFile.type === 'upload'
                            ? {
                                  ...progressFile,
                                  status: data.status,
                                  progress:
                                      (data.uploadProgress /
                                          progressFile.file.size) *
                                      100,
                              }
                            : progressFile
                    )
                );
            } else {
                setProgressFiles(
                    progressFiles.map((progressFile) =>
                        progressFile.id === data.id
                            ? ({
                                  ...progressFile,
                                  status: data.status,
                                  progress: data.progress * 100,
                              } as ProgressFile)
                            : progressFile
                    )
                );

                if (data.status === UploadStatus.COMPLETED) {
                    fetchDriver();
                }
            }
        };

        return () => {
            ws.close();
        };
    }, [session]);

    return (
        <div
            className="relative size-full"
            onDragOverCapture={(e) =>
                handleDragOver(e as any as DragEvent<HTMLDivElement>)
            }
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e as any as DragEvent<HTMLDivElement>)}>
            {files ? (
                <FileList files={files} />
            ) : (
                <div className="size-full flex justify-center items-center">
                    <Loader />
                </div>
            )}

            {dragging && (
                <div className="fixed inset-0 bg-blue-5 bg-opacity-20 flex items-center justify-center z-10 pointer-events-none">
                    <div className="text-xl text-white">Drop files here</div>
                </div>
            )}

            {!!progressFiles.length && (
                <ProgressList
                    progressFiles={progressFiles}
                    handleRemove={(fileId) =>
                        setProgressFiles(
                            progressFiles.filter(
                                (progressFile) => progressFile.id !== fileId
                            )
                        )
                    }
                />
            )}
        </div>
    );
}
