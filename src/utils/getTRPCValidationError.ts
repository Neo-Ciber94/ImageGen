/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { TRPCClientError } from "@trpc/client";

export type TRPCValidationError = {
    code: string;
    maximum: number;
    type: string;
    inclusive: boolean;
    exact: boolean;
    message: string;
    path: string[];
};

export function getTRPCValidationError(err: unknown): TRPCValidationError | null {
    try {
        if (err instanceof TRPCClientError && typeof err.message === "string") {
            const innerError = JSON.parse(err.message)?.[0];
            if (typeof innerError.message === 'string') {
                return innerError as TRPCValidationError;
            }
        }

        return null;
    }
    catch (err) {
        return null;
    }
}