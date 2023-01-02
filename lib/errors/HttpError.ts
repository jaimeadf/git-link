export class HttpError extends Error {
    readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(`${message}`);
        this.statusCode = statusCode;
    }
}