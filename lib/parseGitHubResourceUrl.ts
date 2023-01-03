import { match } from 'path-to-regexp';
import { ValidationError } from './errors/ValidationError';

const parseRoutePath = match<GitHubResourceParameters>('/:owner/:repository/:type(tree|blob)?/:ref?/:path(.*)?');

export interface GitHubResourceParameters {
    owner: string;
    repository: string;
    type?: string;
    ref?: string;
    path?: string;
};

export function parseGitHubResourceUrl(githubUrl: string) {
    const parts = new URL(githubUrl!.toString());

    if (parts.hostname !== 'github.com') {
        throw new ValidationError("URL hostname must be 'github.com'");
    }

    if (!parts.pathname) {
        throw new ValidationError('URL route path cannot be empty');
    }

    const route = parseRoutePath(parts.pathname);

    if (!route || !route.params.type && route.params.ref || route.params.type && !route.params.ref) {
        throw new ValidationError("URL must satisfy the format '/{owner}/{repository}/{blob|tree}/{ref}/{path}'");
    }

    return route.params;
}