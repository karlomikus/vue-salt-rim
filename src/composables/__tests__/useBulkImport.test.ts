import { describe, it, expect, vi, beforeEach } from 'vitest'
import { importInChunks } from '../useBulkImport'

const originalFetch = global.fetch

describe('importInChunks', () => {
    beforeEach(() => {
        // @ts-ignore
        global.window = { srConfig: { API_URL: 'https://example.test' } }
        // Minimal AppState mocks via module mock not trivial here; rely on headers not being validated by mocked fetch
    })

    it('chunks items and merges counts', async () => {
        const responses = [
            { data: { items: Array.from({ length: 2 }).map((_, i) => ({ status: 'created', index: i })), counts: { total: 2, created: 2, skipped: 0, overwritten: 0, failed: 0 } } },
            { data: { items: Array.from({ length: 2 }).map((_, i) => ({ status: 'skipped', index: i })), counts: { total: 2, created: 0, skipped: 2, overwritten: 0, failed: 0 } } },
        ]

        global.fetch = vi.fn()
            // @ts-ignore
            .mockResolvedValueOnce({ ok: true, status: 200, json: async () => responses[0], headers: new Headers() })
            // @ts-ignore
            .mockResolvedValueOnce({ ok: true, status: 200, json: async () => responses[1], headers: new Headers() })

        const items = [1, 2, 3, 4]
        const res = await importInChunks({ items, duplicateAction: 'none', chunkSize: 2, concurrency: 2 })

        expect(res.counts.total).toBe(4)
        expect(res.counts.created).toBe(2)
        expect(res.counts.skipped).toBe(2)
        expect(res.items.length).toBe(4)
    })

    it('retries on 429 with backoff and then succeeds', async () => {
        const retryHeaders = new Headers()
        retryHeaders.set('Retry-After', '0')

        global.fetch = vi.fn()
            // @ts-ignore
            .mockResolvedValueOnce({ ok: false, status: 429, headers: retryHeaders })
            // @ts-ignore
            .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ data: { items: [{ status: 'created', index: 0 }], counts: { total: 1, created: 1, skipped: 0, overwritten: 0, failed: 0 } } }), headers: new Headers() })

        const items = [1]
        const res = await importInChunks({ items, duplicateAction: 'none', chunkSize: 1, concurrency: 1 })

        expect(res.counts.created).toBe(1)
        expect(res.counts.failed).toBe(0)
    })
})

afterAll(() => {
    global.fetch = originalFetch
})


