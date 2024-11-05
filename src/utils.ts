export const isDev = process.env.NODE_ENV === 'development';

export async function niceTryPromise<T>(
    promise: Promise<T>
): Promise<T | undefined> {
    return new Promise<T | undefined>((resolve) => {
        promise.then(resolve).catch(() => {
            resolve(void 0);
        });
    });
}

export function randomInt(minimum: number, maximum: number) {
    return ~~(Math.random() * (maximum - minimum + 1) + minimum);
}
