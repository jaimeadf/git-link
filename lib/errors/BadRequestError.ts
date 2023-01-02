import { StatusCodes } from 'http-status-codes';
import { HttpError } from './HttpError';

export class BadRequestError extends HttpError {
    constructor(message: string) {
        super(message, StatusCodes.BAD_REQUEST);
    }
}