import { useState, useEffect } from 'react';
import Head from 'next/head'
import classNames from 'classnames';
import { FaLink, FaFile } from 'react-icons/fa';

import { GitHubResourceParameters, parseGitHubResourceUrl } from '../lib/parseGitHubResourceUrl';
import { generateGitHubResourceFilename } from '../lib/generateGitHubResourceFilename';

import styles from '../styles/Home.module.scss'

export default function Home() {
    const [gitHubUrl, setGitHubUrl] = useState('');
    const [filename, setFilename] = useState('');
    const [shouldZip, setShouldZip] = useState(false);

    const [parameters, setParameters] = useState<GitHubResourceParameters | null>(null);
    const [failure, setFailure] = useState<string | null>(null);

    const downloadUrl = generateDownloadUrl();
    const fallbackFilename = generateFallbackFilename();

    useEffect(() => {
        setParameters(null);

        if (!gitHubUrl) {
            setFailure('Please, enter a resource URL');
            return;
        }

        try {
            setParameters(parseGitHubResourceUrl(gitHubUrl));
            setFailure(null);
        } catch (error) {
            if (error instanceof Error) {
                setFailure(error.message);
            }
        }
    }, [gitHubUrl]);

    async function copy() {
        await navigator.clipboard.writeText(downloadUrl);
    }

    function generateDownloadUrl() {
        if (!gitHubUrl) {
            return '';
        }

        const url = new URL('api/download', window.location.origin);
    
        url.searchParams.append('url', gitHubUrl);
    
        if (filename) url.searchParams.append('filename', filename);
        if (shouldZip && !isDirectory()) url.searchParams.append('zip', 'true');
    
        return url.toString();
    }

    function generateFallbackFilename() {
        if (!parameters) {
            return null;
        }
    
        const resourceFilename = generateGitHubResourceFilename(parameters);

        if (isZip()) {
            return resourceFilename + '.zip';
        }

        return resourceFilename;
    }
    
    function isZip() {
        if (shouldZip) {
            return true;
        }

        return isDirectory();
    }

    function isDirectory() {
        if (!parameters) {
            return false;
        }

        return !parameters.path || parameters.type === 'tree';
    }

    return (
        <>
            <Head>
                <title>GitLink</title>
                <meta name="description" content="Create download links for GitHub resources" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <header className={styles.header}>
                <h1 className={styles.title}>GitLink</h1>
                <h3 className={styles.description}>Create direct download links for public GitHub resources</h3>
            </header>
            <main className={styles.content}>
                <div className={styles.form}>
                    <div className={styles.field}>
                        <label htmlFor="url" className={styles.label}>
                            <FaLink />
                        </label>
                        <input
                            type="text"
                            placeholder="GitHub File or Directory"
                            autoComplete="off"
                            value={gitHubUrl}
                            onChange={e => setGitHubUrl(e.target.value)}
                            id="url"
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.options}>
                        <div className={classNames(styles.field, styles.filename)}>
                            <label htmlFor="filename" className={styles.label}>
                                <FaFile className={styles.icon}/>
                            </label>
                            <input
                                type="text"
                                placeholder={
                                    'Filename' +
                                    (fallbackFilename ? ` (${fallbackFilename})` : '')
                                }
                                autoComplete="off"
                                value={filename}
                                onChange={e => setFilename(e.target.value)}
                                id="url"
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="zip" className={styles.label}>ZIP</label>
                            <input
                                type="checkbox"
                                checked={isZip()}
                                onChange={e => setShouldZip(e.target.checked)}
                                id="zip"
                                className={styles.input}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.result}>
                    {parameters
                        ? <span className={styles.link}>{downloadUrl}</span>
                        : <span className={classNames(styles.link, styles.failure)}>{failure}</span>
                    }

                    <div className={styles.actions}>
                        <button className={styles.button} onClick={copy}>Copy</button>
                        <a className={styles.button} href={downloadUrl}>Download</a>
                    </div>
                </div>
            </main>
            <footer className={styles.footer}>
                <p>
                    <a href="https://github.com/jaimeadf/git-link" target="_blank" rel="noreferrer">git-link</a>
                    <> by </>
                    <a href="https://github.com/jaimeadf" target="_blank" rel="noreferrer">jaimeadf</a>
                </p>
            </footer>
        </>
    )
}