import AppState from '@/AppState'

export type DuplicateAction = 'none' | 'skip' | 'overwrite'

export interface BulkImportCounts {
    total: number
    created: number
    skipped: number
    overwritten: number
    failed: number
}

export interface BulkImportItemResult<TCocktailBasic = any> {
    status: 'created' | 'skipped' | 'overwritten' | 'failed'
    cocktail?: TCocktailBasic
    name?: string | null
    error?: string | null
    index: number
}

export interface BulkImportResponse<TCocktailBasic = any> {
    items: BulkImportItemResult<TCocktailBasic>[]
    counts: BulkImportCounts
}

export interface ProgressUpdate {
    processed: number
    counts: BulkImportCounts
}

export interface ImportInChunksOptions<T = any> {
    items: T[]
    duplicateAction: DuplicateAction
    chunkSize?: number
    concurrency?: number
    maxAttempts?: number
    onProgress?: (update: ProgressUpdate) => void
}

export async function parseUserJson(input: string | File): Promise<{ payload: any, isArray: boolean }>
{
    const raw = typeof input === 'string' ? input : await input.text()
    const parsed = JSON.parse(raw)
    return { payload: parsed, isArray: Array.isArray(parsed) }
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function postImportChunk<T = any>(chunk: T[], duplicateAction: DuplicateAction, attempt = 0, maxAttempts = 5): Promise<BulkImportResponse>
{
    const appState = new AppState()
    const token = appState.token ?? ''
    const barId = appState.bar?.id ? String(appState.bar.id) : ''

    const response = await fetch(`${window.srConfig.API_URL}/api/import/cocktail`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Bar-Assistant-Bar-Id': barId,
        },
        body: JSON.stringify({ source: chunk, duplicate_actions: duplicateAction }),
    })

    if (response.status === 429) {
        if (attempt >= maxAttempts) {
            // Treat as failed chunk
            return {
                items: chunk.map((item: any, idx: number) => ({ status: 'failed', name: item?.recipe?.name ?? null, error: 'HTTP 429', index: idx })),
                counts: { total: chunk.length, created: 0, skipped: 0, overwritten: 0, failed: chunk.length },
            }
        }

        const retryAfterHeader = response.headers.get('Retry-After')
        const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : 1
        const backoff = Math.min(1000 * Math.pow(2, attempt) + retryAfter * 1000, 15000)
        await sleep(backoff)
        return postImportChunk(chunk, duplicateAction, attempt + 1, maxAttempts)
    }

    if (!response.ok) {
        return {
            items: chunk.map((item: any, idx: number) => ({ status: 'failed', name: item?.recipe?.name ?? null, error: `HTTP ${response.status}` , index: idx })),
            counts: { total: chunk.length, created: 0, skipped: 0, overwritten: 0, failed: chunk.length },
        }
    }

    const json = await response.json()

    // Backend returns single or bulk formats. Normalize.
    if (json && json.data && json.data.items && json.data.counts) {
        return json.data as BulkImportResponse
    }

    // Single response fallback
    return {
        items: [{ status: 'created', cocktail: json?.data ?? null, name: json?.data?.name ?? null, error: null, index: 0 }],
        counts: { total: 1, created: 1, skipped: 0, overwritten: 0, failed: 0 },
    }
}

export async function importInChunks<T = any>(options: ImportInChunksOptions<T>): Promise<BulkImportResponse>
{
    const {
        items,
        duplicateAction,
        chunkSize = 25,
        concurrency = 1,
        maxAttempts = 5,
        onProgress,
    } = options

    if (!Array.isArray(items) || items.length === 0) {
        return { items: [], counts: { total: 0, created: 0, skipped: 0, overwritten: 0, failed: 0 } }
    }

    const effectiveChunkSize = Math.min(Math.max(chunkSize, 1), 500)
    const chunks: T[][] = []
    for (let i = 0; i < items.length; i += effectiveChunkSize) {
        chunks.push(items.slice(i, i + effectiveChunkSize))
    }

    const totals: BulkImportCounts = { total: items.length, created: 0, skipped: 0, overwritten: 0, failed: 0 }
    const allItems: BulkImportItemResult[] = []
    let processed = 0

    const queue = chunks.map((c, idx) => ({ payload: c, originalStartIndex: idx * effectiveChunkSize }))

    async function worker(): Promise<void> {
        while (queue.length > 0) {
            const job = queue.shift()
            if (!job) break

            const data = await postImportChunk(job.payload, duplicateAction, 0, maxAttempts)

            // Merge counts
            totals.created += data.counts.created
            totals.skipped += data.counts.skipped
            totals.overwritten += data.counts.overwritten
            totals.failed += data.counts.failed
            processed += data.counts.total

            // Normalize item indices to original indices
            if (data.items && data.items.length > 0) {
                const normalized = data.items.map((it, idx) => ({ ...it, index: (it?.index ?? idx) + job.originalStartIndex }))
                allItems.push(...normalized)
            }

            onProgress && onProgress({ processed, counts: { ...totals } })
        }
    }

    const workers = Array.from({ length: Math.min(concurrency, chunks.length) }).map(() => worker())
    await Promise.all(workers)

    return { items: allItems, counts: totals }
}

export function getFirstItemNames(items: any[], max = 10): string[]
{
    const names: string[] = []
    for (let i = 0; i < items.length && names.length < max; i++) {
        const it = items[i]
        const name = it?.recipe?.name ?? it?.name ?? null
        names.push(name ? String(name) : `Unnamed item #${i + 1}`)
    }
    return names
}

export function downloadJson(filename: string, data: unknown): void
{
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
}

export async function importSingle<T = any>(source: T, duplicateAction: DuplicateAction): Promise<{ ok: true, data: any } | { ok: false, error: string }>
{
    const appState = new AppState()
    const token = appState.token ?? ''
    const barId = appState.bar?.id ? String(appState.bar.id) : ''

    try {
        const response = await fetch(`${window.srConfig.API_URL}/api/import/cocktail`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Bar-Assistant-Bar-Id': barId,
            },
            body: JSON.stringify({ source, duplicate_actions: duplicateAction }),
        })

        if (!response.ok) {
            return { ok: false, error: `HTTP ${response.status}` }
        }

        const json = await response.json()
        return { ok: true, data: json?.data }
    } catch (e: any) {
        return { ok: false, error: e?.message ?? 'Unknown error' }
    }
}


