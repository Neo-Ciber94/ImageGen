/* eslint-disable @typescript-eslint/no-unused-vars */


/**
 * A promise that can be rejected or resolved manually.
 */
export function deferred<T, TError = unknown>() {
    let resolve = (value: T) => { /** Empty */ };
    let reject = (reason: TError) => { /* Empty */ }

    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });

    return { resolve, reject, promise }
}