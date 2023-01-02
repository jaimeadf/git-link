import { BadRequestError } from './BadRequestError';

export class ValidationError extends BadRequestError {
    constructor(message: string) {
        super(`ValidationError: ${message}`);
    }
}