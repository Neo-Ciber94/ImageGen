import { delay } from "./delay";

const DEFAULT_TIMEOUT = 1000 * 60 * 3; // 3min

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

        if (!res.ok) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const error = await res.text();
            throw new Error(error);
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const json: { messageId: string } = await res.json();
        return json;
    }

    export async function poll({ messageId, timeoutMs = DEFAULT_TIMEOUT }: QStashPollOptions) {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const timeoutId = window.setTimeout(() => abortController.abort(), timeoutMs)
        let started = false;

        while (!signal.aborted) {
            if (started) {
                await delay(1000);
            } else {
                started = true;
            }

            const res = await fetch('/api/image/poll', {
                method: 'POST',
                body: JSON.stringify({ messageId }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (res.status === 404) {
                continue;
            }

            if (!res.ok) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const error = await res.text();
                throw new Error(error);
            }

            window.clearTimeout(timeoutId);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const json: { urls: string[] } = await res.json();
            return json;
        }

        // Fallback
        throw new Error("Timeout");
    }

    export async function generateAndPoll(prompt: string, timeoutMs = DEFAULT_TIMEOUT) {
        const { messageId } = await generate(prompt);
        return poll({ messageId, timeoutMs })
    }
}
