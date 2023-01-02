import type { NextApiRequest, NextApiResponse } from 'next'

import path from 'path';
import url from 'url';
import JSZip from 'jszip';
import { match } from 'path-to-regexp';
import { RequestError } from '@octokit/request-error';
import { StatusCodes } from 'http-status-codes';

import { withErrorCatching } from '../../lib/middlewares/withErrorCatching';
import { checkQueryParameter } from '../../lib/validation/checkQueryParameter';
import { DownloadedFile, GitHubDownload } from '../../lib/GitHubDownload';
import { ValidationError } from '../../lib/errors/ValidationError';
import { NotFoundError } from '../../lib/errors/NotFoundError';

const parseRoutePath = match<GitHubRepositoryParameters>('/:owner/:repository/:type(tree|blob)?/:ref?/:path(.*)?');

type GitHubRepositoryParameters = {
    owner: string;
    repository: string;
    type?: string;
    ref?: string;
    path?: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
    checkQueryParameter(req, 'url');

    const githubUrl = req.query.url!.toString();
    const filename = req.query.filename?.toString();
    const shouldZip = !!req.query.zip;

    const parameters = parseGitHubRepositoryUrl(githubUrl);
    const fallbackFilename = githubUrl.substring(githubUrl.lastIndexOf('/') + 1);

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
    }
}

export default withErrorCatching(handler);

function parseGitHubRepositoryUrl(githubUrl: string) {
    const parts = url.parse(githubUrl!.toString());

    if (parts.hostname !== 'github.com') {
        throw new ValidationError("URL hostname must be 'github.com'");
    }

    if (!parts.pathname) {
        throw new ValidationError('URL route path cannot be empty');
    }

    const route = parseRoutePath(parts.pathname);

    if (!route || !route.params.type && route.params.ref) {
        throw new ValidationError("URL must satisfy the format '/{owner}/{repository}/{blob|tree}/{ref}/{path}'");
    }

    return route.params;
}

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
