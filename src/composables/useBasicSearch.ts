export function useBasicSearch() {
    const currentDriver = window.srConfig.MEILISEARCH_URL

    if (currentDriver == '' || currentDriver == null) {
        return true
    }

    return false
}
