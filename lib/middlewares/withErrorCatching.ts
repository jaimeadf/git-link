import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import { HttpError } from '../errors/HttpError';

export function withErrorCatching(handler: NextApiHandler) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        try {
            await handler(req, res);
        } catch (error) {
            if (error instanceof HttpError) {
                res.status(error.statusCode);
                res.json({ statusCode: error.statusCode, message: error.message });

                return;
            }

            throw error;
        }
    };
}