import { GitHubApi, GitHubNode, GitHubFile, GitHubDirectory } from './GitHubApi';

export interface DownloadedFile {
    name: string;
    path: string;
    content: ArrayBuffer
}

export class GitHubDownload {
    readonly owner: string;
    readonly repository: string;
    readonly basePath?: string;
    readonly ref?: string;

    private promise?: Promise<DownloadedFile | DownloadedFile[]>;
    private files: DownloadedFile[];

    constructor(owner: string, repository: string, basePath?: string, ref?: string) {
        this.owner = owner;
        this.repository = repository;
        this.basePath = basePath;
        this.ref = ref;

        this.files = [];
    }

    async start() {
        if (!this.promise) {
            this.promise = this.startInternal();
        }

        return await this.promise;
    }

    private async startInternal() {
        const data = await this.getRepositoryContent(this.basePath);

        if (Array.isArray(data)) {
            await this.fetchNodes(data);
            return this.files;
        }

        await this.fetchFile(data);

        return this.files[0];
    }

    private async fetchNodes(nodes: GitHubNode[]) {
        await Promise.all(nodes.map(node => this.fetchNode(node)));
    }

    private async fetchNode(node: GitHubNode) {
        switch (node.type) {
            case 'file':
                await this.fetchFile(node);
                break;
            case 'dir':
                await this.fetchDirectory(node);
                break;
        }
    }

    private async fetchDirectory(node: GitHubDirectory) {
        await this.fetchNodes(await this.getRepositoryContent(node.path) as GitHubNode[]);
    }

    private async fetchFile(node: GitHubFile) {
        const response = await fetch(node.download_url);

        this.files.push({
            name: node.name,
            path: node.path,
            content: Buffer.from(await response.arrayBuffer())
        });
    }

    private getRepositoryContent(path?: string) {
        return GitHubApi.getContent(this.owner, this.repository, path, this.ref);
    }
}