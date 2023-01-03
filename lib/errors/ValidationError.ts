export class ValidationError extends Error {
    constructor(message: string) {
        super(`ValidationError: ${message}`);
    }
}