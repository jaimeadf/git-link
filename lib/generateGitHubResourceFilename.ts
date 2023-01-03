import { GitHubResourceParameters } from './parseGitHubResourceUrl';

function stripPathTrailingSlash(path: string) {
    if (path.substring(path.length - 1) === '/') {
        return path.substring(0, path.length - 1);
    }

    return path;
}

export function generateGitHubResourceFilename(parameters: GitHubResourceParameters) {
    const sanitizedPath = parameters.path && stripPathTrailingSlash(parameters.path);

    if (!sanitizedPath) {
        return parameters.repository;
    }

    return sanitizedPath.substring(sanitizedPath.lastIndexOf('/') + 1);
}