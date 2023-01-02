import { Octokit } from 'octokit';

export type GitHubNode = GitHubFile | GitHubDirectory;

export interface GitHubFile {
    type: 'file';
    size: number;
    name: string;
    path: string;
    sha: string;
    url: string;
    git_url: string;
    html_url: string;
    download_url: string;
}

export interface GitHubDirectory {
    type: 'dir';
    size: number;
    name: string;
    path: string;
    sha: string;
    url: string;
    git_url: string;
    html_url: string;
}

export class GitHubApi {
    private static octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    static async getContent(owner: string, repository: string, path?: string, ref?: string) {
        const response = await this.octokit.rest.repos.getContent({
            owner,
            repo: repository,
            path: path ?? '',
            ref
        });

        return response.data as GitHubFile | GitHubNode[];
    }
}