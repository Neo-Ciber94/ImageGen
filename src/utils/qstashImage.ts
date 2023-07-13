
export interface QStashPollOptions {
    messageId: string;
    timeoutMs?: number;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace QStashImageClient {
    export async function generate(prompt: string): Promise<{ messageId: string }> {
        const res = await fetch('/api/image/generate', {
            method: 'POST',
            body: JSON.stringify({ prompt }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const json = await res.json();

        if (res.ok) {
            return json as { messageId: string }
        } else {
            const msg = json as { message: string }
            throw new Error(msg.message)
        }
    }

    export async function poll({ messageId }: { messageId: string }) {
        const MAX_RETRIES = 60 * 2; // 2min 
        let retries = 0;

        return new Promise<{ urls: string[] }>((resolve, reject) => {

            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const intervalId = window.setInterval(async () => {
                if (retries >= MAX_RETRIES) {
                    window.clearInterval(intervalId);
                    reject(new Error(`Timeout after ${retries} seconds`));
                }

                const res = await fetch('/api/image/poll', {
                    method: 'POST',
                    body: JSON.stringify({ messageId }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (res.status === 404) {
                    retries += 1;
                    return;
                }

                window.clearInterval(intervalId);

                if (!res.ok) {
                    const { message } = (await res.json()) as { message: string }
                    reject(new Error(message));
                } else {
                    const { urls } = (await res.json()) as { urls: string[] }
                    resolve({ urls })
                }
            }, 1000)
        })
    }
}
