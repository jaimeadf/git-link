import type { NextApiRequest, NextApiResponse } from 'next'

import path from 'path';
import JSZip from 'jszip';
import { RequestError } from '@octokit/request-error';
import { StatusCodes } from 'http-status-codes';

import { parseGitHubResourceUrl } from '../../lib/parseGitHubResourceUrl';
import { generateGitHubResourceFilename } from '../../lib/generateGitHubResourceFilename';
import { DownloadedFile, GitHubDownload } from '../../lib/GitHubDownload';
import { withErrorCatching } from '../../lib/middlewares/withErrorCatching';
import { checkQueryParameter } from '../../lib/validation/checkQueryParameter';
import { NotFoundError } from '../../lib/errors/NotFoundError';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    checkQueryParameter(req, 'url');

    const githubUrl = req.query.url!.toString();
    const filename = req.query.filename?.toString();
    const shouldZip = !!req.query.zip;

    const parameters = parseGitHubResourceUrl(githubUrl);
    const fallbackFilename = generateGitHubResourceFilename(parameters);

    const download = new GitHubDownload(
        parameters.owner,
        parameters.repository,
        parameters.path,
        parameters.ref
    );

    try {
        const data = await download.start();

        const isDirectory = Array.isArray(data);
        const isZip = shouldZip || isDirectory;
    
        if (isZip) {
            res.setHeader('Content-Disposition', `attachment; filename="${filename ?? (fallbackFilename + '.zip')}"`);
    
            if (isDirectory) {
                createDirectoryZipStream(data, parameters.path).pipe(res);
            } else {
                createFileZipStream(data).pipe(res);
            }
        } else {
            res.setHeader('Content-Disposition', `attachment; filename="${filename ?? fallbackFilename}"`);
            res.send(data.content);
        }
    } catch (error) {
        if (error instanceof RequestError && error.status === StatusCodes.NOT_FOUND) {
            throw new NotFoundError(
                `Path '${parameters.path ?? '/'}'` +
                ` wasn't found in ${parameters.owner}/${parameters.repository}` +
                (parameters.ref ? ` with ref = ${parameters.ref}` : '')
            );
        }

        throw error;
    }
}

export default withErrorCatching(handler);

function createDirectoryZipStream(files: DownloadedFile[], fromPath?: string) {
    const zip = new JSZip();

    for (const file of files) {
        zip.file(fromPath ? path.relative(fromPath, file.path) : file.path, file.content);
    }

    return zip.generateNodeStream();
}

function createFileZipStream(file: DownloadedFile) {
    const zip = new JSZip();

    zip.file(file.name, file.content);

    return zip.generateNodeStream();
}
