import type { NextApiRequest } from 'next';
import { ValidationError } from '../errors/ValidationError';

export function checkQueryParameter(req: NextApiRequest, name: string) {
    if (!req.query[name]) {
        throw new ValidationError(`Query parameter '${name}' is required`);
    }
}