import { ref, computed } from "vue";
import { micromark } from "micromark";

export interface GitHubRelease {
    tag_name: string;
    name: string;
    html_url: string;
    body: string;
    published_at: string;
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
        isLoading.value = true;
        error.value = "";

        try {
            const response = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=1`);

            if (!response.ok) {
                throw new Error(`GitHub API returned ${response.status}`);
            }

            const releases: GitHubRelease[] = await response.json();

            if (releases.length === 0) {
                release.value = null;
                return;
            }

            release.value = releases[0];
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
