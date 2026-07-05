import { ref, computed } from "vue";
import { micromark } from "micromark";

export interface GitHubRelease {
    tag_name: string;
    name: string;
    html_url: string;
    body: string;
    published_at: string;
}

interface CacheEntry {
    data: GitHubRelease | null;
    fetchedAt: number;
}

const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

// Module-level in-memory cache: survives component unmounts within the same SPA session
const memoryCache = new Map<string, CacheEntry>();

function getStorageKey(repo: string): string {
    return `github_release_${repo}`;
}

function readFromStorage(repo: string): CacheEntry | null {
    try {
        const raw = localStorage.getItem(getStorageKey(repo));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed.fetchedAt !== "number") return null;
        return parsed as CacheEntry;
    } catch {
        return null;
    }
}

function writeToStorage(repo: string, entry: CacheEntry): void {
    try {
        localStorage.setItem(getStorageKey(repo), JSON.stringify(entry));
    } catch {
        // localStorage may be full or unavailable — silent no-op
    }
}

function isFresh(entry: CacheEntry, ttl = CACHE_TTL): boolean {
    return Date.now() - entry.fetchedAt < ttl;
}

function getCached(repo: string): CacheEntry | null {
    // 1. Memory cache (fastest, same-session)
    const mem = memoryCache.get(repo);
    if (mem && isFresh(mem)) return mem;

    // 2. localStorage (cross-session)
    const stored = readFromStorage(repo);
    if (stored && isFresh(stored)) {
        memoryCache.set(repo, stored); // hydrate memory tier
        return stored;
    }

    return null;
}

function setCached(repo: string, data: GitHubRelease | null): void {
    const entry: CacheEntry = { data, fetchedAt: Date.now() };
    memoryCache.set(repo, entry);
    writeToStorage(repo, entry);
}

/**
 * Fetch and expose the latest GitHub release for a given repository.
 *
 * @param repo - GitHub repository in `owner/name` form (e.g. `karlomikus/vue-salt-rim`)
 */
export function useGitHubReleases(repo: string) {
    const release = ref<GitHubRelease | null>(null);
    const isLoading = ref<boolean>(false);
    const error = ref<string>("");

    const changelogHtml = computed<string>(() => {
        if (!release.value?.body) return "";
        return micromark(release.value.body);
    });

    async function loadRelease(): Promise<void> {
        // Return cached data if fresh
        const cached = getCached(repo);
        if (cached) {
            release.value = cached.data;
            return;
        }

        isLoading.value = true;
        error.value = "";

        try {
            const response = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=1`);

            if (!response.ok) {
                throw new Error(`GitHub API returned ${response.status}`);
            }

            const releases: GitHubRelease[] = await response.json();

            const data = releases.length > 0 ? releases[0] : null;
            release.value = data;
            setCached(repo, data);
        } catch {
            error.value = "fetch-error";
        } finally {
            isLoading.value = false;
        }
    }

    return {
        release,
        isLoading,
        error,
        changelogHtml,
        fetch: loadRelease,
    };
}
