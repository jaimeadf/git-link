import { StatusCodes } from 'http-status-codes';
import { HttpError } from './HttpError';

export class NotFoundError extends HttpError {
    constructor(message: string) {
        super(message, StatusCodes.NOT_FOUND);
    }
}