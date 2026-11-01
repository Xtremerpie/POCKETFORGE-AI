import { GitHubUser, GitHubRepository, Project } from '../types';

const STORAGE_KEY_GITHUB_TOKEN = 'pocketforge_github_token';

export function getStoredGitHubToken(): string {
  return localStorage.getItem(STORAGE_KEY_GITHUB_TOKEN) || '';
}

export function saveStoredGitHubToken(token: string) {
  if (token) {
    localStorage.setItem(STORAGE_KEY_GITHUB_TOKEN, token.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_GITHUB_TOKEN);
  }
}

async function githubRequest<T>(endpoint: string, token: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Accept', 'application/vnd.github.v3+json');
  headers.set('X-GitHub-Api-Version', '2022-11-28');

  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `GitHub API error ${response.status}`);
  }
  return data;
}

export async function fetchGitHubUser(token: string): Promise<GitHubUser> {
  return githubRequest<GitHubUser>('/user', token);
}

export async function fetchUserRepos(token: string): Promise<GitHubRepository[]> {
  return githubRequest<GitHubRepository[]>('/user/repos?sort=updated&per_page=30', token);
}

export async function createGitHubRepo(
  token: string,
  name: string,
  isPrivate: boolean = true,
  description: string = 'Created with PocketForge AI on Android'
): Promise<GitHubRepository> {
  return githubRequest<GitHubRepository>('/user/repos', token, {
    method: 'POST',
    body: JSON.stringify({
      name,
      private: isPrivate,
      description,
      auto_init: true
    })
  });
}

// Push project files directly via GitHub REST API (Tree & Commit creation)
export async function pushProjectToGitHub(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  project: Project,
  commitMessage: string
): Promise<{ commitSha: string; htmlUrl: string }> {
  // 1. Get branch reference to obtain latest commit SHA
  const refData = await githubRequest<{ object: { sha: string } }>(
    `/repos/${owner}/${repo}/git/ref/heads/${branch}`,
    token
  );
  const parentCommitSha = refData.object.sha;

  // 2. Create blobs for each file
  const treeItems: { path: string; mode: string; type: string; sha: string }[] = [];

  for (const file of project.files) {
    // Exclude unwanted files
    if (file.path.includes('node_modules/') || file.path === '.env') continue;

    const blobData = await githubRequest<{ sha: string }>(
      `/repos/${owner}/${repo}/git/blobs`,
      token,
      {
        method: 'POST',
        body: JSON.stringify({
          content: file.content,
          encoding: 'utf-8'
        })
      }
    );

    treeItems.push({
      path: file.path.replace(/^\/+/, ''),
      mode: '100644', // normal file
      type: 'blob',
      sha: blobData.sha
    });
  }

  // 3. Create Tree
  const treeData = await githubRequest<{ sha: string }>(
    `/repos/${owner}/${repo}/git/trees`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({
        base_tree: parentCommitSha,
        tree: treeItems
      })
    }
  );

  // 4. Create Commit
  const commitData = await githubRequest<{ sha: string; html_url: string }>(
    `/repos/${owner}/${repo}/git/commits`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({
        message: commitMessage || `PocketForge update: ${new Date().toLocaleDateString()}`,
        tree: treeData.sha,
        parents: [parentCommitSha]
      })
    }
  );

  // 5. Update branch reference
  await githubRequest(
    `/repos/${owner}/${repo}/git/refs/heads/${branch}`,
    token,
    {
      method: 'PATCH',
      body: JSON.stringify({
        sha: commitData.sha,
        force: false
      })
    }
  );

  return {
    commitSha: commitData.sha,
    htmlUrl: `https://github.com/${owner}/${repo}/commit/${commitData.sha}`
  };
}
